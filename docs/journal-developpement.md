# ÉduQc.IA — Journal de développement

> Récit chronologique du développement de la plateforme, du 23 mars au 17 avril 2026. Chaque section résume ce qui a été construit, corrigé et documenté.

---

## 23 mars 2026 — Fondations et outillage

La première journée pose les bases du pilotage projet : création du backlog avec la liste des écarts produit et un tableau d'avancement, mise en place d'un protocole de décomposition (méthode de travail avant code), et définition de l'ordre prioritaire d'ingénierie.

Côté fonctionnel, la page **Mes tâches** reçoit ses filtres (Toutes / Brouillons / Publiées) et ses actions : supprimer une tâche (avec blocage si elle est utilisée dans une épreuve) et modifier (redirection vers le wizard en édition). La synchronisation des types Supabase est automatisée via `npm run gen:types`, et la checklist RLS est amorcée avec une revue statique du schéma SQL.

---

## 24 mars 2026 — Fiche de lecture et vignettes

L'affichage de la fiche tâche et des listes est raffiné. La pastille d'opération intellectuelle utilise désormais le glyphe `psychology`. L'aperçu texte de la consigne en miniature (dans les listes et les cartes) retire la phrase introductive « Consultez les documents… » pour ne garder que le contenu pertinent. La validation RLS est exécutée manuellement avec deux comptes enseignants distincts.

---

## 25 mars 2026 — Banque collaborative et anti-dette

La banque collaborative fait son apparition avec la route `/bank` et ses trois onglets (Tâches, Documents, Évaluations). La liste des tâches publiées est alimentée par une vue SQL `banque_tae`. En parallèle, un refactoring anti-dette découpe le volumineux fichier de publication en modules spécialisés (types, payload, lookups, erreurs RPC) et la documentation d'édition des tâches est complétée.

---

## 26 mars 2026 — Grilles d'évaluation et impression

Cette journée est entièrement consacrée aux grilles d'évaluation ministérielles et à l'impression. Les trois grilles complexes (OI3_SO5, OI6_SO3, OI7_SO1) sont travaillées pixel par pixel — colonnes en pixels fixes, bordures fines, séparateurs de groupes en double trait, tailles de police ajustées au dixième de point. Un système de cache module est mis en place pour charger les grilles une seule fois par session, avec un registre typé distinguant les grilles dédiées des grilles génériques.

La fiche imprimable est calibrée au format Letter US : police Arial 11pt, interligne 1.5, marges 2cm via `@page`, pagination CSS avec `break-inside: avoid` sur les blocs atomiques. Les variables de dimension sont centralisées dans le CSS global. L'interligne de l'application est resserré (body à 1.375) et les modes d'impression (formatif, sommatif, corrigé, épreuve) sont documentés comme piste future.

---

## 27 mars 2026 — Module documents et épreuves

Journée massive. Le module documents historiques est livré de bout en bout : wizard de création en 3 étapes (avec split-screen et aperçu comme le wizard TAÉ), onglet Documents dans la banque (liste, filtres, compteur d'usages), fiche lecture enrichie, intégration dans le Bloc 4 du wizard TAÉ (type de source, légende avec positionnement en 4 coins, sélection depuis la banque).

Les documents iconographiques sont pris en charge avec téléversement d'images (redimensionnement serveur via Sharp, plafond 660×400px), légende superposée sur la figure selon le coin choisi, et rendu cohérent entre wizard, fiche et impression.

La composition d'épreuves est branchée : routes de création et d'édition, RPC `save_evaluation_composition`, picker combinant la banque et les tâches personnelles, panier avec ordre drag-and-drop, sauvegarde de brouillon et publication. L'aperçu impression des épreuves est fonctionnel avec renumérotation globale des documents entre tâches.

La terminologie publique est normalisée : « épreuve » remplace « évaluation » dans toute l'interface, et la documentation est scindée — `UI-COPY.md` pour les textes visibles, `DECISIONS.md` pour les règles et protocoles.

---

## 28 mars 2026 — Parcours non rédactionnels

L'infrastructure du wizard non rédactionnel est posée : `variant_slug` dans le catalogue OI, slice dédié dans l'état du formulaire, résolveur dynamique des blocs 3 et 4. Le slot `doc_D` est ajouté (4 documents maximum).

Le parcours **ordre chronologique** (OI 1.1) est le premier livré : saisie de la séquence correcte, génération des options A-B-C-D par permutation, consigne template avec placeholders `{{doc_A}}` à `{{doc_D}}`, feuille élève avec grille 2×2 et cases de réponse, corrigé automatique basé sur les années normalisées. Le guidage élève est séparé de la consigne via un système d'ancres HTML.

La frise SVG **ligne du temps** (OI 1.2) est construite de zéro : polygone ruban 800×120, segments proportionnels aux durées, lettres encadrées, sélection au clavier et à la souris, surbrillance du segment actif. Plusieurs itérations ajustent les dimensions, les polices (Manrope à l'écran, Arial à l'impression), et le layout des dates.

Le parcours **avant/après** (OI 1.3) est livré avec sa colonne JSONB `non_redaction_data`, son tableau à colonnes Avant/Après aligné sur la maquette ministérielle, et les migrations RPC associées.

---

## 30 mars 2026 — Documents enrichis et référentiels

Les documents reçoivent deux nouveaux champs : `repere_temporel` (texte libre de l'enseignant, non affiché sur la copie élève) et `annee_normalisee` (entier, peut être négatif, utilisé pour les comparaisons OI1). La catégorie iconographique est ajoutée comme filtre dans la banque.

L'éditeur riche est unifié : un seul composant `RichTextEditor` basé sur TipTap remplace les trois éditeurs spécialisés qui existaient pour la source, le contenu et le guidage. Le chrome (toolbar, bordures, focus) est partagé avec l'éditeur de consigne.

Le wizard passe officiellement à 7 étapes avec la réorganisation des blocs : la consigne et le guidage restent à l'étape 3, le corrigé passe à l'étape 5, et l'indexation (aspects de société + connaissances relatives) devient l'étape 7.

---

## 31 mars 2026 — Primitives UI et finitions wizard

Plusieurs primitives UI sont créées ou consolidées : `SegmentedControl` (contrôle segmenté sans bordure de conteneur), `LimitCounterPill` (compteur de mots/caractères avec rampe d'avertissement progressive), `Textarea` (wrapper `auth-input` obligatoire). Le wizard document reçoit une refonte visuelle de son étape 1, et le positionnement de la légende passe à une rangée de 4 boutons radio iconiques.

La documentation du backlog est allégée : la chronologie détaillée est déplacée dans un fichier séparé, le backlog principal ne garde que le pilotage courant et la synthèse anti-dette.

---

## 1er avril 2026 — Import NotebookLM et playground

Le bundle d'import TAÉ via NotebookLM évolue rapidement à travers 6 versions (v1.1.1 à v2.3.0) : ajout des connaissances verbatim, protocole de vérification obligatoire en 12 passes, instructions d'autonomie pour le LLM, double stratégie (bundle + normalisation côté app), gestion des erreurs fréquentes. Un module de validation côté serveur (`normalize-llm-aliases`, `validate-tache-import-vs-oi`) est créé pour fiabiliser les imports.

Le Fragment Playground (route dev `/dev/fragments`) est mis en place pour visualiser les composants React avec des mocks, avec 5 onglets (Wizard, Sommaire, Lecture, Thumbnail, Print) et navigation par OI/comportement.

La FAQ publique s'enrichit avec des entrées sur les opérations intellectuelles et le processus de création d'une tâche.

---

## 3–5 avril 2026 — Sprints OI3, OI4 et OI6

Le sprint 2 livre les perspectives (OI3) : templates consigne à 3 niveaux (modèle souple, structure, pur), accordéon séquentiel pour les perspectives groupées/séparées, identification de l'intrus, impression en 2-3 colonnes. Le composant `RadioCardGroup` est créé comme primitive universelle avec animation checkmark et navigation clavier.

Le sprint 3 enchaîne avec OI4 (cause/conséquence) et OI6 (changement/continuité), incluant la variante pure OI6.3 avec champ enjeu obligatoire, choix groupé/séparé, et accordéon séquentiel des moments historiques.

---

## 10 avril 2026 — Renderers de documents

Le système de rendu des documents est finalisé avec trois composants distincts selon le contexte : `DocumentCardThumbnail` (miniature banque avec badges et aperçu), `DocumentCardReader` (fiche lecture complète avec panneau métadonnées), et `DocumentCardPrint` (rendu pixel-perfect Letter US avec bandeau numéro noir et cadre bordure noire). Le composant print gère les colonnes pour les structures perspectives et deux temps.

Le panneau d'aperçu du wizard document reçoit un toggle Sommaire/Impression, et le branchement multi-éléments est effectué pour la fiche TAÉ et l'impression d'épreuve. La spec document-renderer est finalisée couvrant persistence, UX et tous les cas de structure.

---

## 11 avril 2026 — Refactoring fiche sommaire v2

La fiche sommaire v2 est livrée en plusieurs phases. Les primitives partagées (`IconBadge`, `MetaChip`, `ChipBar`, `SectionLabel`, `ContentBlock`, `DocCard`) sont créées dans `lib/fiche/primitives/` pour unifier le design system entre tâches et documents. La sanitisation HTML migre vers `isomorphic-dompurify` pour fonctionner côté serveur et client.

Le mode lecture est migré vers le nouveau système `FicheRenderer` avec des selectors dédiés. Le mode thumbnail permet l'affichage en vignettes sur les pages Mes tâches et Banque, remplaçant les listes textuelles par des grilles de cartes. Les documents dans la fiche sont enrichis de métadonnées (type de source, repère temporel, catégorie).

La grille d'évaluation est rendue inline (plus de modale), les placeholders `{{doc_A}}` sont résolus dans la consigne en mode lecture, et le champ amorce est supprimé (le HTML TipTap contient déjà l'amorce).

---

## 12 avril 2026 — Vue détaillée tâche v1

La vue détaillée tâche (`TacheVueDetaillee`) est livrée en 8 phases et remplace `FicheLecture` sur la route `/questions/[id]`. Le layout à 3 zones (barre d'actions sticky, flux principal gauche, rail sticky droite) structure la page. 15 selectors atomiques alimentent les 5 sections du flux (Hero, Documents, Guidage, Corrigé, Grille) et les métadonnées du rail.

La `FicheModale` est créée pour afficher un document en overlay depuis la vue tâche, avec focus trap et fetch de données via Server Action. Le responsive gère 3 breakpoints avec accordéon pour le rail en mobile. L'accessibilité inclut le focus automatique sur le titre, les zones tactiles 44px et les attributs ARIA sur les accordéons.

---

## 13 avril 2026 — Sécurité et quick wins

Un premier lot de sécurité sanitise tous les `dangerouslySetInnerHTML` non couverts (13 composants), remplace les `select("*")` par des sélections explicites, et ajoute des headers de sécurité (CSP, X-Frame-Options, nosniff). La checklist MVP est créée avec 37 items répartis en 10 lots.

Les quick wins incluent l'ajout de `revalidatePath` sur toutes les Server Actions de mutation, le support du mode `prefers-reduced-motion`, un lien skip-to-content pour l'accessibilité clavier, et l'optimisation des formats d'image (AVIF + WebP).

Un bug du wizard document deux temps est corrigé : le champ repère temporel manquant empêchait le déverrouillage de l'onglet Temps 2.

---

## 14 avril 2026 — Profil enseignant et collaborateurs

La normalisation du schéma profiles est effectuée avec 4 migrations SQL : tables référentielles CSS (72 centres de services) et écoles (602 écoles secondaires) seedées depuis les données du MEQ, remplacement de `full_name` par `first_name` + `last_name`, et remplacement de `school` (JSON texte) par `school_id` (FK vers la table écoles). Un composant `ComboboxField` avec recherche et filtrage insensible aux accents est créé pour la cascade CSS → École.

Le profil enseignant est livré avec mode propriétaire/visiteur : avatar avec initiales, badges rôle et expérience, copie du courriel, 3 onglets de contributions (Documents/Tâches/Épreuves avec pagination), et Side Sheets d'édition pour l'identité et les informations professionnelles. La suppression de compte respecte la Loi 25 via une RPC d'anonymisation.

La page collaborateurs est refontée avec recherche hybride (locale + serveur via AbortController), scroll infini par IntersectionObserver, et cartes enrichies. Un badge d'alerte rouge apparaît dans la sidebar quand le profil professionnel est incomplet.

Un lot de refactoring crée 6 nouvelles primitives UI (`IconButton`, `InlineAlert`, `ToggleChip`, `EmptyState`, `LoadMoreButton`) et normalise les tokens design system sur les composants existants.

Le CRUD manquant est complété : suppression de document (avec garde FK si référencé dans une tâche) et suppression d'épreuve (cascade automatique des liens tâche-épreuve).

Les loading states et error states sont ajoutés sur les 5 routes principales avec des composants Skeleton réutilisables et un `error.tsx` partagé avec bouton Réessayer.

---

## 15 avril 2026 — Print engine

Le print engine est construit en couches successives sur cette journée :

D3/D2/D1 posent les fondations : la transformation `epreuveVersPaginee` compose les pages par mode d'impression (formatif, sommatif standard, épreuve ministérielle) avec renumérotation globale des documents, résolution des placeholders, règles de visibilité et calcul d'empreinte FNV-1a. Le pager greedy first-fit 1D pagine les blocs avec mesure offscreen côté client. La route SSR `/apercu/[token]` vérifie la signature HMAC, fetch le payload depuis Vercel KV, et rend `ApercuImpression`.

Les tests visuels Playwright sont mis en place avec 3 payloads golden (rédactionnel simple, ordre chronologique, sommatif 3 tâches), 7 tests de structure et 3 tests de snapshot visuel.

Le carrousel PNG Embla est livré avec onglets par feuillet, navigation, flou CSS sur les slides inactives, bannière d'invalidation basée sur l'empreinte, et hook `useApercuPng` orchestrant le flux complet token → PNG → affichage → téléchargement PDF.

Le branchement wizard est effectué : un bouton flottant dans la colonne aperçu du wizard ouvre le carrousel PNG en plein écran avec le mode formatif.

L'architecture est étendue à la tâche seule et au document seul avec un type unifié `RenduImprimable` et des entry points dédiés, permettant au wizard TAÉ de construire directement un `DonneesTache` sans enveloppe épreuve.

Un fix corrige le stepper du wizard en édition (toutes les étapes apparaissent complétées) et le mode consigne pour les comportements de type pur (empêche l'écrasement de la consigne par le gabarit).

Le genre est ajouté au profil enseignant avec accord grammatical du label de rôle (Enseignant/Enseignante, Conseiller/Conseillère pédagogique).

La fonctionnalité de modification du mot de passe est livrée avec re-authentification, validation Zod et indicateur de force.

---

## 16 avril 2026 — Nettoyage

La colonne `documents.print_impression_scale` est supprimée (retirée de l'UI le 28 mars, migration DB différée). Le playground dev est supprimé dans le même lot car il cassait le build depuis le refactoring des renderers.

---

## 17 avril 2026 — Sécurité et robustesse

Deux lots de sécurité sont appliqués :

Le lot 3 met à jour les dépendances vulnérables (Next.js, DOMPurify, brace-expansion), ajoute `npm audit` dans la CI, sanitise les termes de recherche collaborateurs contre l'injection PostgREST, et migre le middleware vers la convention proxy de Next.js 16.

Le lot 4 remplace les comptages exacts par des estimations PostgreSQL sur la banque (réduction du coût des requêtes paginées), ajoute du rate limiting sur 4 endpoints sensibles (Puppeteer et recherche), et retire `unsafe-eval` de la CSP en production.

---

## État au 17 avril 2026

La plateforme couvre le cycle complet : création de documents historiques (textuels et iconographiques, simples ou multi-éléments), création de tâches d'évaluation (rédactionnelles pour 6 opérations intellectuelles, non rédactionnelles pour l'ordre chronologique, la ligne du temps et l'avant/après), composition d'épreuves par assemblage de tâches, et génération d'aperçus et de PDF via un pipeline Puppeteer avec route SSR unique.

L'infrastructure inclut la banque collaborative avec filtres et recherche, les profils enseignants avec contributions et gestion d'identité, un système de grilles d'évaluation ministérielles pixel-perfect, et une chaîne de sécurité (sanitisation, RLS, CSP, rate limiting, audit de dépendances).

Les vues détaillées des trois entités (Document, Tâche, Épreuve) sont en cours de refonte avec un layout partagé, des onglets Sommaire/Aperçu de l'imprimé, et une visionneuse plein écran pour la validation avant téléchargement PDF.
