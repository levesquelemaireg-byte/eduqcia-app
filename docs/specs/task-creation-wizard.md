À propos de ce document
Dernière mise à jour : 8 avril 2026
Statut : Spécification conceptuelle consolidée. Issue d'une session de conception approfondie, non encore validée contre le build existant. Les sections 1 à 6 reflètent les décisions de design arrêtées ; la section 7 liste les points restés ouverts ou à confirmer à l'usage.
Périmètre : Ce document couvre le niveau conceptuel, architectural et comportemental du wizard de création de tâche. Il décrit ce que l'outil doit faire, comment les données sont modélisées, comment l'utilisateur interagit avec chaque étape, et comment le contenu est rendu à l'écran et sur papier.
Hors périmètre : Les détails d'implémentation ne sont pas spécifiés ici. Sont notamment exclus : la structure des dossiers et fichiers de code, les noms de composants, les choix de bibliothèques, les conventions de nommage des variables, les formes exactes des schémas de base de données, les signatures d'API, les styles CSS précis (couleurs, polices, espacements au pixel près). Ces décisions relèvent du build et peuvent évoluer sans modifier la spec, tant que le comportement observable reste conforme.
Wizards connexes non couverts : Le wizard de création de document et le wizard de composition d'épreuve sont mentionnés comme contexte mais ne sont pas spécifiés dans ce document. Ils feront l'objet de documents séparés (document-creation-wizard.md et exam-composition-wizard.md).
Utilisation recommandée : Ce document sert de référence pour valider le build existant, guider les évolutions futures, et onboarder de nouveaux contributeurs au projet. Il doit être maintenu à jour au fil de l'implémentation : chaque décision qui s'écarte de la spec doit soit faire remonter la spec au niveau du build (si le build a trouvé une meilleure solution), soit ramener le build au niveau de la spec (si c'est une régression).

# Spécification de référence — Wizard de création de tâche

**Projet** : Outil d'item banking pour la création d'évaluations en Histoire du Québec et du Canada, 4e secondaire
**Document** : Spécification conceptuelle du wizard de création de tâche et de son rendu
**Statut** : Cadre de référence consolidé, à valider contre le build existant

---

## 1. Préambule

### 1.1 Contexte

L'outil permet à des enseignants d'histoire du Québec et du Canada (niveau 4e secondaire) de construire une banque partagée de tâches d'évaluation conformes aux standards du ministère de l'Éducation du Québec (MEQ). Les tâches peuvent ensuite être assemblées en épreuves (examens complets) via un wizard distinct.

L'outil est composé de trois wizards imbriqués :

- **Wizard de création de document** — objet de première classe, réutilisable
- **Wizard de création de tâche** — _présent document_
- **Wizard de composition d'épreuve** — hors périmètre de ce document

### 1.2 Utilisateur cible

Enseignant d'histoire 4e secondaire qui connaît bien les standards MEQ (opérations intellectuelles, comportements attendus, grilles critériées, etc.) et qui arrive généralement dans le wizard avec une tâche **déjà pensée et pré-rédigée** (sur papier, dans un document Word, ou mentalement). Le wizard n'est pas un outil de conception créative, c'est un outil de **saisie structurée assistée** : il guide la transcription et propose des aides contextuelles (modèles de consigne, préambules auto, etc.) sans se substituer au jugement pédagogique de l'enseignant.

### 1.3 Principes directeurs

- **Cascade d'inférence** : chaque décision structurante (opération intellectuelle, comportement attendu) réduit l'incertitude des étapes suivantes et préconfigure des valeurs par défaut intelligentes
- **Transcription assistée, pas création** : l'outil automatise le formel (numérotation, préambules, grilles), laisse libre le créatif (consigne, corrigé, guidage)
- **Complétude garantie** : le passage d'étape est bloqué tant que les champs requis ne sont pas remplis ; les cas limites légitimes sont gérés par avertissements _« est-ce volontaire ? »_
- **Source unique de vérité visuelle** : le rendu écran (aperçu) et le rendu PDF final proviennent du même HTML/CSS, garantissant une cohérence pixel-perfect
- **Une tâche = une page** : contrainte structurelle forte qui élimine la complexité de pagination locale
- **Pas de scroll vertical en mode édition** : chaque étape du wizard tient dans la hauteur d'écran utile

---

## 2. Modèle de données

### 2.1 Entités de première classe

Trois entités indépendantes qui peuvent exister sans dépendance mutuelle :

**Document** — entité autonome qui vit dans une banque consultable. Propriétés principales :

- Identifiant unique permanent (`doc_uuid`)
- Type : textuel ou iconographique
- Titre (optionnel)
- Contenu : texte brut pour textuel, image uploadée pour iconographique
- Source bibliographique
- Repère temporel (utilisé pour automatiser certaines tâches de type _Situer dans le temps et dans l'espace_)
- Statut : source primaire ou secondaire
- Pour les iconographiques :
  - Légende (optionnelle)
  - Position de la légende (coin supérieur gauche, supérieur droit, inférieur gauche, inférieur droit)
  - Type spécifique (carte, peinture, photographie, gravure, caricature, schéma, tableau, etc.)

**Tâche** — entité qui référence des documents et encapsule tous les éléments d'une question d'évaluation :

- Paramètres pédagogiques (OI, comportement attendu, niveau, discipline)
- Liste ordonnée de références vers des documents (0 à N, selon le comportement attendu)
- Consigne structurée (TipTap JSON, voir section 2.3)
- Guidage pédagogique conditionnel
- Corrigé et notes au correcteur
- Grille d'évaluation préselectionnée (non modifiable, issue du standard MEQ pour le comportement attendu)
- Alignement au programme (compétence disciplinaire, aspects de société, connaissances associées)
- Métadonnées (auteurs, dates, version)

**Épreuve** — hors périmètre, mais importante à comprendre : liste ordonnée de tâches, organisée en sections (A, B, C selon la convention MEQ), avec son propre rendu (dossier documentaire global, questionnaire global, cahier de réponses).

### 2.2 Principe de référencement

Une tâche ne **contient pas** ses documents, elle les **référence**. Le document reste autonome dans la banque. Une même entité `Document` peut être référencée par 0 à N tâches.

Cette séparation a plusieurs conséquences positives :

- Réutilisation naturelle des documents entre tâches
- Possibilité de déduplication au niveau d'une épreuve (un document partagé entre deux tâches n'apparaît qu'une fois dans le dossier documentaire global)
- Possibilité de remixer une tâche en substituant un document par un autre sans toucher au reste

### 2.3 Références dans la consigne

La consigne est stockée sous forme de **JSON structuré TipTap**, pas de texte brut. Les références à des documents à l'intérieur du texte sont des **nœuds structurés** typés, pas des chaînes de caractères.

Exemple de structure :

```json
{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Consultez le " },
    {
      "type": "documentReference",
      "attrs": { "documentId": "uuid-traite-de-paris-1763" }
    },
    { "type": "text", "text": " et identifiez les principaux changements." }
  ]
}
```

Les nœuds `documentReference` pointent vers un identifiant de document. L'étiquette d'affichage (« document A », « document 8 ») est **résolue au rendu**, selon le contexte :

- **Contexte tâche isolée** (aperçu du wizard, fiche dans la banque) : l'étiquette est locale, basée sur l'ordre des documents dans la tâche (A, B, C, D)
- **Contexte épreuve composée** (PDF d'une épreuve) : l'étiquette est globale, basée sur la numérotation du dossier documentaire déduplicé de l'épreuve (1, 2, 3, … N)

Ce modèle permet à une tâche d'être réutilisée dans plusieurs épreuves sans modification : les références se résolvent différemment selon le contexte, mais le contenu stocké reste identique.

**Cas particulier** : une consigne peut ne contenir aucune référence structurée. C'est rare mais légitime — certaines opérations intellectuelles demandent à l'élève d'identifier lui-même les documents pertinents du dossier, sans guidage explicite. Dans ce cas, le texte de la consigne ne contient que des nœuds `text`, et aucune réécriture contextuelle n'est nécessaire.

### 2.4 Représentation visuelle des références selon le contexte

Le même modèle de données JSON est affiché différemment selon la vue :

| Contexte                           | Rendu des nœuds `documentReference`                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Éditeur TipTap (étape 3 du wizard) | Chip visuelle distincte (fond coloré, bordure, étiquette « Document A »)                       |
| Aperçu sommaire à droite du wizard | Chip visuelle (même pattern que l'éditeur, peut-être cliquable pour naviguer vers le document) |
| Aperçu imprimé (sous-onglet)       | Texte plat résolu (« document A »), sans distinction visuelle                                  |
| PDF final généré                   | Texte plat résolu (identique à l'aperçu imprimé)                                               |

Cette distinction entre **représentation éditoriale** (chips) et **représentation de lecture** (texte plat) permet de garder la richesse structurelle sans polluer le rendu final.

### 2.5 Stratégie de mutation des documents partagés

Un document peut être référencé par de nombreuses tâches. Quand un utilisateur veut modifier un document de la banque, le système applique la **stratégie d'avertissement avant modification** :

1. Avant d'ouvrir le document en édition, le système détecte combien de tâches le référencent
2. Si le nombre est supérieur à 0, une modale d'avertissement s'affiche :
   > _Ce document est utilisé par N tâches. Modifier ce document affectera toutes ces tâches._
   > _[ Modifier quand même ] [ Dupliquer pour créer une variante ] [ Annuler ]_
3. L'option _« Dupliquer pour créer une variante »_ crée un nouveau document (nouveau `doc_uuid`) avec les mêmes propriétés, que l'utilisateur peut modifier librement sans affecter l'original

Cette stratégie offre une protection simple sans le coût d'un système de versioning complet, tout en laissant une porte de sortie propre pour les adaptations personnelles.

---

## 3. Wizard de création de tâche — les 7 étapes

### 3.1 Principes transversaux du wizard

- **Stepper horizontal cliquable** : les étapes sont toutes visibles dans une barre de progression au-dessus du panneau d'édition
- **Bouton Suivant bloqué tant que les champs requis de l'étape courante ne sont pas remplis** — avec balisage visuel explicite des champs manquants
- **Navigation libre vers les étapes précédentes** déjà complétées
- **Sauvegarde automatique permanente** en fond (transparente pour l'utilisateur)
- **Bouton _Enregistrer comme brouillon_ toujours actif**, indépendant de la validation d'étape, qui ferme la session en conservant l'état
- **Aperçu à droite du wizard, toujours visible**, qui se met à jour en temps réel à chaque frappe
- **Pas de scroll vertical dans le panneau d'édition** : chaque étape tient dans la hauteur disponible

### 3.2 Étape 1 — Signature

**Objectif** : identifier l'auteur ou les co-auteurs de la tâche.

**Contenu** :

- Toggle _Seul_ / _En équipe_
- Si _Seul_ : l'auteur est automatiquement l'utilisateur courant, aucune saisie supplémentaire
- Si _En équipe_ : module d'ajout de co-auteurs depuis le répertoire des utilisateurs abonnés (champ de recherche + liste des co-auteurs ajoutés avec avatar, nom, bouton retirer)

**Rôle stratégique** : cette étape vient en premier parce qu'elle correspond au premier réflexe mental de l'enseignant qui s'apprête à numériser une tâche pré-pensée (« est-ce que je signe seul ou je crédite des collègues ? »). Elle est légère en mode par défaut (_Seul_) pour ne pas freiner le flow.

**Validation pour passer à l'étape suivante** : aucune (l'auteur solo est toujours valide par défaut).

### 3.3 Étape 2 — Paramètres pédagogiques

**Objectif** : cadrer la nature évaluative de la tâche selon les standards MEQ, et déclencher la préconfiguration des étapes suivantes.

**Contenu** (en cascade stricte de déverrouillage) :

1. **Niveau** : 4e secondaire (probablement valeur unique dans le contexte actuel)
2. **Discipline** : Histoire du Québec et du Canada
3. **Opération intellectuelle (OI)** : liste filtrée selon niveau et discipline
4. **Comportement attendu** : liste filtrée selon l'OI choisie

Dès que le comportement attendu est sélectionné, le système :

- **Attache automatiquement la grille d'évaluation préselectionnée** (issue de la banque d'outils d'évaluation MEQ pour ce comportement attendu) — cette grille est **fixe, non modifiable**, et apparaît dans l'aperçu à droite
- **Fixe le nombre de documents** que la tâche référencera (par exemple 1, 2, 3 ou 4 selon le standard pour cette OI)
- **Détermine le format de la zone de production** de l'élève (lignes vides pour rédactionnelle, choix multiple, encadré de réponse courte)
- **Fixe le nombre de lignes** de l'espace de production si applicable

L'enseignant peut ajuster ces paramètres dérivés si la tâche réelle s'écarte légèrement du standard, mais les valeurs par défaut sont toujours conformes au MEQ.

**Comportement UI** :

- Les champs en cascade sont **désactivés tant que le champ précédent n'est pas rempli**
- Un texte d'aide contextuel apparaît sur chaque champ désactivé (« Choisissez d'abord une opération intellectuelle »)
- La grille préselectionnée apparaît dans l'aperçu sommaire à droite dès qu'elle est attachée, avec un indicateur visuel qu'elle est système (« Outil d'évaluation MEQ », icône cadenas ou similaire)

**Validation pour passer à l'étape suivante** : tous les champs en cascade (niveau, discipline, OI, comportement attendu) doivent être remplis.

### 3.4 Étape 3 — Consigne et guidage

**Objectif** : rédiger le texte de la question posée à l'élève et son guidage pédagogique optionnel.

**Contenu** :

**Champ consigne** (TipTap éditeur riche)

- Largeur généreuse, typographie confortable, focus sur la rédaction
- Préambule auto-généré par défaut : _« Consultez le document A. »_ (ou _« Consultez les documents A et B. »_, etc., selon le nombre de documents fixé à l'étape 2). Ce préambule contient déjà les chips de référence correspondantes, pré-insérées à leur position canonique.
- Toggle _« Référencer explicitement les documents dans la consigne »_ (activé par défaut) — si désactivé, le préambule auto est retiré et l'enseignant rédige sa consigne sans guidage automatique de référence. Utile pour les cas où l'élève doit identifier lui-même les documents pertinents du dossier.
- Boutons dans la toolbar pour **insérer une chip de référence** vers un document (un bouton par slot disponible : _Insérer Doc. A_, _Insérer Doc. B_, etc., selon le nombre de documents prévus)
- Les chips insérées sont visuellement distinctes (fond coloré, non éditable comme du texte, supprimables d'un clic)

**Champ guidage** (en dessous de la consigne)

- Pré-formaté en italique pour rappeler visuellement comment il apparaîtra à l'élève
- Mention discrète sous le champ : _« Ce guidage s'affichera en italique sous la consigne en mode formatif. Il sera masqué automatiquement en mode sommatif. »_
- Optionnel — peut rester vide

**Panneau latéral _Modèles fréquents_** (encart à droite ou en accordéon)

- Propose 2 à 4 modèles de formulation pour la consigne, tirés d'une analyse de nombreuses épreuves existantes, filtrés par OI + comportement attendu
- Présentation avec autorité tranquille : titre _« Modèles fréquents pour cette opération »_
- Cliquer un modèle l'insère dans le champ de consigne sur action explicite (jamais de pré-remplissage automatique)
- Pas de système de notation ni d'avertissement de qualité (les modèles sont curés par analyse)

**Validation pour passer à l'étape suivante** :

- Champ consigne non vide (bloquant)
- Champ guidage optionnel (non bloquant)

### 3.5 Étape 4 — Documents

**Objectif** : attacher les documents référencés par la tâche.

**Contenu** :

- Le nombre de slots est **déjà fixé à l'étape 2** par le comportement attendu. L'enseignant voit exactement N emplacements à remplir, ni plus, ni moins.
- Chaque slot affiche son étiquette locale (Document A, Document B, etc.) et son état (vide ou rempli)
- Pour chaque slot, deux actions possibles :
  - **Sélectionner depuis la banque** — ouvre une modale de recherche dans la banque de documents, avec filtres (type, période, source primaire/secondaire, tâches qui l'utilisent déjà), prévisualisation, et indication de l'empreinte du document dans l'écosystème (« Utilisé dans 12 autres tâches »)
  - **Créer un nouveau document** — lance le wizard de création de document en pile (ouvert par-dessus le wizard de tâche). Au commit, le nouveau document rejoint la banque et remplit automatiquement le slot en cours dans le wizard parent.

**Ordre des documents**

- L'ordre est significatif : il détermine les étiquettes locales (A, B, C, D)
- Réordonnancement possible par glisser-déposer
- Si l'enseignant réordonne les documents, les chips de référence dans la consigne se mettent à jour automatiquement (le contenu stocké ne change pas, seule l'étiquette affichée est recalculée)

**Validation pour passer à l'étape suivante** : tous les slots doivent être remplis. Le bouton Suivant est bloqué sinon.

**Avertissements _« est-ce volontaire ? »_** (à la validation, non bloquants, confirmation explicite requise) :

- Si un document attaché n'a pas de titre : _« Le document X n'a pas de titre. Est-ce volontaire ? »_
- Si un document attaché n'a pas de source : _« Le document X n'a pas de source. Est-ce volontaire ? »_
- Si plusieurs cas sont détectés, les avertissements sont groupés dans une seule modale

### 3.6 Étape 5 — Corrigé et notes au correcteur

**Objectif** : saisir la clé de correction et les notes d'accompagnement pour le correcteur.

**Contenu** :

- **Champ corrigé** : texte riche, contient la réponse attendue ou les éléments de réponse attendus selon le comportement attendu
- **Champ notes au correcteur** : texte riche, contient les nuances, les cas particuliers à accepter, les pièges fréquents à reconnaître
- **Rappel de la grille d'évaluation** : affichée en lecture seule dans l'aperçu à droite (déjà attachée à l'étape 2) ; peut éventuellement être rappelée dans un encart latéral discret ici pour référence pendant la rédaction du corrigé
- **Panneau latéral _Modèles fréquents_** : même principe qu'à l'étape 3, propose des modèles de corrigé tirés de l'analyse d'épreuves existantes

**Validation pour passer à l'étape suivante** : champ corrigé non vide (notes au correcteur optionnelles).

### 3.7 Étape 6 — Compétence disciplinaire

**Objectif** : rattacher la tâche à une compétence disciplinaire du programme MEQ.

**Contenu** :

- **Arbre hiérarchique en miller columns** (colonnes cascadées façon Finder macOS)
- Chaque colonne représente un niveau de profondeur de l'arbre
- Cliquer un élément d'une colonne ouvre la suivante à droite
- Sélection unique ou multiple selon le modèle (à valider avec le build)
- Source de données : fichier JSON statique, éditable hors application

**Validation pour passer à l'étape suivante** : au moins une compétence sélectionnée.

### 3.8 Étape 7 — Aspects de société et connaissances associées

**Objectif** : rattacher la tâche aux aspects de société et aux connaissances spécifiques du programme.

**Contenu** :

- **Deux arbres hiérarchiques en miller columns** : l'un pour les aspects de société, l'autre pour les connaissances associées
- Présentation côte à côte ou en onglets internes selon l'espace disponible
- Même pattern d'interaction qu'à l'étape 6
- Source de données : fichiers JSON statiques, éditables hors application

**Validation pour passer à l'étape suivante** : au moins un aspect de société et une connaissance associée sélectionnés (à confirmer).

**Finalisation** : à la fin de l'étape 7, le bouton Suivant devient _« Terminer »_ ou _« Enregistrer dans la banque »_, qui clôt le wizard et publie la tâche dans la banque.

---

## 4. Aperçu et rendu

### 4.1 Structure générale de l'aperçu

Le panneau d'aperçu vit à droite du wizard, toujours visible, et se met à jour en temps réel à chaque saisie. Il a **deux onglets principaux** :

**Onglet _Aperçu sommaire_** — vue structurée par sections, optimisée pour la consultation rapide et la validation de complétude. Affiche la grille d'évaluation attachée, les chips de référence dans la consigne (comme dans l'éditeur), et tous les éléments de la tâche organisés par blocs distincts.

**Onglet _Aperçu imprimé_** — rendu pixel-perfect du format papier 8,5 × 11 po, tel que l'élève le verra une fois la tâche insérée dans une épreuve. Utilisé pour la validation de mise en page.

### 4.2 Sous-onglets de l'aperçu imprimé

L'aperçu imprimé est divisé en deux sous-onglets correspondant aux deux feuillets distincts de la chaîne MEQ :

**Sous-onglet _Dossier documentaire_** — uniquement les documents de la tâche, disposés selon l'algorithme de mise en page bicolonne.

**Sous-onglet _Questionnaire_** — consigne, guidage (conditionnel), espace de production, grille d'évaluation.

### 4.3 Toggle Formatif / Sommatif

Présent uniquement dans le sous-onglet _Questionnaire_ (il n'a aucun sens dans le dossier documentaire, qui est identique dans les deux modes).

- Contrôle latéral dans la vue (pas un niveau de navigation hiérarchique)
- Mode _Formatif_ par défaut à l'ouverture (affichage complet avec guidage)
- Bascule vers _Sommatif_ masque le guidage en temps réel
- La grille d'évaluation reste visible dans les deux modes
- L'enseignant peut basculer à tout moment pour vérifier l'apparence de la tâche dans chaque mode

### 4.4 Mise en page du Dossier documentaire

**Format de page**

- Page 8,5 × 11 po
- Marges de 2 cm sur tous les côtés
- Zone utile : ~650 px de large à la résolution standard
- Contenu _nu_, sans en-tête ni pied de page (ajoutés plus tard par le wizard d'épreuve)

**Grille bicolonne**

- Zone utile divisée en deux colonnes verticales de largeur égale
- Gouttière entre colonnes : minime mais suffisante (~15-20 px à calibrer)
- Largeur d'une colonne simple : ~315 px
- Largeur double (pleine page) : ~650 px

**Décision automatique de la largeur par l'application**

L'enseignant ne choisit jamais manuellement la largeur d'un document. Le système décide selon des règles déterministes :

- **Image** : si largeur native ≤ 315 px, largeur simple ; sinon largeur double (plafonnée à 650 px)
- **Texte** : toujours largeur simple (les textes de documents historiques font rarement plus de 125-150 mots, ce qui tient confortablement dans une colonne)

Les images ne sont jamais agrandies au-delà de leur taille native ; une petite image reste petite et est centrée dans sa zone.

**Règles de placement**

- Les documents sont placés dans l'ordre strict de la liste de la tâche (jamais de réorganisation automatique)
- Un document en largeur simple va dans la colonne active (gauche d'abord, puis droite)
- Un document en largeur double prend toute la largeur et marque une rupture : les documents suivants recommencent dans la colonne gauche en dessous
- L'ordre de lecture naturel (gauche vers droite, haut vers bas) correspond à l'ordre A, B, C, D des documents

**Encadrement de chaque document**

- Bordure noire 1 px
- Padding interne d'environ 10 px sur tous les côtés
- Contenu du cadre dans l'ordre :
  1. Label _Document N_ (fond noir, texte blanc, coin supérieur gauche)
  2. Titre optionnel à côté du label, sur la même ligne
  3. Contenu principal (image ou texte)
  4. Source précédée de _« Source : »_, en police légèrement plus petite, en bas du cadre (à l'intérieur)

**Documents textuels**

- Largeur utile dans une colonne simple : ~295 px (après padding)
- Typographie lisible, interlignage généreux pour compenser la largeur limitée

**Documents iconographiques**

- Images redimensionnées automatiquement à la largeur du slot (simple ou double)
- Légende en surimposition interne dans un des quatre coins, selon la propriété définie à la création du document
- Fond semi-transparent sous la légende pour assurer la lisibilité sur tous types d'images

**Contrainte d'une page**

- Une tâche = une page 8,5 × 11 po maximum
- Si les documents débordent, le système signale le problème en temps réel : _« Le dossier documentaire dépasse une page. Réduisez le nombre de documents ou choisissez des variantes plus compactes. »_
- L'enseignant ajuste jusqu'à ce que la contrainte soit respectée

### 4.5 Mise en page du Questionnaire

**Format de page**

- Page 8,5 × 11 po, marges 2 cm, zone utile ~650 px
- Contenu nu, sans en-tête ni pied de page
- Flux vertical, pleine largeur (pas de bicolonne)

**Ordre vertical du contenu**

1. **Consigne** en pleine largeur, texte plat (chips résolues en texte simple)
2. **Guidage** en italique, sous la consigne (conditionnel selon le mode formatif/sommatif)
3. **Espace de production** adapté au type de question :
   - Rédactionnelle : N lignes vides (N déterminé par le comportement attendu à l'étape 2)
   - Choix multiple : liste de choix avec cases à cocher
   - Réponse courte : petit encadré
4. **Grille d'évaluation** en pleine largeur (650 px), toujours visible dans les deux modes

---

## 5. Architecture technique

### 5.1 Principe de rendu unique

Le rendu écran (aperçu imprimé) et le rendu PDF final proviennent du **même HTML/CSS**. Aucun double rendereur, aucune divergence possible.

**Implémentation recommandée** :

- Feuille de style print sérieuse et exhaustive (contrôle des marges, sauts de page, pagination, polices)
- Aperçu dans le wizard : iframe ou composant React qui applique la feuille de style print directement
- Génération PDF : moteur Chromium headless (Puppeteer ou équivalent) qui rend exactement le même HTML/CSS en PDF
- Verrouillage de la version de Chromium côté serveur pour garantir la cohérence avec le rendu client

### 5.2 Layout engine isolé pour le dossier documentaire

Le moteur de mise en page bicolonne du dossier documentaire est un **composant isolé**, réutilisable pour l'aperçu HTML et la génération PDF.

**Entrée** : liste ordonnée de documents avec leurs métadonnées (type, dimensions natives, longueur de texte)

**Sortie** : structure de mise en page (colonnes, positions, hauteurs calculées) appliquée ensuite par le rendu HTML/CSS

**Stratégie** : algorithme glouton et local (décisions paire par paire, pas d'optimisation globale), respect strict de l'ordre des documents, contrainte d'une page vérifiée en sortie.

### 5.3 Persistance

- **Sauvegarde automatique** en fond à intervalles réguliers, transparente pour l'utilisateur
- **Brouillon explicite** via bouton _« Enregistrer comme brouillon »_, qui ferme la session en conservant l'état et fait apparaître la tâche dans une liste _« Mes brouillons »_
- Indicateur visible en permanence : _« Brouillon · Sauvegardé il y a X sec. »_

### 5.4 Taxonomie

Les taxonomies des compétences disciplinaires, des aspects de société et des connaissances associées sont stockées dans des **fichiers JSON statiques**, éditables hors application. Pas de couplage avec le code — les mises à jour du programme MEQ se font par édition des fichiers.

Migration possible plus tard vers une base de données avec back-office si le volume ou la fréquence d'édition le justifie.

---

## 6. Comportements transversaux

### 6.1 Cascade de verrouillage progressif

À l'étape 2, les champs se déverrouillent dans l'ordre : niveau → discipline → OI → comportement attendu. Chaque champ est désactivé tant que le précédent n'est pas rempli, avec un texte d'aide contextuel qui l'explique.

Ce pattern de cascade matérialise visuellement la logique d'inférence du modèle MEQ et empêche les états incohérents (par exemple choisir un comportement attendu qui ne correspond pas à l'OI sélectionnée).

### 6.2 Avertissements « est-ce volontaire ? »

Pattern d'interaction pour capturer les cas limites légitimes sans bloquer l'utilisateur :

- Se déclenche **à la validation d'une étape** (clic sur Suivant), pas en direct pendant la saisie
- Apparaît sous forme de modale légère avec deux options : _« Oui, c'est voulu »_ (poursuit) et _« Non, je veux corriger »_ (reste sur l'étape)
- Ne se répète pas dans la même session si l'enseignant a déjà confirmé
- Groupe plusieurs cas détectés dans une seule modale plutôt qu'en cascade

**Cas actuellement identifiés** :

- Document sans titre
- Document sans source
- (Autres cas à ajouter selon l'observation en usage réel)

### 6.3 Modèles fréquents issus d'analyse

Les modèles proposés en encart latéral aux étapes 3 (consigne, guidage) et 5 (corrigé) sont **dérivés d'une analyse de nombreuses épreuves existantes**. Ni curés manuellement, ni contribués par les utilisateurs.

**Principes d'affichage** :

- Présentés avec autorité tranquille, sans système de notation
- Filtrés par OI + comportement attendu
- 2 à 4 modèles par étape, pas plus
- Visuellement distincts des champs de saisie (encart latéral, pas pré-remplissage)
- Insertion sur action explicite de l'enseignant, jamais automatique
- Rejetable d'un clic une fois inséré

### 6.4 Sauvegarde et brouillons

Deux mécanismes distincts et coexistants :

- **Sauvegarde automatique** : persistance silencieuse de l'état courant, transparente, assurance contre la perte de travail
- **Brouillon explicite** : action volontaire de l'enseignant pour mettre en pause sa session, la tâche apparaît dans _« Mes brouillons »_ et peut être reprise plus tard

L'indicateur visible _« Brouillon · Sauvegardé il y a X sec. »_ rassure l'enseignant que rien n'est perdu.

---

## 7. Questions ouvertes et points à surveiller

### 7.1 À valider contre le build existant

- Conformité du build actuel à la spécification ci-dessus, étape par étape
- Comportement exact du toggle _« Référencer explicitement les documents »_ à l'étape 3 (si présent dans le build)
- Sélection unique ou multiple dans les miller columns des étapes 6 et 7
- Gouttière exacte entre colonnes du dossier documentaire (15, 20, 25 px ?)
- Gestion visuelle de la légende en surimposition sur les images (fond semi-transparent exact, couleur du texte)

### 7.2 À trancher plus tard

- Est-ce qu'une tâche peut être clonée pour créer une variante ? Si oui, le clone référence-t-il les mêmes documents ou des copies ?
- Interactions exactes entre le wizard de tâche et le wizard d'épreuve pour la déduplication (ce document couvre le modèle conceptuel, mais pas l'UI de composition d'épreuve)
- Cas limites du layout engine (image très haute, texte exceptionnellement long, etc.)
- Stratégie d'onboarding pour les nouveaux utilisateurs (peut-être des tâches d'exemple pré-remplies)

### 7.3 À tester en usage réel

- Ressenti du blocage de bouton Suivant — trop paternaliste ou bien accepté ?
- Découvrabilité du toggle Formatif/Sommatif en contrôle latéral
- Pertinence et utilisation réelle des modèles fréquents
- Fluidité du lancement du wizard de création de document depuis l'étape 4 (pile de wizards)
- Tolérance au nombre d'étapes (7) et à la densité de chaque étape

---

## 8. Glossaire rapide

| Terme                    | Définition                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OI**                   | Opération intellectuelle (convention MEQ : Situer dans le temps et dans l'espace, Établir des faits, Établir des causes et conséquences, Comparer, Mettre en relation, etc.) |
| **Comportement attendu** | Déclinaison concrète d'une OI, par exemple _« L'élève doit situer des faits sur une ligne du temps »_                                                                        |
| **Grille d'évaluation**  | Outil d'évaluation critérié fourni par le MEQ, associé à un comportement attendu, non modifiable dans l'outil                                                                |
| **Dossier documentaire** | Ensemble des documents sources consultés par l'élève pour répondre à une tâche ou à une épreuve                                                                              |
| **Questionnaire**        | Ensemble des consignes et zones de réponse, distinct du dossier documentaire                                                                                                 |
| **Mode formatif**        | Mode d'évaluation où l'élève reçoit un guidage pédagogique (en italique sous la consigne)                                                                                    |
| **Mode sommatif**        | Mode d'évaluation sans guidage, utilisé pour les épreuves notées                                                                                                             |
| **Épreuve**              | Panier ordonné de tâches regroupées, organisé en sections A/B/C selon la convention MEQ                                                                                      |
| **Miller columns**       | Pattern UI de navigation hiérarchique en colonnes cascadées (façon Finder macOS), utilisé pour les arbres de compétences et de connaissances                                 |
| **Chip de référence**    | Nœud structuré dans l'éditeur TipTap qui pointe vers un document, affiché différemment selon le contexte (chip en édition, texte plat au rendu final)                        |

---

_Document consolidé à partir d'une session de conception approfondie. À relire et ajuster au contact du build réel et des premiers tests utilisateurs._
