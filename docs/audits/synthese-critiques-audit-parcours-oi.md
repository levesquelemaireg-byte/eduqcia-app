# Synthèse des critiques — Audit Parcours OI (R/NR)

**Destinataire :** Claude Code (auteur de l'audit original)
**Objet :** Retours consolidés de 7 revues externes sur le document `audit-structurel-parcours-oi.md`
**Date :** 14 avril 2026
**Statut :** Matière d'analyse. Les décisions finales te reviennent — tu es le seul à avoir le code sous les yeux.

---

## Comment lire ce document

Sept agents ont critiqué l'audit (Claude Opus, ChatGPT, DeepSeek, Grok, Copilot v1+v2, Gemini, Kimi). Ce document extrait **ce qui vaut la peine d'être considéré**, pas les redites. Les sept confirment unanimement Option B via Option A progressif — ce consensus est noté mais n'est pas le sujet.

Le document est structuré en quatre parties :

1. **Contributions techniques à intégrer** — idées concrètes qui ont émergé et méritent d'être dans le plan final
2. **Angles morts collectifs** — points qu'aucun agent n'a levés correctement et que tu es seul à pouvoir trancher
3. **Désaccords réels** — tensions entre agents sur des paramètres d'exécution
4. **Corrections et précisions à l'audit initial** — erreurs ou imprécisions que les critiques ont révélées

---

## 1. Contributions techniques à intégrer

### 1.1 Contrat TypeScript — dériver les types depuis l'union discriminée

**Source : Kimi (formulation retenue), Gemini (idée initiale)**

Le point le plus important techniquement. Tous les autres agents proposaient `TProps = any` ou `any` direct dans le contrat, ce qui tue la sécurité de type que ton discriminated union apporte. La bonne formulation :

```typescript
export interface NRVariantConfig<T extends NonRedactionData = NonRedactionData> {
  slug: T["type"];

  // Builders typés — le payload est automatiquement dérivé du slug
  buildConsigne: (payload: T["payload"]) => string;
  buildGuidage: (payload: T["payload"]) => string;
  buildCorrige: (payload: T["payload"]) => string;

  normalize: (raw: unknown) => T["payload"] | null;

  // UI
  bloc3Component: () => Promise<{ default: ComponentType<Bloc3Props<T>> }>;
  bloc4Component: () => Promise<{ default: ComponentType<Bloc4Props<T>> }>;
  bloc5Component: ComponentType<Bloc5Props<T>>;

  // Print
  parseForStudentPrint: (consigneHtml: string) => StudentPrintData;
  printComponent: () => Promise<{ default: ComponentType<PrintProps<T>> }>;

  // Métadonnées
  stepLabels: { step4Title: string; step4Description: string };
  anchor: string;

  // Validation publication — intègre wizard-publish-guards.ts
  validateForPublish: (payload: T["payload"]) => ValidationResult;
}
```

**Pourquoi c'est important :** avec cette forme, `ordreChronologiqueConfig: NRVariantConfig<Extract<NonRedactionData, { type: 'ordre-chronologique' }>>` et TypeScript garantit que `buildConsigne` reçoit exactement le bon type de payload. Aucune casting, aucun `any`, narrowing préservé.

Gemini avait proposé `Extract<NonRedactionData, { type: T }>['payload']` — même idée, syntaxe plus lourde. Kimi a trouvé la formulation idiomatique.

### 1.2 `validateForPublish` intégré au contrat

**Source : Kimi (seul à l'avoir soulevé)**

Ton audit liste `wizard-publish-guards.ts` comme un fichier à toucher à chaque ajout de variant (cascade `isActive*Variant` + validations parallèles). Kimi propose d'intégrer la validation _dans_ la config du variant via `validateForPublish`. Résultat : le fichier `wizard-publish-guards.ts` n'a plus besoin d'exister sous sa forme actuelle, il devient une fonction qui loop sur le registre.

À valider en lisant le code : est-ce que les validations actuelles sont purement intra-variant, ou est-ce qu'il y a des règles cross-variant (ex : "si le document choisi est X, alors…") qui ne tiennent pas dans un contrat par variant ?

### 1.3 `assertNever` pour l'exhaustivité à la compilation

**Source : Grok**

Le garde-fou structurel qui empêche un variant d'être oublié dans le registre. L'idée : quelque part dans le code (par exemple dans `resolveNRContent` ou dans un test type-only), faire un `switch` exhaustif sur `NonRedactionData['type']` qui termine par `default: assertNever(slug)`. Si quelqu'un ajoute un variant à l'union sans l'enregistrer dans le registre, TypeScript refuse de compiler.

```typescript
function assertNever(x: never): never {
  throw new Error(`Variant non géré : ${JSON.stringify(x)}`);
}
```

**Tension avec la décision migration progressive :** Kimi proposait `Partial<NRRegistry>` pour permettre la cohabitation pendant le refactor, mais `Partial` désactive cette vérification. Deux options :

- **Option stricte** : registre complet dès le départ, `assertNever` actif, tous les variants migrés avant la première PR.
- **Option progressive** : `Partial<NRRegistry>` + test runtime qui itère sur l'union et vérifie la présence dans le registre (Gemini) + warning explicite pour les slugs manquants.

Tu connais ta tolérance au risque sur ce repo — tranche en fonction.

### 1.4 Nuance lazy vs synchrone pour les composants

**Source : Kimi (seul)**

Kimi propose `Bloc3`/`Bloc4` lazy loaded (code splitting via `React.lazy`) et `Bloc5` synchrone (souvent léger, Suspense ajoute du bruit pour rien). C'est une heuristique plausible mais à valider contre le code réel :

- Est-ce que `Bloc5OrdreChronologique`, `Bloc5LigneDuTemps`, `Bloc5AvantApres` sont réellement légers ?
- Est-ce que `Bloc3`/`Bloc4` valent le coût Suspense (taille, dépendances, import TipTap ou non) ?

Si Bloc5 importe aussi TipTap ou d'autres grosses dépendances, tout mettre en lazy. Sinon, l'asymétrie de Kimi est une bonne idée.

### 1.5 Traitement explicite de `formStateToTae` (deprecated)

**Sources : Gemini et DeepSeek (convergent)**

`formStateToTae` est marquée deprecated mais encore consommée par `PrintableFichePreview`. Deux agents ont traité ce point explicitement : ne pas la laisser vivre après le refactor, la rebrancher sur `resolveNRContent` pendant la migration, puis la supprimer quand plus rien ne l'appelle. Sinon le refactor crée une cinquième cascade fantôme à maintenir.

Concrètement, étape obligatoire dans le plan : **une phase terminale qui solde cette dette**, pas un "à faire plus tard".

### 1.6 Fallback silencieux (P5) — correction structurelle

**Sources : Kimi + Gemini (approches complémentaires)**

P5 était sous-estimé dans l'audit initial. Les deux corrections à combiner :

- **Compilation** : `assertNever` pour que l'union et le registre restent alignés (Grok, voir 1.3).
- **Runtime** : dans `resolveComportementSlug`, si le slug existe dans `oi.json` mais pas dans le registre, logger une erreur explicite et optionnellement afficher une bannière "en cours de développement" dans le wizard au lieu de fallback silencieux vers rédactionnel (Gemini).

Ce n'est pas un gros travail — peut-être 30 lignes — mais ça élimine une classe de bugs silencieux.

---

## 2. Angles morts collectifs

**Points qu'aucun agent n'a traités correctement.** Ce sont les décisions que tu es seul à pouvoir prendre parce qu'elles dépendent du code réel.

### 2.1 Couplage UI/serveur dans Next.js 15 App Router

**Statut : non résolu par aucun agent.**

Tous les agents proposent un `NR_VARIANT_REGISTRY` unique qui contient à la fois les builders (pures fonctions serveur-safe) et les composants React (client). Le problème :

- `selectNRContent`, `publish-tae-payload`, `resolveNRContent` sont probablement appelés depuis des Server Components ou des actions serveur.
- `wizardBlocResolver`, `Bloc5`, `PrintableFichePreview` sont des composants client.
- Si les deux importent le _même_ registre, le bundler (Turbopack/Webpack) doit correctement identifier les frontières.

Kimi évite le problème par construction en utilisant `() => Promise<{ default: ComponentType }>` (lazy), ce qui retarde l'import jusqu'à l'appel côté client. **Mais** : est-ce que Next.js 15 traite correctement ces lazy imports quand ils sont référencés depuis un objet importé côté serveur ? Dans mon expérience, ça dépend des directives `'use client'` et de la façon dont le fichier qui contient le registre est taggué.

**Questions à trancher en lisant le code :**

1. Depuis quels contextes `selectNRContent` et `publish-tae-payload` sont-ils appelés ? Server Components ? Route handlers ? Server actions ? Client Components ?
2. Le fichier qui contiendrait `NR_VARIANT_REGISTRY` aurait-il besoin d'une directive `'use client'` ou serait-il neutre ?
3. Est-ce que séparer en deux registres (`nr-content-registry.ts` purement serveur + `nr-ui-registry.ts` côté client) simplifierait ou compliquerait la structure ?

**Recommandation par défaut si le doute subsiste** : deux registres séparés. Le coût est faible (un fichier de plus), et ça élimine une classe de bugs de bundling difficiles à diagnostiquer. Mais toi seul peux dire si c'est nécessaire.

### 2.2 Stratégie de non-régression des builders HTML

**Statut : aucun agent ne l'a soulevé.**

Tu as ~50k lignes de builders qui produisent du HTML consommé par TipTap, le reducer, le preview, le print, et potentiellement Supabase. Le refactor Option B touche au _routing_ de ces builders, pas à leur logique interne — mais pendant la migration, il est trivial d'introduire une différence d'un espace, d'un attribut, d'un ordre de nœuds qui casse un test d'intégration ou pire, un rendu en production.

**Approche recommandée :**

1. **Avant** de commencer le refactor, produire un snapshot des HTML générés par chaque builder sur un jeu de payloads de référence (les fixtures des tests existants suffisent probablement).
2. **Après** chaque phase du refactor, rejouer le snapshot et diff byte-à-byte. Zéro différence attendue.
3. Les tests actuels (~17 000 lignes sur les payloads) testent probablement les builders isolément. Ils ne couvrent pas forcément le _chemin complet_ state → resolver → builder → HTML. Le snapshot de bout en bout attrape les régressions du routing, pas des builders.

Si ce type de test n'existe pas encore, ajouter un fichier de snapshot (un seul) est probablement 2-3 heures de travail et c'est le seul filet de sécurité réel pendant la migration.

### 2.3 Ordre de migration des variants

**Statut : tous les agents supposent "n'importe lequel".**

Mais ton audit note que `avant-apres` a un cas spécial dans le reducer (`UPDATE_DOCUMENT_SLOT` qui reset les options si le document change). C'est un signal : `avant-apres` est le variant le plus couplé au reste de l'état, donc le pire premier candidat.

**Ordre de migration suggéré, à valider :**

1. **`ordre-chronologique` en premier** — c'est probablement le plus simple (grille numérotée, pas de cas spécial dans le reducer). Il sert à valider l'architecture sur un cas propre.
2. **`ligne-du-temps` en deuxième** — frise SVG, probablement intermédiaire en complexité.
3. **`avant-apres` en dernier** — le cas spécial `UPDATE_DOCUMENT_SLOT` est traité quand l'approche est stabilisée sur les deux premiers. Tu sais déjà à ce moment-là si le contrat `NRVariantConfig` tient la route ou s'il faut l'étendre pour ce cas.

À valider : la complexité relative des builders peut inverser cet ordre. Si `ordre-chronologique-payload.ts` fait 17k lignes et `ligne-du-temps-payload.ts` en fait 14k, commencer par le plus petit (`ligne-du-temps`) peut être plus rapide pour une première validation. Toi seul peut trancher.

---

## 3. Désaccords réels entre agents

### 3.1 Estimation du temps de migration

| Agent                     | Estimation                                               |
| ------------------------- | -------------------------------------------------------- |
| DeepSeek                  | 3 jours solo                                             |
| Claude Opus (ma critique) | 6-8 jours solo, étalés sur 2 semaines                    |
| Kimi                      | Phases sans estimation ("semaine suivante" pour phase 2) |
| Autres                    | Pas d'estimation                                         |

Mon estimation tenait compte de : l'absence de tests de non-régression (à écrire, 2.2), la complexité du cas `avant-apres` (2.3), et la règle empirique "multiplier par 2-3 pour du refactor architectural sur code métier dense". Si tu as déjà des tests de snapshot HTML, réduire vers 4-5 jours est plausible.

### 3.2 Nombre de fichiers final après refactor

| Agent      | Estimation |
| ---------- | ---------- |
| Grok       | 16 → 6     |
| Kimi       | 16 → 4-5   |
| Copilot v2 | 16 → 6     |

Kimi est optimiste parce qu'il compte "0" pour le reducer et l'hydratation alors qu'il faut au minimum ajouter une branche à l'union et une ligne à l'hydratation. **La cible réaliste est 6 fichiers par variant** :

1. 1 ligne dans `variant-slugs.ts` (ou automatique via oi.json)
2. 1 branche dans `NonRedactionData` (union discriminée)
3. 1 nouveau fichier `variants/<slug>.ts` (la config)
4. 1 nouveau fichier de builder (~2000+ lignes de logique métier — c'est le gros du travail _réel_)
5. 2 composants UI (Bloc3/4 ou Bloc3/4/5)
6. 1 composant Print

Plus les tests (3-6 fichiers supplémentaires). Le gain par rapport à 16 n'est pas dans le nombre absolu de fichiers mais dans le fait qu'**aucun de ces fichiers ne touche à du code partagé** — pas de modification de resolver, pas d'ajout de branche dans une cascade, pas de ternaire à étendre.

### 3.3 `Partial<NRRegistry>` vs registre complet

Désaccord entre Kimi (partiel pour migration progressive) et Grok (complet avec `assertNever`). Les deux sont défendables selon la stratégie de migration. Voir 1.3 pour le trade-off.

---

## 4. Corrections et précisions à l'audit initial

**Points où les critiques ont révélé des imprécisions dans le document original.**

### 4.1 P5 sous-évalué

L'audit classait le fallback silencieux de `resolveComportementSlug` comme un problème mineur. Les critiques convergent pour dire que c'est un problème **structurel** qui mérite un traitement de première classe (compilation + runtime, voir 1.6).

### 4.2 "14k-22k lignes" pour les builders

Ma critique initiale doutait de ces chiffres. Tu es l'auteur et tu as le code — si c'est mesuré, c'est mesuré. À retenir : cette taille _confirme_ que le refactor ne doit pas toucher à l'intérieur des builders, seulement au routing. Tous les agents convergent là-dessus.

### 4.3 Couche 2 (State) — initialisation par variant

L'audit mentionne `initialNonRedactionForSlug()` comme un 3-way if cascade dans le reducer. Dans le refactor, cette fonction devient `NR_VARIANT_REGISTRY[slug].initialPayload()`, ce qui est plus propre mais _pas_ gratuit : il faut s'assurer que l'appel n'a pas d'effet de bord et que l'initialisation reste pure (pas de `Date.now()`, pas de `Math.random()` non-déterministe pour les tests).

### 4.4 `oi.json` reste la source de vérité pour `comportementId → slug`

Grok avait proposé de mettre `comportementIds: ['oi1-1.1', ...]` dans la config de chaque variant, dupliquant `oi.json`. Mauvaise idée, l'audit est explicite là-dessus : le registre auto-construit depuis `oi.json` est un des points qui fonctionne bien et qu'il faut préserver.

---

## 5. Plan d'action proposé (à valider)

**Phase 0 — Filet de sécurité (avant tout refactor)**

- Produire un snapshot HTML des 3 builders actuels sur fixtures de référence
- Commit isolé, point de retour en cas de problème

**Phase 1 — Option A minimale (factory centralisée)**

- Créer `resolve-nr-content.ts` avec la fonction `resolveNRContent`
- Rebrancher `selectNRContent`, `publish-tae-payload`, `fiche-helpers` (formStateToTae), `wizard-publish-guards` dessus
- Les cascades existantes disparaissent, mais les isActive\*, composants wizard, step labels restent inchangés
- Rejouer le snapshot : zéro diff attendu
- **C'est une phase réversible et autonome.** Elle élimine P1 et P2 sans toucher à l'UI.

**Phase 2 — Contrat NRVariantConfig et premier variant**

- Définir `NRVariantConfig<T>` avec la syntaxe Kimi
- Créer `variants/ordre-chronologique.ts` (ou `ligne-du-temps` si plus simple)
- Créer `NR_VARIANT_REGISTRY` (décision : `Partial` ou complet ? voir 1.3)
- Migrer `resolveNRContent` pour consommer le registre pour ce variant uniquement
- Les deux autres variants passent encore par l'ancienne cascade (cohabitation temporaire)
- Rejouer le snapshot

**Phase 3 — Migration des deux autres variants**

- Même travail pour les deux restants, un par un
- `avant-apres` en dernier si le cas spécial `UPDATE_DOCUMENT_SLOT` complique le contrat
- À la fin : plus aucune cascade manuelle dans les 4 fichiers cibles

**Phase 4 — Migration UI (wizard + print)**

- `wizardBlocResolver` consomme `NR_VARIANT_REGISTRY[slug].bloc3Component` (lazy)
- `Bloc5.tsx` : lookup déclaratif sur le registre
- `index.tsx` step labels : `NR_VARIANT_REGISTRY[slug]?.stepLabels ?? DEFAULT`
- Suppression des 4 fonctions `isActive*Variant()`, remplacées par `getActiveVariantSlug()`

**Phase 5 — Solder les dettes**

- Supprimer `formStateToTae` (deprecated) maintenant que `PrintableFichePreview` est branché sur le nouveau helper
- Supprimer `wizard-publish-guards.ts` si `validateForPublish` l'a absorbé
- Ajouter le `console.error` + bannière pour les slugs non implémentés (P5)
- Mettre à jour l'audit structurel pour refléter la nouvelle architecture

**Phase 6 — Garde-fous**

- Ajouter le test type-only avec `assertNever` (si registre complet)
- Ou le test runtime qui itère sur l'union et vérifie la présence dans le registre (si `Partial`)
- Un test d'intégration qui instancie un variant fictif minimal pour valider que le contrat fonctionne

---

## 6. Questions que toi seul peux trancher

1. **Couplage UI/serveur** : depuis quels contextes (Server Component, route handler, action, Client Component) les builders sont-ils appelés ? Deux registres séparés ou un seul avec lazy imports ?
2. **Complexité réelle des composants Bloc5** : synchrones ou lazy ?
3. **`validateForPublish` cross-variant** : y a-t-il des validations qui dépendent de l'état global et ne tiennent pas dans un contrat par variant ?
4. **Stratégie du registre** : `Partial` (progressif, moins sûr) ou complet (strict, big-bang) ?
5. **Ordre de migration des variants** : `ordre-chronologique` en premier est ma recommandation par défaut, mais la taille relative des builders peut la renverser.
6. **Tests de non-régression** : existent-ils déjà au niveau "state → HTML complet" ou faut-il les créer en Phase 0 ?

---

## Résumé des 7 critiques (classement par utilité technique)

1. **Kimi** — meilleur contrat TypeScript, seul à proposer `validateForPublish`, nuance lazy/synchrone
2. **Gemini** — `Extract<...>` comme idée-mère, phasage explicite de `formStateToTae`
3. **DeepSeek** — exécution concrète (reducer, PrintableFichePreview), migration incrémentale
4. **Grok** — phasage décisionnel + `assertNever`
5. **Claude Opus (critique initiale)** — trois angles morts collectifs (couplage, snapshots, ordre), typage faible à corriger
6. **Copilot v2** — "dispersion du contrat" comme formulation, tableau approximatif
7. **ChatGPT** — validation générique sourcée (Strategy, Registry patterns)

_Copilot v1 est ignoré (reformulation du document original sans apport)._

---

_Document de synthèse généré pour Claude Code. Aucune décision n'est imposée — chaque recommandation est à valider contre le code réel du repo._
