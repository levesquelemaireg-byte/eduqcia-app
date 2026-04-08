# Audit du wizard de création de tâche vs `docs/specs/task-creation-wizard.md`

## À propos de ce document

**Date de l'audit** : 8 avril 2026

**Type de document** : Rapport d'audit ponctuel, daté. Ce n'est pas un document vivant à mettre à jour — il représente l'état du build par rapport à la spec à un instant donné.

**Méthodologie** : Audit automatisé via Claude Code, comparant le code du wizard de création de tâche au document de référence `docs/specs/task-creation-wizard.md` tel qu'il existait au 8 avril 2026. L'audit a porté sur le périmètre conceptuel et comportemental, pas sur les détails d'implémentation (noms de composants, structure de dossiers, styles CSS au pixel près).

**Utilisation recommandée** : Ce rapport sert à :

- Guider les prochaines phases de correction et de refactoring
- Servir de point de référence pour suivre la progression au fil des corrections
- Fournir un contexte initial lors de futures sessions de travail (avec Claude, Claude Code, ou tout autre collaborateur)
- Permettre une comparaison historique avec de futurs audits pour mesurer l'évolution du projet

Ce document ne doit pas être modifié après la date de l'audit, sauf pour des corrections purement typographiques. Les décisions prises en réponse à l'audit, ou les évolutions du build qui répondent aux écarts identifiés, doivent être consignées dans d'autres documents (notes de décision, changelog, ou mise à jour de la spec elle-même).

Pour voir l'état actuel du build, un nouvel audit devra être généré à une date ultérieure et placé dans le même dossier avec une date différente.

---

Spec : 534 lignes, lue intégralement. Code : tous les fichiers nommés dans la table de correspondance ont été inspectés (Bloc1 à Bloc7, résolveur Bloc5, registre de comportements, modèles d'aperçu, toolbar print, draft banners, FormState, StepperNavFooter, BanqueDocumentsStub, DocRef extension). Périmètre : wizard de création de tâche uniquement.

Table de correspondance confirmée par le code
Spec Code (entrée) Notes
Étape 1 — Signature Bloc1AuteursTache.tsx RadioCardGroup seul / equipe + CollaborateurSearchField.
Étape 2 — Paramètres pédagogiques Bloc2ParametresTache.tsx → Bloc2EditFields ou BlueprintLockedView Cascade niveau→discipline→OI→comportement, lock/unlock après sélection.
Étape 3 — Consigne et guidage Bloc3ConsigneProduction.tsx ou variantes via wizardBlocResolver (Bloc3ModeleSouple, Bloc3TemplateStructure, Bloc3TemplatePur) SectionConsigne + SectionGuidage.
Étape 4 — Documents Bloc4DocumentsHistoriques.tsx → DocumentSlotPanel ×N + variantes Perspectives/Moments Accordéon séquentiel.
Étape 5 — Corrigé et notes Bloc5.tsx (résolveur) → Bloc5Redactionnel / Bloc5Intrus / variantes NR Pas de file Bloc5Principal — c'est le résolveur lui-même qui sert de point d'entrée.
Étape 6 — Compétence disciplinaire Bloc5CompetenceDisciplinaire.tsx → MillerCdColumns ⚠ nom préfixé Bloc5 mais slice state.bloc6.cd — incohérence interne.
Étape 7 — Aspects + Connaissances Bloc7Indexation.tsx → SectionAspects + MillerConnaissancesHec/Hqc Importe SectionAspects depuis bloc3/ (pas mort, juste mal rangé).
Localisation Étape 5 confirmée : pas de composant parent Bloc5Principal ; le mapping step-meta index 4 résout via wizardBlocResolver qui inspecte d'abord WizardBlocConfig.bloc5 (si intrus → Bloc5Intrus), sinon délègue à BLOC5_DYNAMIC_BY_SLUG[slug] (registry.ts) qui choisit entre Bloc5Redactionnel et les variantes NR (Bloc5OrdreChronologique, Bloc5LigneDuTemps, Bloc5AvantApres, Bloc5TestScalability). Le composant bloc5/Bloc5.tsx duplique partiellement cette logique de résolution — flag à signaler en dette.

Section 2 — Modèle de données
✓ Conformités
§2.1 Document — propriétés visibles : type textuel/iconographique, titre, contenu, source, position de légende, source primaire/secondaire — tous présents dans les schémas et le wizard de slot (DocumentSlotPanel.tsx, DocumentSlotLegendBlock.tsx).
§2.1 Tâche — encapsulation : TaeFormState regroupe paramètres, slots de documents, consigne, guidage, corrigé, CD, aspects, connaissances, métadonnées auteurs (FormState.tsx).
§2.2 Référencement, pas inclusion : les slots Bloc 4 stockent des références ; BanqueDocumentsStub permet la réutilisation depuis la banque (BanqueDocumentsStub.tsx, DocumentSlotIdleChoices.tsx).
§2.3 Stockage TipTap structuré : la consigne est bien du HTML TipTap avec nœuds docRef, pas du texte brut (extensionDocRef.ts).
§2.4 Représentation contextuelle distincte : DocRefNodeView (chip teal en édition) ≠ resolveDocRefsForPreview qui aplatit en lettre dans l'aperçu print (DocRefNodeView.tsx, consigne-helpers.ts).
⚠ Écarts
E2.1 — RÉGRESSION majeure — Spec §2.3 : « Les nœuds documentReference pointent vers un identifiant de document ». Le code stocke letter: "A"|"B"|"C"|"D", pas un documentId UUID (extensionDocRef.ts:17-22). Conséquences :

La résolution contextuelle prévue §2.4 (lettre locale en tâche isolée → numéro global déduplicé en épreuve) est impossible : la lettre est figée dans le HTML stocké au moment de l'insertion.
Si l'enseignant réordonne les documents (spec §3.5 : « les chips de référence dans la consigne se mettent à jour automatiquement »), les références ne se mettent pas à jour parce qu'elles encodent une lettre, pas une cible.
Si le slot doc_A est dépeuplé et un autre document y est mis, l'ancienne référence pointe encore vers la lettre A mais n'a plus aucune cible vérifiable.
Fichiers concernés : components/tae/TaeForm/tiptap/extensionDocRef.ts, lib/tae/consigne-helpers.ts (helpers de résolution), components/tae/TaeForm/tiptap/DocRefNodeView.tsx.

E2.2 — AMBIGUÏTÉ — Spec §2.5 : « avant d'ouvrir le document en édition, le système détecte combien de tâches le référencent » + modale d'avertissement avec option Dupliquer pour créer une variante. Je n'ai pas trouvé cette modale dans BanqueDocumentsStub ni dans le wizard document. La spec décrit une UX éditrice de document (probablement hors wizard tâche), donc à clarifier : est-ce attendu dans le wizard de tâche ou dans le wizard document ? Si c'est dans le wizard document, c'est hors périmètre de cet audit.

✗ Absences
A2.1 — Schéma documentReference avec documentId UUID — devrait remplacer l'attribut letter dans extensionDocRef.ts. Cherché activement, confirmé absent.

Section 3 — Les 7 étapes du wizard
3.1 Principes transversaux
✓ Conformités
Stepper horizontal cliquable : Stepper → WizardStepper avec onCompletedStepClick (Stepper.tsx). Spec §3.1 ✓
Bouton Suivant bloqué tant que les champs requis ne sont pas remplis : nextDisabled calculé à partir d'une batterie de guards (StepperNavFooter.tsx:387 + wizard-publish-guards.ts, cd-step-guards.ts, connaissances-step-guards.ts).
Navigation libre vers étapes complétées : onCompletedStepClick borne au currentStep côté WizardStepper.
Bouton Enregistrer comme brouillon toujours actif : présent dans le footer si persistSessionDraft (StepperNavFooter.tsx:397-411).
Sauvegarde automatique en fond : useEffect débouncé 300 ms écrit sessionStorage[TAE_DRAFT_STORAGE_KEY] à chaque mutation du state (FormState.tsx:95-109).
Aperçu à droite toujours visible, mise à jour temps réel : FicheSommaireColumn lit state via useTaeForm, formStateToTae recalculé à chaque rendu (FicheSommaireColumn.tsx).
Pas de scroll vertical du panneau d'édition : conteneur du wizard xl:h-[calc(100dvh-3rem)] xl:overflow-hidden + colonne édition xl:overflow-y-auto (index.tsx:104-106). À noter : la spec dit « chaque étape tient dans la hauteur disponible » — la colonne édition scrolle quand même en interne sur xl, la spec est plus stricte que le build (voir AMBIGUÏTÉ).
⚠ Écarts
E3.1.1 — AMBIGUÏTÉ — Spec §3.1 : « Pas de scroll vertical dans le panneau d'édition : chaque étape tient dans la hauteur disponible ». Le build autorise un scroll interne (xl:overflow-y-auto sur la colonne édition). Soit la spec est trop stricte (il est probablement irréaliste de tenir Bloc 4 + Bloc 7 dans 100dvh sans scroll), soit le build a relâché la contrainte sciemment. À clarifier.

E3.1.2 — RÉGRESSION — Spec §5.3 : « Indicateur visible en permanence : "Brouillon · Sauvegardé il y a X sec." ». Pas trouvé dans le code. WizardDraftBanners affiche seulement deux bannières de reprise au montage si un brouillon préexiste — il n'y a aucun indicateur permanent qui rassure pendant l'édition. Cherché : grep Sauvegardé il y a, lastSavedAt, aucune occurrence. Fichier suggéré : à ajouter dans index.tsx ou en surcouche de StepperNavFooter.

3.2 Étape 1 — Signature
✓ Conformités
Toggle Seul / En équipe via RadioCardGroup (Bloc1AuteursTache.tsx:42-63).
Auteur = utilisateur courant en mode seul (résolu côté formStateToTae via previewMeta.authorFullName).
Recherche de co-auteurs depuis le répertoire (CollaborateurSearchField.tsx + useCollaborateurProfileSearch.ts).
Liste des co-auteurs avec bouton retirer (Bloc1AuteursTache.tsx:100-121).
Validation : aucune — isConceptionStepComplete accepte seul immédiatement.
⚠ Écarts
Aucun écart majeur identifié sur cette étape. La spec décrit une étape volontairement légère ; le build est aligné.

3.3 Étape 2 — Paramètres pédagogiques
✓ Conformités
Cascade stricte niveau → discipline → OI → comportement (Bloc2EditFields.tsx).
Sélection du comportement déclenche : attache outilEvaluation, fixe nbDocuments, nbLignes, génère documentSlots (Bloc2ParametresTache.tsx:81-93).
Grille préselectionnée affichée comme système non modifiable (BlueprintLockedView + grilleModalOpen).
Désactivation des champs en cascade (à confirmer dans Bloc2EditFields mais le pattern d'aide contextuelle existe via BLOC2_LOADING_PARAMETERS).
Validation : isBlueprintFieldsComplete && blueprintLocked requis (wizard-publish-guards.ts).
⚠ Écarts
E3.3.1 — AMBIGUÏTÉ — Spec §3.3 : « L'enseignant peut ajuster ces paramètres dérivés si la tâche réelle s'écarte légèrement du standard ». Le build verrouille nbDocuments, nbLignes et outilEvaluation après sélection (blueprintLocked) ; pour les modifier, il faut passer par confirmUnlock qui repart à zéro. La spec suggère un ajustement plus léger. Soit la spec est trop souple (le verrouillage protège l'intégrité MEQ), soit le build est trop rigide. À clarifier.

E3.3.2 — DETTE TECHNIQUE — Spec §3.3 désigne le champ comme « Niveau », mais le code limite déjà à sec3 côté wizard et bloque sec5 (Bloc2ParametresTache.tsx:60-65). La spec dit « 4e secondaire (probablement valeur unique) » — c'est compatible. Simple constat.

3.4 Étape 3 — Consigne et guidage
✓ Conformités
Champ consigne TipTap large (ConsigneTipTapEditor.tsx).
Préambule auto-généré : insertAmorceDocumentaire(editor, nbDocuments) injecté au montage si l'éditeur est vide, contenant des nœuds docRef pré-positionnés (ConsigneTipTapEditor.tsx + insertAmorce.ts).
Boutons d'insertion de chip dans la toolbar : un par slot, label « Document A »/« Document B », docInsertButtons passés via RichTextEditorShell → RichTextEditorToolbar (ConsigneTipTapEditor.tsx + RichTextEditorToolbar.tsx).
Chips visuellement distinctes : DocRefNodeView rend un badge teal avec icône article + lettre, atomique, supprimable d'une touche.
Champ guidage en italique sous la consigne (SectionGuidage.tsx).
Validation : consigne non vide bloquante, guidage optionnel (wizard-publish-guards.ts).
⚠ Écarts
E3.4.1 — RÉGRESSION — Spec §3.4 : « Toggle "Référencer explicitement les documents dans la consigne" (activé par défaut) — si désactivé, le préambule auto est retiré et l'enseignant rédige sa consigne sans guidage automatique de référence. ». Pas trouvé dans le code (grep Référencer explicitement, toggle.\*référence → 0 occurrence). Le build insère systématiquement le préambule au montage avec le bouton « Réinsérer l'amorce » comme seul levier ; il n'y a pas de toggle pour désactiver le pattern. Note : la spec §7.1 cite explicitement ce point comme « à valider contre le build existant », donc tu en es probablement déjà conscient.

E3.4.2 — RÉGRESSION — Spec §3.4 : « Panneau latéral "Modèles fréquents" (encart à droite ou en accordéon) — Propose 2 à 4 modèles de formulation pour la consigne, tirés d'une analyse de nombreuses épreuves existantes, filtrés par OI + comportement attendu ». Le build a un seul templateButton dans la toolbar, et il n'apparaît que pour les variantes OI3 perspectives via Bloc3ModeleSouple. Il n'y a aucun panneau latéral généralisable, ni 2-4 modèles, ni filtrage OI×comportement multi-templates. Ce qui existe (CONSIGNE_TEMPLATES dans consigne-templates.ts) n'expose qu'un seul template par clé.

E3.4.3 — INNOVATION — Le build ajoute une famille de templates de consigne structurés (gabarit OI3 perspectives, OI6 changement/continuité, OI7 liens de causalité) qui va au-delà du « modèle libre à insérer » prévu par la spec. Le pattern Bloc3TemplateStructure / Bloc3TemplatePur génère une consigne déterministe à partir de champs typés (perspectivesMode, contexte, enjeu, éléments). C'est plus riche que les « 2-4 modèles fréquents » et c'est probablement la bonne direction — à faire remonter dans la spec.

Fichiers : Bloc3ConsigneProduction.tsx, Bloc3ModeleSouple.tsx, Bloc3TemplateStructure.tsx, Bloc3TemplatePur.tsx, lib/tae/wizard-bloc-config.ts, lib/tae/consigne-templates.ts.

E3.4.4 — DETTE TECHNIQUE — Tu m'as déjà signalé SectionAspects et SectionCorrige comme « artefacts morts dans bloc3/ ». Vérification :

SectionCorrige (dans bloc3/) → vraiment mort, aucun import. Suppression OK.
SectionAspects (dans bloc3/) → utilisé activement par Bloc7Indexation.tsx:5. Pas mort, juste mal rangé. À déplacer dans bloc7/ ou shared/, pas à supprimer.
3.5 Étape 4 — Documents
✓ Conformités
Nombre de slots fixé par Bloc 2 (b.nbDocuments) (Bloc4DocumentsHistoriques.tsx:20-21).
Étiquettes locales A/B/C/D + état vide/rempli (DocumentSlotPanelHeader).
Sélectionner depuis la banque : DocumentSlotIdleChoices propose « Réutiliser depuis la banque » → ouvre BanqueDocumentsStub modal (DocumentSlotPanelModals.tsx, BanqueDocumentsStub.tsx).
Créer un nouveau document : DocumentSlotIdleChoices propose « Créer un nouveau document » → DocumentSlotCreateForm (création inline, pas en pile ; voir écart).
Validation : isDocumentsStepComplete requiert tous slots remplis (document-helpers.ts).
⚠ Écarts
E3.5.1 — RÉGRESSION — Spec §3.5 : « Réordonnancement possible par glisser-déposer ». Aucun système de drag-drop dans bloc4/. L'ordre des slots est fixé par documentSlots à la sélection du comportement et n'est pas réorganisable par l'utilisateur (grep drag, sortable, reorder → 0 occurrence). Conséquence directe : §3.5 « si l'enseignant réordonne les documents, les chips de référence dans la consigne se mettent à jour automatiquement » est vide de sens dans le build actuel.

Fichiers : Bloc4DocumentsHistoriques.tsx, DocumentSlotPanel.tsx.

E3.5.2 — RÉGRESSION — Spec §3.5 : « modale de recherche dans la banque de documents, avec filtres (type, période, source primaire/secondaire, tâches qui l'utilisent déjà), prévisualisation, et indication de l'empreinte du document dans l'écosystème ("Utilisé dans 12 autres tâches") ». BanqueDocumentsStub est un picker minimal — liste plate, pas de filtres, pas de prévisualisation, pas d'indicateur de réutilisation. Le nom même BanqueDocumentsStub confirme l'état provisoire. Fichier : BanqueDocumentsStub.tsx.

E3.5.3 — RÉGRESSION — Spec §3.5 : « Créer un nouveau document — lance le wizard de création de document en pile (ouvert par-dessus le wizard de tâche) ». Le build utilise DocumentSlotCreateForm, un formulaire inline dans le panneau du slot, pas un wizard complet en pile. Cela diverge d'un « wizard de création de document » unifié qui existe par ailleurs dans components/documents/wizard/AutonomousDocumentWizard.tsx. Le formulaire inline est probablement plus rapide pour l'enseignant mais pose deux problèmes : (a) le code de saisie de document est dupliqué entre le wizard standalone et le slot inline, (b) on ne peut pas profiter de toutes les étapes du wizard standalone (légende, repère temporel, etc.). À trancher : régression, ou choix UX assumé ?

E3.5.4 — RÉGRESSION — Spec §3.5 : « Avertissements "est-ce volontaire ?" (à la validation, non bloquants) : Si un document attaché n'a pas de titre / pas de source ». Aucun guard de ce type dans wizard-publish-guards.ts ni dans le handleNext de StepperNavFooter. Cherché : grep volontaire, sans titre, sans source → 0. Fichier suggéré : lib/tae/wizard-publish-guards.ts + nouveau composant modal.

3.6 Étape 5 — Corrigé et notes au correcteur
✓ Conformités
Champ corrigé texte riche (Bloc5Redactionnel.tsx:59-67).
Grille d'évaluation toujours visible dans l'aperçu (héritée de Bloc 2, affichée par PrintableFichePreview et FicheSommaireColumn).
Variantes par type de question résolues automatiquement (Bloc5.tsx → BLOC5_DYNAMIC_BY_SLUG).
Validation : corrigé non vide via wizard-publish-guards.ts.
⚠ Écarts
E3.6.1 — RÉGRESSION — Spec §3.6 : « Champ notes au correcteur : texte riche, contient les nuances, les cas particuliers à accepter, les pièges fréquents à reconnaître ». Le build n'a pas de champ notes au correcteur distinct du corrigé. Bloc5Redactionnel n'expose qu'un seul RichTextEditor pour state.bloc5.corrige. Cherché : grep notesCorrecteur, notes_au_correcteur, notes_correcteur → 0. Fichier : Bloc5Redactionnel.tsx, slice state.bloc5.

E3.6.2 — RÉGRESSION — Spec §3.6 : « Panneau latéral "Modèles fréquents" : même principe qu'à l'étape 3, propose des modèles de corrigé ». Pas implémenté. Même cause que E3.4.2.

E3.6.3 — DETTE TECHNIQUE — Confirmation que bloc5/Bloc5.tsx est un résolveur qui duplique partiellement la logique de wizardBlocResolver.tsx pour l'étape 5 (vérification WizardBlocConfig.bloc5 puis fallback BLOC5_DYNAMIC_BY_SLUG). Deux résolveurs en parallèle pour la même étape. À unifier.

E3.6.4 — INNOVATION — Le build a une famille non-redactionnel/ (Bloc5OrdreChronologique, Bloc5LigneDuTemps, Bloc5AvantApres) qui implémente des étapes 5 spécialisées par type de comportement. La spec ne prévoit pas explicitement ces variantes (elle imagine un seul champ corrigé universel). C'est un acquis du build à faire remonter dans la spec, sous réserve que les comportements NR soient bien dans le périmètre du wizard de création de tâche.

3.7 Étape 6 — Compétence disciplinaire
✓ Conformités
Miller columns : MillerCdColumns (Bloc5CompetenceDisciplinaire.tsx:75-86).
Source de données JSON statique : cdDataUrlForDiscipline charge hec-cd.json ou hqc-cd.json depuis public/data/.
Validation : isCdStepGateOk vérifie qu'une sélection existe (cd-step-guards.ts).
⚠ Écarts
E3.7.1 — DETTE TECHNIQUE — Le composant s'appelle Bloc5CompetenceDisciplinaire mais la slice est state.bloc6.cd (cf. ligne 78 : state.bloc6.cd.selection). Confusion de numérotation interne au build : le préfixe du nom de fichier reste Bloc5 (ancienne numérotation à 6 blocs), la slice est passée à bloc6 (nouvelle numérotation à 7 étapes). Renommage attendu : Bloc6CompetenceDisciplinaire. Aucune incidence fonctionnelle.

E3.7.2 — AMBIGUÏTÉ — Spec §3.7 : « Sélection unique ou multiple selon le modèle (à valider avec le build) ». Le build : sélection unique (SET_CD_SELECTION remplace, pas d'ajout) ; un seul triplet competenceId/composanteId/critereId. Spec §7.1 cite ce point comme à valider — réponse confirmée : c'est unique.

3.8 Étape 7 — Aspects de société et connaissances associées
✓ Conformités
Aspects de société : SectionAspects (importé depuis bloc3/) — toggles multi (Bloc7Indexation.tsx:192-196).
Connaissances : MillerConnaissancesHec ou MillerConnaissancesHqc selon discipline (Bloc7Indexation.tsx:152-178).
Source JSON statique (connDataUrlForDiscipline).
Bouton « Réinitialiser » pour les connaissances.
⚠ Écarts
E3.8.1 — AMBIGUÏTÉ — Spec §3.8 : « Présentation côte à côte ou en onglets internes selon l'espace disponible ». Le build empile verticalement (Aspects au-dessus, Connaissances en dessous séparées par border-t). Pas de variante côte-à-côte ni onglets. Spec ouverte (« selon l'espace »), à confirmer comme décision UX.

E3.8.2 — RÉGRESSION — Spec §3.8 : « Validation pour passer à l'étape suivante : au moins un aspect de société et une connaissance associée sélectionnés (à confirmer). ». Le guard isConnaissancesStepGateOk vérifie connaissances.length > 0 mais je n'ai pas vu de vérification sur les aspects (à confirmer dans connaissances-step-guards.ts). Note : la spec marque elle-même ce point « à confirmer », donc soit un soit l'autre est acceptable.

E3.8.3 — DETTE TECHNIQUE — Le nom Bloc7Indexation ne reflète pas le contenu « aspects + connaissances ». À renommer en Bloc7AspectsConnaissances (ou similaire) — clarté de nommage uniquement, fonctionnel OK.

E3.8.4 — DETTE TECHNIQUE — SectionAspects vit dans bloc3/ mais est consommé uniquement par Bloc7Indexation. À déplacer dans bloc7/ (à créer).

E3.8.5 — DETTE TECHNIQUE — Le dossier bloc6/ contient MillerConnaissances\*.tsx alors que les connaissances sont à l'étape 7. C'est aussi un reliquat de l'ancienne numérotation à 6 blocs. À renommer en bloc7/ (ou consolider avec les aspects).

✗ Absences
A3.8.1 — Bouton final « Terminer » / « Enregistrer dans la banque » à la fin de l'étape 7. Spec §3.8 : « le bouton Suivant devient "Terminer" ou "Enregistrer dans la banque" ». Le build affiche WIZARD_PUBLISH_CTA (« Publier ») dans StepperNavFooter mais c'est un bouton séparé du bouton Suivant, présent en permanence (StepperNavFooter.tsx:415-420). Le bouton « Suivant » n'est jamais transformé en « Terminer » à la dernière étape. C'est plutôt une AMBIGUÏTÉ : un bouton publier permanent peut être un meilleur design (visible dès qu'éligible) ; à trancher avec toi.

Section 4 — Aperçu et rendu
✓ Conformités
§4.1 : aperçu à droite du wizard, mise à jour temps réel — FicheSommaireColumn recalcule formStateToTae à chaque mutation du state.
§4.2 : sous-onglets dossier documentaire / questionnaire — TaePrintFeuilletToggle avec role="tablist" (TaePrintFeuilletToggle.tsx).
§4.4 : page Letter, marges 2 cm, contenu nu — défini dans printable-fiche-preview.module.css + print-page-css.ts (@page { size: letter; margin: 2cm; }).
§4.4 : grille bicolonne avec largeur automatique selon densité → shouldPrintDocumentFullWidth (print-document-full-width.ts) classe « simple » (auto-fit) ou « double » (documentCellFull) selon longueur de texte / présence de table / taille de listes.
§4.4 : encadrement document avec label « Document N » + titre + contenu + source — PrintableDocumentCell (PrintableFichePreview.tsx:68-142).
§4.4 : légende en surimposition coin de l'image — DocumentImageLegendOverlay rendu sur la figure.
§4.5 : ordre vertical du questionnaire — consigne → guidage (conditionnel) → lignes de réponse → grille — respecté dans PrintableFicheQuestionnaireSection.
⚠ Écarts
E4.1 — RÉGRESSION — Spec §4.1 : « Onglet Aperçu sommaire — vue structurée par sections. Onglet Aperçu imprimé — rendu pixel-perfect du format papier ». Dans le build, ce n'est pas un système d'onglets dans une seule colonne d'aperçu. Le sommaire (FicheSommaireColumn) vit en permanence dans la colonne droite ; l'aperçu imprimé est dans une modale plein écran séparée ouverte via WizardPreviewToolbar (bouton flottant print ouvre PrintPreviewModal). L'enseignant ne peut pas basculer entre les deux dans la colonne droite — il passe d'une vue à un overlay temporaire. Fichiers : WizardPreviewToolbar.tsx, PrintPreviewModal.tsx.

À classer comme RÉGRESSION ou INNOVATION ? La modale est sans doute plus agréable pour vérifier la mise en page A4 (pas de compression), mais on perd la cohabitation continue des deux vues. À trancher.

E4.2 — RÉGRESSION — Spec §4.3 : « Toggle Formatif / Sommatif — présent uniquement dans le sous-onglet Questionnaire. Bascule vers Sommatif masque le guidage en temps réel. ». Pas trouvé. La donnée showGuidageOnStudentSheet existe dans TaeFicheData et est consommée par shouldShowGuidageOnStudentSheet mais aucun composant UI ne la modifie. Le toggle Formatif/Sommatif n'est exposé nulle part dans le wizard ni dans la modale d'aperçu impression. Cherché : grep Formatif, Sommatif, showGuidageOnStudentSheet= (assignation) → seul le PASSAGE en lecture est trouvé, pas d'écriture par l'utilisateur. Fichier suggéré : à ajouter dans TaePrintFeuilletToggle.tsx (à étendre) ou nouveau composant dans preview/.

E4.3 — RÉGRESSION — Spec §4.4 : « Si les documents débordent, le système signale le problème en temps réel : "Le dossier documentaire dépasse une page. Réduisez le nombre de documents…" ». Pas implémenté. Aucun calcul de débordement actif (grep dépasse, overflow.\*page, isOverflow → 0 occurrence pertinente). Le CSS commente même « Limite UA : si le bloc dépasse une page entière, fragmentation ou débordement possible » (printable-fiche-preview.module.css) — donc le débordement existe mais n'est pas signalé.

E4.4 — INNOVATION — shouldPrintDocumentFullWidth (print-document-full-width.ts) implémente une heuristique riche pour décider la largeur d'un document textuel (longueur en caractères, présence de table, nombre de <li>) — alors que la spec §4.4 dit « Texte : toujours largeur simple ». Le build est plus intelligent que la spec : un long texte avec <table> ou beaucoup de <li> prend toute la largeur. À faire remonter dans la spec.

E4.5 — AMBIGUÏTÉ — Spec §4.4 : « Image : si largeur native ≤ 315 px, largeur simple ; sinon largeur double ». shouldPrintDocumentFullWidth retourne toujours false pour les iconographiques (print-document-full-width.ts:23-25). Donc toutes les images sont en largeur simple, peu importe leur taille native. C'est une divergence claire mais je la classe en ambiguïté car la spec mentionne un seuil exact (315 px) qui n'est pas trivial à mesurer côté CSS sans connaître la résolution native — il manque peut-être une décision pratique qui n'a pas été notée. Pour moi c'est une RÉGRESSION en réalité.

✗ Absences
A4.1 — Indicateur de débordement « dossier > 1 page » (E4.3 ci-dessus). Suggéré : nouveau hook useFicheOverflow dans lib/tae/preview/.

A4.2 — Toggle Formatif/Sommatif (E4.2 ci-dessus).

A4.3 — Onglet inline « Aperçu sommaire / Aperçu imprimé » dans la colonne droite (E4.1 ci-dessus).

Section 5 — Architecture technique
✓ Conformités
§5.1 Rendu unique : PrintableFicheFromTaeData est utilisé à la fois dans PrintPreviewModal (aperçu écran) et la route /questions/[id]/print (impression). Pas de double-rendereur. CSS print appliqué via print-page-css.ts injecté par la modale.
§5.2 Layout engine isolé : shouldPrintDocumentFullWidth est une fonction pure dans lib/tae/, réutilisable par tout consommateur. La spec décrit « algorithme glouton et local » — le code est encore plus simple (un booléen par document), ce qui convient.
§5.3 Sauvegarde automatique en fond : useEffect débouncé 300 ms (FormState.tsx:95-109).
§5.3 Brouillon explicite : saveWizardDraftAction côté serveur via bouton « Sauvegarder le brouillon » (StepperNavFooter.tsx:399-411).
§5.4 Taxonomie JSON statique : public/data/{oi.json,grilles-evaluation.json,hec-cd.json,hqc-cd.json,hec-sec1-2.json,hqc-sec3-4.json,css.json} — exactement ce que prévoit la spec.
⚠ Écarts
E5.1 — RÉGRESSION — Spec §5.1 : « Génération PDF : moteur Chromium headless (Puppeteer ou équivalent) qui rend exactement le même HTML/CSS en PDF ». Le bouton « Télécharger le PDF » est désactivé dans PrintPreviewModal (PrintPreviewModal.tsx:104-115 — disabled + WIZARD_PRINT_PREVIEW_COPY.downloadPdfHint). Seule l'impression navigateur (window.print()) est offerte. Pas de pipeline Puppeteer.

E5.2 — RÉGRESSION — Spec §5.3 : « Indicateur visible en permanence : "Brouillon · Sauvegardé il y a X sec." ». Cf. E3.1.2.

E5.3 — AMBIGUÏTÉ — Spec §5.3 décrit deux mécanismes coexistants. Le build a sessionStorage (auto local) et saveWizardDraftAction (brouillon serveur), donc OK. Mais la sauvegarde automatique ne touche que le sessionStorage, pas le serveur. Donc si l'enseignant ferme l'onglet sans cliquer « Sauvegarder le brouillon », il perd tout ce qui n'est pas sur cet appareil. La spec ne dit pas explicitement que l'auto doit aller au serveur, mais c'est l'esprit (« assurance contre la perte de travail »). À clarifier.

Section 6 — Comportements transversaux
✓ Conformités
§6.1 Cascade de verrouillage : implémentée dans Bloc 2 (cf. §3.3 conformités).
§6.4 Sauvegarde et brouillons : deux mécanismes distincts présents (auto + bouton).
⚠ Écarts
E6.1 — RÉGRESSION — Spec §6.2 : « Avertissements "est-ce volontaire ?" — apparaît sous forme de modale légère avec deux options. Cas actuellement identifiés : Document sans titre, Document sans source. » — cf. E3.5.4. Pas de mécanisme de modale d'avertissement non bloquant dans le pipeline handleNext.

E6.2 — RÉGRESSION — Spec §6.3 : « Modèles fréquents issus d'analyse — Présentés avec autorité tranquille, sans système de notation, filtrés par OI + comportement attendu, 2 à 4 modèles par étape, pas plus » — cf. E3.4.2 et E3.6.2.

Section « Code mort suspect » à confirmer
Je n'ai pas audité ces éléments — à toi de trancher s'ils sont vraiment morts :

components/tae/TaeForm/bloc3/SectionCorrige.tsx — aucun import dans le code, fonctionnalité similaire à Bloc5Redactionnel. Confirmé mort par grep.
components/tae/TaeForm/bloc5/non-redactionnel/Bloc5TestScalability.tsx + entrée test-scalability dans BLOC5_DYNAMIC_BY_SLUG — nom évoque un test ou expérimentation. À vérifier si encore utilisé en production.
components/tae/TaeForm/bloc5/non-redactionnel/Bloc5Default.tsx — fallback BLOC5_COMPORTEMENT_INCONNU, ne devrait plus jamais s'afficher si tous les comportements sont mappés. À vérifier.
Le commentaire // Ajouter ici pour OI7 dans consigne-templates.ts:23 suggère un TODO non fait — OI7 utilise déjà un gabarit champ-par-champ via Bloc3TemplatePur, pas une clé de template, donc ce TODO est obsolète.
Doublon bloc5/Bloc5.tsx ↔ wizardBlocResolver.tsx — deux résolveurs en parallèle pour la même étape (cf. E3.6.3). L'un des deux est probablement à supprimer.
Slice state.bloc6.cd + bloc6/Miller*.tsx — la numérotation interne 6 ↔ noms de fichiers Bloc5* / Bloc7\* est incohérente. Possible reliquat d'une migration partielle de 6 → 7 étapes.
Synthèse
Compteurs
Catégorie Total
✓ Conformités 27
⚠ Écarts 23 dont 12 RÉGRESSION, 3 INNOVATION, 6 AMBIGUÏTÉ, 7 DETTE TECHNIQUE (les colonnes ne s'additionnent pas, certains écarts cumulent plusieurs sous-catégories)
✗ Absences franches 5
Top 3 critique à traiter en priorité
E2.1 — Modèle de stockage des références documentaires : letter au lieu de documentId. C'est le seul écart qui empêche structurellement de réaliser la spec §2.4 (résolution contextuelle local↔épreuve) et §3.5 (mise à jour automatique au réordonnancement). Tout le reste est rattrapable, celui-ci est foundationnel et touchera le schéma de la consigne stockée — donc à régler avant d'avoir trop de tâches en base.

E3.5.1 + E3.5.2 — Étape 4 est en deçà de la spec : pas de drag-and-drop, pas de filtres dans le picker banque, pas d'indicateur de réutilisation, picker nommé Stub. Cette étape est le pivot de la valeur du produit (réutilisation des documents = banque collaborative) et le build est encore au stade prototype. Les utilisateurs vont sentir la différence très vite.

E4.2 + E3.1.2 — Toggle Formatif/Sommatif et indicateur de sauvegarde permanent : deux signaux UX que la spec décrit comme rassurants pour l'enseignant. Leur absence donne une sensation de produit incomplet alors que les fonctionnalités existent côté données (showGuidageOnStudentSheet, sauvegarde silencieuse) — il manque juste l'exposition UI.

Recommandation globale
Le build est globalement aligné sur la spec, mais en retard sur trois axes structurels et en avance sur un axe créatif.

En retard structurel : modèle de référencement documentaire (E2.1), maturité du picker banque (E3.5.2), workflows d'avertissement non-bloquants (E3.5.4, E6.1). Ces points correspondent à des fonctionnalités de fiabilité et de réutilisation qui sont au cœur de la valeur d'un outil d'item banking.

En retard d'exposition UX : toggles Formatif/Sommatif (E4.2), indicateur permanent de sauvegarde (E3.1.2), basculement Sommaire/Imprimé inline (E4.1), réordonnancement Bloc 4 (E3.5.1). Ces points sont relativement peu coûteux à livrer car les données sous-jacentes existent déjà.

En avance créative : variantes structurées Bloc 3 (E3.4.3 — Bloc3TemplatePur, Bloc3TemplateStructure), variantes NR Bloc 5 (E3.6.4), heuristique riche pour la largeur des documents textuels (E4.4). Ces innovations devraient être documentées dans la spec et pas perdues dans l'implémentation.

Dette technique notable mais isolée : la numérotation bloc5/bloc6/bloc7 du code n'est plus cohérente avec les 7 étapes de la spec (Bloc5CompetenceDisciplinaire = étape 6, Bloc7Indexation = étape 7, dossier bloc6/ contient des Miller pour étape 7). Renommage à planifier en un seul lot pour éviter les renommages partiels successifs.

Les artefacts morts signalés dans le bloc 3 sont en partie réels (SectionCorrige) et en partie faussement étiquetés (SectionAspects est encore utilisé par Bloc 7). Une passe de tri rapide suffit.

Effort estimé pour ramener le build à la spec : les 3 priorités du top 3 demandent du travail produit non trivial (refacto schéma, picker banque mature, exposition UX). Les autres écarts sont en majorité des oublis d'exposition UI ou de la dette technique. Aucun des écarts identifiés ne remet en cause l'architecture générale du wizard — le squelette à 7 étapes, le stepper, l'aperçu temps réel, le rendu unifié print/écran sont tous solides et conformes à la philosophie de la spec.
