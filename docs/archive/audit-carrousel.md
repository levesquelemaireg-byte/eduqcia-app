# Audit complet — Carrousel aperçu PNG (archivé 2026-04-17)

> Date : 17 avril 2026
> Clôturé : 17 avril 2026 — tous les bugs corrigés (lots 5 + 6)
> Périmètre : `CarrouselApercu`, hook `useApercuPng`, pipeline PNG (token-draft → Puppeteer → base64), API routes impression, `PrintPreviewModal`

---

## Flux de données complet

```
TaeForm (state wizard)
  │ useMemo → etatWizardVersTache()
  ▼
PayloadImpression { type, donnees, mode, estCorrige }
  │
  ▼
PrintPreviewModal (open/close)
  │ useApercuPng(payload, mode, estCorrige)
  │
  ├─ 1. POST /api/impression/token-draft
  │     → HMAC-signed token + payload stocké dans Vercel KV (TTL 10 min)
  │
  ├─ 2. POST /api/impression/apercu-png
  │     → API vérifie auth Supabase
  │     → Lit payload depuis KV via token
  │     → Puppeteer : GET /apercu/[token]
  │       → SSR : ApercuImpression (composant unique §0.5)
  │       → preflight : fonts + images + DOM mutations
  │       → screenshot chaque [data-page-impression]
  │     → Buffer[] → base64[] → JSON response
  │
  ├─ 3. calculerRendu() local → pagesParFeuillet
  │
  ▼
CarrouselApercu
  │ construireFeuillets() → FeuilletInfo[]
  │ Onglets : dossier-documentaire | questionnaire | cahier-reponses
  ▼
CarrouselFeuillet (Embla Carousel)
  │ <img src="data:image/png;base64,..." />
  │ Navigation prev/next + indicateur page
  ▼
Bannière invalidation (si empreinteWizard ≠ empreintePng)
```

---

## Fichiers audités

| Fichier                                                | Lignes | Rôle                                  |
| ------------------------------------------------------ | ------ | ------------------------------------- |
| `components/epreuve/apercu/carrousel.tsx`              | ~260   | Composant carrousel (Embla)           |
| `hooks/epreuve/use-apercu-png.ts`                      | ~213   | Hook orchestration PNG + PDF          |
| `components/tache/wizard/preview/PrintPreviewModal.tsx` | ~145   | Modale d'aperçu impression            |
| `app/api/impression/apercu-png/route.ts`               | ~196   | API route génération PNG              |
| `app/api/impression/token-draft/route.ts`              | —      | API route token HMAC + KV             |
| `lib/epreuve/impression/puppeteer.ts`                  | ~131   | Wrapper Chromium headless             |
| `components/epreuve/impression/index.tsx`              | ~84    | Renderer unique `ApercuImpression`    |
| `components/epreuve/impression/section-page.tsx`       | ~69    | Page wrapper `[data-page-impression]` |
| `styles/impression.css`                                | ~102   | Variables et règles @page             |
| `app/(apercu)/apercu/[token]/page.tsx`                 | ~129   | Route SSR pour Puppeteer              |
| `app/(apercu)/apercu/layout.tsx`                       | ~40    | Layout minimal sans AppShell          |

---

## Bugs et problèmes identifiés

### BUG-1 : Race condition — pas d'AbortController au démontage

**Sévérité : CRITIQUE**
**Fichier :** `hooks/epreuve/use-apercu-png.ts` lignes 137–173

Le hook `useApercuPng` lance deux appels asynchrones séquentiels (token-draft puis apercu-png). Si l'utilisateur ferme la modale pendant le fetch (cas fréquent — la génération PNG prend 5–30 s), les `setEtat()` qui suivent s'exécutent sur un composant démonté.

```typescript
const generer = useCallback(async () => {
  setEtat({ statut: "chargement" });
  try {
    const token = await obtenirToken();       // ← checkpoint 1
    const res = await fetch("/api/...");      // ← checkpoint 2 (5-30s)
    // Si modale fermée ici → composant démonté
    setEtat({ statut: "pret", pages: ... }); // ← state update sur composant démonté
  } catch (err) {
    setEtat({ statut: "erreur", ... });       // ← idem
  }
}, [payload, mode, estCorrige]);
```

**Conséquences :**

- Warning React en dev (`Can't perform a React state update on an unmounted component`)
- Fuite mémoire potentielle : la closure retient les références au state et aux pages base64
- Le fetch réseau continue inutilement côté serveur (Puppeteer tourne pour rien)

**Correctif :** Ajouter un `AbortController` avec signal sur les fetch, et un cleanup dans un `useEffect` de démontage. Ignorer silencieusement les `AbortError`.

---

### BUG-2 : Clés instables dans le map des slides

**Sévérité : MAJEUR**
**Fichier :** `components/epreuve/apercu/carrousel.tsx` ligne 119

```typescript
{feuillet.pages.map((pageBase64, i) => (
  <div key={i}>   // ← index comme clé
    <img src={`data:image/png;base64,${pageBase64}`} />
  </div>
))}
```

**Conséquences :**

- Si le tableau `pages` change de longueur ou d'ordre (régénération après invalidation), React réutilise les nœuds DOM avec un `indexActif` périmé
- L'indicateur de page (`Page 3 / 5`) peut se désynchroniser de l'image réellement affichée
- Embla peut scroller à une position qui ne correspond plus au contenu

**Correctif :** Utiliser une clé stable, par exemple `key={\`${feuillet.type}-${i}-${empreintePng}\`}` pour forcer le remount quand les PNGs changent.

---

### BUG-3 : Pas de timeout sur le téléchargement PDF

**Sévérité : MAJEUR**
**Fichier :** `hooks/epreuve/use-apercu-png.ts` lignes 175–210

```typescript
const telechargerPdf = useCallback(async () => {
  setPdfEnCours(true);
  try {
    const res = await fetch("/api/impression/pdf", { ... });
    // ← Aucun timeout ! Si Vercel timeout (60s) ou réseau bloqué,
    //   le spinner tourne indéfiniment
    const blob = await res.blob();
    // ...
  } catch {
    // Erreur silencieuse
  } finally {
    setPdfEnCours(false);
  }
}, [payload, mode, estCorrige]);
```

**Conséquences :**

- Le bouton reste en état spinner indéfiniment si le réseau est lent ou si Vercel timeout
- Aucun feedback à l'utilisateur — il ne sait pas si ça progresse ou si c'est bloqué
- Le `catch` est silencieux : l'utilisateur ne voit aucune erreur

**Correctif :** `Promise.race()` avec un timeout de 30 s, et afficher un toast d'erreur en cas d'échec.

---

### BUG-4 : Perte de position au changement d'onglet

**Sévérité : MINEUR**
**Fichier :** `components/epreuve/apercu/carrousel.tsx` lignes 250–254

```typescript
<CarrouselFeuillet
  key={feuilletActif.type}   // ← remount au changement d'onglet
  feuillet={feuilletActif}
  totalPagesGlobal={pages.length}
/>
```

**Conséquences :**

1. L'utilisateur navigue à la page 3 du « dossier documentaire »
2. Il clique sur l'onglet « questionnaire »
3. Il revient sur « dossier documentaire »
4. Le carrousel est remonté → `indexActif` repart à 0, il voit la page 1

**Correctif possible :** Stocker la position par feuillet dans un `useRef<Record<TypeFeuillet, number>>` et restaurer via `emblaApi.scrollTo()` au mount.

---

### BUG-5 : Expiration token KV non gérée proprement

**Sévérité : MAJEUR**
**Fichier :** `app/api/impression/apercu-png/route.ts` ligne 143

Si le payload KV expire (TTL 10 min) entre la création du token et l'appel PNG :

1. `kv.get()` retourne `null`
2. La route retourne 404
3. Le hook `useApercuPng` tente de parser le JSON → échec
4. L'utilisateur voit un message d'erreur générique

**Scénario réaliste :** L'utilisateur ouvre la modale, est distrait 10 min, puis clique « Régénérer ». Le token est expiré. Le bouton « Régénérer » appelle `generer()` qui crée un nouveau token → ça fonctionne au 2e clic. Mais le 1er clic affiche une erreur non explicative.

**Correctif :** Détecter le 404 spécifiquement et régénérer automatiquement le token au lieu d'afficher une erreur.

---

### BUG-6 : Message d'invalidation peu clair

**Sévérité : MINEUR**
**Fichier :** `components/epreuve/apercu/carrousel.tsx` lignes 200–222

La bannière d'invalidation s'affiche quand `empreinteWizard ≠ empreintePng`, mais le message ne précise pas **ce qui** a changé. L'utilisateur peut cliquer « Régénérer » plusieurs fois sans comprendre pourquoi la bannière réapparaît (s'il continue d'éditer le formulaire en arrière-plan).

---

## Points vérifiés — conformes

| Aspect                                           | Statut | Notes                                     |
| ------------------------------------------------ | ------ | ----------------------------------------- |
| Embla config (`align`, `containScroll`)          | OK     | Centré, pas de scroll vide aux extrémités |
| Event listeners Embla (cleanup)                  | OK     | `off()` dans le return du `useEffect`     |
| Navigation prev/next (disabled states)           | OK     | Correctement désactivé aux bornes         |
| Indicateur de page global                        | OK     | `feuillet.debutIndex + indexActif + 1`    |
| `draggable={false}` sur les images               | OK     | Empêche le drag natif du navigateur       |
| Empty state (0 feuillets)                        | OK     | `return null` si aucun feuillet           |
| Onglets affichés seulement si > 1                | OK     | Condition `feuillets.length > 1`          |
| Token HMAC-SHA256 + timing-safe compare          | OK     | Sécurité correcte                         |
| KV TTL 10 min                                    | OK     | Nettoyage automatique                     |
| Preflight Puppeteer (fonts, images, DOM)         | OK     | Attend stabilisation complète             |
| Invariant composant unique §0.5                  | OK     | `ApercuImpression` identique partout      |
| `URL.revokeObjectURL()` après téléchargement PDF | OK     | Ligne 203 du hook                         |
| Auth Supabase sur les routes API                 | OK     | Vérifié sur token-draft et apercu-png     |
| Page dimensions (816×1056 px, Letter @ 96 DPI)   | OK     | Cohérent CSS + composant                  |
| `break-inside: avoid` sur les blocs atomiques    | OK     | Dans `impression.css`                     |
| Layout aperçu sans AppShell                      | OK     | Layout dédié `(apercu)/layout.tsx`        |
| Masquage dev tools Next.js dans le layout aperçu | OK     | CSS en `<head>`                           |

---

## Mémoire et performance

| Métrique                    | Valeur typique | Risque                |
| --------------------------- | -------------- | --------------------- |
| Taille PNG par page         | 50–200 KB      | Faible                |
| Inflation base64            | +33 %          | Accepté               |
| 5 pages en mémoire          | ~335 KB–1.3 MB | Faible                |
| 50 pages (épreuve longue)   | ~3–13 MB       | Moyen — surveiller    |
| Temps Puppeteer (5 pages)   | 5–15 s         | Acceptable            |
| Temps Puppeteer (20+ pages) | 20–60 s        | Risque timeout Vercel |

Le state React (`etat.pages`) contient les base64 pendant toute la durée de vie de la modale. La fermeture de la modale démonte le composant → le state est libéré. Pas de fuite permanente, mais pression mémoire temporaire sur les grosses épreuves.

---

## Résumé des correctifs par priorité

| #   | Bug                                               | Sévérité | Effort estimé |
| --- | ------------------------------------------------- | -------- | ------------- |
| 1   | BUG-1 : AbortController manquant                  | CRITIQUE | ~30 min       |
| 2   | BUG-2 : Clés instables (index comme key)          | MAJEUR   | ~5 min        |
| 3   | BUG-3 : Pas de timeout PDF                        | MAJEUR   | ~15 min       |
| 4   | BUG-5 : Token KV expiré → erreur au lieu de retry | MAJEUR   | ~20 min       |
| 5   | BUG-4 : Perte position onglet                     | MINEUR   | ~30 min       |
| 6   | BUG-6 : Message invalidation flou                 | MINEUR   | ~10 min       |

Tous les correctifs sont localisés dans 2–3 fichiers et ne nécessitent aucun changement architectural.
