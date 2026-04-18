Audit de l’application ÉduQc.IA

1. Résumé exécutif
   Critique 1 : pipeline impression avec rendu HTML non sanitizé dans les blocs questionnaire et corrigé, exposant à du XSS sur des contenus utilisateurs dans la sortie imprimable (quadruplet.tsx:47, quadruplet.tsx:60, corrige.tsx:40, epreuve-vers-paginee.ts:71).
   Critique 2 : robustesse impression fragile, car la pagination repose encore sur une hauteur fictive fixe à 200 px, combinée à des conteneurs en overflow hidden, ce qui peut tronquer le rendu réel (app/(apercu)/apercu/[token]/page.tsx, route.ts:39, use-apercu-png.ts:45, section-page.tsx:61).
   Critique 3 : bug de pagination banque documents (filtre iconographique) avec total faux et fenêtre de résultats limitée à un sous-ensemble, bloquant la navigation au-delà de certaines pages (bank-documents.ts:186, bank-documents.ts:200, bank-documents.ts:201).
   Critique 4 : vulnérabilités supply chain détectées sur dépendances de production (Next.js DoS high, DOMPurify moderate) et version Next.js actuellement dans la plage vulnérable (package.json:51).
   Critique 5 : redirection ouverte potentielle dans le callback auth via paramètre next non normalisé côté serveur (route.ts:8, route.ts:43).
2. Analyse détaillée
   Architecture
   Important : duplication de logique impression entre couche historique transformation épreuve et nouvelle couche builders, augmentant le risque de divergence fonctionnelle (epreuve-vers-paginee.ts, blocs-tache.ts).
   Important : frontière serveur/client incomplète autour du client service role, sans garde explicite server-only dans le module central (admin.ts:8).
   Important : warning de compatibilité Next.js sur convention middleware déjà visible au build, risque de dette de migration proche (middleware.ts).
   Amélioration : plusieurs fichiers très volumineux sur des chemins critiques (réducteur wizard, payloads NR, UI copy), ce qui ralentit la maintenance et les revues.
   Code
   Important : qualité de branche non “green” sur pipeline locale complète. Le format check échoue (10 fichiers), ce qui stoppe le ci local avant lint/test/build.
   Important : lint sans erreurs bloquantes mais avec warnings non traités, signe de dette active (ex. variables inutilisées dans index.tsx:57, ProfileEditSheet.tsx:62, flux-lecture.tsx:15).
   Important : couverture de tests orientée unitaires techniques, mais trous sur modules sensibles (banque docs paginée, callback auth, route collaborateurs). La config ne couvre que les fichiers \*.test.ts et exclut les e2e du runner Vitest (vitest.config.ts:13, vitest.config.ts:14).
   Amélioration : présence de zones provisoires et TODO dans des composants produit déjà exposés (ex. bank-evaluations.ts:50).
   Performance
   Important : usage de count exact sur listes banque à chaque requête, coûteux à mesure que le volume grossit (bank-tasks.ts:198, bank-evaluations.ts:70).
   Important : génération de token aperçu épreuve avec chargement séquentiel des tâches (boucle await), augmentant la latence pour les épreuves riches (evaluation-apercu.ts:70, evaluation-apercu.ts:71).
   Important : recherche collaborateurs fait plusieurs requêtes volumineuses non agrégées (comptages calculés en mémoire), ce qui monte vite avec la base (route.ts:39).
   Amélioration : route register force dynamic et charge toutes les écoles à chaque hit, sans cache applicatif (app/(auth)/register/page.tsx/register/page.tsx#L4), app/(auth)/register/page.tsx/register/page.tsx#L7), css-schools.ts:53).
   Scalabilité
   Critique : pagination documents filtrés icono non scalable (fenêtre fixe + total local partiel), cassant la navigation réelle à grand volume (bank-documents.ts:186).
   Important : route collaborateurs ignore offset alors que le client l’envoie, provoquant doublons et mauvais comportement de scroll infini (CollaborateursClient.tsx:88, route.ts:39).
   Important : endpoints impression coûteux (PNG/PDF Puppeteer) sans stratégie de rate limiting applicatif.
   Amélioration : manque de cache partagé pour référentiels et calculs de listes les plus consultés (banque, collaborateurs, register).
   Sécurité
   Critique : sinks HTML non sanitizés dans impression épreuve et vue document (source), vecteur XSS si contenu malveillant persiste en base (quadruplet.tsx:47, corrige.tsx:40, contenu.tsx:76).
   Critique : open redirect potentiel sur callback auth via next non borné (route.ts:43).
   Important : CSP permissive en production avec unsafe-inline et unsafe-eval, ce qui réduit fortement l’efficacité XSS (next.config.ts:46).
   Important : route recherche collaborateurs interpole le terme utilisateur dans la clause or sans sanitation dédiée de ce chemin API (route.ts:32).
   Important : modèle de confidentialité très ouvert entre utilisateurs actifs (policy de lecture profiles globale + affichage email), à valider vis-à-vis principe de minimisation (schema.sql:769, CollaborateurCard.tsx:78).
   Critique : audit dépendances remonte 2 vulnérabilités prod (Next.js high, DOMPurify moderate).
   UX / Produit
   Critique : banque documents peut afficher moins de résultats que la réalité et bloquer la progression utilisateur sur filtres iconographiques (bank-documents.ts:201).
   Important : scroll infini collaborateurs incohérent (duplication potentielle, progression trompeuse) à cause du mismatch client/API (CollaborateursClient.tsx:88, route.ts:39).
   Important : échec téléchargement PDF silencieux côté hook, sans feedback utilisateur (use-apercu-png.ts:204).
   Amélioration : certains filtres évaluations restent provisoires, ce qui crée une expérience incomplète sur la banque (bank-evaluations.ts:50).
   Données
   Point fort : schéma SQL mature avec RLS étendue et indexation solide sur tables clés (schema.sql).
   Important : stockage de dimensions de filtre iconographique dans JSON elements oblige un filtrage applicatif partiel en banque, source du bug de pagination et limite de scalabilité (bank-documents.ts:178).
   Important : forte dépendance à service role pour des lectures fonctionnelles courantes, augmentant le rayon d’impact d’une erreur logique (DashboardContent.tsx:22, dashboard.ts:22).
   Impression (si applicable)
   Critique : pagination calculée sur hauteur fictive 200 px et rendu final clipé en overflow hidden, risque direct de contenu manquant en PDF/PNG (app/(apercu)/apercu/[token]/page.tsx, section-page.tsx:48).
   Critique : rendu HTML non sanitizé dans les sections questionnaire/corrigé du moteur impression (quadruplet.tsx:47, corrige.tsx:40).
   Important : pipeline d’impression multiple (route apercu, route print question, route print document) avec risque de divergence de comportement/rendu.
   Important : API PDF ne valide pas le token avant de lancer Puppeteer, ce qui laisse une surface de consommation CPU inutile en cas de token invalide (route.ts:43).
   DevOps
   Point fort : workflow CI clair sur format, lint, tests, build (ci.yml:39, ci.yml:48).
   Important : état actuel non “ci pass” local à cause de Prettier, ce qui masque des régressions potentielles plus loin dans la chaîne.
   Important : build OK mais warning de dépréciation middleware à traiter à court terme.
   Critique : aucune étape de sécurité dépendances dans CI alors que audit npm signale déjà des vulnérabilités de prod.
   Amélioration : absence de monitoring d’erreurs/perf en production (alerting, traces, SLO).
3. Plan d’action priorisé
   Critique
   Corriger immédiatement les sinks HTML impression : appliquer sanitization stricte côté transformation (consigne, guidage, corrigé), et uniformiser avec le helper central.
   Remplacer la mesure placeholder 200 par une vraie mesure de bloc avant pagination (offscreen ou équivalent), puis enlever tout clipping destructif.
   Réparer la pagination banque documents filtrés icono : requête paginée correcte en base, total exact global, plus de slicing local trompeur.
   Normaliser et borner strictement next dans le callback auth aux chemins internes seulement.
   Mettre à jour Next.js et DOMPurify vers versions corrigées, puis ajouter une barrière audit dépendances dans CI.
   Important
   Réparer la route collaborateurs search pour supporter offset/limit cohérents avec le client, et migrer les compteurs vers agrégats SQL.
   Ajouter rate limiting sur endpoints impression et recherche collaborateurs.
   Renforcer la CSP (réduction progressive de unsafe-inline/unsafe-eval via nonce/stratégie compatible App Router).
   Ajouter garde server-only sur modules service role et modules Node sensibles.
   Ajouter tests ciblés : auth callback (open redirect), banque documents (filtres+pagination), collaborateurs (load more), impression (non-troncature, parité preview/output).
   Améliorations
   Réduire la dette architecture impression en convergeant vers un seul pipeline métier.
   Introduire caching intelligent pour référentiels peu volatils (CSS/écoles, filtres banque).
   Réduire la taille des gros fichiers critiques (reducers et payload builders) avec extraction fonctionnelle.
   Ajouter observabilité prod (erreurs, latence endpoints impression, saturation Puppeteer).
4. Quick wins
   Appliquer sanitize sur 4 points de rendu HTML prioritaires et sécuriser le callback next en une itération courte.
   Implémenter offset côté route collaborateurs (paramètre déjà envoyé par le client).
   Corriger le total icono banque documents sans refonte complète en premier patch.
   Afficher un message utilisateur en cas d’échec téléchargement PDF au lieu d’un catch silencieux.
   Ajouter une étape npm audit dans le workflow CI pour éviter la régression supply chain.
5. Risque d’échec
   Si je devais parier que cette app échoue dans 12 mois, ce serait moins à cause de la richesse fonctionnelle que d’une combinaison de dette “qualité opérationnelle” : fiabilité d’impression insuffisante sur un produit où l’output imprimé est central, bugs de pagination/recherche qui érodent la confiance enseignant, et exposition sécurité encore trop permissive pour une plateforme collaborative.

Le scénario d’échec probable est progressif :

perte de crédibilité métier (documents incomplets en sortie, résultats banque incohérents),
hausse du coût de support (bugs intermittents difficiles à reproduire),
ralentissement des livraisons (architecture dupliquée + gros fichiers + qualité non green),
puis blocage à l’échelle (latence endpoints lourds, incidents sécurité/dépendances).
La bonne nouvelle est que ce risque est réversible : le socle SQL/RLS est solide, les tests unitaires sont nombreux, et une séquence de remédiation de 4 à 8 semaines peut remettre le produit sur une trajectoire robuste.
