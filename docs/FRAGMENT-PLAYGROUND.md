# Fragment Playground — Guide d'intégration

> **Conventions de nommage** (fragments français, `Fragment` / `App` / `Print`) : **[CONVENTIONS-FRAGMENTS.md](./CONVENTIONS-FRAGMENTS.md)** — référence à suivre pour tout nouveau code.

> **Outil DEV uniquement.** Route `/dev/fragments` — désactivée automatiquement en production (`NODE_ENV === "production"` → `notFound()` + `dynamic = "force-dynamic"`).  
> Pas de Supabase. Pas d'auth. Données fictives uniquement.

---

## Ce que c'est

Un environnement DEV pour comparer **le même jeu de données fiche** (`TaeFicheData`, `lib/types/fiche.ts`) sous **plusieurs contextes d'affichage** réels du produit, et ce **par comportement attendu** (`comportement_id` dans `public/data/oi.json`).

**Navigation :** liste groupée par **opération intellectuelle** (données via `useOiData()` → `/data/oi.json`). Les comportements non sélectionnables au Bloc 2 (`isComportementSelectable`) ou sans mock playground restent visibles avec le libellé **[BLOC2_OI_COMING_SOON](./UI-COPY.md)** (même clé que l'étape 2).

**Contextes (onglets) :**

| Onglet     | Composant(s) monté(s)                                                                 | Remarque                          |
| ---------- | --------------------------------------------------------------------------------------- | --------------------------------- |
| Wizard     | Placeholder phase 1 — phase 2 : formulaire ou storyboard                                |                                   |
| Sommaire   | `FicheTache` `mode="sommaire"`                                                          | Même shell que colonne droite wizard |
| Lecture    | `FicheTache` `mode="lecture"`                                                           | Équivalent fiche `/questions/[id]` |
| Thumbnail  | `TaeCard`                                                                               | Carte condensée (liste / banque)  |
| Print      | `PrintableFicheFromTaeData` — **pas** `PrintableFichePreview` (celui-ci dépend du `FormState` wizard) | Deux feuillets dossier / questionnaire |

**Mocks :** `lib/fragment-playground/mocks.ts` — une entrée `MOCK_TAE_FICHE_BY_COMPORTEMENT_ID` par comportement **sélectionnable** avec mock (15 ids : 0.1, 1.1–1.3, 3.1–3.5, 4.1–4.2, 6.1–6.3, 7.1). `outilEvaluation` aligné sur `oi.json`. Parcours **1.1, 1.2, 1.3** : HTML consigne / corrigé / guidage produit par les **mêmes builders** que la publication (`buildOrdreChronologiqueConsigneHtml`, `buildLigneDuTempsConsigneHtml`, `runAvantApresGeneration` + `buildAvantApresConsigneHtml`, etc.) pour satisfaire les parseurs impression.

**Persistance locale :** `PLAYGROUND_LOCAL_STORAGE_COMPORTEMENT_KEY` dans `lib/fragment-playground/types.ts` — dernier `comportement_id` choisi.

**Mode d'affichage (`PlaygroundViewMode`) :**

- **Vue complète** — composant produit tel quel (`FicheTache`, `TaeCard`, `PrintableFicheFromTaeData`) lorsque le mode **Debug** est désactivé.
- **Fragment isolé** — liste déroulante des fragments disponibles pour l’onglet courant ; un seul bloc rendu, centré avec marge (voir `playground-fragment-catalog.ts`). Implémenté via des **miroirs playground** (`PlaygroundFicheRenderer`, etc.) qui réutilisent les mêmes sous-composants que les fichiers prod **sans les modifier**.

**Mode debug** — case à cocher discrète en haut à droite de la zone de preview :

- Le conteneur preview porte `data-playground-preview="true"` et, si activé, `data-debug="true"`.
- Chaque fragment exposé par le playground est enveloppé par `PlaygroundFragmentWrapper` (`data-fragment="…"`) — **jamais** d’attribut ajouté dans les composants prod.
- Styles : `components/playground/playground-debug.module.css` — contours pointillés colorés par fragment et étiquette `::before` avec la valeur de `data-fragment`.
- **Onglet Print + debug** : repère horizontal rouge pointillé à **893 px** du haut de la zone de preview (référence zone utile Lettre US, marges 2 cm) avec libellé **saut de page**.

Lorsque le **debug** est actif, Sommaire / Lecture / Thumbnail passent par les miroirs playground pour pouvoir décorer chaque bloc ; hors debug, la vue complète utilise à nouveau les composants racine prod inchangés.

**Print — vue complète + debug :** un seul enveloppe `data-fragment="PrintableFicheFromTaeData"` autour du composant prod (le contenu interne des deux feuillets n’est pas découpé sans dupliquer tout le module d’impression). Utiliser **Fragment isolé** (`PrintDossier`, `PrintQuestionnaire`, etc.) pour des repères par bloc.

## Ce que c'est PAS

- Ce n'est **pas** une page `/questions/[id]` complète — pas de shell app, pas de données persistées
- Les données viennent de **`lib/fragment-playground/mocks.ts`**, pas de Supabase
- Le playground n'influence **pas** le bundle de production (aucun import `components/playground/` ou `mocks` hors DEV)

## Règle de continuité des identifiants (obligatoire)

Le playground doit utiliser **exactement les mêmes identifiants métier** que les **sources de vérité du projet à l'instant T**, sans alias local ni parallèle « playground only ».

- `oi_id` (ex. `OI1`)
- `comportement_id` (ex. `1.3`)
- `variant_slug` (ex. `avant-apres`, `ligne-du-temps`)
- `outil_evaluation` (ex. `OI1_SO3`)
- Clés de payload non-rédactionnel (`non_redaction_data`) conservées telles quelles

**Interdit :** créer des identifiants de convenance (`modeA`, `comp-1`, etc.) qui n'existent dans aucune source canonique — le playground ne définit pas son propre référentiel.

**Objectif :** garantir un branchement / transfert direct vers l'app (wizard, fiche, impression, RPC) avec adaptation minimale.

**Sources de vérité :**

- `public/data/oi.json`
- `public/data/grilles-evaluation.json`
- `lib/tae/` (helpers, payloads et types)

### Évolution volontaire du référentiel (granularité, modularité, scalabilité)

La règle ci-dessus **n'interdit pas** de changer les identifiants métier quand c'est une **décision d'architecture / produit** : meilleure granularité, modularité, évolution du schéma, etc.

Dans ce cas, l'ordre est toujours le même :

1. **Décider et tracer** la nouvelle convention (où c'est normé : [DECISIONS.md](./DECISIONS.md), [ARCHITECTURE.md](./ARCHITECTURE.md) si SQL / RPC / fichiers de données).
2. **Mettre à jour les sources de vérité** en premier (types, payloads dans `lib/tae/`, migrations Supabase si la base porte les ids). Les **JSON référentiels** sous **`public/data/`** sur lesquels l’app est fondée **ne font pas l’objet de modifications** en développement courant (immuables sauf nécessité absolue) — voir [DECISIONS.md](./DECISIONS.md) § Référentiels `public/data/*.json`.
3. **Faire suivre l'application** (wizard, fiche, impression, actions / RPC).
4. **Aligner le playground** sur le nouveau référentiel — le playground **suit** la vérité canonique, il ne la précède pas.

Ainsi il n'y a **jamais** deux jeux d'identifiants en concurrence (anciens seulement dans l'app, nouveaux seulement dans le playground) : une fois la migration faite, mocks et sélecteurs DEV utilisent les **mêmes** ids que la prod.

---

## Fichiers du playground

```
lib/fragment-playground/
  types.ts                      → `PlaygroundDisplayContext`, `PlaygroundViewMode`, clé `localStorage`
  mocks.ts                      → `MOCK_TAE_FICHE_BY_COMPORTEMENT_ID`, `getMockTaeFicheForComportement`
  playground-fragment-catalog.ts → Liste des fragments isolables par onglet

components/playground/
  FragmentPlayground.tsx          → État global (contexte, vue, debug, fragment isolé par onglet)
  PlaygroundBehaviorSelector.tsx  → Liste OI × comportements
  PlaygroundContextCanvas.tsx     → Onglets, toolbar vue, preview + toggle Debug
  PlaygroundFragmentWrapper.tsx   → `data-fragment` (playground uniquement)
  PlaygroundFicheRenderer.tsx   → Miroir `FicheTache` + mode isolé
  PlaygroundTaeCardRenderer.tsx   → `TaeCard` ou sous-blocs (isolé / debug)
  PlaygroundPrintRenderer.tsx     → `PrintableFicheFromTaeData` ou blocs print isolés
  playground-debug.module.css     → Contours et repère « saut de page » (print + debug)

app/dev/fragments/
  page.tsx    → Garde production
```

---

## Ajouter ou ajuster un mock

1. Vérifier que le `comportement_id` existe dans `oi.json` et est **sélectionnable** (`nb_documents` renseigné, `status !== coming_soon` au niveau comportement si défini).
2. Ajouter une entrée dans `MOCK_TAE_FICHE_BY_COMPORTEMENT_ID` typée **`TaeFicheData`** (`lib/types/fiche.ts` uniquement — ne pas recréer le type ailleurs).
3. Pour un parcours NR, préférer les **builders** `lib/tae/non-redaction/*-payload.ts` pour la consigne publiée afin que l'onglet Print reste cohérent avec `parse*ForStudentPrint`.
4. `npm run lint && npm run build` ; mettre à jour ce document (table des onglets ou liste des ids mockés si besoin).

---

## Format papier de référence

**Le projet utilise le format Lettre US** — voir `lib/tae/print-page-css.ts` et `app/globals.css` :

```
Format   : Lettre US — 8,5 × 11 po
Marges   : 2 cm partout  (TAE_PRINT_PAGE_MARGIN, --tae-print-sheet-padding)
Zone utile : ~6,9 po × ~9,3 po
Police corps : Arial 11pt / line-height 1.5 (@media print + .paper)
Police grilles : Arial, tailles propres à eval-grid.module.css
```

Puppeteer (à implémenter — ex. route `/api/pdf/[id]`) :

```ts
await page.pdf({
  format: "Letter", // jamais "A4"
  margin: { top: "2cm", bottom: "2cm", left: "2cm", right: "2cm" },
  printBackground: true,
});
```

---

## Règles absolues

```
✅ lib/types/fiche.ts              → type canonique `TaeFicheData` (jamais dupliqué dans le playground)
✅ lib/fragment-playground/types.ts → uniquement ce qui ne relève pas de la fiche (onglets, clé storage)
✅ lib/fragment-playground/mocks.ts → importable **uniquement** depuis `components/playground/*`
✅ components/playground/          → UI DEV uniquement

❌ Ne jamais importer components/playground/ dans du code de production
❌ Ne jamais importer lib/fragment-playground/mocks.ts hors du playground
✅ npm run lint && npm run build après branchement
```

---

## Éléments d'épreuve / fragments hors maquette fiche

Les blocs **StudentId**, **Header**, **Footer** épreuve (spec historique dans les anciennes versions de ce document) ne sont **pas** couverts par la matrice fiche actuelle ; les traiter dans un prolongement dédié ou dans [CONVENTIONS-FRAGMENTS.md](./CONVENTIONS-FRAGMENTS.md) lorsqu'un composant stable existe.

---

## Références croisées projet

| Besoin                          | Fichier                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| Données fiche                   | `lib/types/fiche.ts` (`TaeFicheData`)                                |
| Grilles d'évaluation            | `components/tae/grilles/grille-registry.tsx`, `eval-grid.module.css` |
| Source textes grilles           | `public/data/grilles-evaluation.json`                                |
| Impression depuis `TaeFicheData`| `PrintableFicheFromTaeData` dans `PrintableFichePreview.tsx`         |
| CSS print + @page Letter        | `lib/tae/print-page-css.ts`, `app/globals.css`                       |
| Comportements non-rédactionnels | `lib/tae/non-redaction/`, `docs/wizard-oi-non-redactionnelle.md`     |
| Référentiel OI (fetch client)   | `useOiData` — `components/tae/TaeForm/bloc2/useBloc2Data.ts`         |
