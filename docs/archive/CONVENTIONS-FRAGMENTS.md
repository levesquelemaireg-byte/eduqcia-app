# Conventions — fragments métier (fiche, impression, PDF)

> **⚠️ Document déprécié — avril 2026**
>
> Cette convention de nommage (`*Fragment` / `*App` / `*Print`) n'a jamais été appliquée dans le code de production. Seul le playground dev (`components/playground/`, `app/dev/fragments/`) en utilise des traces.
>
> **Référentiel actuel pour les composants de rendu d'impression :** `docs/specs/print-engine.md` (section 5).
>
> **Référentiel actuel pour la convention de nommage générale :** section « Convention de nommage et structure des fichiers » dans `CLAUDE.md`.
>
> Conservé pour référence historique uniquement.

Document de **référence normative** pour nommer et structurer les fragments de rendu (TAÉ, documents, copie élève, grilles). À lire avec [FRAGMENT-PLAYGROUND.md](../FRAGMENT-PLAYGROUND.md) (outil DEV `/dev/fragments`) et [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## 1. Pourquoi ces conventions

- Le wizard et les fiches sont **orientés comportements** (OI, comportement attendu, parcours rédactionnel vs non rédactionnel).
- Un même jeu de **données** alimente plusieurs **vues** : fiche web, aperçu wizard, feuille imprimable (Lettre US), PDF futur.
- Sans règles de nommage, on mélange « stub playground », « section fiche » et « bloc imprimable » — dette de lecture et de maintenance.

**Objectif :** noms **français**, **stables**, **grep-friendly**, qui disent **quoi** (métier) et **où** (app vs feuille).

**Emplacement des fichiers (nouveaux fragments) :** les composants `…App` et `…Print` **extraits** vivent sous **`components/fragments/`** (un fichier **PascalCase** par composant — créer le dossier au premier besoin). Les **assembleurs** existants (`FicheTache`, `TaeCard`, `PrintableFicheFromTaeData`, etc.) restent sous leurs chemins actuels (souvent **`components/tache/`**) et importent depuis `components/fragments/`. Détail arborescence : [ARCHITECTURE.md](./ARCHITECTURE.md#structure-des-dossiers-état-du-dépôt).

---

## 2. Logique métier (rappel)

1. Le **formulaire / état** concentre les données (wizard, puis persistance).
2. Ces données sont rendues :
   - **dans l’app** : fiche lecture, prévisualisation sommaire, etc. ;
   - **sur feuille** : impression navigateur et PDF (même HTML/CSS **tant qu’aucun écart moteur n’est prouvé** — voir § impression vs PDF).

Certaines données **n’ont jamais** de rendu imprimé (métadonnées de pilotage, champs réservés à la fiche document en lecture) : elles n’ont **pas** de variante `…Print` (§ 7).

---

## 3. Suffixes obligatoires

| Suffixe     | Rôle                                                                     |
| ----------- | ------------------------------------------------------------------------ |
| `…Fragment` | Unité métier **canonique** (nom du bloc, sans contexte d’écran).         |
| `…App`      | Rendu **application** (navigateur, fiche, wizard — hors feuille Letter). |
| `…Print`    | Rendu **feuille** : impression + PDF (Lettre US, marges, styles print).  |

**Règle :** `…Print` couvre **impression** et **PDF** tant que le pipeline est identique. Si Puppeteer impose un traitement différent, documenter l’exception dans ce fichier ou dans [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md) (format papier).

**Granularité :** viser une **granularité utile** — pas le découpage maximal possible. Un fragment = une **responsabilité** de rendu ou de mise en page testable. Si deux blocs partagent le même HTML/CSS et la même logique, ne pas les scinder artificiellement.

---

## 4. Rédactionnel — fragments canoniques

Pour une copie élève **rédactionnelle**, les blocs habituels sont :

| Canonique                                | App                                 | Print                                 |
| ---------------------------------------- | ----------------------------------- | ------------------------------------- |
| `ConsigneFragment`                       | `ConsigneApp`                       | `ConsignePrint`                       |
| `GuidageComplementaireFragment`          | `GuidageComplementaireApp`          | `GuidageComplementairePrint`          |
| `EspaceReponseEleveRedactionnelFragment` | `EspaceReponseEleveRedactionnelApp` | `EspaceReponseEleveRedactionnelPrint` |
| `GrilleCorrectionFragment`               | `GrilleCorrectionApp`               | `GrilleCorrectionPrint`               |

**Note :** en code existant, des noms anglais historiques (`ConsigneContent`, `GridContent`, etc.) peuvent subsister ailleurs jusqu’à migration ; le playground DEV monte désormais **`FicheTache` / `TaeCard` / `PrintableFicheFromTaeData`** à partir de mocks `TaeFicheData` — [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md). Les **nouveaux** composants suivent ce tableau.

---

## 5. Non rédactionnel — fragments « réponse »

Les parcours NR diffèrent par **structure** (tableau, ordre, ligne du temps, etc.). Deux niveaux possibles :

1. **Niveau 1 (recommandé pour démarrer)** — distinguer seulement **NR** dans le nom :
   - `ChoixReponsesNonRedactionnelFragment` / `…App` / `…Print`
   - `ReponseFinaleNonRedactionnelFragment` / `…App` / `…Print`

2. **Niveau 2** — si le rendu **diverge vraiment** entre comportements (ex. ordre chronologique vs avant/après), des noms explicites :
   - `ReponseFinaleOrdreChronologiqueFragment`, etc.

**Règle :** factoriser tant que le **DOM** et les **règles CSS print** sont les moins dupliqués possibles ; dupliquer le fragment quand la structure métier l’impose.

---

## 6. Documents (dossier documentaire imprimable)

Pour **une carte document** sur feuille, découpage logique :

| Rôle                 | Nom canonique (exemple)                 |
| -------------------- | --------------------------------------- |
| Conteneur / cadre    | `BoiteDocumentFragment`                 |
| Titre                | `TitreDocumentFragment`                 |
| Corps textuel        | `ContenuDocumentTextuelFragment`        |
| Corps iconographique | `ContenuDocumentIconographiqueFragment` |
| Légende (icono)      | `LegendeDocumentIconographiqueFragment` |
| Source               | `SourceDocumentFragment`                |

Chaque ligne peut avoir `…App` et `…Print` **si** les deux contextes existent ; le **carton** et le **titre** suivent souvent la même logique avec des classes différentes.

---

## 7. Données « fiche seule » (sans impression)

Certaines données collectées (métadonnées document, champs réservés à la **fiche document en lecture**, etc.) **ne sont pas** portées sur la feuille élève / PDF.

**Convention :**

- fragments ou sections **`…App` uniquement** (pas de `…Print`) ;
- ou colonne dans la spec : **Imprimable : non** pour ce champ.

Ne pas inventer de `…Print` vide « pour faire pareil ».

---

## 8. Playground (DEV)

- **`components/playground/*`** : UI DEV — sélecteur **OI / comportement** (`useOiData`) et onglets **contexte** (`FicheTache`, `TaeCard`, `PrintableFicheFromTaeData`).
- **`lib/fragment-playground/mocks.ts`** : mocks **`TaeFicheData`** par `comportement_id` — **import playground uniquement**.
- **`lib/fragment-playground/types.ts`** : onglets / clé `localStorage` — pas de duplication de `TaeFicheData`.
- **Ne jamais importer** `components/playground/` ni `lib/fragment-playground/mocks.ts` depuis du code **production**.

Détail : [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md).

---

## 9. Table de correspondance (alias historiques → cible)

À utiliser lors des refactors progressifs ; pas d’obligation de renommer tout en une fois.

| Ancien / générique (exemples)        | Cible canonique (nouveau code)                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `GridContent`, « evaluation tool »   | `GrilleCorrectionFragment`                                                            |
| `StudentResponseContent` (générique) | `EspaceReponseEleveRedactionnelFragment` ou `…NonRedactionnel…` selon cas             |
| `DocumentCardContent`                | `CarteDocumentFragment` ou sous-fragments § 6                                         |
| `MetadataContent`                    | `MetadonneesFicheFragment` (ou blocs CD / connaissances séparés selon implémentation) |

---

## 10. Épreuve / en-têtes (à créer)

Fragments prévus hors fiche TAÉ seule — voir [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md) (section éléments d’épreuve / hors maquette fiche) :

- `IdentificationEleveFragment` (+ App / Print)
- `EnteteEpreuveFragment` (+ App / Print)
- `PiedPageEpreuveFragment` (+ App / Print)

Noms à figer au moment de l’implémentation ; ce document est la **référence** pour le suffixe `Fragment` / `App` / `Print`.

---

## 11. Checklist avant merge (fragments)

- [ ] Nom français + suffixe conforme § 3.
- [ ] Si réponse : R vs NR explicite quand la structure diffère (§ 5).
- [ ] Données sans rendu print : pas de `…Print` forcé (§ 7).
- [ ] Aucun import playground / mocks hors DEV (§ 8).
- [ ] `npm run lint` et `npm run build` verts.

---

## Références

| Sujet           | Fichier                                                              |
| --------------- | -------------------------------------------------------------------- |
| Playground DEV  | [FRAGMENT-PLAYGROUND.md](./FRAGMENT-PLAYGROUND.md)                   |
| Structure dépôt | [ARCHITECTURE.md](./ARCHITECTURE.md)                                 |
| Copy UI         | [UI-COPY.md](./UI-COPY.md)                                           |
| Parcours NR     | [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md) |
