# Print Engine — Spécification d'architecture (v2.1)

**Statut :** verrouillé après audit 6 agents + audit d'implémentabilité Claude Code (2026-04)
**Portée :** chaîne de rendu wizard → aperçu → carrousel → PDF Puppeteer
**Contexte :** ÉduQc.IA, plateforme solo Next.js 15 / Supabase / TipTap, création d'épreuves d'histoire pour le secondaire québécois
**Version :** 2.1 — intègre les corrections d'implémentabilité + arbitrages des 3 questions ouvertes + conventions de nommage + clarifications audit v2

---

## Changements depuis la v2

1. **Renommage `FicheTache` → `DonneesTache`** : type pivot unique pour toutes les données d'une tâche. Plus de type parallèle — un seul type, des `Pick` locaux là où seul un sous-ensemble est nécessaire.
2. **Emplacements de fichiers ajustés** : `lib/tache/contrats/donnees.ts` (était `fiche.ts`), `lib/tache/contrats/etat-wizard-vers-tache.ts` (était `etat-wizard-vers-fiche.ts`).
3. **Hydratation `EspaceProduction` et `OutilEvaluation`** détaillée dans D0 avec mapping explicite depuis les champs legacy.
4. **Cohabitation avec les selectors existants** : note explicite — les selectors de `lib/fiche/selectors/` restent pour le sommaire wizard, `etatWizardVersTache` est le mapper officiel pour la chaîne d'impression. Pas de refactor des selectors dans D0.
5. **Wipe alpha explicité** : `DELETE FROM tae;` manuel avant le merge de D0. Toutes les TAÉ (rédactionnelles et NR) sont supprimées. Utilisateurs alpha prévenus.
6. **Scope des `window.print()` supprimés clarifié** : épreuves uniquement (`TaeFichePrintView`, `EvaluationFichePrintView`, `PrintPreviewModal`). Les fichiers d'impression de documents individuels (`DocumentPrintView`, `DocumentWizardPrintModal`) restent sur `window.print()`.
7. **Type pivot unique** : l'audit v2 proposait un type parallèle ; tranché vers l'extension du type existant `TaeFicheData` → `DonneesTache`.

### Changements depuis la v1 (historique)

1. **Nommage** : conforme à la convention du repo (kebab-case, français, entité `tache`/`epreuve`, pas de préfixe technique dans les noms). Le legacy `tae` est grandfathered, le nouveau code utilise `tache`.
2. **Contexte alpha** : pas de migration de données. Les TAÉ NR publiées avec des ancres HTML sont **wipées** avant déploiement de D0. Aucun parser de compatibilité legacy.
3. **En-tête d'épreuve** : hauteur fixe plafonnée à **80px** (Option A tranchée par les 6 agents). `MAX_CONTENT_HEIGHT` calculé à partir de cette constante. Chicken-and-egg résolu.
4. **Guidage simplifié** : `{ content: string } | null`. Pas de champ `position`. Si un besoin émerge plus tard, extension sans migration.
5. **3 feuillets confirmés** : `dossier-documentaire`, `questionnaire`, `cahier-reponses`. Exigence du mode épreuve ministérielle.
6. **Draft-token signé HMAC** : le token du wizard draft est signé avec une clé stockée dans `process.env.DRAFT_TOKEN_SECRET` pour empêcher l'accès par brute-force.
7. **Vercel KV** : stockage officiel pour les drafts, TTL 10 minutes.
8. **Ordre d'implémentation révisé** : D0 → D6 → D3 → D2 → D1 pour résoudre les dépendances de hauteur.
9. **`PlaygroundPrintRenderer` ignoré** : outil de dev interne, sera cassé par D0 et corrigé plus tard si besoin.
10. **Logique existante réutilisée** : `flattenDocumentsWithGlobalNumbers` et `rewriteTaeHtmlDocRefsForEvaluationPrint` (dans `lib/evaluations/evaluation-print-doc-map.ts`) sont refactorisés et réutilisés dans `epreuveVersPaginee`.
11. **Distinction `EspaceProduction` vs `OutilEvaluation`** : deux types distincts pour éviter la confusion entre "grille de réponse" (cases A/B/C/D) et "grille d'évaluation" (critères et points).

---

## 0. Invariants produit (non négociables)

1. **Aperçu = PDF.** Le carrousel d'aperçu avant téléchargement affiche des PNG rasterisés depuis le PDF réel. L'identité est mathématique.

2. **Quadruplet insécable.** Un quadruplet (consigne + guidage + espace de production + outil d'évaluation) ne peut jamais être coupé sur deux pages. Débordement = erreur bloquante.

3. **Pas de réduction automatique de police.** L'accessibilité prime. Débordement = correction par l'enseignant.

4. **Austérité graphique.** Arial uniquement, noir uniquement, images noir et blanc, pas d'ombres, pas de dégradés, pas de transparence. Choix architectural délibéré qui élimine la quasi-totalité des dérives Chromium desktop vs headless.

5. **Un seul composant de rendu.** `ApercuImpression` est rendu identiquement par le wizard (aperçu live), la route SSR (Puppeteer), et la génération PNG (carrousel). Toute divergence entre ces trois points d'entrée est un bug.

6. **Formatif non-atomique.** Le mode formatif n'impose pas l'atomicité document↔tâche. Seul le quadruplet est atomique. Un document et son quadruplet peuvent être séparés par un saut de page naturel.

---

## 1. Terminologie — `EspaceProduction` vs `OutilEvaluation`

Dans une TAÉ, le quadruplet contient deux structures distinctes qui étaient ambiguëment nommées "grille" dans la v1 :

- **`EspaceProduction`** — la zone où l'élève produit sa réponse. Types possibles : lignes vierges, cases (A/B/C/D pour OI1 ordre chrono), zone libre.
- **`OutilEvaluation`** — l'outil servant à évaluer la production. Critères, niveaux de performance, descripteurs, points.

Ce sont deux concepts orthogonaux. Un quadruplet a un `EspaceProduction` **et** un `OutilEvaluation`. Ils ne se confondent jamais.

---

## 2. Décisions verrouillées

### D0 — Contrat de données `DonneesTache`

**Décision :** refactor préalable et bloquant du contrat de données. Blast radius estimé à **~18 fichiers** (voir section 8).

**Pourquoi bloquant :**

- Le pager isomorphe doit mesurer consigne, guidage et espace de production **séparément** pour décider d'un saut de page. Le guidage encodé dans une string HTML monolithique avec ancre `<!--eduqcia:...-->` force un split par regex au rendu, ce qui tue les performances et rend les mesures non-déterministes.
- Aucun test de régression visuel ne détectera une **absence silencieuse de contenu sémantique** (ex: guidage disparu après re-sérialisation Puppeteer). Seul un contrat structuré l'empêche.
- En alpha, les données existantes sont wipées. Wipe alpha = `DELETE FROM tae;` manuel exécuté avant le merge de D0. Toutes les TAÉ (rédactionnelles et non-rédactionnelles) sont supprimées. Pas de script de migration, pas de parser legacy. Les utilisateurs alpha sont prévenus.

**Type pivot unique — `DonneesTache` :**

`DonneesTache` est le type pivot unique pour toutes les données d'une tâche. Il remplace le legacy `TaeFicheData` et contient tout ce que le wizard "Créer une tâche" récolte : métadonnées métier (oi, comportement, connaissances, niveau, discipline, version, is_published, etc.), consigne, guidage structuré, documents, espaceProduction, outilEvaluation résolu, corrigé.

Pas de type parallèle. Le print-engine consomme un sous-ensemble via un `Pick` local dans le fichier de pagination ou de transformation, pas un type nommé séparé :

```typescript
// Dans lib/epreuve/transformation/epreuve-vers-paginee.ts
type TacheImpression = Pick<
  DonneesTache,
  | "id"
  | "titre"
  | "consigne"
  | "guidage"
  | "documents"
  | "espaceProduction"
  | "outilEvaluation"
  | "corrige"
>;
```

**Type `Guidage` :**

```typescript
type Guidage = { content: string } | null;
```

Pas de champ `position`. Visibilité décidée par le mode d'impression dans la transformation `epreuveVersPaginee`, pas par le contrat.

**Règles de visibilité du guidage (appliquées par `epreuveVersPaginee`) :**

- Visible en mode `formatif`.
- Masqué en mode `sommatif-standard` et `epreuve-ministerielle`.

**Règles de visibilité des titres de documents (idem) :**

- Visibles en mode `formatif`.
- Masqués en mode `sommatif-standard` et `epreuve-ministerielle` (documents anonymes, seule la matière compte).

**Remplacement de `formStateToTae` :** la fonction existante `lib/tae/fiche-helpers.ts:formStateToTae` marquée `@deprecated` est supprimée. Remplacée par `lib/tache/contrats/etat-wizard-vers-tache.ts:etatWizardVersTache`, pure, testée unitairement.

**Hydratation dans `etatWizardVersTache` :**

- `espaceProduction.type = 'lignes'` si `showStudentAnswerLines === true` (comportement rédactionnel), avec `nbLignes` depuis le champ existant `nb_lignes`.
- `espaceProduction.type = 'cases'` si `nonRedactionData.type === 'ordre-chronologique'`, avec `options: ['A', 'B', 'C', 'D']`.
- `espaceProduction.type = 'libre'` pour les variantes ligne du temps et avant/après.
- `outilEvaluation` : le champ legacy est une string (ID de grille dans `grilles-evaluation.json`). Le mapper charge le contenu du JSON et le résout en `OutilEvaluation` avec `criteres: Critere[]` pré-résolus. L'hydratation se fait **une seule fois** dans le mapper, pas au rendu. Coût : ~50 lignes dans le mapper.

**Cohabitation avec les selectors existants :** les selectors de `lib/fiche/selectors/` restent pour le sommaire wizard (affichage des métadonnées en UI live). `etatWizardVersTache` est le mapper officiel pour la chaîne d'impression. Responsabilités séparées, pas de refactor des selectors dans D0. La duplication de ~90% de logique entre les deux chemins est acceptée.

**Builders NR à modifier :** les trois builders qui injectent actuellement des ancres (`ordre-chronologique-payload.ts`, `ligne-du-temps-payload.ts`, `avant-apres-payload.ts`) doivent émettre du JSON structuré (consigne nettoyée + guidage séparé). Les parsers correspondants (`parse*ConsigneForStudentPrint`) sont supprimés.

**`rewriteTaeHtmlDocRefsForEvaluationPrint`** (`lib/evaluations/evaluation-print-doc-map.ts`) est refactorisé pour consommer `guidage.content` (string) et `consigne` (string) séparément. La logique de résolution `{{doc_A}}` est conservée et réutilisée dans `epreuveVersPaginee`.

### D1 — Source de vérité visuelle : route SSR unique

**Décision :** un seul composant React (`ApercuImpression`) est rendu par une route Next.js SSR. Puppeteer ouvre cette URL, pas de HTML sérialisé.

**Mécanisme pour les drafts wizard :**

- `POST /api/impression/token-draft` reçoit le payload en cours d'édition.
- Stockage en **Vercel KV** avec TTL 10 minutes.
- Le token est **signé HMAC** avec `process.env.DRAFT_TOKEN_SECRET` pour empêcher le brute-force et l'accès non-autorisé à des payloads non-publiés.
- Format : `{ payloadId: string; exp: number; signature: string }` encodé en base64url.
- La route SSR vérifie la signature avant de fetch le payload.

**URL** : `/apercu/[token]` pour uniformiser tous les aperçus d'impression sous un seul namespace. Les anciennes routes `/questions/[id]/print`, `/evaluations/[id]/print`, `/documents/[id]/print` restent grandfathered et redirigeront plus tard.

### D2 — Moteur de pagination : hybride isomorphe

**Décision :** pager JavaScript isomorphe (même code client et serveur) + CSS pour les finitions.

**Algorithme :** greedy first-fit 1D. Pas de 2D, pas de Knuth-Plass, pas de réarrangement.

**Constantes de dimension (Letter 96dpi) :**

```typescript
// lib/epreuve/pagination/constantes.ts

export const PAGE_HEIGHT_PX = 1056; // Letter portrait 8.5" × 11" à 96dpi
export const PAGE_WIDTH_PX = 816; // 8.5" à 96dpi
export const PAGE_MARGIN_PX = 151; // ~2cm × 2 marges verticales
export const HEADER_HEIGHT_PX = 80; // Hauteur fixe plafonnée (Option A)
export const TOLERANCE_PX = 4; // Marge de garde pour dérive subpixel
export const MAX_CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_MARGIN_PX - HEADER_HEIGHT_PX;
// = 825px disponibles pour les blocs par page
```

**Note :** ces constantes sont à valider empiriquement sur le premier prototype. Si Letter paysage ou un autre format est requis, ajuster.

**Tolérance :** ratio max `0.97` encodé dans `BlocMesure`. Avec les contraintes Arial + N&B, cette tolérance pourra potentiellement être relâchée à 0.99 après validation empirique.

**Mesure :**

- **Côté client (wizard)** : offscreen dans `position: fixed; left: -9999px; width: <pageWidthPx>`, déclenchée au clic "Aperçu" ou via debounce 500ms pour l'indicateur de remplissage. Jamais dans le DOM visible.
- **Côté serveur (Puppeteer)** : mesure finale qui fait foi pour l'erreur bloquante.

**Note sur la mesure serveur :** en Server Component Next.js, il n'y a pas de DOM. La mesure serveur se fait uniquement dans Puppeteer après navigation, via `page.evaluate()`. Pendant le développement, le pager est testable côté client et en tests unitaires avec des hauteurs mockées.

**UX d'erreur :** bloquante, message nommant la TAÉ fautive et la hauteur mesurée, bouton "Aller à cette TAÉ". Pas de réduction de police.

**Indicateur de remplissage dans le wizard :** jauge "X% de la page remplie" basée sur une mesure offscreen debouncée, affichée sous le quadruplet en cours d'édition. Bascule en rouge à 97%. Approximation, pas l'invariant — l'invariant est vérifié au PDF.

### D3 — Flux multiples : couche `EpreuvePaginee`

**Décision :** transformation pure `epreuveVersPaginee(epreuve, options, mesureur): EpreuvePaginee` qui centralise :

- Renumérotation globale des documents (réutilise `flattenDocumentsWithGlobalNumbers` de `evaluation-print-doc-map.ts`).
- Résolution `{{doc_A}}` (réutilise et adapte `rewriteTaeHtmlDocRefsForEvaluationPrint`).
- Composition par mode.
- Application du flag `estCorrige`.
- Règles de visibilité (guidage et titres de documents selon le mode).

**Pourquoi D et pas C :** le pager de D2 produit déjà `Page[]`. Exposer ce résultat comme contrat stable coûte ~300 lignes de fonction pure testable sans DOM. Refuser D disperse la logique métier dans du JSX conditionnel à chaque point d'entrée.

**API minimaliste :** ne pas transformer `EpreuvePaginee` en DSL. Un `type Page = { blocs: Bloc[] }` et une fonction pure, point.

**Corrigé :** flag orthogonal `estCorrige: boolean`, pas un 5ème mode. Appliqué dans la transformation, pas dans le rendu. N'a de sens que pour les feuillets contenant un questionnaire.

**Formatif non-atomique :** le pager applique `break-inside: avoid` sur chaque document et chaque quadruplet indépendamment. Un document et son quadruplet peuvent être séparés.

### D4 — Convergence wizard ↔ Puppeteer : défense en profondeur

**Décision :** combinaison de quatre mécanismes vérifiables, pas de discipline humaine.

1. **Route SSR unique** (D1) — élimine la sérialisation.
2. **Preflight bloquant dans Puppeteer :**
   - `await page.waitForFunction(() => document.fonts.status === 'loaded')` (Arial est système mais on vérifie quand même).
   - `await page.waitForFunction(() => Array.from(document.images).every(img => img.complete))`.
   - `MutationObserver` qui échoue si des mutations surviennent après `load`.
3. **Tests visuels Playwright :** 8 payloads golden, comparaison raster PDF vs baseline, seuil 0.1% (potentiellement 0% après validation Arial + N&B), baselines générées sur la même CI Linux, masquage des zones variables (timestamps), régénération via label GitHub spécifique. L'infra Playwright existe déjà dans le repo.
4. **Empreinte de payload** (`sha256(DonneesEpreuve + mode + estCorrige + version-assets)`) calculée dès maintenant. Ne sert pas au cache PDF au MVP mais sert à la bannière d'invalidation du carrousel et prépare le cache futur.

**Cache PDF :** prématuré au MVP.

**Sources de dérive neutralisées par les contraintes produit :**

- Fonts fallback — éliminé (Arial système universel).
- Subpixel anti-aliasing — éliminé (pas de détails graphiques sensibles).
- Espace colorimétrique — éliminé (noir + N&B).
- GPU vs logiciel — éliminé (pas de composition de calques).

**Sources résiduelles à surveiller :** DPR (forcé à `deviceScaleFactor: 1`), line-height rounding, mutations post-render React.

### D5 — Carrousel d'aperçu : PNG rasterisés depuis le PDF

**Décision :** le wizard affiche l'aperçu live via `ApercuImpression` rendu en React. Au clic "Aperçu avant téléchargement", un modal ouvre un carrousel dont les slides sont des PNG extraits du PDF Puppeteer.

**Structure UX :** onglets par feuillet (Dossier documentaire / Questionnaire / Cahier de réponses). Chaque onglet contient un carrousel horizontal avec flou CSS sur les slides non-actives.

**Dépendance à ajouter :** **Embla Carousel** (léger, headless, React, accessible). `CLAUDE.md` exige une demande explicite pour toute nouvelle dépendance npm — à valider avant installation.

**Invalidation :** bannière "Modifications détectées — Regénérer" quand l'empreinte du payload wizard diverge de l'empreinte des PNG affichés.

**Latence cible :** 2-3 secondes cible, **4-5 secondes max acceptable au MVP** (cold start Puppeteer ~2-3s + render + `page.pdf()` + extraction PNG + transfert base64). Skeleton loader "Génération de l'aperçu..." dès le clic. Optimisation warm function reportée post-MVP.

### D6 — En-tête d'épreuve : hauteur fixe plafonnée 80px

**Décision :** l'en-tête est paramétré au niveau `DonneesEpreuve`, répété sur chaque page du PDF, rendu en React par `SectionPage`, hauteur contrainte à **80px maximum** par CSS (`max-height: 80px; overflow: hidden`).

**Pourquoi 80px fixe :** résout le chicken-and-egg entre pager et en-tête. Le pager utilise la constante sans mesure dynamique. L'en-tête doit respecter le plafond, pas l'inverse.

**Pourquoi React et pas CSS `@page` running header :** mal supporté par Puppeteer avec les contraintes de typographie du produit. Plus fragile que la répétition explicite en React.

**Champs paramétrables dans le wizard** (à affiner en implémentation) :

- Titre de l'épreuve (obligatoire)
- Nom de l'enseignant (obligatoire)
- École (optionnel)
- Niveau / groupe (optionnel)
- Date (optionnel)

**Numérotation des pages :** injectée par le pager dans `Page.numeroPage` / `Page.totalPages`, pas par `counter(page)` CSS (meilleur contrôle, pas de dépendance à Puppeteer).

**Pas d'en-tête dans les composants `Document` ou `Quadruplet`** : ils ignorent totalement l'en-tête. Seul `SectionPage` (le wrapper de page) connaît `EnTeteEpreuve` et l'injecte via le contexte épreuve.

---

## 3. Architecture cible

```
┌──────────────────────────────────────────────────────────────┐
│                         WIZARD                                │
│  FormState ──┬─→ etatWizardVersTache ──→ DonneesTache v2     │
│              │                              │                 │
│              │                              ▼                 │
│              │                      DonneesEpreuve v2         │
│              │                              │                 │
│              │                              ▼                 │
│              │                  epreuveVersPaginee(mode)      │
│              │                              │                 │
│              │                              ▼                 │
│              │                      EpreuvePaginee            │
│              │                              │                 │
│              │                              ▼                 │
│              │                  <ApercuImpression />          │
│              │                   (aperçu live React)          │
│              │                                                │
│              └─→ POST /api/impression/token-draft             │
│                         │                                     │
│                         ▼                                     │
│                    Vercel KV                                  │
│                    (TTL 10min, HMAC)                          │
└────────────────────────────────────────┬─────────────────────┘
                                         │
                                         ▼ token signé
┌──────────────────────────────────────────────────────────────┐
│                     ROUTE SSR                                 │
│  app/(apercu)/apercu/[token]/page.tsx                        │
│     │                                                         │
│     ├─→ vérification HMAC                                    │
│     ├─→ fetch payload (KV si draft, DB si publié)            │
│     ├─→ epreuveVersPaginee(payload, mode, estCorrige)        │
│     └─→ <ApercuImpression paginee={...} />                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                                         ▲
                                         │
┌────────────────────────────────────────┼─────────────────────┐
│                     PUPPETEER          │                      │
│                                         │                      │
│  POST /api/impression/pdf               │                      │
│     │                                   │                      │
│     ├─→ page.goto(`/apercu/${token}`)──┘                     │
│     ├─→ preflight (fonts, images, mutations)                 │
│     ├─→ page.pdf()           ──→ PDF binaire                 │
│     └─→ page.screenshot() × N ──→ PNG[] (pour carrousel)     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Contrats TypeScript

### 4.1 Contrat de données `DonneesTache`

```typescript
// lib/tache/contrats/donnees.ts

export type Guidage = { content: string } | null;

export type DocumentReference = {
  id: string;
  kind: "textuel" | "iconographique";
  titre: string; // visible en formatif, masqué en sommatif
  contenu: string; // HTML propre, sans ancre
  echelle?: number; // pour iconographique
};

export type Critere = {
  libelle: string;
  descripteurs: Array<{ niveau: string; description: string; points: number }>;
};

export type OutilEvaluation = {
  oi: "OI1" | "OI2" | "OI3" | "OI4" | "OI5" | "redactionnel";
  criteres: Critere[];
};

export type EspaceProduction =
  | { type: "lignes"; nbLignes: number }
  | { type: "cases"; options: string[] } // ex: ['A', 'B', 'C', 'D']
  | { type: "libre" };

// Type pivot unique — remplace le legacy TaeFicheData.
// Contient TOUTES les données d'une tâche (métier + impression).
// Le print-engine consomme un sous-ensemble via Pick<DonneesTache, ...> local.
export type DonneesTache = {
  id: string;
  titre: string;
  consigne: string; // HTML propre, sans ancre
  guidage: Guidage; // structuré, composé par React
  documents: DocumentReference[];
  espaceProduction: EspaceProduction;
  outilEvaluation: OutilEvaluation;
  corrige?: string; // HTML du corrigé
  // + tous les champs métier existants de TaeFicheData :
  // auteur_id, auteurs, oi, comportement, niveau, discipline,
  // aspects_societe, cd, connaissances, version, is_published,
  // created_at, updated_at, etc.
};
```

### 4.2 Contrat `DonneesEpreuve`

```typescript
// lib/epreuve/contrats/donnees.ts

export type EnTeteEpreuve = {
  titre: string; // obligatoire
  enseignant: string; // obligatoire
  ecole?: string;
  niveau?: string;
  groupe?: string;
  date?: string;
};

export type DonneesEpreuve = {
  id: string;
  titre: string;
  enTete: EnTeteEpreuve; // répété sur chaque page, injecté par SectionPage
  taches: DonneesTache[];
};
```

### 4.3 Contrat de pagination

```typescript
// lib/epreuve/pagination/types.ts

export type ModeImpression = "formatif" | "sommatif-standard" | "epreuve-ministerielle";
export type TypeFeuillet = "dossier-documentaire" | "questionnaire" | "cahier-reponses";

export type KindBloc = "document" | "quadruplet" | "entete-section";

export type Bloc = {
  id: string;
  kind: KindBloc;
  tacheId?: string;
  content: unknown; // payload spécifique au kind
};

export type BlocMesure = Bloc & {
  hauteurPx: number;
  ratio: number; // hauteurPx / MAX_CONTENT_HEIGHT_PX
  securise: boolean; // ratio <= 0.97
};

export type Page = {
  feuillet: TypeFeuillet;
  numeroPage: number;
  totalPages: number;
  blocs: BlocMesure[];
  hauteurTotalePx: number;
};

export type ErreurDebordement = {
  kind: "DEBORDEMENT_BLOC";
  blocId: string;
  blocLibelle: string; // "TAÉ 3 — Révolution industrielle"
  hauteurPx: number;
  hauteurMaxPx: number;
  suggestion: string;
};

export type EpreuvePaginee =
  | {
      ok: true;
      empreinte: string;
      enTete: EnTeteEpreuve;
      feuillets: Record<TypeFeuillet, Page[]>;
    }
  | {
      ok: false;
      erreur: ErreurDebordement;
    };
```

### 4.4 Signature de la transformation

```typescript
// lib/epreuve/transformation/epreuve-vers-paginee.ts

export type OptionsRendu = {
  mode: ModeImpression;
  estCorrige: boolean;
};

export type Mesureur = (bloc: Bloc) => number;

export function epreuveVersPaginee(
  epreuve: DonneesEpreuve,
  options: OptionsRendu,
  mesureur: Mesureur,
): EpreuvePaginee;
```

### 4.5 Mapper wizard

```typescript
// lib/tache/contrats/etat-wizard-vers-tache.ts

export function etatWizardVersTache(etat: EtatFormulaireWizard): DonneesTache;
```

### 4.6 Draft-token signé

```typescript
// lib/epreuve/impression/token-draft.ts

export type PayloadTokenDraft = {
  payloadId: string; // clé dans Vercel KV
  exp: number; // timestamp expiration
  signature: string; // HMAC-SHA256(payloadId + exp, DRAFT_TOKEN_SECRET)
};

export function signerTokenDraft(payloadId: string): string;
export function verifierTokenDraft(token: string): { valide: boolean; payloadId?: string };
```

---

## 5. Fichiers à créer (conformes à la convention)

### Contrats et mappers

- `lib/tache/contrats/donnees.ts` — types `DonneesTache`, `Guidage`, `DocumentReference`, `OutilEvaluation`, `EspaceProduction`.
- `lib/epreuve/contrats/donnees.ts` — types `DonneesEpreuve`, `EnTeteEpreuve`.
- `lib/tache/contrats/etat-wizard-vers-tache.ts` — fonction `etatWizardVersTache()`, pure, testée.
- `lib/epreuve/contrats/empreinte.ts` — `calculerEmpreinte(payload, mode, estCorrige)`.

### Pagination

- `lib/epreuve/pagination/types.ts`
- `lib/epreuve/pagination/constantes.ts` — `MAX_CONTENT_HEIGHT_PX`, `HEADER_HEIGHT_PX`, `TOLERANCE_PX`, etc.
- `lib/epreuve/pagination/mesure.ts` — mesure offscreen isomorphe.
- `lib/epreuve/pagination/pager.ts` — greedy first-fit 1D.
- `lib/epreuve/pagination/preflight.ts` — `attendreFontsChargees()`, `attendreImagesDecodees()`, `assertAucuneMutation()`.

### Transformation métier

- `lib/epreuve/transformation/epreuve-vers-paginee.ts` — fonction principale.
- `lib/epreuve/transformation/renumerotation.ts` — réutilise `flattenDocumentsWithGlobalNumbers` existant.
- `lib/epreuve/transformation/regles-visibilite.ts` — visibilité guidage et titres par mode.

### Impression : utilitaires

- `lib/epreuve/impression/token-draft.ts` — signature HMAC + vérification.
- `lib/epreuve/impression/puppeteer.ts` — wrapper `@sparticuz/chromium-min`, options déterministes, preflight.

### Composants de rendu

- `components/epreuve/impression/index.tsx` — `ApercuImpression`, composant unique, consomme `EpreuvePaginee`.
- `components/epreuve/impression/section-page.tsx` — `SectionPage`, wrapper `<section class="page">` avec en-tête injecté.
- `components/epreuve/impression/entete.tsx` — `EnTeteImpression`, l'en-tête 80px max.
- `components/epreuve/impression/sections/document.tsx` — `SectionDocument`.
- `components/epreuve/impression/sections/quadruplet.tsx` — `SectionQuadruplet` (consigne + guidage + espace de production + outil d'évaluation).
- `components/epreuve/impression/sections/corrige.tsx` — `SectionCorrige`, variante pour `estCorrige = true`.
- `components/epreuve/impression/sections/outil-evaluation.tsx` — `SectionOutilEvaluation`.
- `components/epreuve/impression/sections/espace-production.tsx` — `SectionEspaceProduction`, rendu selon le type.

### Route SSR et API

- `app/(apercu)/apercu/[token]/page.tsx` — Server Component.
- `app/(apercu)/apercu/layout.tsx` — layout minimal sans UI wizard, injecte CSS impression.
- `app/api/impression/token-draft/route.ts` — POST payload, retourne token signé (KV TTL 10min).
- `app/api/impression/pdf/route.ts` — POST `{ token, mode, estCorrige }`, retourne PDF binaire.
- `app/api/impression/apercu-png/route.ts` — POST idem, retourne `{ pages: string[] }` base64.

### Carrousel

- `components/epreuve/apercu/carrousel.tsx` — `CarrouselApercu`, Embla, onglets par feuillet, flou CSS, bannière invalidation empreinte.

### Styles

- `styles/impression.css` — CSS impression statique, variables de dimension, `@page`, `break-inside: avoid` en défense en profondeur.

### Tests

- `tests/unit/tache/etat-wizard-vers-tache.test.ts`
- `tests/unit/epreuve/renumerotation.test.ts`
- `tests/unit/epreuve/epreuve-vers-paginee.test.ts`
- `tests/unit/epreuve/pager.test.ts`
- `tests/visual/golden/*.json` — 8 payloads golden représentatifs.
- `tests/visual/regression-pdf.spec.ts` — Playwright PDF → PNG → pixelmatch.

---

## 6. Fichiers à supprimer

| Fichier                                                    | Remplacé par                               | Impact                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EvaluationPrintableBody`                                  | `ApercuImpression` + `epreuveVersPaginee`  | Tout appelant passe par la route SSR                                                                                                                                                                                                                                                                              |
| Les trois `PrintableQuestionnaireCore*`                    | Composition dans `epreuve-vers-paginee.ts` | Aucun composant ne fait plus de composition par mode                                                                                                                                                                                                                                                              |
| Tout parsing de `<!--eduqcia:...-->`                       | Champ `guidage` structuré                  | Les builders NR émettent du JSON structuré                                                                                                                                                                                                                                                                        |
| `formStateToTae()` déprécié                                | `etatWizardVersTache()`                    | Tous les imports mis à jour                                                                                                                                                                                                                                                                                       |
| Les trois `parse*ConsigneForStudentPrint`                  | Suppression sèche                          | Le guidage vient du payload structuré                                                                                                                                                                                                                                                                             |
| `window.print()` dans les fichiers **épreuves** uniquement | Route SSR                                  | `TaeFichePrintView`, `EvaluationFichePrintView`, `PrintPreviewModal`. Les fichiers d'impression de documents individuels (`DocumentPrintView`, `DocumentWizardPrintModal`) ne sont **pas** concernés — ils restent sur `window.print()`. Le périmètre du print-engine est les épreuves, pas les documents isolés. |

---

## 7. Fichiers **non mis à jour** dans ce refactor (dette assumée)

- `components/playground/PlaygroundPrintRenderer.tsx` — outil de dev interne, consomme l'ancien contrat. Sera cassé par D0 et corrigé plus tard si besoin. Documenté comme dette.

---

## 8. Blast radius de D0 (audit Claude Code)

Selon l'audit d'implémentabilité, D0 touche **~18 fichiers** directement (ceux qui lisent `guidage` comme string ou qui construisent des données de tâche). Le type legacy `TaeFicheData` est importé par ~49 fichiers au total, mais la majorité ne touche pas `guidage` ni les ancres — ils lisent des champs métier (oi, comportement, etc.) qui restent inchangés dans `DonneesTache`.

**Builders NR (3) :** `ordre-chronologique-payload.ts`, `ligne-du-temps-payload.ts`, `avant-apres-payload.ts`
**Parsers à supprimer (3) :** `parse*ConsigneForStudentPrint` dans les mêmes fichiers
**Composants de rendu (3+) :** les `*PrintableQuestionnaireCore`
**Helpers (2) :** `lib/tae/fiche-helpers.ts:formStateToTae`, `lib/tae/consigne-helpers.ts:shouldShowGuidageOnStudentSheet`
**Publication (1) :** `publish-tae-payload.ts` (écriture du payload RPC)
**Impression d'évaluations (1) :** `lib/evaluations/evaluation-print-doc-map.ts:rewriteTaeHtmlDocRefsForEvaluationPrint`
**Renommage import type (reste) :** les fichiers qui importent `TaeFicheData` doivent être mis à jour vers `DonneesTache` — changement mécanique sans logique.

**Coût estimé :** 3-4 jours de travail concentré.

---

## 9. Contraintes infrastructurelles Vercel

- **Chromium :** `@sparticuz/chromium-min` (~40 MB).
- **Limite fonction :** 50 MB max. Vérification à la build (`scripts/verifier-taille-fonction.ts`). **Risque** : le bundle Next.js + chromium peut dépasser 50 MB. Plan de mitigation si dépassement : passer à `chromium-minimal` ou splitter la fonction de génération PDF dans une edge function séparée.
- **Timeout :** 60s (Pro requis). Cold start Puppeteer ~2-3s, génération PDF cible < 2s.
- **Viewport Puppeteer :** 816×1056 (Letter portrait 96dpi), `deviceScaleFactor: 1`.
- **Vercel KV :** requis pour draft-token. Ajout dans `vercel.json`.
- **Variable d'environnement :** `DRAFT_TOKEN_SECRET` (clé HMAC, ≥ 32 bytes aléatoires).
- **Dépendance npm à valider :** `embla-carousel-react`. Demande explicite au dev avant installation (règle `CLAUDE.md`).

---

## 10. Ordre d'implémentation (révisé après audit Claude Code)

L'ordre v1 plaçait le pager avant l'en-tête. C'était faux : le pager a besoin de connaître la hauteur de l'en-tête. La v2 résout ce problème en fixant la hauteur en constante (80px) mais garde l'en-tête avant le pager pour une implémentation linéaire.

1. **D0 partiel — types et mapper**
   - Créer `lib/tache/contrats/donnees.ts` avec `DonneesTache`, `Guidage`, `EspaceProduction`, `OutilEvaluation`.
   - Créer `lib/epreuve/contrats/donnees.ts` avec `DonneesEpreuve`, `EnTeteEpreuve`.
   - Créer `etatWizardVersTache()` avec tests unitaires.
   - Ne pas toucher aux consommateurs encore.

2. **D0 complet — wipe alpha + migration des consommateurs**
   - **Wipe alpha** : `DELETE FROM tae;` manuel en base Supabase. Toutes les TAÉ (rédactionnelles et NR) sont supprimées. Utilisateurs alpha prévenus.
   - Mise à jour des ~18 fichiers consommateurs : builders NR, parsers, helpers, composants, `rewriteTaeHtmlDocRefsForEvaluationPrint`.
   - Suppression des parsers d'ancres et de `formStateToTae`.
   - Documenter `PlaygroundPrintRenderer` comme cassé temporairement.
   - Grep exhaustif sur `.guidage.replace`, `.guidage.indexOf`, `.guidage.trim` pour éviter les régressions silencieuses.

3. **D6 — En-tête d'épreuve**
   - Créer `components/epreuve/impression/entete.tsx` avec contrainte `max-height: 80px`.
   - Créer `SectionPage` qui injecte l'en-tête.
   - Définir `HEADER_HEIGHT_PX = 80` dans `lib/epreuve/pagination/constantes.ts`.

4. **D3 — Transformation `epreuveVersPaginee`**
   - Créer la fonction pure avec composition par mode, renumérotation (réutilise `flattenDocumentsWithGlobalNumbers`), résolution `{{doc_A}}` (réutilise et adapte `rewriteTaeHtmlDocRefsForEvaluationPrint`), flag `estCorrige`, règles de visibilité.
   - Tests unitaires sur les 3 modes + corrigé.

5. **D2 — Pager isomorphe**
   - Maintenant que `MAX_CONTENT_HEIGHT_PX` est fixé, le pager est implémentable.
   - Greedy first-fit 1D, tolérance 4px.
   - `mesure.ts` offscreen côté client.
   - Tests unitaires avec hauteurs mockées.

6. **D1 — Route SSR + draft-token**
   - Configuration Vercel KV + variable `DRAFT_TOKEN_SECRET`.
   - `lib/epreuve/impression/token-draft.ts` avec HMAC.
   - `app/(apercu)/apercu/[token]/page.tsx`.
   - `app/api/impression/token-draft/route.ts`.
   - Test manuel : ouvrir l'URL dans un navigateur.

7. **Composants de rendu**
   - `ApercuImpression` + `SectionPage` + sections (document, quadruplet, corrigé, outil d'évaluation, espace de production).
   - Intégration de l'en-tête via `SectionPage`.

8. **D4 — Puppeteer + preflight + empreinte**
   - `lib/epreuve/impression/puppeteer.ts`.
   - `app/api/impression/pdf/route.ts`.
   - Empreinte calculée à la génération.
   - Test manuel : télécharger un PDF depuis un payload golden.

9. **Tests visuels Playwright**
   - 3 payloads golden au départ (rédactionnel simple, ordre chrono, sommatif 3 tâches).
   - Baseline générée sur CI Linux.
   - Extension progressive à 8 payloads.

10. **D5 — Carrousel PNG**
    - Demander l'ajout d'`embla-carousel-react` au dev.
    - `app/api/impression/apercu-png/route.ts`.
    - `CarrouselApercu` avec onglets par feuillet et bannière d'invalidation.

---

## 11. Questions produit laissées ouvertes

Ces questions n'ont pas besoin d'être tranchées avant l'implémentation, mais doivent être résolues avant le premier utilisateur en production.

- **Champs exacts et gabarit visuel de l'en-tête** dans la limite de 80px.
- **Position de la numérotation des pages** : en-tête ou pied de page, format ("X / Y" ou "Page X sur Y").
- **Gabarit officiel du mode épreuve ministérielle** : existe-t-il un modèle ministériel à reproduire pour l'en-tête et la structure du cahier de réponses ?
- **Comportement précis du corrigé** par OI : cases cochées, points attribués, commentaires.
- **Fallback si cold start Puppeteer > 4s** : skeleton loader étendu ou pool warm function.

---

## 12. Risques confirmés par l'audit

- **Hauteur exacte de l'en-tête vs pager** : mitigé par le choix de 80px fixe.
- **Bundle size Vercel** : à vérifier à l'étape 8. Plan de mitigation : `chromium-minimal` ou edge function séparée.
- **Dérive silencieuse du typage `guidage` string → objet** : mitigée par TypeScript strict + grep exhaustif sur `.guidage.replace`, `.guidage.indexOf`, `.guidage.trim` avant la migration des consommateurs (étape 2).
- **Draft-token brute-force** : mitigé par signature HMAC avec `DRAFT_TOKEN_SECRET`.
- **Embla Carousel non installé** : demande explicite au dev avant installation.

---

## 13. Angles morts couverts par le cadrage

- Ancres HTML → contrat structuré (D0).
- Wizard in-progress → `etatWizardVersTache` élevé au rang de contrat officiel.
- Politique d'assets → neutralisée par austérité Arial + N&B.
- Contraintes Vercel → explicites en section 9.
- En-tête d'épreuve → `EnTeteEpreuve` au niveau `DonneesEpreuve`, injecté par `SectionPage`, hauteur fixe 80px.
- Pagination physique → `numeroPage` / `totalPages` injectés par le pager.
- Invalidation du carrousel → bannière empreinte.
- Indicateur de remplissage dans le wizard → jauge debouncée, rouge à 97%.
- Migration des consommateurs de `TaeFicheData` → `DonneesTache`, reconnue comme blast radius ~18 fichiers (section 8).
- Sécurité du draft-token → signature HMAC.
- Chicken-and-egg en-tête vs pager → hauteur fixe 80px.
- Distinction `EspaceProduction` vs `OutilEvaluation` → deux types distincts (section 1).

---

**Fin de la spécification v2.1. Toute modification doit être discutée et versionnée.**
