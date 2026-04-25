# FAQ publique — ÉduQc.IA

Texte officiel à destination du **public** (site, aide, communications). Alignement produit et technique : [FEATURES.md](./FEATURES.md), [WORKFLOWS.md](./WORKFLOWS.md), [DECISIONS.md](./DECISIONS.md), [DOMAIN_MODEL.md](./DOMAIN_MODEL.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Qu'est-ce qu'une tâche ?

Sur notre plateforme, une tâche est l'unité de base de création.

Il s'agit d'une consigne claire et ciblée, proposée à l'élève, qui l'amène à réaliser une opération intellectuelle précise à partir d'un contenu donné.

Chaque tâche vise à produire une trace observable permettant de porter un jugement sur les apprentissages de l'élève.

### Une tâche, en pédagogie

En didactique, une tâche correspond à ce que l'élève est concrètement invité à faire. Elle constitue un point de rencontre entre l'enseignement et l'évaluation : bien conçue, elle permet à la fois de soutenir l'apprentissage et d'en vérifier la progression.

Dans une approche par compétences, une tâche ne se limite pas à vérifier une connaissance isolée. Elle vise plutôt à faire mobiliser des ressources dans une situation donnée.

### Sur notre plateforme ÉduQc.IA

Une tâche comprend généralement :

- une consigne claire et explicite
- une opération intellectuelle ciblée
- un contenu disciplinaire (ex. document historique)
- une production attendue

Les tâches peuvent être utilisées seules ou regroupées dans une épreuve.

> **Note produit :** dans l'application, la forme officielle est **Tâche** (l'ancienne forme longue « tâche d'apprentissage et d'évaluation » et l'acronyme TAÉ ont été retirés de l'UI le 25 avril 2026 — voir [DECISIONS.md](./DECISIONS.md)).

---

## Qu'est-ce qu'une opération intellectuelle ?

Sur la plateforme ÉduQc.IA, une opération intellectuelle est le véritable moteur de la tâche.

Elle correspond au processus cognitif précis que l'élève doit mobiliser pour analyser des informations historiques et construire du sens à partir d'une réalité sociale.

Plutôt que de simplement restituer des connaissances, l'opération intellectuelle amène l'élève à traiter, organiser et interpréter des informations, souvent à partir de sources documentaires. Elle oriente ainsi le type de raisonnement attendu (par exemple : identifier une cause, situer un événement dans le temps ou comparer des points de vue).

### Une opération intellectuelle, en didactique de l'histoire

En didactique de l'histoire, les opérations intellectuelles sont au cœur du développement de la pensée historique. Elles permettent de dépasser la mémorisation pour amener l'élève à véritablement faire de l'histoire.

Le programme d'Histoire du Québec et du Canada identifie six opérations intellectuelles fondamentales qui structurent l'analyse des réalités sociales :

- **Situer dans le temps et dans l'espace** : localiser des faits à l'aide de repères temporels ou spatiaux
- **Dégager des différences et des similitudes** : comparer des réalités, des situations ou des points de vue
- **Déterminer des causes et des conséquences** : expliquer les origines ou les effets d'un fait
- **Mettre en relation des faits** : établir des liens pertinents entre des documents et une réalité donnée
- **Déterminer des changements et des continuités** : analyser l'évolution d'une société dans le temps
- **Établir des liens de causalité** : construire un enchaînement logique entre plusieurs faits historiques

Chaque opération s'appuie sur des critères de rigueur (exactitude, pertinence, clarté, complétude) qui permettent d'évaluer la qualité du raisonnement de l'élève.

### Sur la plateforme ÉduQc.IA

L'opération intellectuelle est le paramètre central qui structure la conception de chaque tâche.

Elle permet de :

- **Structurer la tâche** : elle détermine le type de raisonnement attendu et oriente la sélection des documents
- **Encadrer l'évaluation** : elle est associée à un **outil d'évaluation préselectionné** (communément appelé grille de correction), conforme aux standards du ministère de l'Éducation du Québec, automatiquement attaché dès que vous choisissez un comportement attendu. Cet outil d'évaluation n'est pas modifiable : il garantit l'alignement rigoureux avec les pratiques ministérielles et vous évite d'avoir à concevoir votre propre instrument d'évaluation.
- **Assurer l'alignement pédagogique** : la tâche cible explicitement l'utilisation appropriée des connaissances, un critère central du programme

En choisissant une opération intellectuelle, vous ne créez pas simplement une question : vous concevez une situation d'apprentissage et d'évaluation structurée, qui développe l'analyse, la rigueur et l'esprit critique des élèves.

> **Note produit :** en interface, on utilise toujours la forme **opération intellectuelle** en toutes lettres — jamais l'abréviation « OI ». Les opérations **proposées dans le formulaire**, leurs libellés techniques et le statut MVP / « coming soon » sont décrits dans [FEATURES.md](./FEATURES.md) et le référentiel `public/data/oi.json`.

---

## Le processus de création d'une tâche rédactionnelle

Sur la plateforme ÉduQc.IA, la création d'une tâche rédactionnelle suit un processus structuré en sept étapes. Cette démarche guide l'enseignant afin d'assurer la cohérence pédagogique, l'alignement avec le programme et la qualité de l'évaluation.

### 1. Identifier les auteurs de la tâche

L'enseignant précise s'il est l'unique concepteur ou s'il travaille en collaboration. Dans ce cas, il peut rechercher et ajouter des collègues inscrits sur la plateforme afin de reconnaître leur contribution.

### 2. Définir les paramètres pédagogiques

L'enseignant sélectionne les éléments fondamentaux de la tâche :

- le niveau scolaire
- la discipline
- l'opération intellectuelle ciblée
- le comportement attendu

Ces choix structurent automatiquement la tâche en déterminant :

- le **nombre de documents** requis pour la tâche
- l'**outil d'évaluation** préselectionné, conforme aux standards MEQ et non modifiable
- le **nombre de lignes** d'espace de production rédactionnel — **déduit** des données ministérielles (`oi.json`) pour le comportement choisi, sans saisie manuelle à cette étape

Une fois ces paramètres validés, ils sont verrouillés pour préserver la cohérence de la tâche. L'enseignant peut les déverrouiller s'il doit les ajuster, mais cette action réinitialise les étapes dépendantes — un garde-fou pour éviter les incohérences accidentelles entre l'outil d'évaluation, le nombre de documents et le contenu rédigé.

### 3. Rédiger la consigne et le guidage

À l'aide d'un éditeur riche, l'enseignant formule une consigne claire et rigoureuse, qu'il peut enrichir en insérant des **références aux documents** (Document A, Document B, etc.) via les boutons dédiés dans la barre d'outils de l'éditeur. Ces références apparaissent comme des pastilles visuelles distinctes pendant la rédaction, et se transforment en texte normal (« document A », « document B ») sur la copie de l'élève.

Un **appel documentaire** est automatiquement pré-inséré en début de consigne selon le nombre de documents de la tâche (« Consultez le document A. », « Consultez les documents A et B. », etc.) — l'enseignant n'a pas à le saisir et peut le modifier ou le retirer librement si sa formulation place les références ailleurs dans la phrase.

L'enseignant ajoute ensuite un **guidage complémentaire** pour soutenir l'élève si nécessaire (facultatif). Ce guidage s'affichera en italique sous la consigne en mode formatif, et sera automatiquement masqué en mode sommatif au moment de composer une épreuve.

### 4. Intégrer les documents historiques

L'enseignant remplit les emplacements de documents (le nombre est déjà fixé à l'étape 2 selon le comportement attendu choisi). Pour chaque emplacement, deux options :

- **Créer un nouveau document** sur place, qui rejoindra automatiquement la banque partagée — le même assistant de création de document que depuis la banque est utilisé, dans une version allégée qui hérite des dimensions d'indexation de la tâche en cours
- **Réutiliser un document existant** en le sélectionnant depuis la banque de documents

Chaque document est accompagné des informations pertinentes (titre, légende, source, **repère temporel** si pertinent — voir FAQ dédiée plus bas). L'ordre des documents détermine leurs étiquettes locales (A, B, C, D) et peut être ajusté par glisser-déposer — les références dans la consigne se mettent à jour automatiquement.

### 5. Rédiger le corrigé et les notes au correcteur

L'enseignant rédige la **production attendue**, qui sert de clé de correction pour l'évaluation. Il peut également ajouter des **notes au correcteur** pour préciser les nuances d'interprétation, les cas particuliers à accepter ou les pièges fréquents à reconnaître.

L'outil d'évaluation attaché à l'étape 2 est rappelé ici en lecture seule, pour que l'enseignant puisse rédiger son corrigé en cohérence avec les critères qui seront utilisés.

### 6. Associer la compétence disciplinaire

L'enseignant sélectionne la compétence visée dans le référentiel, en précisant :

- la compétence
- sa composante
- le critère d'évaluation

La navigation se fait par colonnes cascadées, qui permettent d'explorer le référentiel en profondeur sans se perdre.

### 7. Cibler les aspects de société et les connaissances du programme

L'enseignant sélectionne les **aspects de la réalité sociale** visés par la tâche, puis associe une ou plusieurs **connaissances** du programme en naviguant dans le référentiel structuré. Cela permet de relier explicitement la tâche aux contenus à maîtriser et d'assurer son indexation pour la banque collaborative.

### Une conception assistée et flexible

Tout au long du processus, l'enseignant peut :

- **naviguer librement entre les étapes** déjà complétées grâce au stepper cliquable, sans avoir à suivre un ordre rigide
- **visualiser sa tâche en temps réel** dans la colonne de droite, avec deux vues complémentaires : le **Sommaire**, une vue structurée par sections pour valider la complétude, et l'**Aperçu imprimé**, un rendu pixel-perfect du format papier 8,5 × 11 pouces tel que l'élève le recevra
- **profiter de la sauvegarde automatique permanente** qui préserve son travail en continu, et enregistrer un brouillon nommé pour y revenir plus tard
- **télécharger un PDF** pixel-perfect de sa tâche pour l'imprimer depuis son poste ou l'archiver

Les différents formats de présentation pour l'impression d'une épreuve (formatif, sommatif standard, sommatif « épreuve ministérielle », corrigé) sont disponibles **depuis la vue détaillée de l'épreuve une fois celle-ci créée**, et non pendant la conception.

Cette approche permet de concevoir des tâches à la fois rigoureuses, cohérentes et directement utilisables en contexte d'évaluation, tout en offrant une expérience fluide et adaptée à la réalité du travail enseignant.

> **Note produit :** le parcours correspond à l'**assistant de création de tâche en sept étapes** (création / édition) — détail des écrans, stepper et règles techniques : [WORKFLOWS.md](./WORKFLOWS.md). En interface, la colonne de synthèse du formulaire s'appelle le **Sommaire** (et non « aperçu » ou « preview »). La section **Espace de production** au Bloc 2 affiche le **nombre de lignes** issu des données (comportement) ; libellés : [UI-COPY.md](./UI-COPY.md) ; la **production attendue** et le **corrigé** : [FEATURES.md](./FEATURES.md).

---

## Qu'est-ce que la banque de documents ?

La banque de documents est un espace partagé où tous les documents utilisés dans les tâches sont regroupés et consultables.

### Un document, entité autonome

Sur la plateforme ÉduQc.IA, un document n'appartient pas à une tâche particulière : c'est une **entité indépendante** qui peut être référencée par plusieurs tâches simultanément. Un texte d'époque, une carte historique, une caricature politique ou un tableau statistique existe une seule fois dans la banque et peut servir à autant de tâches que nécessaire.

### Pourquoi cette approche ?

Cette organisation a trois avantages pédagogiques concrets :

- **Réutilisation facilitée** : un document bien sélectionné et bien documenté peut servir à plusieurs opérations intellectuelles différentes, créées par vous ou par vos collègues
- **Qualité partagée** : plus un document est utilisé, plus sa fiche s'enrichit (titre, source, légende, repère temporel), et tout le monde en bénéficie
- **Cohérence dans les épreuves** : quand plusieurs tâches d'une même épreuve partagent un document, il n'apparaît qu'une seule fois dans le dossier documentaire final, avec une numérotation cohérente

### Modifier un document partagé

Quand vous modifiez un document de la banque, la plateforme vous avertit du nombre de tâches qui l'utilisent actuellement. Vous avez alors le choix : modifier le document (la modification sera visible dans toutes les tâches qui le référencent), ou **dupliquer** le document pour créer une variante personnelle que vous pouvez ajuster librement sans affecter l'original.

### Création d'un document

Un document peut être créé de deux façons :

- **Directement depuis l'assistant de création de document**, pour alimenter votre bibliothèque sans forcément avoir une tâche en tête
- **Depuis l'assistant de création de tâche**, à l'étape 4, quand vous avez besoin d'un document qui n'existe pas encore — le nouveau document rejoint automatiquement la banque partagée

Dans les deux cas, **le même assistant de création de document** vous guide à travers les informations à saisir : type (textuel ou iconographique), titre, contenu, source, repère temporel, et pour les documents iconographiques la légende et sa position sur l'image. Invoqué depuis l'assistant de création de tâche, il présente une version allégée qui hérite des dimensions pertinentes de l'indexation de la tâche en cours — une fois le document créé, il est pleinement autonome et son indexation peut évoluer indépendamment.

### Banque collaborative

Au-delà de vos ressources personnelles (**Mes documents**, **Mes tâches**, **Mes épreuves**), la **banque collaborative** regroupe les trois types de ressources partagées par la communauté enseignante. Elle s'organise en trois onglets : **documents**, **tâches**, **épreuves**. Vous pouvez y chercher, consulter et réutiliser les ressources publiées par vos collègues.

---

## Qu'est-ce qu'une épreuve ?

Sur notre plateforme ÉduQc.IA, une épreuve est un regroupement structuré de tâches.

Elle permet de rassembler plusieurs tâches afin d'évaluer de manière plus complète les apprentissages des élèves, en variant les opérations intellectuelles, les contenus et les niveaux de complexité.

### Une épreuve, en pédagogie

En sciences de l'éducation, une épreuve correspond à un instrument d'évaluation : un ensemble organisé de tâches conçu pour recueillir des informations pertinentes sur les apprentissages.

Contrairement à une tâche isolée, l'épreuve permet :

- de multiplier les traces d'apprentissage
- de croiser différentes habiletés
- d'augmenter la validité de l'évaluation (jugement plus fiable)

Elle s'inscrit dans une situation d'évaluation plus large, qui peut inclure des critères, un outil d'évaluation et une intention pédagogique (formative ou sommative).

### Sur notre plateforme ÉduQc.IA

Une épreuve :

- regroupe plusieurs tâches créées par l'enseignant
- peut être utilisée comme activité d'évaluation complète
- permet de structurer un examen, un test ou une activité formative

**Formats d'impression disponibles.** Depuis la vue détaillée d'une épreuve, vous pouvez choisir parmi plusieurs formats adaptés à différents contextes d'usage :

- **Formatif** : documents et tâches enchaînés sur la même feuille, avec le guidage complémentaire visible
- **Sommatif standard** : documents sur une feuille, tâches sur une autre (deux feuillets distincts)
- **Sommatif « épreuve ministérielle »** : trois feuillets distincts — Dossier documentaire / Questionnaire / Cahier de réponse, conforme au modèle ministériel
- **Corrigé** : chaque tâche affiche sa production attendue dans l'espace normalement dévolu à l'élève, pour faciliter la correction

Ce choix de format est effectué **au moment de l'usage** (après création de l'épreuve), pas pendant la conception.

Elle constitue un outil central pour organiser et exploiter les tâches dans un contexte réel d'enseignement.

> **Note technique :** l'entité persistée côté base s'appelle encore `evaluations` ; les écrans et libellés utilisent **épreuve** / **Mes épreuves**. La migration du nommage côté base est une dette identifiée dans [DOMAIN_MODEL.md](./DOMAIN_MODEL.md).

---

<a id="faq-repere-temporel-enseignants"></a>

## FAQ enseignants — Repère temporel et opération intellectuelle « Situer dans le temps »

Texte à destination des **enseignants** : rôle du **repère temporel** et de l'**année normalisée** pour les tâches non rédactionnelles rattachées à l'opération intellectuelle **Situer dans le temps**. Alignement produit et technique : [FEATURES.md](./FEATURES.md), [wizard-oi-non-redactionnelle.md](./wizard-oi-non-redactionnelle.md), `public/data/oi.json`, `lib/ui/ui-copy.ts`, `lib/utils/extract-year.ts`, `lib/tache/behaviours/avant-apres.ts`.

Les libellés **comportements attendus** ci-dessous reprennent les **énoncés** du référentiel `oi.json`.

### 1. Pourquoi renseigner un repère temporel pour mes documents ?

Le repère temporel (date, période ou formulation que vous jugez utile) permet à la plateforme de **poser une chronologie comparable** entre documents. Pour les tâches rattachées à l'opération intellectuelle **Situer dans le temps**, cela sert à **calculer ou valider** des éléments d'exercice (ordre, cohérence avec une frise, etc.) et à **limiter les erreurs de saisie** grâce à l'**année normalisée** affichée ou corrigée sous le champ.

**Le repère temporel est un attribut du document lui-même**, saisi dans l'assistant de création de document et stocké avec le document. Il accompagne le document à chacune de ses utilisations — vous n'avez pas à le re-saisir dans chaque tâche.

### 2. Quelle est la différence entre le champ « Repère temporel » et l'« Année normalisée » ?

- **Repère temporel :** texte libre, comme pour une légende ou vos notes — _exemples : « vers 1760 », « juin 1834 »_.
- **Année normalisée :** **nombre entier** utilisé en interne pour **comparer** les documents. Il est **proposé automatiquement** lorsque le texte du repère contient une **année sur quatre chiffres** ; vous pouvez le **corriger** si l'interprétation doit être différente.

Si aucune année à quatre chiffres n'est détectable, un **champ dédié** permet de saisir ou d'ajuster l'année à la main.

### 3. En quoi cela m'aide-t-il à créer des tâches ?

- **Ordonner chronologiquement des faits en tenant compte de repères de temps**
  Dès que les **quatre** documents disposent d'une **année comparable** (année normalisée ou année extraite du repère), vous pouvez, à l'**étape des options de réponse**, utiliser **« Générer les options A B C D »** pour produire l'ordre attendu, des distracteurs et la lettre du corrigé, avec une justification. En cas d'**égalité d'année** entre documents, le formulaire vous demande d'abord de **fixer la bonne séquence** (saisie en cases), puis de générer.

- **Situer des faits sur une ligne du temps**
  Vous configurez la **frise** (segments et dates) à l'étape consigne ; le **document cible** doit contenir des **indices** permettant à l'élève de repérer la période sur cette frise. **Aucun message automatique** ne signale aujourd'hui un écart entre l'année du document et un segment : c'est à vous de **vérifier la cohérence** entre le contenu du document, le repère ou l'année et la ligne du temps.

- **Classer des faits selon qu'ils sont antérieurs ou postérieurs à un repère de temps**
  Disponible dans le sélecteur (**Situer dans le temps**). Après avoir renseigné le **thème**, le **repère** et l'**année du repère** (étape 3) et les **quatre documents** avec une **année comparable** chacun (étape 4), utilisez à l'**étape 5** **« Générer les options A à D »** pour produire les quatre répartitions AVANT/APRÈS, les distracteurs et la lettre du corrigé, avec justification automatique. En cas d'**égalité d'année** entre documents (ou avec le repère), le formulaire demande de **trancher** (cases Avant / Après) avant de générer.

### 4. Et si un document n'a pas de date précise ?

Vous pouvez utiliser une **période** ou une **estimation** ; dès qu'une **année à quatre chiffres** apparaît dans le repère, elle peut être reprise pour l'année normalisée. Les formulations **sans quatre chiffres consécutifs** (certaines dates très anciennes, formats atypiques) nécessitent en général une **saisie manuelle** de l'année.

Si le document **n'offre vraiment aucun repère exploitable**, les fonctions qui dépendent d'une année comparable **ne pourront pas tout automatiser** ; le formulaire vous indiquera ce qui manque (par exemple pour la génération des options en ordre chronologique).

### 5. Est-ce que les élèves voient ce repère temporel ?

**Non** sur la copie de l'élève ni dans le PDF téléchargé de la tâche : ces champs sont **réservés à la préparation** de la tâche et à l'organisation de votre banque. L'élève travaille à partir du **contenu** des documents publiés (texte ou image), pas à partir de ce libellé interne. Le repère temporel est néanmoins visible dans la **vue détaillée** d'un document lorsque vous le consultez depuis la banque.

### 6. Cette information est-elle obligatoire ?

Pour **tirer parti de l'automatisation** là où elle existe (**ordre chronologique**, **ligne du temps**, **avant / après**), une **année comparable par document** (directement ou via le repère) est **nécessaire**. Pour les autres types de tâches, le repère peut rester **facultatif** selon le cas, tout en restant utile pour **réutiliser** ou **classer** vos documents.

Il est recommandé d'associer un repère temporel à vos documents dès leur création, que ce soit depuis l'assistant de création de document dédié ou depuis l'assistant de création de document intégré à l'assistant de création de tâche — c'est un investissement minime qui facilite grandement la réutilisation ultérieure.

### 7. Les documents déjà existants dans la banque ont-ils déjà un repère temporel ?

Lorsqu'un document de banque comporte déjà **repère temporel** et **année normalisée**, ces informations accompagnent le document à chacune de ses utilisations. **Elles ne sont pas dupliquées tâche par tâche** : le repère est attribut du document, pas de l'association tâche-document.

Si vous souhaitez ajuster le repère d'un document, modifiez-le depuis l'édition du document (option « Modifier le document » dans la banque). La plateforme vous avertira du nombre de tâches qui utilisent ce document, et vous pourrez choisir de modifier le document en place ou de le **dupliquer** pour créer une variante personnelle.

### 8. Est-ce que je peux utiliser un même document pour plusieurs tâches ?

Oui, c'est même l'un des principes clés de la plateforme : un document est une entité autonome, réutilisable dans autant de tâches que vous souhaitez. Le repère temporel et l'année normalisée du document sont cohérents d'une tâche à l'autre.

Si, pour une raison particulière, vous souhaitez un document avec un repère différent (par exemple pour recadrer son usage), vous pouvez **dupliquer** le document depuis la banque et modifier la copie.

### 9. Est-ce que l'année normalisée est prise en compte pour d'autres opérations intellectuelles ?

Pour l'instant, l'usage principal est la **temporalité** au sein de **Situer dans le temps**. D'autres usages (suggestions de connaissances, classements plus fins) relèvent de **pistes** produit futures, pas d'un engagement sur l'application actuelle.

### 10. Que se passe-t-il si je modifie le repère temporel après avoir généré les options ?

La bonne pratique est de **vérifier** que l'ordre et les options restent **cohérents** avec les nouvelles dates. Utilisez **« Régénérer les distracteurs »** (ou repartez d'une nouvelle séquence si l'égalité d'années ou la saisie en cases l'exige) pour **recalculer** à partir des données à jour. Ne présumez pas qu'un **message système** rappelle chaque incohérence : l'outil **ne remplace pas** une relecture rapide avant publication.

### 11. Qu'est-ce que l'appel documentaire ?

En didactique, l'appel documentaire est la composante de la consigne qui indique à l'élève le ou les documents à consulter pour répondre à la question. Il se présente sous deux formes dans les épreuves :

- **Direct :** « Consultez le document 7. »
- **Intégré :** « À partir du document 16, indiquez... »

Dans ÉduQc.IA, un appel documentaire est **pré-inséré automatiquement** en début de consigne selon le nombre de documents associés à votre tâche — vous n'avez donc pas à le rédiger de zéro.

**Exemples pré-insérés :**

- « Consultez le document A. » (1 document)
- « Consultez les documents A et B. » (2 documents)
- « Consultez les documents A, B et C. » (3 documents)

Vous pouvez **modifier librement cet appel ou le retirer complètement** si votre formulation place les références ailleurs dans la phrase. L'éditeur de consigne met à votre disposition des boutons dédiés pour insérer des **pastilles de référence** aux documents (Document A, Document B, etc.) : elles apparaissent visuellement distinctes pendant la rédaction et se transforment automatiquement en texte normal sur la copie de l'élève (« document A », « document B »), avec une renumérotation automatique si la tâche est utilisée dans une épreuve.

L'appel documentaire (qu'il soit pré-inséré ou rédigé intégré dans la consigne) apparaît toujours sur la copie de l'élève. Dans les miniatures et les listes de la banque, la partie pré-insérée est retirée automatiquement pour mettre en avant la consigne rédigée par l'enseignant.

### 12. Qu'est-ce que le guidage complémentaire ?

En didactique, le guidage complémentaire — parfois appelé étayage — désigne tout ce que l'enseignant ajoute autour d'une consigne pour aider l'élève à comprendre, planifier et réussir la tâche, sans faire le travail à sa place.

- **La consigne** → ce que l'élève doit faire
- **Le guidage** → comment on l'aide à y arriver

**Formes concrètes :** le guidage peut prendre plusieurs formes : clarification de la tâche (reformuler la consigne, définir des mots complexes, préciser le produit attendu), structuration de la démarche (étapes, méthode, stratégie), indices gradués (questions guidées, pistes de réflexion, rappels de notions) et modélisation (exemple de réponse, bon ou mauvais).

**Principe clé :** un bon guidage oriente la pensée sans donner la réponse. L'idée est d'étayer au début, puis de retirer graduellement le soutien — c'est le désétayage.

**Dans ÉduQc.IA :** le guidage est enregistré avec chaque tâche et réutilisable dans toutes vos épreuves. Il apparaît automatiquement sur la copie de l'élève en évaluation formative. Vous pouvez choisir de le masquer au moment de composer une épreuve sommative.

### 13. Qu'est-ce que la copie de l'élève ?

La copie de l'élève désigne le support physique fourni par l'enseignant, destiné à recevoir la production écrite, graphique ou symbolique de l'élève dans le cadre d'une tâche.

Dans ÉduQc.IA, la copie de l'élève est produite sous forme de **PDF pixel-perfect** (format 8,5 × 11 pouces) que l'enseignant télécharge depuis la plateforme et imprime ensuite depuis son poste.

**Les éléments suivants apparaissent sur la copie de l'élève :**

- L'appel documentaire
- La consigne
- Le guidage complémentaire (en évaluation formative uniquement)
- L'espace de production — lignes de réponse pour les tâches rédactionnelles, ou encadré pour inscrire un choix de lettre pour les tâches non rédactionnelles
- L'outil d'évaluation (communément appelé grille de correction), qui permet également à l'élève de s'autoévaluer

Le corrigé, les notes du correcteur, le repère temporel des documents et les métadonnées de la tâche n'apparaissent jamais sur la copie de l'élève.

### En résumé

Renseigner le repère temporel et, au besoin, l'année normalisée directement sur vos documents ancre ceux-ci dans le temps pour la plateforme et **réduit le travail manuel** sur les parcours **déjà proposés**, y compris **avant / après** lorsque les quatre documents ont une année comparable et que le repère de l'étape 3 est renseigné.
