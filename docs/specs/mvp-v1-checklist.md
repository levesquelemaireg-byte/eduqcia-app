# Checklist MVP v1 — ÉduQc.IA

**Créé le :** 13 avril 2026
**Source :** `docs/specs/mvp-v1-audit-completude.md`
**Usage :** cocher `[x]` au fur et à mesure des livraisons. Un item coché = code mergé + fonctionnel.

### Règles concernant l'implémentation des lots

Avant le lancement de l'implémentation de chaque nouveau lot :

1. Lire `EDUQCIA-APP/CLAUDE.md`
2. Respecter à la lettre les règles qui s'y trouvent pour implémenter le lot

Après chaque lot complété, Claude doit **obligatoirement** :

1. **Commit** les changements avec un message descriptif (`fix(security): ...`, `feat(ux): ...`, etc.)
2. **Push** vers le remote
3. **Documenter** la livraison :
   - Mettre à jour le tableau d'avancement en bas de ce fichier
   - Ajouter une ligne en tête de `docs/BACKLOG-HISTORY.md`
   - Mettre à jour `docs/BACKLOG.md` §2 si un domaine change de statut

Un lot n'est **pas terminé** tant que ces 3 étapes ne sont pas faites.

---

## Lot 1 — Sécurité (bloquant prod)

- [x] **SEC-1** Appliquer `sanitize()` (DOMPurify) sur tous les `dangerouslySetInnerHTML` non couverts + sanitiser `sourceCitationDisplayHtml()` à la source
- [x] **SEC-2** Remplacer les 8 `select("*")` par des sélections explicites (documents ×4, tae ×2, vote_counts ×1, + type `hydrateRendererDocument` resserré)
- [x] **SEC-3** Ajouter les headers CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy + Permissions-Policy dans `next.config.ts`

## Lot 2 — Quick wins (< 1h chacun)

- [x] **QW-1** Ajouter `revalidatePath` après `publishTaeAction` (C10)
- [x] **QW-2** Ajouter `revalidatePath` sur les actions manquantes (`tae-draft`, actions document)
- [x] **QW-3** `prefers-reduced-motion` dans `globals.css`
- [x] **QW-4** Skip-to-content link
- [x] **QW-5** Configurer `formats: ['image/avif']` dans `next.config.ts`

## Lot 3 — Loading / Error states

- [ ] **LE-1** `loading.tsx` pour les routes principales (`dashboard`, `questions`, `documents`, `evaluations`, `bank`)
- [ ] **LE-2** `error.tsx` pour les mêmes routes
- [ ] **LE-3** Créer 2-3 composants Skeleton dans `components/ui/`
- [ ] **LE-4** Ajouter `<Suspense>` boundaries sur dashboard + banque

## Lot 4 — CRUD manquant

- [ ] **CRUD-1** Supprimer un document (C5) — action + guard FK `tae_documents` + bouton + modale
- [ ] **CRUD-2** Supprimer une épreuve (C21) — action + cascade `evaluation_tae` + bouton + modale

## Lot 5 — Gestion du compte

- [ ] **AUTH-1** Modifier son mot de passe (A4) — route/modale + action + schéma Zod + composant
- [ ] **AUTH-2** Afficher son profil (A5) — query + composant de rendu (mutualisé avec D9)
- [ ] **AUTH-3** Modifier son profil (A6) — route + action + schéma + formulaire (CSS/école/niveaux)
- [ ] **AUTH-4** Profil public enseignant (D9) — mutualisé avec A5

## Lot 6 — Finitions parcours création

- [ ] **CRE-1** Sélecteurs niveau/discipline dans le wizard épreuve (C17)
- [ ] **CRE-2** Filtres épreuves dans la banque — niveau, discipline (D3)
- [ ] **CRE-3** Filtre par auteur dans la banque (D4)
- [ ] **CRE-4** Page de lecture épreuve read-only (D5 partiel)

## Lot 7 — Dashboard

- [ ] **DASH-1** Enrichir widgets avec dernières créations (B2)
- [ ] **DASH-2** Widget « Brouillons en cours » avec liens directs (B4)

## Lot 8 — Favoris / Épinglage

- [ ] **FAV-1** Action `toggle-favoris.ts` (insert/delete)
- [ ] **FAV-2** Query `get-user-favorites.ts`
- [ ] **FAV-3** Câbler le bouton épingler dans la fiche tâche (D6)
- [ ] **FAV-4** Widget dashboard « Mes favoris » avec liste (B3)

## Lot 9 — Export PDF (livrable classe)

- [ ] **PDF-1** Installer `puppeteer-core` + `@sparticuz/chromium-min` (E1)
- [ ] **PDF-2** Route API `/api/evaluations/[id]/pdf` (E1)
- [ ] **PDF-3** Bouton « Télécharger PDF » dans l'UI épreuve (E4)
- [ ] **PDF-4** Template print « corrigé enseignant » (E2)
- [ ] **PDF-5** Template print « formatif un feuillet » (E2, coupe possible)
- [ ] **PDF-6** Validation impression fidèle sur 2-3 imprimantes (E5)

## Lot 10 — Tests d'intégration

- [ ] **TEST-1** Tests intégration `publishTaeAction`
- [ ] **TEST-2** Tests intégration `saveWizardDraftAction`
- [ ] **TEST-3** Tests intégration `publishEpreuveAction`

---

## Résumé d'avancement

| Lot                    | Items  | Faits | %       |
| ---------------------- | ------ | ----- | ------- |
| 1 — Sécurité           | 3      | 3     | 100%    |
| 2 — Quick wins         | 5      | 5     | 100%    |
| 3 — Loading/Error      | 4      | 0     | 0%      |
| 4 — CRUD manquant      | 2      | 0     | 0%      |
| 5 — Compte             | 4      | 0     | 0%      |
| 6 — Finitions création | 4      | 0     | 0%      |
| 7 — Dashboard          | 2      | 0     | 0%      |
| 8 — Favoris            | 4      | 0     | 0%      |
| 9 — Export PDF         | 6      | 0     | 0%      |
| 10 — Tests             | 3      | 0     | 0%      |
| **Total**              | **37** | **8** | **22%** |

---

## Notes

- Les lots sont ordonnés par priorité recommandée (sécurité d'abord, PDF en dernier)
- Les items marqués « coupe possible » dans `mvp-v1.md` : PDF-5 (formatif), D4 (filtre auteur), D6/FAV (épinglage), D9/AUTH-4 (profil public)
- Référence détaillée par item : `docs/specs/mvp-v1-audit-completude.md`
