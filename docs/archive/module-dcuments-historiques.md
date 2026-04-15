# Module : Documents historiques (exhaustif)

> **Registre officiel (app) :** **textes UI** dans **[UI-COPY.md](./UI-COPY.md#module-documents-historiques)** ; **règles, mapping données et périmètre** dans **[DECISIONS.md](./DECISIONS.md#module-documents-historiques--périmètre-données-intégration)**. Ce fichier et ces deux entrées doivent rester **alignés** ; en cas d’écart sur un texte UI, **UI-COPY.md** prime ; sur une règle technique ou le mapping SQL, **DECISIONS.md** prime.
>
> **Arbitrages (mars 2026) :** compteur d’usages, visibilité banque sans brouillon document sur le parcours autonome, légende + position + style, source primaire/secondaire obligatoire avec modales, redirection vers fiche lecture — détail : [FEATURES.md](./FEATURES.md) §5.4–5.6, [UI-COPY.md](./UI-COPY.md#module-documents-historiques), [DECISIONS.md](./DECISIONS.md#module-documents-historiques--périmètre-données-intégration).

## Objectif

Permettre aux enseignants de créer, indexer et réutiliser des **documents historiques structurés**, intégrés ensuite dans des tâches, elles-mêmes regroupées dans des évaluations.

Le module est accessible depuis la **navbar**, et les documents sont consultables et réutilisables via la **banque collaborative**.

---

## 1. Création d’un document

### Champs principaux

- **Titre du document**
- **Type de document** : texte ou image

### Contenu

- **Si texte** → champ texte pour l’extrait
- **Si image** → upload de l’image + **champ légende** (optionnel) ; **texte d’aide** et **icônes de position** : [UI-COPY.md](./UI-COPY.md#étape-4--documents-historiques) (Légende) ; [DECISIONS.md](./DECISIONS.md#justifications--position-de-la-légende) (icônes ; haut gauche = `position_top_right` en miroir horizontal).

**UI suggestion :**

[ Champ Titre ]
Type : ( ) Texte ( ) Image

Si texte :
[ Zone texte ]

Si image :
[ Upload image ]
[ Légende ] (optionnel) — copy d’aide : [UI-COPY.md](./UI-COPY.md#étape-4--documents-historiques)

---

## 2. Source

- Champ texte obligatoire : `source`
- Sélection du type : `primaire` / `secondaire`

**UI suggestion :**

Source : [ Nom du livre / auteur / année ]
Type de source : ( ) Primaire ( ) Secondaire

---

## 3. Indexation

- **Discipline** (dropdown)
- **Niveau** (dropdown)
- **Connaissances associées** (sélection dans la banque)
- **Aspects de société** (multi-sélection) : Politique, Économie, Social, Culturel, Territorial

---

## 4. Avertissement légal (Québec)

**UI :** l’encadré de confirmation utilise le glyphe Material **`gavel`** et le titre **Documentation légale** — [DECISIONS.md](./DECISIONS.md#documentation-légale) (icône), [UI-COPY.md](./UI-COPY.md#module-documents-historiques) (textes), [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) (icônes), `LegalNoticeIcon`, `DOCUMENT_MODULE_LEGAL_SECTION_HEADING` dans `lib/ui/ui-copy.ts`.

En ajoutant ce document, vous confirmez que vous avez le droit de l’utiliser dans un contexte éducatif, conformément à la Loi sur le droit d’auteur et aux ententes applicables (ex. Copibec).

Vous vous engagez à respecter les limites de reproduction permises (extraits raisonnables) et à citer adéquatement la source.

La plateforme ne vérifie pas les droits d’auteur des contenus ajoutés et décline toute responsabilité en cas d’utilisation non conforme.

**Checkbox obligatoire :**

☑ Je confirme respecter les règles d’utilisation des œuvres en milieu scolaire au Québec (ex. Copibec)

---

## 5. Modèle de données (simplifié)

```ts
Document {
  id
  title
  type               // texte / image
  content
  caption           // uniquement si type = image / optionnelle
  source
  sourceType         // primaire / secondaire
  disciplineId
  niveauId
  createdBy          // utilisateur auteur
  createdAt          // date de création
}

DocumentKnowledge {
  documentId
  knowledgeId
}

DocumentAspect {
  documentId
  aspectId
}

DocumentTask {
  documentId
  taskId             // pour calcul du nombre d'utilisations
}
```

---

## 6. Réutilisation

Un document peut être utilisé dans plusieurs tâches

Les tâches peuvent ensuite être regroupées au sein d’évaluations

Affichage usages :

Utilisé dans : [ X tâches ]

---

## 7. Affichage du document (lecture)

Titre, contenu, légende (si image)

Source + type primaire/secondaire

Discipline, niveau, aspects de société, connaissances

Auteur (créateur du document)

Date de création

Nombre de tâches utilisant le document

**UI suggestion :**

Titre : [ titre du document ]
Contenu : [ texte ou image ]
Légende : [ légende si image ]
Source : [ source ] (Primaire / Secondaire)
Discipline : Histoire
Niveau : Secondaire 3
Aspects : Économie, Politique
Connaissances : [ liste sélectionnée ]
Auteur : [ nom de l’utilisateur qui a créé le document ]
Date de création : [ jj/mm/aaaa ]
Utilisé dans : [ X tâches ]

**Tooltip / copy :**

- Source primaire : document produit à l'époque étudiée (ex. journal, lettre, artefact)
- Source secondaire : analyse ou interprétation produite après coup par un historien ou chercheur

**Copy utilisé :**

- “Utilisé dans X tâches” : indique combien de tâches réutilisent ce document
- Calculé automatiquement à partir de la table DocumentTask

**Navbar icon suggestion pour mode création :**

- Icone : `add_notes` (Google Material Icons)

---

## 8. Intégration dans la création de tâche

Lors de la création d’une tâche, l’utilisateur peut :

Créer un nouveau document (wizard)

Sélectionner un document existant depuis la banque collaborative

---

## 9. Banque collaborative

Centralise trois types de ressources :

Évaluations : ensembles de tâches déjà regroupées par des enseignants

Tâches : créées par des enseignants-utilisateurs

Documents historiques : créés par des enseignants-utilisateurs

### Fonctionnalités

Recherche et filtres basés sur les données d’indexation : discipline, niveau, aspects de société, connaissances, type de document (texte / image)

Aperçu avant sélection (extrait texte ou vignette + légende)

Affichage du nombre de tâches utilisant chaque document

**UI suggestion :**

Banque collaborative :
[ Barre de recherche / filtres : Discipline, Niveau, Aspect, Connaissance, Type ]
[ Liste des documents / tâches / évaluations ]
[ Sélectionner ]

---

## 10. Résultat final

Le module permet de :

Créer des documents historiques structurés

Indexer par : discipline, niveau, connaissances, aspects de société

Ajouter avertissement légal adapté Québec

Ajouter légende uniquement pour les images

Réutiliser les documents dans des tâches, elles-mêmes regroupées en évaluations

Afficher utilisations dans les tâches

Afficher l’auteur et la date de création en mode lecture

Centraliser et filtrer toutes les ressources dans la banque collaborative

---

## 11. Recommandations pour Cursor / améliorations UX

Feedback et validation en temps réel

Champs obligatoires, légende pour image optionnelle

Recherche et filtres multi-critères dans la banque collaborative

Aperçu avant sélection (extrait texte ou vignette image)

Traçabilité / audit (historique, auteur, date, nombre d’utilisations)

Accessibilité (labels clairs, navigation clavier, lecteur d’écran)

Gestion légale simplifiée (lien Copibec, tooltip “extrait raisonnable”)

Consistance des indexations (valeurs standard pour discipline, niveau, aspects, connaissances)
