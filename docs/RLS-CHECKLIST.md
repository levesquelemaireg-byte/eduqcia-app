# Checklist RLS — exécution F3 / A3

Procédure **manuelle** pour valider le **palier A3** et **F3** ([BACKLOG.md](./BACKLOG.md#41-fondations-sans-quoi-la-prod-casse), [ARCHITECTURE.md](./ARCHITECTURE.md#checklist-rls-manuelle)). Les politiques sont dans `supabase/schema.sql` (**ROW LEVEL SECURITY**).

## À quoi ça sert — et quand

Ce n’est **pas** une liste à cocher « toute de suite » : chaque scénario n’a de **sens produit** que lorsque le **parcours UI** existe.

- **Maintenant (utile)** : scénarios **1–2** (+ suppression TAÉ) — ils protègent les **brouillons** (cœur création). C’est le minimum **avant** d’ouvrir la banque ou les **épreuves** au public.
- **Après la banque collaborative** ([BACKLOG.md](./BACKLOG.md) §4.4 **B1**, [DECISIONS.md](./DECISIONS.md) — banque avant épreuves complètes) : scénarios **5–7** (favoris, notifications, votes) deviennent **pertinents** ; les tester **avant** la banque n’apporte guère — noter **N/A** sans culpabilité.
- **Après le module épreuve / composition** (**E1**) : scénarios **3–4** — **parcours livré** (`/evaluations/new`, `/evaluations/[id]/edit`, liste `/evaluations`) ; à exécuter dès que deux comptes actifs sont disponibles.

**F3 / A3** : documenter les passes au fil de l’eau ; une passe **1–2 OK** reste **valide** pour le périmètre brouillons. Pas besoin de « tout valider » avant la prochaine grosse feature.

## Périmètre par livraison (référence)

| Bloc                       | Scénarios                | Quand l’exécuter                                                                                                 |
| -------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **TAÉ + wizard**           | 1, 2 (+ suppression TAÉ) | Dès deux comptes ; Mes tâches / fiche / wizard disponibles.                                                      |
| **Banque / communauté**    | 5, 6, 7                  | **Après** UI banque (et flux fiche / dashboard associés) — pas avant.                                            |
| **Épreuves (composition)** | 3, 4                     | **Dès maintenant** (composition livrée — [WORKFLOWS.md](./WORKFLOWS.md#création--édition-dépreuve-composition)). |

## Prérequis

| Élément       | Détail                                                                                                                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environnement | **Staging ou prod** (ou local branché sur un projet Supabase **réel** avec RLS actives — pas une base sans RLS).                                                                          |
| Comptes       | **Deux enseignants** distincts, statut **actif** (`profiles.status = 'active'`), rôle **`enseignant`** (ex. second compte : `npm run seed:teacher-b` — voir `scripts/seed-teacher-b.ts`). |
| Matériel      | Deux sessions séparées : navigateur A + navigateur B (ou fenêtre privée), chacun connecté à un compte.                                                                                    |
| Données       | Compte **A** : au moins une TAÉ **non publiée** (brouillon) et une **publiée**. Pour **3–4** : une **épreuve brouillon** créée par **A** via `/evaluations/new` (ou équivalent).          |

## Comment noter le résultat

Pour chaque scénario : **OK** (comportement conforme), **KO** (fuite ou accès indu — noter l’URL / l’action), **N/A** (parcours UI absent — ex. module composition d’épreuve non livré : **pas** une défaillance RLS ; à rejouer quand le parcours existe).

## Scénarios (7)

### 1 — TAÉ non publiée : pas de fuite entre auteurs

**Politique visée :** `tae_select` sur `tae` — brouillon visible seulement par auteur, collaborateur, admin / conseiller pédagogique.

**Étapes**

1. Connecté en **A**, repérer l’UUID d’une TAÉ **non publiée** (liste Mes tâches → filtre Brouillons, ou URL `/questions/[id]`).
2. Connecté en **B**, ouvrir `/questions` : la tâche de A **ne doit pas** apparaître (y compris après rafraîchissement).
3. Toujours en **B**, accéder directement à `/questions/<uuid_brouillon_A>`.

**Attendu**

- Pas de contenu sensible de la tâche de A (page erreur / not found / message métier équivalent).
- Aucune liste ou API exposant le brouillon d’un autre enseignant.

---

### 2 — Brouillon wizard (`tae_wizard_drafts`) : isolation stricte

**Politique visée :** `tae_wizard_drafts_*_own` — `user_id = auth.uid()`.

**Étapes**

1. **A** : sur `/questions/new`, saisir des données visibles (ex. consigne distinctive), cliquer **Sauvegarder le brouillon** si disponible, attendre la confirmation.
2. **B** : ouvrir `/questions/new` (ou recharger le wizard) : le contenu ne doit **pas** reprendre le brouillon de A.
3. **B** : vérifier Mes tâches / dashboard : rien ne doit révéler le JSON ou l’état du brouillon serveur de A.

**Attendu**

- Chaque utilisateur ne voit **que** son propre enregistrement dans `tae_wizard_drafts` (comportement observable via l’app).

---

### 3 — Épreuve non publiée : auteur seul

**Politique visée :** `eval_select` sur `evaluations`.

**Étapes**

1. **A** : créer une épreuve **brouillon** sur `/evaluations/new` (**Enregistrer le brouillon**), ou en repérer une dans **Mes épreuves** ; noter l’URL `/evaluations/<id>/edit`.
2. **B** : ouvrir `/evaluations` (**Mes épreuves**) ; l’épreuve brouillon de **A** ne doit **pas** y figurer.
3. **B** : ouvrir `/evaluations/<id>/edit` avec l’UUID de l’épreuve de **A** (barre d’adresse).

**Attendu**

- **B** ne lit pas le titre ni le détail de l’épreuve brouillon de **A** (page erreur / vide / redirection login ou message métier — **pas** de fuite du contenu).

---

### 4 — Liaisons `evaluation_tae` : écriture réservée à l’auteur de l’épreuve

**Politique visée :** `eval_tae_write` — écriture si `evaluations.auteur_id = auth.uid()` (ou admin). La sauvegarde applicative passe par la RPC `save_evaluation_composition` (**SECURITY DEFINER**), qui refuse toute épreuve dont l’auteur n’est pas l’utilisateur courant.

**Étapes**

1. **A** : sur `/evaluations/<id>/edit`, composer l’épreuve avec au moins une TAÉ (**Publier** ou **Enregistrer le brouillon** selon le cas).
2. **B** : connecté en parallèle, tenter d’ouvrir `/evaluations/<id>/edit` pour la **même** épreuve : l’UI ne doit **pas** permettre de modifier la composition de **A** (cf. scénario 3). Si un contournement outil (requête manuelle) existait, le serveur refuserait — le test prioritaire reste **l’app**.

**Attendu**

- **B** ne peut pas modifier la composition de l’épreuve de **A** (RLS + garde-fous RPC).

---

### 5 — Favoris : strictement privés

**Politique visée :** `favoris_own` — `user_id = auth.uid()`.

> **Banque / fiche publique :** à traiter en priorité **après** [BACKLOG.md](./BACKLOG.md) §4.4 **B1**. Sans parcours favori : **N/A**.

**Étapes**

1. **A** : ajouter une TAÉ publiée aux favoris (ou action équivalente dans l’UI).
2. **B** : consulter le dashboard / zone favoris : les compteurs ou listes ne doivent **pas** refléter les favoris de **A**.

**Attendu**

- Aucune lecture croisée des favoris entre **A** et **B**.

---

### 6 — Notifications : strictement propres

**Politique visée :** `notif_own` — `user_id = auth.uid()`.

> Souvent pertinent **après** banque + dashboard ; sinon **N/A**.

**Étapes**

1. Déclencher côté **A** un événement qui crée une notification (si disponible), ou vérifier le compteur non lu.
2. **B** : le compteur / la liste de **B** ne doit **pas** afficher les notifications de **A**.

**Attendu**

- Pas de fuite de notifications entre utilisateurs.

---

### 7 — Votes : droit conditionnel (`auth_can_vote`)

**Politique visée :** `votes_insert` avec `auth_can_vote(tae_id)` — usage enregistré (`tae_usages`) et pas auteur de la TAÉ.

> **Après** banque / fiche avec votes — voir [FEATURES.md](./FEATURES.md) §8. Sans UI : **N/A**.

**Étapes**

1. **A** : TAÉ **publiée** (idéalement d’A ou d’un tiers, selon le scénario métier à tester).
2. **B** (non auteur) : sans avoir « déverrouillé » la TAÉ (favori, ajout à une épreuve, téléchargement PDF selon [FEATURES.md](./FEATURES.md) §8), tenter de voter si l’UI l’offre.
3. **B** : après une action de déverrouillage permise par le produit, le vote peut être autorisé — vérifier cohérence avec la spec.

**Attendu**

- **B** ne peut pas voter sans satisfaire les conditions métier ; pas de contournement évident côté client seul.

---

## Scénario complémentaire (recommandé) — Suppression TAÉ

**Politique visée :** `tae_delete` — auteur (ou admin) seulement.

**Étapes**

1. **B** tente **Supprimer** une tâche dont **A** est auteur (via UI ou absence du bouton).

**Attendu**

- **B** ne peut pas supprimer la TAÉ de **A**.

---

## Fiche de passage

| #   | Scénario                  | Résultat (OK / KO / N/A) | Notes (date, environnement, capture si KO)                                                                                  |
| --- | ------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | TAÉ brouillon             |                          |                                                                                                                             |
| 2   | Brouillon wizard          |                          |                                                                                                                             |
| 3   | Évaluation brouillon      | OK                       | 27 mars 2026 — local ; brouillon A absent liste B ; lien `/evaluations/[id]/edit` → `not-found` coquille (message + liens). |
| 4   | `evaluation_tae` écriture | OK                       | 27 mars 2026 — même URL en B après composition A (TAÉ + enregistrement) ; pas d’éditeur, pas de fuite.                      |
| 5   | Favoris                   |                          |                                                                                                                             |
| 6   | Notifications             |                          |                                                                                                                             |
| 7   | Votes                     |                          |                                                                                                                             |
| +   | Suppression TAÉ (auteur)  |                          |                                                                                                                             |

**Suivi enregistré (27 mars 2026) :** **3–4 = OK** (deux comptes enseignants, `/evaluations/*`). **1–2** : inchangé selon passe antérieure (noter OK si rejoué). **5–7** : **N/A** ou partiel selon exposition favoris / notifications / votes — à rejouer après §4.4 B1 si besoin ; **+** : si Supprimer exposé pour la TAÉ de A.

**Environnement testé :** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*** **Date :** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

**Comptes :** A = \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*** B = \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

**Signature / revue :** \***\*\*\*\*\***\_\_\_\_\***\*\*\*\*\***

---

## Après exécution

1. **Passe partielle :** documenter (OK / **N/A** avec raison : « avant banque », « avant E1 », etc.) et mettre à jour [BACKLOG.md](./BACKLOG.md) — **F3** / **A3** **partiel** + **§ Historique**.
2. **Vagues suivantes :** après **banque** → rejouer **5–7** si l’UI le permet ; **3–4** : **OK** documenté (fiche ci-dessus, 27 mars 2026).
3. **F3 / A3 « fait »** : uniquement si tous les scénarios **testables** sont **OK** pour l’env cible (ou **N/A** acceptés explicitement par le PO).
4. Si **KO** : ouvrir un ticket / issue avec le numéro de scénario, captures, et extrait de politique dans `schema.sql` concernée ; ne pas marquer F3 comme clos.

## Références

- [ARCHITECTURE.md](./ARCHITECTURE.md#schéma-base-de-données) — schéma et RPC
- [BACKLOG.md](./BACKLOG.md#31-palier-a--vérité-commune-et-périmètre-de-confiance-bloquant) — palier A3
- `supabase/schema.sql` — définitions `CREATE POLICY`, helpers `auth_can_edit_tae`, `auth_can_vote`, etc.
