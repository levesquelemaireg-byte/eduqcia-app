# Print Engine — Limitations connues et plan de convergence

> Document technique interne. Derniere mise a jour : 2026-04-18 (audit securite lot 10).

## 1. Pagination heuristique (Surveillance active)

### Etat actuel

Le placeholder fixe **200px** a ete retire. La pagination utilise maintenant
`mesurerBlocImpression` (`lib/impression/mesure-estimation.ts`) sur les 3 flux :

- route SSR `/apercu/[token]`
- API `/api/impression/apercu-png`
- hook client `useApercuPng`

Le clipping destructif a aussi ete retire dans `SectionPage`
(`overflow: visible` au wrapper page et au conteneur de contenu).

### Limitation residuelle

La mesure reste **heuristique** (pas une mesure DOM reelle du rendu final).
Donc il peut subsister des ecarts marginaux sur des cas extremes :

- contenu HTML tres dense
- images atypiques avec metadonnees partielles
- grilles tres verboses sur plusieurs criteres

### Impact

- Le risque de troncature silencieuse est fortement reduit.
- Le systeme peut sur-estimer certains blocs (plus de pages), ce qui est un
  compromis volontaire pour privilegier l'integrite du contenu.

### Plan de convergence

1. **Court terme (en place)**
   - mesure heuristique partagee
   - clipping CSS retire
2. **Moyen terme**
   - mesure DOM offscreen pour les blocs les plus sensibles
   - instrumentation latence + telemetrie de pagination
3. **Long terme (si necessaire)**
   - double passage headless (mesure puis rendu final)

### Fichiers concernes

| Fichier                                          | Role                                            |
| ------------------------------------------------ | ----------------------------------------------- |
| `lib/impression/mesure-estimation.ts`            | Mesureur heuristique partage                    |
| `hooks/partagees/use-apercu-png.ts`              | Pagination client apercu PNG                    |
| `app/(apercu)/apercu/[token]/page.tsx`           | Pagination SSR tokenisee                        |
| `app/api/impression/apercu-png/route.ts`         | Pagination serveur avant generation PNG         |
| `components/epreuve/impression/section-page.tsx` | Suppression clipping destructif (`overflow`)    |
| `lib/epreuve/pagination/pager.ts`                | Algorithme greedy first-fit + verif debordement |

---

## 2. Duplication pipeline impression (Important)

### Probleme

Deux chemins de code construisent les blocs d'impression d'une tache :

1. **`lib/epreuve/transformation/epreuve-vers-paginee.ts`** (323 lignes)
   - Utilise par le flux epreuve (multi-taches)
   - Compose par mode (formatif, sommatif-standard, epreuve-ministerielle)
   - Gere les feuillets (dossier-documentaire, questionnaire, cahier-reponses)

2. **`lib/impression/builders/blocs-tache.ts`** (69 lignes)
   - Couche d'orchestration : assemble document + quadruplet + corrige
   - Appele par `epreuve-vers-paginee.ts` ET `tache-vers-imprimable.ts`

3. **`lib/tache/impression/tache-vers-imprimable.ts`** (80 lignes)
   - Utilise par le flux tache seule
   - Pas de feuillets, pas d'en-tete
   - Meme pager, meme mesureur

### Analyse

La duplication est **structurelle, pas accidentelle**. Les deux chemins partagent
`blocs-tache.ts` comme couche commune. La divergence est dans la composition
par feuillets (epreuve) vs. feuillet unique (tache seule).

Le risque reel est **l'ecart de rendu** : si les regles de visibilite ou le format
des blocs evolue dans un chemin sans etre repercute dans l'autre.

### Plan de convergence

1. **Court terme** : s'assurer que les deux chemins appellent les memes builders
   de blocs (`construireBlocDocument`, `construireBlocQuadruplet`, `construireBlocCorrige`).
   C'est deja le cas — `blocs-tache.ts` est la couche commune.

2. **Moyen terme** : extraire la logique de composition par feuillet dans un module
   dedie (`lib/impression/feuillets/`) que `epreuve-vers-paginee.ts` consomme.
   `tache-vers-imprimable.ts` passerait par le meme module avec un seul feuillet.

3. **Tests** : ajouter un test d'integration qui verifie que le rendu d'une tache
   seule produit les memes blocs que la meme tache dans une epreuve mono-tache
   (mode formatif, sans en-tete).

---

## 3. Observabilite production — impression (Amelioration)

### Etat actuel

Les routes impression (`/api/impression/pdf`, `/api/impression/apercu-png`) ont :

- `console.error` sur les exceptions — visible dans les logs Vercel, mais non structure
- Timeout Puppeteer 30 s avec reponse 504 explicite
- Rate limiting par utilisateur (5 PDF/min, 10 PNG/min)

Ce qui manque :

### 3.1 Metriques de latence

Aucune mesure du temps reel de generation. Impossible de savoir si les temps
augmentent progressivement (image lourde, fonts lentes) avant d'atteindre le timeout.

**Recommandation** : ajouter un `performance.now()` autour de `genererPdf` /
`genererPngPages` et logger la duree avec le nombre de pages :

```typescript
const t0 = performance.now();
const result = await genererPdf(url);
const dureeMs = Math.round(performance.now() - t0);
console.log(`[impression/pdf] ${dureeMs}ms, ${result.length} bytes`);
```

Vercel Logs + Log Drains (Datadog, Axiom) captent ces lignes sans SDK supplementaire.

### 3.2 Saturation Puppeteer

Chaque requête d'impression lance un processus Chromium séparé (`lancerNavigateur()`).
Aucun pool ni sémaphore ne limite la concurrence. Sous charge, plusieurs invocations
simultanées pourraient épuiser la mémoire de la fonction serverless (1024 MB par défaut
sur Vercel).

**Recommandation court terme** : le rate limiting existant (5 PDF/min par user) limite
déjà le risque en usage normal. Pour une protection systémique :

- Ajouter un compteur atomique (Vercel KV `INCR`/`DECR`) du nombre d'invocations
  Puppeteer en cours. Refuser avec 503 si > seuil (ex. 3 simultanées).
- Alternative Vercel : configurer `maxDuration` dans le route handler pour éviter
  l'empilement silencieux.

### 3.3 Erreurs structurées

Remplacer les `console.error` par un format structuré JSON pour faciliter
le filtrage dans les log drains :

```typescript
console.error(
  JSON.stringify({
    route: "impression/pdf",
    userId: user.id,
    error: message,
    durationMs: dureeMs,
    timestamp: new Date().toISOString(),
  }),
);
```

### 3.4 Alerting (futur)

Quand un log drain est en place (Axiom, Datadog, Sentry) :

- Alerte si taux d'erreur 5xx > 5 % sur 15 min
- Alerte si p95 latence impression > 20 s
- Alerte si saturation Puppeteer (503) > 0 sur 5 min

### Fichiers concernes

| Fichier                                  | Action                              |
| ---------------------------------------- | ----------------------------------- |
| `app/api/impression/pdf/route.ts`        | Ajouter timing + log structuré      |
| `app/api/impression/apercu-png/route.ts` | Ajouter timing + log structuré      |
| `lib/epreuve/impression/puppeteer.ts`    | Candidat pour sémaphore concurrence |
