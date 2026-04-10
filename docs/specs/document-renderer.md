# Spec — Rendu des documents historiques

**Statut** : v0.3 finale, prête pour implémentation
**Date** : 9 avril 2026
**Auteurs** : Guillaume Lemaire-Levesque + Claude, avec critiques de Grok, NotebookLM, Copilot, Gemini
**Version** : 0.3

## 1. Contexte et objectifs

Le wizard de création de document produit un objet `Document` contenant toutes les métadonnées nécessaires à sa représentation. Ce document doit pouvoir être affiché dans plusieurs contextes différents, chacun répondant à des besoins spécifiques.

L'objectif de cette spec est de définir une architecture de rendu unique, scalable et évolutive, capable de produire plusieurs modes d'affichage à partir d'une seule source de données, sans duplication de code et sans compromis sur la qualité visuelle du mode impression pixel-perfect.

La spec est ancrée dans la pratique réelle des épreuves ministérielles du MEQ, validée par l'analyse des dossiers documentaires des épreuves officielles et enrichie par les critiques de plusieurs agents externes.

## 2. Les structures de documents supportées

Le produit supporte trois structures de documents, choisies par l'enseignant au moment de la création dans le wizard. La structure détermine la composition du document et conditionne la mise en page finale.

### 2.1 Document simple

Un document contenant un seul élément (textuel ou iconographique). C'est la structure par défaut et majoritaire dans la pratique MEQ. **Compatible avec toutes les opérations intellectuelles**, y compris celles qui ne nécessitent aucune structure spéciale.

**Composition** :

- Un seul élément avec son propre type (textuel ou iconographique)
- Un titre commun au document
- Un repère temporel optionnel au niveau du document global

### 2.2 Document à perspectives

Un document regroupant plusieurs points de vue d'acteurs ou d'historiens, présentés pour la comparaison. Utilisé principalement pour les opérations intellectuelles qui demandent de dégager des différences et des similitudes entre des points de vue (OI 3.3 point de désaccord, 3.4 point d'accord, 3.5 différences et similitudes entre plusieurs perspectives).

**Nombre d'éléments** : 2 ou 3, choisi par l'enseignant juste après la sélection de la structure. Pour un point d'accord ou de désaccord entre deux acteurs (OI 3.3 et 3.4), 2 perspectives. Pour une comparaison plus large avec identification d'un acteur divergent (OI 3.5), 3 perspectives.

**Composition** :

- 2 ou 3 éléments, chacun avec son propre type (textuel ou iconographique) choisi indépendamment
- Chaque élément a un auteur obligatoire (acteur ou historien)
- Un titre commun au document
- Un repère temporel optionnel au niveau du document global

**Note pédagogique importante** : les perspectives peuvent légitimement être de types différents. Un document peut présenter une caricature d'époque, une citation d'un acteur et un extrait d'un historien contemporain comme trois perspectives sur un événement. Le type est une propriété de chaque perspective, pas du document.

### 2.3 Document à deux temps (`deux_temps`)

Un document présentant un même objet ou une même réalité à deux moments distincts dans le temps, pour permettre l'analyse du changement ou de la continuité. Utilisé pour l'opération intellectuelle 6.3 (montrer un changement ou une continuité avec justification).

**Nombre d'éléments** : exactement 2, correspondant aux deux moments de la comparaison.

**Composition** :

- 2 éléments, chacun avec son propre type (textuel ou iconographique) choisi indépendamment
- Chaque élément a un repère temporel obligatoire (date précise ou période)
- Chaque élément a un sous-titre optionnel pour préciser le contexte du moment
- Un titre commun au document

**Note pédagogique importante** : comme pour les perspectives, les deux temps peuvent être de types différents. Un document peut comparer une photographie d'époque avec un texte contemporain pour montrer une évolution sociale.

**Exemples pédagogiques concrets** :

- Une carte de la Nouvelle-France en 1713 et une carte de la même région en 1763, pour observer les changements territoriaux après la Conquête
- Une photographie de vitrines de magasins ségréguées dans le sud américain des années 1960 et un texte contemporain sur les politiques d'affirmative action, pour observer l'évolution des politiques raciales

## 3. Modèle de données

Le modèle de données utilise une discriminated union TypeScript pour garantir au compile-time que chaque élément a les champs appropriés selon son type. Cette approche élimine les incohérences possibles entre le type d'un élément et ses données.

### 3.1 Types TypeScript

```typescript
interface Document {
  id: string;
  titre: string;
  structure: "simple" | "perspectives" | "deux_temps";
  elements: DocumentElement[]; // 1 pour simple, 2 ou 3 pour perspectives, 2 pour deux_temps
  repereTemporelDocument?: string; // Optionnel, au niveau du document global
}

type DocumentElement = TextuelElement | IconographiqueElement;

interface TextuelElement {
  id: string;
  type: "textuel";
  contenu: RichText; // Obligatoire, non vide
  categorieTextuelle: CategorieTextuelle; // Obligatoire, discriminé par type

  // Attribution selon la structure du document parent
  auteur?: string; // Obligatoire si structure = 'perspectives', optionnel si 'simple'
  repereTemporel?: string; // Obligatoire si structure = 'deux_temps'
  sousTitre?: string; // Optionnel, utilisé uniquement si structure = 'deux_temps'

  // Source bibliographique (par élément)
  source: RichText; // Obligatoire, non vide
  sourceType: "primaire" | "secondaire";
}

interface IconographiqueElement {
  id: string;
  type: "iconographique";
  imageUrl: string; // Obligatoire, URL HTTPS valide
  legende?: string; // Optionnel, max 50 mots
  legendePosition?: LegendePosition; // Obligatoire si legende présente
  categorieIconographique: CategorieIconographique; // Obligatoire, discriminé par type

  // Attribution selon la structure du document parent
  auteur?: string; // Obligatoire si structure = 'perspectives', optionnel si 'simple'
  repereTemporel?: string; // Obligatoire si structure = 'deux_temps'
  sousTitre?: string; // Optionnel, utilisé uniquement si structure = 'deux_temps'

  // Source bibliographique (par élément)
  source: RichText; // Obligatoire, non vide
  sourceType: "primaire" | "secondaire";
}

type LegendePosition = "haut_gauche" | "haut_droite" | "bas_gauche" | "bas_droite";
```

### 3.2 Règles de validation

**Règles sur le document** :

- Pour `structure === 'simple'`, `elements.length === 1`
- Pour `structure === 'perspectives'`, `elements.length === 2 || elements.length === 3`
- Pour `structure === 'deux_temps'`, `elements.length === 2`
- `titre` est obligatoire, non vide après trim

**Règles sur chaque élément** :

- Si `type === 'textuel'`, alors `contenu` est obligatoire et non vide après trim
- Si `type === 'iconographique'`, alors `imageUrl` est obligatoire et doit être une URL HTTPS valide
- `source` est obligatoire et non vide après trim pour tous les éléments
- `sourceType` est obligatoire pour tous les éléments
- Chaque élément a une catégorie obligatoire correspondant à son type (garantie par la discriminated union)

**Règles selon la structure du document parent** :

- Pour `structure === 'perspectives'`, chaque élément doit avoir un `auteur` non vide après trim
- Pour `structure === 'deux_temps'`, chaque élément doit avoir un `repereTemporel` non vide après trim

**Règles sur la légende iconographique** :

- `legende` est optionnelle
- Si `legende` est présente et non vide, `legendePosition` est obligatoire
- `legende` ne doit pas dépasser 50 mots (compté par la fonction `countWordsFr`)
- Avertissement visuel à partir de 45 mots

### 3.3 Persistance en base de données

La base de données Supabase utilise les colonnes existantes pour les champs déjà persistés (`image_legende`, `image_legende_position`, `image_url`, etc.) et ajoute les nouvelles colonnes nécessaires pour la structure du document et le tableau d'éléments.

**Nouvelles colonnes à ajouter** (migration SQL séparée à prévoir) :

- `documents.structure` avec un enum strict `document_structure` contenant `'simple'`, `'perspectives'`, `'deux_temps'`
- Les éléments multiples sont stockés via une table relationnelle `document_elements` liée à `documents` par une foreign key

**Nomenclature** : le mot `deux_temps` est utilisé en snake_case partout, dans le code TypeScript et dans la base de données, pour cohérence avec les autres enums du projet (`documents_officiels`, `presse_publications`, etc.).

## 4. Les quatre modes d'affichage

### 4.1 Mode impression (pixel-perfect PDF)

Rendu destiné à l'export PDF via Puppeteer côté serveur, pour la copie imprimée de l'élève.

**Contraintes techniques strictes** :

- Format papier : Lettre US (215.9 × 279.4 mm exactement)
- Marges fixes : 20 mm sur les quatre côtés
- Zone utile : 175.9 × 239.4 mm
- Police : Arial avec fallback `'Arial', 'Liberation Sans', 'Helvetica', sans-serif`
- Taille corps de texte : 12 pt
- Interligne : 1.4
- Taille titre du document : 12 pt gras
- Taille source : 9 pt
- Taille auteur : 12 pt italique
- Taille repère temporel : 12 pt gras
- Taille sous-titre (pour `deux_temps`) : 12 pt gras
- **Couleur du texte : noir pur (100%)** pour tout le contenu imprimé, sans nuances de gris
- CSS obligatoire : `print-color-adjust: exact` pour garantir que les fonds noirs (bandeau du numéro) s'impriment
- Règle de pagination : `page-break-inside: avoid` sur le cadre du document

**Stratégie de police** : Arial doit être installée sur le serveur Puppeteer pour garantir le rendu pixel-perfect. Si Arial n'est pas disponible, Liberation Sans sert de fallback visuel équivalent. Cette dépendance doit être documentée dans le README du projet et dans le Dockerfile du pipeline Puppeteer.

**Mise en page selon la structure** :

**Simple** : un seul cadre pleine largeur contenant l'élément unique.

```
┌──────────────────────────────────┐
│ [N°] Titre du document            │
├──────────────────────────────────┤
│                                   │
│  Contenu de l'élément             │
│  (texte riche ou image)           │
│                                   │
│                        Auteur     │
└──────────────────────────────────┘
Source bibliographique
```

**Perspectives (2)** : deux colonnes de largeur égale, séparées par une gouttière verticale, chacune contenant un élément complet avec son auteur et sa source.

```
┌──────────────────────────────────┐
│ [N°] Titre du document            │
├─────────────────┬────────────────┤
│ Contenu         │ Contenu        │
│ perspective 1   │ perspective 2  │
│                 │                │
│  Auteur 1       │  Auteur 2      │
├─────────────────┼────────────────┤
│ Source 1        │ Source 2       │
└─────────────────┴────────────────┘
```

**Perspectives (3)** : trois colonnes de largeur égale, séparées par des gouttières verticales, chacune contenant un élément complet.

```
┌─────────────────────────────────────┐
│ [N°] Titre du document               │
├──────────┬──────────┬───────────────┤
│ Contenu  │ Contenu  │ Contenu       │
│ persp. 1 │ persp. 2 │ persp. 3      │
│          │          │               │
│ Auteur 1 │ Auteur 2 │ Auteur 3      │
├──────────┼──────────┼───────────────┤
│ Source 1 │ Source 2 │ Source 3      │
└──────────┴──────────┴───────────────┘
```

**Deux temps** : deux colonnes de largeur égale, chaque colonne affiche en haut le repère temporel en gras, puis le sous-titre optionnel, puis le contenu, puis la source.

```
┌──────────────────────────────────┐
│ [N°] Titre du document            │
├─────────────────┬────────────────┤
│ Temps 1 (date)  │ Temps 2 (date) │
│ Sous-titre 1    │ Sous-titre 2   │
│                 │                │
│ Contenu 1       │ Contenu 2      │
├─────────────────┼────────────────┤
│ Source 1        │ Source 2       │
└─────────────────┴────────────────┘
```

**Note technique sur la largeur des 3 perspectives** : avec une zone utile de 175.9 mm divisée en 3 colonnes plus 2 gouttières, chaque colonne fait environ 53 mm de large. C'est étroit pour du texte (environ 25 à 30 caractères par ligne). Cette contrainte est gérée par les seuils d'avertissement de longueur stricts pour le contenu des perspectives (voir section 6.3).

**Champs affichés en mode impression** :

- Numéro de document (généré automatiquement, bandeau noir en coin)
- Titre du document
- Pour chaque élément :
  - Contenu principal (texte riche ou image)
  - Auteur si présent (obligatoire pour perspectives, optionnel pour simple)
  - Repère temporel si présent (obligatoire pour deux_temps)
  - Sous-titre si présent (optionnel pour deux_temps)
  - Source bibliographique
  - Légende iconographique en overlay sur l'image (voir section 4.5)

**Champs exclus du mode impression** : catégorie, type de source, et toute métadonnée pédagogique (opération intellectuelle, comportement attendu, aspects de société, connaissances mobilisées).

**Règle pleine largeur pour les images** : si une image native dépasse 315 pixels de largeur après redimensionnement, et si la structure du document le permet (structure simple), l'image peut être rendue en pleine largeur de la zone utile au lieu de la largeur par défaut. Cette règle correspond à l'écart E4.5 identifié dans l'audit et doit être implémentée correctement dans le nouveau code (l'heuristique `shouldPrintDocumentFullWidth` actuelle retourne toujours `false` pour les iconographiques et doit être corrigée).

### 4.2 Mode sommaire (fiche complète)

Rendu qui affiche l'ensemble des données recueillies dans le formulaire. Utilisé pour la consultation exhaustive et l'analyse pédagogique.

**Champs affichés** :

- Tous les champs du formulaire, incluant les métadonnées pédagogiques
- Structure du document visible (simple, perspectives, ou deux temps)
- Nombre d'éléments
- Pour chaque élément : tous les champs (type, contenu, auteur, repère temporel, sous-titre, source, type de source, catégorie, légende et position de légende si iconographique)

**Mise en page** : structure en sections claires avec des titres pour faciliter la lecture. Chaque élément du document apparaît dans son propre bloc.

### 4.3 Mode lecture standard (plateforme)

Rendu utilisé quand un enseignant clique sur un document dans la banque collaborative pour l'explorer en détail.

**Caractéristiques** :

- Responsive (desktop et mobile)
- Boutons d'action : _« Modifier »_, _« Ajouter à ma banque »_, _« Signaler »_, _« Partager »_
- Métadonnées de publication affichées : date de création, date de dernière modification, auteur enseignant, nombre de vues si tracking existe
- Toggle vers le mode aperçu impression (voir section 4.6)
- Accessibilité WCAG AA : labels ARIA explicites, navigation clavier fonctionnelle, contraste suffisant
- Les images iconographiques utilisent la `legende` comme attribut `alt` HTML pour les lecteurs d'écran. Si `legende` est absente, `alt=""` est utilisé (convention WCAG pour les images décoratives)

### 4.4 Mode thumbnail (miniature)

Rendu compact pour l'affichage dans la liste de la banque collaborative.

**Champs affichés** (sélection restreinte) :

- Titre du document (tronqué à 2 lignes max)
- Aperçu du contenu (première ligne du texte ou image miniature du premier élément)
- Icône de la catégorie du premier élément
- Badge type de source du premier élément (primaire ou secondaire)
- Badge structure du document : _« Simple »_, _« 2 perspectives »_, _« 3 perspectives »_, ou _« Deux temps »_

**Champs exclus** : légende iconographique (la miniature est trop petite pour qu'elle soit lisible)

**Dimensions** : fixes, à déterminer par Claude Code selon le design system existant dans `BankDocumentsPanel`. Ratio proche de Lettre US pour évoquer le format final.

### 4.5 Légende iconographique (tous modes sauf thumbnail)

La légende iconographique est une métadonnée optionnelle attachée à un document iconographique. C'est un texte court (maximum 50 mots) qui annote l'image elle-même, distinct du titre du document et de la source bibliographique.

**Comportement de la légende** :

- Affichée en overlay sur l'image dans un des 4 coins (`haut_gauche`, `haut_droite`, `bas_gauche`, `bas_droite`)
- Fond semi-transparent noir avec texte blanc pour garantir la lisibilité quel que soit le fond de l'image
- Visible dans tous les modes de rendu **sauf thumbnail** (le mode miniature est trop petit)
- Implémentée par le composant `DocumentImageLegendOverlay` existant dans le code

**Pipeline existant** : le code actuel gère déjà la saisie, la validation Zod, la persistance en base et le rendu de la légende via les composants `DocumentLegendTextField`, `DocumentLegendPositionGrid`, et `DocumentImageLegendOverlay`. La spec documente ce comportement existant pour le formaliser, pas pour le réinventer.

### 4.6 Toggle aperçu dans le panneau preview du wizard

Le panneau d'aperçu du wizard de création de document contient un toggle permettant à l'enseignant de basculer entre deux modes de visualisation sans ouvrir de modale.

**Deux modes** :

**Mode _« Sommaire »_** (icône `topic`) : affiche le rendu du mode sommaire (section 4.2) avec toutes les métadonnées pédagogiques. C'est le mode par défaut sélectionné à l'ouverture du wizard.

**Mode _« Aperçu impression »_** (icône `picture_as_pdf`) : affiche un rendu HTML/CSS fidèle du mode impression (section 4.1), utilisant exactement les mêmes règles CSS que le mode impression Puppeteer. C'est une approximation visuelle fidèle, pas un vrai PDF généré à la volée. L'enseignant voit exactement ce qui apparaîtra sur la copie de l'élève.

**Emplacement et libellés** : délégués à Claude Code au moment de l'implémentation, selon les conventions du design system existant et la cohérence avec le reste du projet. Les deux icônes Material Symbols Outlined sont fixées : `topic` et `picture_as_pdf`.

**Pour obtenir le vrai PDF téléchargeable**, l'enseignant utilise un bouton séparé _« Télécharger le PDF »_ dans un autre endroit de l'interface, qui déclenche le pipeline Puppeteer côté serveur.

## 5. Architecture technique du rendu

### 5.1 Principe directeur

Un composant central `DocumentCard` qui gère l'ensemble du rendu avec un branchement interne selon la structure. Le composant est entouré de wrappers spécialisés qui ajoutent le contexte d'utilisation (impression, preview, lecture, thumbnail).

### 5.2 Composant central `DocumentCard`

**Responsabilité** : rendre le document en HTML/CSS pur, sans logique d'interaction, sans contexte d'utilisation.

**Props** :

```typescript
interface DocumentCardProps {
  document: Document;
  numero?: number; // Numéro généré automatiquement (1, 2, 3...)
  mode?: "sommaire" | "impression"; // Utilisé par le toggle du preview
}
```

**Logique de rendu selon la structure** :

- Si `structure === 'simple'`, rendre l'élément unique pleine largeur (avec règle pleine largeur image si applicable)
- Si `structure === 'perspectives'`, rendre les 2 ou 3 éléments en colonnes de largeur égale via CSS grid ou flex avec `gap` fixe
- Si `structure === 'deux_temps'`, rendre les 2 éléments en colonnes de largeur égale, avec le repère temporel et le sous-titre en haut de chaque colonne

**Sous-composant `DocumentElementRenderer`** : chaque élément est rendu par ce sous-composant qui gère les deux types (textuel et iconographique). Il prend un élément en entrée et produit le HTML approprié selon son type, incluant l'overlay de légende pour les images.

**CSS key points** :

- Numéro : fond noir (avec `print-color-adjust: exact`), texte blanc, Arial bold, positionné pour chevaucher le coin supérieur gauche du cadre
- Cadre : bordure 1.5 pt grise, padding intérieur 8 mm, fond blanc
- Colonnes : `display: grid` ou `display: flex` avec `gap` uniforme, alignement vertical top
- Source par élément : Arial 9 pt, sous son élément respectif
- Auteur : Arial 12 pt italique, en bas à droite dans l'élément
- Repère temporel (pour `deux_temps`) : Arial 12 pt gras, en haut de la colonne
- Sous-titre (pour `deux_temps`) : Arial 12 pt gras, sous le repère temporel

### 5.3 Les quatre wrappers spécialisés

**`DocumentCardPrint`** : conteneur au format Lettre US avec marges fixes pour Puppeteer. Pas d'interactivité. CSS `@page` pour la pagination.

**`DocumentCardPreview`** : version utilisée dans le panneau d'aperçu du wizard, avec le toggle Sommaire / Aperçu impression. Rendu HTML/CSS fidèle mais pas via Puppeteer.

**`DocumentCardReader`** : conteneur responsive pour la fiche de lecture dans la banque. Boutons d'action, métadonnées de publication, accessibilité WCAG AA.

**`DocumentCardThumbnail`** : conteneur miniature pour les listes. Dimensions fixes, troncature, badges, clic pour ouvrir le `DocumentCardReader`.

### 5.4 Rendu du contenu riche

Un helper partagé `renderRichText(content, mode)` est utilisé par tous les wrappers pour convertir le contenu riche (édité avec TipTap ou équivalent) en HTML sécurisé. Règles de sanitisation : pas de scripts, pas de styles inline dangereux, tailles de police en points pour le mode impression et en pixels pour les autres modes.

Le même helper s'applique au champ `source` qui accepte aussi du formatage riche.

### 5.5 Pipeline images (existant, à réutiliser)

Le pipeline de téléversement et traitement des images existe déjà et doit être réutilisé :

- Upload via `ImageUploadDropzone` avec drag-and-drop
- Validation client : formats JPG, PNG, WebP, taille max 10 Mo
- Redimensionnement serveur via Sharp (boîte 660 × 400 px max, sans agrandissement)
- Stockage dans Supabase Storage avec URL publique retournée
- Helper `isPublicHttpUrl` pour distinguer URL HTTPS publique de blob URL temporaire

**Blocage critique identifié** : le bucket Supabase Storage n'est pas configuré en production sur `eduqc-ia.com`. C'est l'item F4 du backlog technique. Tant que le bucket n'est pas créé avec ses politiques RLS, les uploads échoueront en production. Ce point doit être résolu avant toute publication de document iconographique par le bêta testeur.

## 6. Le wizard de création de document

### 6.1 Ordre des étapes

1. **Structure du document** : simple, à perspectives (avec sous-choix 2 ou 3), ou à deux temps
2. **Titre du document** : champ texte avec avertissement de longueur
3. **Saisie des éléments** : selon la structure choisie (formulaire direct pour simple, accordéons pour multi-éléments)
4. **Métadonnées globales** : repère temporel optionnel au niveau du document, éventuelles connaissances mobilisées

**Justification de l'ordre** : la structure est la décision pédagogique fondamentale qui conditionne tout le reste. Le type de chaque élément (textuel ou iconographique) est une décision secondaire prise au sein de chaque bloc d'élément. Commencer par la structure évite toute confusion cognitive et correspond aux meilleures pratiques des wizards modernes.

### 6.2 Interface des accordéons pour les structures multi-éléments

Pour les structures à plusieurs éléments (`perspectives` et `deux_temps`), chaque élément est un accordéon distinct avec un indicateur d'état visible.

**Header de l'accordéon fermé** :

- Titre : _« Première perspective »_, _« Deuxième perspective »_, _« Troisième perspective »_ pour `perspectives`
- Titre : _« Temps 1 »_, _« Temps 2 »_ pour `deux_temps`
- Badge d'état : _« À compléter »_ (gris), _« En cours »_ (jaune), _« Complété »_ (vert avec icône cadenas)
- Aperçu rapide dans le header quand complété : nom de l'auteur ou repère temporel + type de contenu

**Contenu de l'accordéon ouvert** :

- Sélecteur _« Type de contenu »_ (Textuel / Iconographique)
- Selon le type choisi, les champs appropriés apparaissent :
  - Si textuel : éditeur riche pour le contenu, champ auteur (ou repère temporel et sous-titre optionnel selon la structure)
  - Si iconographique : upload image via `ImageUploadDropzone`, champ légende optionnel, sélecteur de position de légende, champ auteur (ou repère temporel et sous-titre optionnel selon la structure)
- Champ source avec éditeur riche
- Sélecteur de type de source (primaire / secondaire)
- Sélecteur de catégorie (textuelle ou iconographique selon le type, consommant les helpers de `document-categories.json`)

**Règles d'interaction** :

- Un seul accordéon ouvert à la fois
- Cliquer sur un accordéon fermé ferme celui qui était ouvert en préservant son état de complétion
- Le bouton _« Suivant »_ du wizard est désactivé tant que tous les accordéons ne sont pas dans l'état _« Complété »_
- L'enseignant peut rouvrir un accordéon complété pour modifier son contenu

**Pour la structure `simple`** : pas d'accordéon. Les champs de l'élément unique sont affichés directement sans wrapper, puisqu'il n'y a qu'un seul élément à saisir.

### 6.3 Avertissements de longueur

**Pour le titre du document**, compteur de mots en temps réel sous le champ :

- **1 à 8 mots** : zone idéale, indicateur neutre
- **9 à 12 mots** : avertissement léger (bannière jaune)
  - Message : _« Ce titre est un peu long. Envisagez de le raccourcir pour améliorer la lisibilité. »_
- **13 mots et plus** : avertissement fort (bannière rouge)
  - Message : _« La longueur du titre pourrait nuire à la mise en page et à la compréhension de l'élève. Raccourcissez-le autant que possible. »_

**Pour le contenu textuel d'un élément** (seuils ajustés sur la pratique réelle des épreuves MEQ où la moyenne observée est de 25 à 50 mots, validée par NotebookLM) :

- **0 à 60 mots** : zone confortable, indicateur neutre
- **61 à 100 mots** : avertissement léger (bannière jaune)
  - Message : _« Ce texte commence à être long. Les documents des épreuves ministérielles font typiquement entre 25 et 50 mots. Envisagez de le raccourcir. »_
- **101 mots et plus** : avertissement fort (bannière rouge)
  - Message : _« La longueur du texte dépasse ce qu'on observe dans les épreuves ministérielles. Raccourcissez-le pour rester dans les standards pédagogiques. »_

**Pour la légende iconographique** (règle existante dans le code) :

- Maximum absolu : 50 mots
- Seuil d'avertissement visuel : 45 mots (la pilule de comptage vire à l'orange)

**Note** : les avertissements ne bloquent jamais la saisie ni la publication. Ils sont purement informatifs.

### 6.4 Texte UI des cards de sélection de structure

**Titre de l'étape** : _« Structure du document »_

**Sous-titre** : _« Choisissez la structure qui correspond à l'usage pédagogique du document. »_

**Card 1 — Document simple**

- Icône : `description` (Material Symbols Outlined)
- Titre : _« Document simple »_
- Description : _« Un document autonome qui peut être utilisé avec toutes les opérations intellectuelles. »_

**Card 2 — Document à perspectives**

- Icône : `groups`
- Titre : _« Document à perspectives »_
- Description : _« Un document regroupant plusieurs points de vue d'acteurs ou d'historiens, présentés côte à côte. Permet de dégager des différences et des similitudes entre ces points de vue. »_

**Card 3 — Document à deux temps**

- Icône : `history`
- Titre : _« Document à deux temps »_
- Description : _« Un document présentant un même objet à deux moments distincts, pour déterminer des changements et des continuités. »_

**Règle UI importante** : aucun acronyme d'opération intellectuelle (OI 3.3, OI 6.3, etc.) ne doit apparaître dans l'interface utilisateur. Ce sont des codes internes réservés à la documentation. Les descriptions utilisent le vocabulaire officiel du programme MEQ (_« dégager des différences et des similitudes »_, _« déterminer des changements et des continuités »_) sans jamais mentionner les codes.

Après la sélection de la card _« Document à perspectives »_, un deuxième choix apparaît pour le nombre de perspectives (2 ou 3), également sans aucun code d'OI dans l'UI.

## 7. Points d'intégration

### 7.1 Avec le wizard de création de document

Le composant `DocumentCardPreview` remplace la fenêtre d'aperçu actuelle du wizard avec le toggle Sommaire / Aperçu impression. La mise à jour est réactive aux changements du formulaire.

### 7.2 Avec la banque collaborative

Les composants `DocumentCardThumbnail` et `DocumentCardReader` sont consommés par `BankDocumentsPanel` pour afficher respectivement la liste compacte et la vue détaillée.

### 7.3 Avec le pipeline de publication PDF

Le composant `DocumentCardPrint` est rendu côté serveur par Puppeteer lors de la génération d'un PDF d'épreuve. Les règles CSS d'impression sont incluses directement dans le composant.

### 7.4 Avec `document-categories.json`

Tous les wrappers qui affichent une icône de catégorie consomment les helpers de `lib/tae/document-categories-helpers.ts` pour récupérer l'icône Material Symbols depuis le JSON. Aucun hardcoding.

### 7.5 Avec le pipeline images existant

Le composant `DocumentCardPreview` et les wrappers utilisent le pipeline d'upload existant via `ImageUploadDropzone` sans le réinventer. Le composant `DocumentImageLegendOverlay` existant est consommé tel quel pour le rendu des légendes.

## 8. Exigences non-fonctionnelles

### 8.1 Performance

- Le `DocumentCardThumbnail` doit être léger et rapide (lazy loading des images, memoization si la liste contient plus de 20 documents)
- Le `DocumentCardPrint` peut être plus lourd, il n'est rendu que lors de la génération PDF
- Les modes `Preview` et `Reader` doivent avoir une mise à jour réactive fluide sans lag perceptible

### 8.2 Accessibilité

- Tous les wrappers interactifs (`Reader`, `Thumbnail`, `Preview`) respectent WCAG AA
- Les boutons d'action ont des labels ARIA explicites
- La navigation clavier est fonctionnelle dans tous les modes interactifs
- Le mode impression utilise du noir pur (100%) pour tout le texte, ce qui garantit un contraste maximal
- Les images iconographiques utilisent la `legende` comme attribut `alt` HTML pour les lecteurs d'écran. Si `legende` est absente, `alt=""` est utilisé (convention WCAG pour les images décoratives)

### 8.3 Stratégie de tests

- Tests snapshot pour `DocumentCard` avec les trois structures et les différentes combinaisons de types par élément
- Tests unitaires pour chaque wrapper isolé (`Print`, `Preview`, `Reader`, `Thumbnail`)
- Tests visuels (Percy ou équivalent) pour `DocumentCardPrint` pour garantir le rendu pixel-perfect
- Tests d'intégration pour le wizard de création de document avec les accordéons et les structures multi-éléments
- Tests pour la discriminated union TypeScript : vérifier que le type-checker rejette les combinaisons invalides

## 9. Plan d'implémentation suggéré

**Phase 1 — Modèle de données et migrations**
Étendre le type `Document` avec `structure` et `elements`, implémenter la discriminated union TypeScript, créer la migration SQL pour les nouvelles colonnes et la table `document_elements`, régénérer les types avec `npm run gen:types`.

**Phase 2 — Composant central `DocumentCard`**
Implémenter le composant pur avec le branchement selon la structure. Sous-composant `DocumentElementRenderer` pour gérer textuel et iconographique. Tests snapshot pour les trois structures.

**Phase 3 — Wrapper Preview avec toggle**
Implémenter `DocumentCardPreview` avec le toggle Sommaire / Aperçu impression pour remplacer la fenêtre d'aperçu actuelle du wizard. Premier gain visible pour l'utilisateur.

**Phase 4 — Wizard refondu**
Implémenter les accordéons pour les structures multi-éléments. Intégrer les avertissements de longueur avec les nouveaux seuils. Garantir la suppression des acronymes OI de l'UI.

**Phase 5 — Wrappers Reader et Thumbnail**
Implémenter `DocumentCardReader` et `DocumentCardThumbnail` pour la banque collaborative.

**Phase 6 — Wrapper Print et pipeline PDF**
Implémenter `DocumentCardPrint` et l'intégrer au pipeline Puppeteer côté serveur. Tests visuels pour valider le pixel-perfect. Corriger l'heuristique `shouldPrintDocumentFullWidth` pour implémenter correctement la règle de pleine largeur des images (écart E4.5).

**Pré-requis critique** : résoudre le blocage F4 (bucket Supabase Storage en production) avant que les documents iconographiques ne soient utilisables par le bêta testeur.

## 10. Décisions en attente

**D-1** : Gestion des repères temporels — date précise vs période. Pour l'instant, on utilise une chaîne de caractères libre (`string`) qui accepte aussi bien _« 1713 »_ que _« vers 1700 »_ ou _« milieu du 19e siècle »_. Souplesse maximale, validation uniquement sur le non-vide.

**D-2** : Filtrage vs priorisation dans le picker de banque du wizard de création de tâche. Approche retenue : **priorisation** avec un badge _« Recommandé pour cette OI »_ plutôt que filtrage strict. Un enseignant créatif peut utiliser un document simple pour une OI de comparaison. Cette décision concerne le picker de banque, pas directement le `DocumentRenderer`, et sera implémentée dans un chantier ultérieur.

**D-3** : Le toggle _« Aperçu impression »_ dans le panneau preview génère un rendu HTML/CSS qui approxime fidèlement le mode impression. Pour obtenir le vrai PDF téléchargeable, l'enseignant utilise un bouton séparé _« Télécharger le PDF »_ qui déclenche le pipeline Puppeteer côté serveur. Cette séparation garantit la performance du wizard.

---

## Historique des versions

- **v0.1** (8 avril 2026) : version initiale avec 4 modes d'affichage et architecture wrapper
- **v0.2** (8 avril 2026) : introduction des trois structures de documents (simple, perspectives, deux temps), liberté de type par élément, accordéons pour multi-éléments
- **v0.3** (9 avril 2026) : version finale consolidée après critiques de Grok, NotebookLM, Copilot et Gemini. Ajouts : discriminated unions TypeScript, validations explicites (contenu, source, catégorie), sous-titres pour `deux_temps`, pipeline images et légende existants documentés, toggle Sommaire/Impression dans preview, seuils de longueur ancrés dans la pratique MEQ, règle pleine largeur images (E4.5), renommage `deux_temps` en snake_case partout.
