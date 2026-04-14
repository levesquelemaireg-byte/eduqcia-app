# Page Profil + Répertoire Collaborateurs — Spec UX finale (v5.1)

**Projet :** ÉduQc.IA — Application pour enseignants Québec
**Scope :** `/profile/[id]` (vue propriétaire + vue publique) + refonte `/collaborateurs`
**Date :** Avril 2026
**Statut :** **FERMÉE** — Phase 1 (§21 items 1-30) livrée le 14 avril 2026. Phase 2 (liens auteur banque/docs/épreuves, tri « plus utilisées ») reportée. Phase 3 (filtres collaborateurs, optimistic UI, cursor pagination) reportée V2/V3. Spec issue de 7 passes de revue + 6 itérations de proto interactif.
**Design language :** Patterns M3 (Material Design 3) adaptés en Tailwind — pas de librairie tierce.

**Terminologie :** Trois catégories de contenus créés ou recherchés : **Tâches**, **Documents**, **Épreuves**. Le terme « TAÉ » n'est plus utilisé dans l'UI ni dans la spec — uniquement dans le code legacy/SQL où il subsiste pour compatibilité.

---

## Sommaire

1. Positionnement
2. État actuel (observations)
3. Patterns M3 retenus
4. Routing et modes
5. Architecture de la page Profil
6. Helper de pluralisation (règle universelle)
7. Données et migration SQL
8. Avatar (composant unifié)
9. Édition par Side Sheet
10. Vue publique
11. Section Contributions
12. Refonte `/collaborateurs`
13. Badge notification sidebar
14. Cas limites et états d'erreur
15. Accessibilité (WCAG 2.2 AA volontaire)
16. Responsive
17. Sécurité, RLS et gestion des comptes
18. Navigation et intégration
19. Server Actions, queries, contrats TypeScript et performance
20. Composants à créer
21. Priorisation MVP
22. Décisions tranchées (récap)
23. Dépendances externes (Loi 25)
24. Tests et critères d'acceptation
25. Reportés en V2/V3
26. Refusés définitivement
27. Annexe : reviewers consultés

---

## 1. Positionnement : ce que le profil N'EST PAS

**Ce n'est pas un réseau social.** Pas de bio libre, pas de hobbies, pas de photo de chat. Les utilisateurs sont des enseignants vérifiés (`@*.gouv.qc.ca`) qui utilisent un outil de travail. Le profil n'est pas un espace d'expression personnelle — c'est une **carte de visite professionnelle** + un **portfolio de contributions**.

**Ce n'est pas le Dashboard.** Le dashboard = "mon travail en cours" (brouillons, tâches récentes, notifications). Le profil = "qui je suis dans cette communauté et ce que j'ai partagé". Un enseignant consulte son dashboard 10× par jour ; il visite un profil occasionnellement avec une intention précise.

**Ce n'est pas une page de paramètres.** Les settings techniques (mot de passe, notifications, thème) n'ont rien à faire ici. Le profil est une **vitrine**, pas un panneau de contrôle.

---

## 2. Observations sur l'état actuel

### 2.1 `/collaborateurs` actuel

- Titre + sous-titre compteur (à conserver)
- Une carte par enseignant : initiales teal couleur accent du projet, nom, courriel, école + CSS + niveau
- Compteur "X tâches publiées" à droite
- **Cartes inertes** — pas de lien
- Sous-utilisation de l'espace
- Courriel visible — à conserver

### 2.2 `/profile/[id]` actuel

- Placeholder : titre, UUID brut, "Vue publique enseignant — à venir"
- On part de zéro

### 2.3 Sidebar et patterns visuels

- Structure : Navigation → Mes contenus → Création → Communauté → Système
- "Profil" sous Système (déjà cliquable)
- Dark sidebar, contenu sur fond clair, cartes outlined arrondies, typo sobre

---

## 3. Patterns M3 retenus (adaptés en Tailwind)

### 3.1 Chips (Assist/Filter Chip)

Pour les chips simples (sans icône). **Les niveaux, disciplines et expérience utilisent le composant `MetaPill` existant** — voir §3.7.

- Hauteur : 32px (`h-8`)
- Padding horizontal : 16px (`px-4`)
- Border-radius : 8px (`rounded-lg`)
- Typo : 14px medium
- Défaut : `bg-slate-100 text-slate-700 border border-slate-200`
- Hover : `bg-slate-200`
- Focus-visible : `ring-2 ring-offset-2 ring-teal-500`

### 3.2 Tabs (Primary Tabs)

**Usage :** onglets Documents / Tâches / Épreuves dans la section Contributions.

- Indicateur actif : ligne 3px en bas, teal app
- Texte actif : `text-teal-600 font-semibold`
- Texte inactif : `text-slate-500 font-medium`
- Touch target : 48px de hauteur minimum
- **Compteur intégré au label avec pluriel dynamique** : format `Documents (8)` / `Tâches (12)` / `Épreuves (3)`. Au singulier : `Document (1)` / `Tâche (1)` / `Épreuve (1)`. Voir §6.
- Attributs ARIA : `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` + `id` systématiques

### 3.3 Card (Outlined Card)

- `border border-slate-200 rounded-xl bg-white p-4`
- Hover : `hover:border-slate-300 hover:shadow-sm transition-all duration-150`
- Focus-visible : `ring-2 ring-teal-500 ring-offset-2`
- Si cliquable : tout le card est un `<Link>`

### 3.4 Side Sheet

- Largeur desktop : 400px
- Slide depuis la droite : `transition-transform duration-300 ease-out`
- Overlay : `bg-black/40 backdrop-blur-sm`
- Header sticky avec titre + bouton fermer
- Footer sticky avec boutons : **Annuler à gauche (text button) + Enregistrer à droite (filled button primary)** — ordre M3
- **Focus initial sur le premier champ** à l'ouverture
- Mobile (< 768px) : plein écran, header avec flèche retour, footer stack vertical (Enregistrer en bas, pouce friendly)

### 3.5 Icon Button

- 40×40px, icône 20px
- `bg-transparent hover:bg-slate-100 rounded-full`
- `aria-label` contextuel obligatoire
- Focus-visible : ring teal

### 3.6 Text Button (M3 standard)

- Fond transparent, texte `text-teal-600`
- Hover : `bg-teal-50`
- Focus-visible : ring teal
- Utilisé pour : "Voir plus", "Compléter" (état vide infos pro), liens de chaînage Side Sheet

### 3.7 MetaPill (composant existant à réutiliser)

**Usage :** affichage des niveaux, disciplines et expérience sur le profil et dans le Side Sheet d'édition. **Aussi utilisé sur les cartes collaborateurs (§12.3) pour la cohérence visuelle.**

L'application dispose déjà d'un composant `MetaPill` qui combine icône dédiée + texte dans une pill arrondie. Pour le profil et les collaborateurs, on réutilise ce composant **tel quel** :

- **Niveau** : `MetaPill` avec icône "graduation" / chapeau diplômé (couleur dédiée niveau, ramp bleu/indigo)
- **Discipline** : `MetaPill` avec icône "open book" / livre ouvert (couleur dédiée discipline, ramp ambre)
- **Expérience** : `MetaPill` avec icône "clock" / horloge (couleur dédiée expérience, ramp vert)

Le développeur n'a rien à recoder visuellement — il branche simplement le composant existant avec les bonnes données. **Pas de chips génériques pour ces 3 champs.**

### 3.8 Empty State

- Icône outline sobre
- Texte principal 16px medium, secondaire 14px regular `text-slate-500`
- CTA optionnel pour le propriétaire (text button)
- Centré

---

## 4. Routing et modes

### 4.1 Une seule route : `/profile/[id]`

- Si `id === currentUser.id` → **mode propriétaire** (lecture + édition)
- Si `id !== currentUser.id` → **mode visiteur** (lecture seule)

Pas de `/profile/me` ni `/profile/edit` séparé. Une seule URL, deux rendus conditionnels.

### 4.2 Mode propriétaire — principe "preview-first"

L'enseignant voit son profil **tel qu'il apparaît aux autres**, avec des affordances d'édition discrètes (icon buttons crayon par section). La vue par défaut EST la vue publique.

### 4.3 Mode visiteur

Vue lecture seule, sans crayons. Le visiteur arrive depuis `/collaborateurs`, depuis une fiche tâche/document/épreuve, ou depuis la banque collaborative.

---

## 5. Architecture de la page Profil

### 5.1 Page scrollable simple, sans navigation intra-profil

**Pas d'anchor nav, pas de navigation sticky, pas de scroll spy.** Décision tranchée à la suite du proto interactif : les onglets de la section Contributions catégorisent déjà les contenus par type (Documents / Tâches / Épreuves), donc une barre de navigation supplémentaire au-dessus serait redondante.

Au MVP avec 0 à ~30 contributions par profil, le scroll est court et naturel. Si plus tard les profils deviennent très chargés (50+ contributions par type), on pourra envisager de rendre les onglets de la section Contributions sticky au scroll — mais ce n'est pas nécessaire au lancement.

**Conséquences techniques :** pas de composant `AnchorNav` à créer, pas de `IntersectionObserver` pour scroll spy, pas de `rootMargin: -40%`, pas de désactivation de spy pendant scroll programmatique, pas de `scroll-margin-top` sur sections cibles, pas de gestion mobile snap horizontal. Simplification majeure héritée de la décision proto.

### 5.2 Sections (ordre vertical)

```
┌─────────────────────────────────────────────────────┐
│  HERO CARD                                          │
│  ┌──────┐                                           │
│  │  GL  │  Gabriel Lemaire                    [✏️]  │
│  └──────┘  [Enseignant] · Contributeur actif        │
│            CSS de Laval · École secondaire X         │
│            glemaire@csslaval.gouv.qc.ca  [📋]       │
│            Membre depuis 2024                       │
├─────────────────────────────────────────────────────┤
│  INFORMATIONS PROFESSIONNELLES                [✏️]  │
│  Niveau enseigné : [🎓 Sec. 3] [🎓 Sec. 4]         │
│  Discipline enseignée : [📖 Histoire] [📖 Géo.]     │
│  Expérience : [⏱ 12 années d'expérience]            │
├─────────────────────────────────────────────────────┤
│  CONTRIBUTIONS PUBLIÉES                             │
│  ┌──────────────┬──────────────┬──────────────┐     │
│  │ Documents (8)│ Tâches (12)  │ Épreuves (3) │     │
│  └──────────────┴──────────────┴──────────────┘     │
│  ┌─────────────────────────────────────┐            │
│  │  Carte document 1                  │            │
│  ├─────────────────────────────────────┤            │
│  │  Carte document 2                  │            │
│  └─────────────────────────────────────┘            │
│  [Voir plus]                                        │
└─────────────────────────────────────────────────────┘
```

### 5.3 Justification de l'ordre des sections

**Hero → Infos pro → Contributions** (et pas l'inverse). Les infos pro **contextualisent** la lecture des contributions. Lire une tâche d'un enseignant en sachant qu'il enseigne en sec. 4 depuis 12 ans donne un poids différent que de la lire à froid.

### 5.4 Justification de l'ordre des onglets Contributions

**Documents → Tâches → Épreuves** (du plus simple au plus complexe pédagogiquement). Un document est une ressource atomique, une tâche utilise un ou plusieurs documents, et une épreuve agrège plusieurs tâches. L'ordre reflète la **hiérarchie de composition** : ressource → activité → évaluation.

**Onglet par défaut au chargement : Documents.**

### 5.5 Détails par section

**Hero card.** Initiales dans un cercle (teal sur fond gris pâle). Nom complet en `h1`. **Badge rôle** (Assist Chip M3) — `Enseignant` / `Conseiller pédagogique` / `Administrateur`. **Indicateur d'expérience neutre** à côté du badge rôle, calculé automatiquement côté serveur :

- `0 contributions publiées` → "Nouveau membre"
- `1–9 contributions` → pas d'étiquette (état neutre)
- `10–49 contributions` → "Contributeur actif"
- `50+ contributions` → "Contributeur expérimenté"

Le badge expérience a un `aria-label` enrichi : `"Contributeur actif — basé sur 24 contributions publiées"`.

École parsée depuis `profiles.school`. **Courriel visible** + petit icon button "Copier" (mode propriétaire ET visiteur) — toast `role="status" aria-live="polite"` "Courriel copié" au clic, disparition après 4 secondes. "Membre depuis [année]" en `text-slate-500 text-sm` discret.

**Informations professionnelles.** Section avec ordre fixe : **Niveau enseigné → Discipline enseignée → Expérience**. Chaque champ utilise le composant `MetaPill` existant avec son icône dédiée.

Le label de chaque sous-section est **dynamique au pluriel** :

- 0 ou 1 niveau : "Niveau enseigné"
- 2+ niveaux : "Niveaux enseignés"
- 0 ou 1 discipline : "Discipline enseignée"
- 2+ disciplines : "Disciplines enseignées"
- "Expérience" reste invariable

**Si vide en mode propriétaire** : section affichée avec **micro-copy spécifique par champ** :

- Niveau enseigné : "Non renseigné — précisez vos niveaux pour faciliter la collaboration."
- Discipline enseignée : "Non renseigné — ajoutez vos disciplines pour mieux contextualiser vos contenus."
- Expérience : "Non renseigné — indiquez vos années d'expérience pour situer votre parcours."

**Si vide en mode visiteur** : chaque sous-section vide est masquée individuellement. Pas de skeleton intermédiaire (évite tout layout shift).

**Important :** ces 3 champs **ne sont jamais demandés à l'inscription**. L'inscription ne capture que `full_name`, `email`, `role`, `school`. Les niveaux, disciplines et années d'expérience sont saisis **après** l'inscription via le Side Sheet d'édition. Cela signifie qu'un nouveau membre démarre toujours avec ces 3 champs vides, et c'est le badge notification sidebar (§13) qui lui rappelle de les remplir.

**Contributions.** Trois onglets M3 dès le MVP dans l'ordre Documents → Tâches → Épreuves. Chaque onglet une liste de cartes outlined avec **signal d'utilité "Utilisée X fois"** sur les Tâches uniquement (depuis `tae_usages`). État vide adapté au mode + CTA contextuel selon l'onglet actif.

---

## 6. Helper de pluralisation (règle universelle)

Tous les libellés numériques de l'app suivent une règle de pluralisation française unique implémentée dans un helper partagé.

### 6.1 Règle

```ts
function pluralize(count: number, singular: string, plural: string): string {
  return count <= 1 ? singular : plural;
}
```

**Convention française :** `0` et `1` prennent le **singulier**, `2+` prend le **pluriel**.

### 6.2 Exemples d'usage dans l'app

| Contexte                  | 0 ou 1                             | 2+                                     |
| ------------------------- | ---------------------------------- | -------------------------------------- |
| Onglets contributions     | `Document (1)`                     | `Documents (8)`                        |
| Onglets contributions     | `Tâche (1)`                        | `Tâches (12)`                          |
| Onglets contributions     | `Épreuve (1)`                      | `Épreuves (3)`                         |
| Section infos pro         | `Niveau enseigné`                  | `Niveaux enseignés`                    |
| Section infos pro         | `Discipline enseignée`             | `Disciplines enseignées`               |
| Expérience                | `1 année d'expérience`             | `12 années d'expérience`               |
| Tâches utilisées          | `Utilisée 1 fois`                  | `Utilisée 24 fois`                     |
| Carte épreuve (nb tâches) | `1 tâche`                          | `5 tâches`                             |
| Bouton "Voir plus"        | `1 restant(e)`                     | `9 restant(e)s`                        |
| Cartes collaborateurs     | `1 document · 1 tâche · 1 épreuve` | `8 documents · 12 tâches · 3 épreuves` |

### 6.3 Genre grammatical

Le helper accepte les deux formes (singulier et pluriel) en arguments, donc il gère naturellement le genre :

- Masculin : `pluralize(n, 'restant', 'restants')`
- Féminin : `pluralize(n, 'restante', 'restantes')`

### 6.4 Emplacement du helper

`lib/utils/pluralize.ts` — exporté pour usage dans tous les composants UI.

---

## 7. Données et migration SQL

### 7.1 Colonnes `profiles` existantes (à conserver)

| Colonne      | Usage profil                                                                    |
| ------------ | ------------------------------------------------------------------------------- |
| `id`         | UUID, clé de route                                                              |
| `full_name`  | Affiché dans le hero (obligatoire à l'inscription, garantit prénom + nom)       |
| `email`      | Affiché sur le profil (obligatoire à l'inscription, communauté fermée vérifiée) |
| `role`       | Badge dans le hero                                                              |
| `school`     | JSON existant (CSS + école), obligatoire à l'inscription                        |
| `created_at` | "Membre depuis [année]"                                                         |

### 7.2 Migration SQL — Phase 1

**Extension trigram (prérequis) :**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Colonnes scalaires sur profiles :**

```sql
ALTER TABLE profiles
  ADD COLUMN years_experience smallint NULL,
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN school_search_text text GENERATED ALWAYS AS (
    coalesce(school->>'css','') || ' ' || coalesce(school->>'ecole','')
  ) STORED;
```

**Tables pivot pour les référentiels** (au lieu de `text[]` — meilleure intégrité, pas de dette technique, recherche SQL native, pattern diff-friendly) :

```sql
CREATE TABLE profile_disciplines (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  discipline_slug text REFERENCES disciplines(slug) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, discipline_slug)
);

CREATE TABLE profile_niveaux (
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  niveau_slug text REFERENCES niveaux(slug) ON DELETE CASCADE,
  PRIMARY KEY (profile_id, niveau_slug)
);
```

**Indexes :**

```sql
CREATE INDEX idx_profiles_full_name_lower ON profiles (lower(full_name));
CREATE INDEX idx_profiles_school_search ON profiles USING gin (school_search_text gin_trgm_ops);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_tae_auteur_published ON tae(auteur_id, is_published, created_at DESC);
CREATE INDEX idx_documents_auteur_published ON documents(auteur_id, is_published, created_at DESC);
CREATE INDEX idx_evaluations_auteur_published ON evaluations(auteur_id, is_published, created_at DESC);
CREATE INDEX idx_profile_disciplines_profile ON profile_disciplines(profile_id);
CREATE INDEX idx_profile_niveaux_profile ON profile_niveaux(profile_id);
```

### 7.3 Ce qu'on n'ajoute PAS

- `bio` / `about` — pas de réseau social
- `avatar_url` — initiales suffisent
- `phone`, `links`, `website` — pas pertinent
- `preferences_pedagogiques` — trop vague
- Toggles consentement par champ — pas exigé par Loi 25 dans une communauté fermée

### 7.4 Données calculées (pas de colonne)

| Donnée                  | Source                                                                                            | Affichage                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Nb tâches publiées      | `count(tae) WHERE auteur_id = ? AND is_published`                                                 | Compteur onglet, carte collaborateur           |
| Nb documents publiés    | `count(documents) WHERE auteur_id = ? AND is_published`                                           | Compteur onglet, carte collaborateur           |
| Nb épreuves publiées    | `count(evaluations) WHERE auteur_id = ? AND is_published`                                         | Compteur onglet, carte collaborateur           |
| Total contributions     | somme des 3, calculée **côté serveur**                                                            | Indicateur d'expérience                        |
| Nb infos pro manquantes | calculé côté serveur (compte des champs `disciplines`, `niveaux`, `years_experience` non remplis) | **Badge notification sidebar** (§13)           |
| Utilisations par tâche  | `count(*) FROM tae_usages WHERE tae_id = ?`                                                       | "Utilisée X fois" (chiffre exact, masqué si 0) |
| Membre depuis           | `profiles.created_at` → année                                                                     | Hero                                           |

---

## 8. Avatar : composant `AvatarInitials` unifié

### 8.1 Initiales

**Règle simple (deux mots garantis par l'inscription) :** première lettre du premier mot + première lettre du dernier mot.

```
"Gabriel Lemaire"        → "GL"
"Marie Tremblay"         → "MT"
"Jean-François Tremblay" → "JT"
```

**Cas anormal défensif** (ne devrait jamais arriver puisque le nom est obligatoire à l'inscription et structuré prénom + nom) : si `full_name` est vide ou null en runtime, lever une erreur côté code — pas de fallback silencieux qui masquerait une corruption de données.

### 8.2 Couleur unique pour tous

**Pas de palette, pas de hash.** Toutes les initiales utilisent la même combinaison :

- **Fond :** gris pâle (`bg-slate-100`)
- **Texte :** teal de l'app (`text-teal-600`)
- **Bordure :** `border border-slate-200` pour démarquer sur fond blanc

Pourquoi : la cohérence visuelle prime sur la différenciation. Pattern Notion. Le nom et les initiales suffisent à différencier deux personnes.

**Note dark mode :** à valider en QA — probablement passer à `bg-slate-800` + `text-teal-400` en dark mode si l'app le supporte.

### 8.3 Tailles

| Contexte              | Cercle  | Texte | Font weight |
| --------------------- | ------- | ----- | ----------- |
| Hero (profil)         | 80×80px | 28px  | semibold    |
| Carte collaborateur   | 40×40px | 14px  | medium      |
| Inline (auteur fiche) | 32×32px | 12px  | medium      |

Un seul composant `<AvatarInitials>` avec prop `size: 'sm' | 'md' | 'lg'`.

---

## 9. Édition par Side Sheet

### 9.1 Décision : Side Sheet M3 par section

Pas de mode édition global, pas de modale, pas d'inline edit. Le propriétaire clique l'icon button crayon → side sheet slide depuis la droite → formulaire pré-rempli → sauvegarde ou annule.

### 9.2 Sections éditables et leurs champs

**Side Sheet "Identité" (Hero)**

- Nom complet → champ texte (`full_name`)
- Établissement → sélecteur basé sur `css-ecoles.json`
- Rôle → **non éditable** (action admin)
- Courriel → **non éditable** (lié à `auth.users`, workflow vérification séparé)

**Side Sheet "Informations professionnelles"**

- Niveau enseigné → multi-select via composant `MetaPill` depuis `niveaux` (référentiel)
- Discipline enseignée → multi-select via composant `MetaPill` depuis `disciplines` (référentiel)
- Années d'expérience → input numérique (min=0, max=50)

**Ordre dans le Side Sheet :** identique à l'ordre d'affichage profil — Niveau → Discipline → Expérience.

### 9.3 Validation client + serveur

- **Validation côté client** : React Hook Form + Zod, messages d'erreur sous chaque champ en temps réel
- **Validation côté serveur** : Zod identique dans la Server Action (source de vérité)

### 9.4 Flux de sauvegarde

1. Clic icon button crayon → side sheet slide
2. Formulaire pré-rempli avec valeurs actuelles (snapshot `initialValues`)
3. **Focus initial sur le premier champ** à l'ouverture
4. Modification des champs avec validation client en temps réel
5. **Boutons : "Annuler" (gauche, text button) + "Enregistrer" (droite, filled button primary)**
6. Clic "Enregistrer" → Server Action → mise à jour transactionnelle (voir §9.5) → `revalidateTag('profile-' + userId)` → toast succès → sheet se ferme
7. Clic "Annuler" ou Escape → sheet se ferme sans changement
8. **Confirmation de sortie uniquement si modifications détectées** (compare `initialValues` vs `currentValues`)
9. **Échec de sauvegarde** : toast d'erreur, sheet reste ouvert, focus sur Enregistrer redevenu actif
10. **Timeout 10 secondes** : message + réactivation bouton

### 9.5 Mise à jour transactionnelle des pivot tables (diff intelligent)

**Pas de DELETE global + INSERT global.** Diff intelligent :

```ts
const oldDisciplines = await fetchProfileDisciplines(userId);
const toAdd = newDisciplines.filter((d) => !oldDisciplines.includes(d));
const toRemove = oldDisciplines.filter((d) => !newDisciplines.includes(d));

await supabase.rpc("begin");
if (toRemove.length > 0) {
  await supabase
    .from("profile_disciplines")
    .delete()
    .eq("profile_id", userId)
    .in("discipline_slug", toRemove);
}
if (toAdd.length > 0) {
  await supabase
    .from("profile_disciplines")
    .insert(toAdd.map((slug) => ({ profile_id: userId, discipline_slug: slug })));
}
await supabase.rpc("commit");
```

**Pourquoi :** évite les race conditions, préserve l'historique implicite, prêt pour des triggers d'audit/analytics futurs.

### 9.6 Chaînage entre Side Sheets

Pour éviter la friction "modifier identité → fermer → modifier infos pro → fermer", après une sauvegarde réussie, le toast de succès inclut un lien discret :

- Side Sheet Identité → "Modifier les informations professionnelles →"
- Side Sheet Infos pro → "Modifier l'identité →"

**Gestion du focus après chaînage :** à la fermeture du second sheet, le focus retourne sur le crayon de la section qu'on vient d'éditer en dernier.

**Pas d'autosave.** Sauvegarde explicite, plus rassurante.

---

## 10. Vue publique (mode visiteur)

### 10.1 Différences avec le mode propriétaire

Exactement la même page, **sans les icon buttons crayon**. Le bouton "Copier courriel" est conservé (utile pour le visiteur). Les sous-sections "Infos pro" vides sont masquées individuellement.

### 10.2 Points d'entrée

- `/collaborateurs` (cherche un collègue)
- Une fiche tâche/document/épreuve (clique sur le nom de l'auteur)
- La banque collaborative

### 10.3 Actions disponibles

- Voir les tâches, documents, épreuves → liens vers fiches
- Copier le courriel via icon button
- Retour navigation standard

Pas de bouton "Contacter" — le courriel + bouton copier suffit.

---

## 11. Section Contributions (les 3 onglets dès le MVP)

### 11.1 Structure à onglets

```
[ Documents (8) ]  [ Tâches (12) ]  [ Épreuves (3) ]
       ━━━━━
```

**Ordre fixe :** Documents → Tâches → Épreuves (du plus simple au plus complexe pédagogiquement).
**Onglet par défaut au chargement :** Documents.
**Format des labels :** pluriel dynamique via le helper `pluralize` (§6).

Indicateur teal 3px sous l'onglet actif. Compteurs **toujours visibles**, même à zéro.

### 11.2 Format d'affichage par onglet

**Documents** — Cartes M3 outlined :

- Titre / description
- Type (textuel / iconographique) avec icône
- Date
- → Lien vers `/documents/[id]`
- **Pas de signal "Utilisée X fois" au MVP** — la donnée n'existe pas. À ajouter en V2 si un compteur d'usage équivalent est créé.

**Tâches** — Cartes M3 outlined :

- Aperçu de la consigne (tronqué ~80 car.)
- OI + comportement (chip)
- Niveau + discipline
- **Signal d'utilité : "Utilisée X fois"** depuis `tae_usages` (chiffre exact, masqué si 0 — "Utilisée 0 fois" est démotivant et inutile)
- Date de publication
- → Lien vers `/questions/[id]`

**Épreuves** :

- Titre de l'épreuve
- Nombre de tâches incluses (avec pluriel : `1 tâche` / `5 tâches`)
- Date
- → Lien vers `/evaluations/[id]`
- **Pas de signal "Utilisée X fois" au MVP** — idem.

### 11.3 Load more (concaténation)

- 10 premiers items par onglet
- Bouton **"Voir plus" en text button M3 standard** (fond transparent, texte teal-600, hover bg-teal-50)
- Comportement : **concaténation** (append) — les nouveaux items s'ajoutent à la liste
- Requête Supabase `.range()` avec offset cumulatif côté client (`useState`)
- **Annonce `aria-live="polite"`** après chaque append : "10 nouveaux résultats chargés"
- Label dynamique : `Voir plus (X restant)` ou `(X restants)` selon pluralisation

### 11.4 État vide

- **Propriétaire** : "Vous n'avez pas encore publié de [type]." + CTA "Créer →" pointant vers la bonne route selon l'onglet actif :
  - Documents → `/documents/new`
  - Tâches → `/questions/new`
  - Épreuves → `/evaluations/new`
- **Visiteur** : "Cet enseignant n'a pas encore partagé de [type]."

### 11.5 Tri par défaut

Plus récent d'abord (`created_at DESC`). Pas de tri alternatif au MVP.

**Note pour V2 :** un tri par usage ("Plus utilisées d'abord") sur l'onglet Tâches est une attente naturelle puisqu'on affiche "Utilisée X fois". À ajouter en V2.

### 11.6 Brouillons

**Jamais affichés sur le profil**, même pour le propriétaire. Le profil est une vitrine publique ; les brouillons restent dans le dashboard.

---

## 12. Refonte `/collaborateurs`

**Note importante :** ce proto a été validé visuellement de la même façon que la page profil, dans une itération séparée. Tous les éléments de cette section sont issus du proto validé.

### 12.1 Problèmes actuels

1. Cartes inertes — pas de lien
2. Sous-utilisation de l'espace
3. Informations limitées (pas de niveaux/disciplines)
4. Pas de recherche/filtre
5. Hiérarchie visuelle plate

### 12.2 En-tête de page

```
Enseignants collaborateurs
[X] enseignants inscrits sur la plateforme

┌──────────────────────────────────────────────┐
│ 🔍  Rechercher un enseignant…                │
└──────────────────────────────────────────────┘
[indicateur sync : "Mise à jour des résultats…" si actif]
```

- Barre de recherche M3 : filtre live (voir §12.5)
- **Pas de hint clavier (Ctrl+K)** — c'est une input filter, pas une command palette
- Filtres niveau/discipline : V2 seulement
- **Sous-titre dynamique** : passe de `[X] enseignants inscrits sur la plateforme` à `[Y] résultats trouvés pour « ... »` en mode recherche

### 12.3 Carte collaborateur — hiérarchie visuelle (4 lignes)

```
┌────────────────────────────────────────────────────────────────┐
│  ┌────┐                                                        │
│  │ GL │  Gabriel Lemaire  [Enseignant]                         │
│  └────┘  CSS de Laval · 8 documents · 12 tâches · 3 épreuves   │
│          glemaire@csslaval.gouv.qc.ca  [📋]                    │
│          [🎓 Sec. 3] [🎓 Sec. 4] [📖 Histoire] [📖 Géographie] │
└────────────────────────────────────────────────────────────────┘
```

**Hiérarchie visuelle :**

| Ligne                 | Contenu                                                           | Style                                                     |
| --------------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| 1 (dominante)         | Avatar + nom + badge rôle                                         | Avatar 40×40px + `text-base font-semibold text-slate-900` |
| 2 (école + compteurs) | École · compteurs dans l'ordre `documents · tâches · épreuves`    | `text-sm text-slate-600`                                  |
| 3 (action)            | Courriel + bouton copier                                          | `text-sm text-slate-500`                                  |
| 4 (taxonomie)         | MetaPills niveaux + disciplines (composant existant, taille `sm`) | inline-flex avec gap 4px                                  |

**Détails :**

- **Toute la carte est un `<Link>`** vers `/profile/[id]`
- Hover : `border-slate-300 shadow-sm`
- **Prefetch au hover** : précharger `/profile/[id]` au `onMouseEnter` via `router.prefetch()` pour navigation quasi-instantanée
- Le bouton copier courriel utilise `e.stopPropagation()` pour ne pas déclencher la navigation
- `AvatarInitials` taille `md` (40×40px), teal sur gris pâle
- **MetaPills (composant existant) pour niveaux ET disciplines**, dans cet ordre, ligne 4 — réutilisation du composant utilisé sur le profil
- Ligne 4 absente (pas de placeholder vide) si rien rempli
- **Compteurs dans l'ordre cohérent avec le profil** : `documents · tâches · épreuves` (et non plus `tâches · documents · épreuves` comme dans la spec d'origine)
- **Compteurs avec pluralisation dynamique** via le helper `pluralize`
- **Micro-copy compteurs adaptatif :**
  - Si TOUS les compteurs sont à 0 : afficher "Aucune contribution pour le moment" en italique gris à la place de la ligne de compteurs
  - Si au moins un compteur > 0 : afficher la ligne complète `8 documents · 12 tâches · 3 épreuves` (avec singulier si applicable)

### 12.4 Pagination : scroll infini server-side hybride

**Pattern hybride : Intersection Observer + fallback bouton + désactivation en mode recherche.**

**En mode liste normale (sans recherche) :**

- 20 items par batch
- Server-side via route handler (voir §12.5)
- **Intersection Observer** sur sentinelle en bas de liste : visible → fetch suivant → append
- **Bouton "Voir plus"** (text button M3 standard) toujours visible — fallback accessible pour clavier/lecteurs d'écran. Label dynamique : `Voir plus (X restant)` / `(X restants)`
- `aria-live="polite"` annonce l'ajout de nouveaux items
- Fin de liste : "Vous avez vu tous les enseignants inscrits."
- Loading : skeleton de cartes pendant le fetch

**En mode recherche (`query !== ''`) :**

- **Scroll infini désactivé** (évite le bug de scroll incohérent)
- Pagination simple : tous les résultats correspondants chargés en une fois (max 50)
- Si > 50 résultats : message "Affinez votre recherche pour voir plus de résultats"
- `aria-live="polite"` annonce "X résultats trouvés pour [terme]"

### 12.5 Recherche hybride (cache local + server sync)

**Pattern :**

1. Frappe utilisateur dans l'input
2. **Filtre local instantané** sur le batch déjà chargé en mémoire (réactivité immédiate, zéro latence perçue)
3. **État `isSyncing = true`** affiché : indicateur subtil "Mise à jour des résultats…" sous la barre de recherche
4. **Debounce 300ms** puis lancement de la requête server en parallèle
5. La réponse server **complète/remplace** les résultats locaux avec l'ensemble complet
6. **`isSyncing = false`** une fois les résultats serveur reçus
7. **AbortController** pour annuler les requêtes obsolètes (race conditions)

**Pourquoi l'indicateur `isSyncing` :** sans ça, l'utilisateur tape "mar", voit 2 résultats locaux, puis brusquement la liste passe à 18 résultats serveur → perçu comme un bug. Avec l'indicateur, l'utilisateur comprend que les résultats vont s'enrichir.

**Implémentation technique :**

- Le filtrage local + l'AbortController nécessitent du code côté client → utiliser une **route handler** (`app/api/collaborateurs/search/route.ts`) plutôt qu'une Server Action (Server Actions Next.js ne sont pas annulables nativement)
- **Cleanup AbortController obligatoire dans `useEffect`** :
  ```ts
  useEffect(() => {
    const controller = new AbortController();
    searchCollaborateurs({ signal: controller.signal, ... });
    return () => controller.abort();
  }, [query]);
  ```
- C'est l'**exception** au pattern Server Actions de l'app, justifiée par la nécessité de l'annulation

**Recherche sur :** `full_name`, `email`, `school_search_text` (colonne générée — index trigram pour recherche partielle).

**État vide de recherche :** "Aucun enseignant trouvé pour « [terme] »." + suggestion "Vérifiez l'orthographe ou essayez un autre terme."

### 12.6 Tri par défaut

Alphabétique par nom (`full_name ASC`). Pas de tri "plus contributifs" au MVP — utile à partir de 50+ enseignants, à ajouter en V2.

### 12.7 Grille responsive

- **Desktop (≥ 768px)** : **2 colonnes** (`grid-cols-2 gap-3`)
- **Mobile (< 768px)** : 1 colonne

**Breakpoint à 768px** (et non 1024px comme initialement prévu) — confirmé par le proto : les cartes à 4 lignes tiennent confortablement à 2 par ligne dès 768px. Pas de grille 3 colonnes : la carte est dense et a besoin de respiration horizontale.

### 12.8 L'utilisateur courant n'est pas dans la liste

Le user connecté ne se voit pas — c'est un répertoire des _autres_. Son propre profil est accessible via la sidebar.

### 12.9 Cohérence visuelle avec la page Profil

Tous les éléments visuels sont les mêmes que sur la page profil :

- Même `AvatarInitials` (teal sur gris pâle)
- Même badge rôle M3 (Assist Chip)
- Mêmes `MetaPill` pour niveaux (icône chapeau, ramp bleu) et disciplines (icône livre, ramp ambre)
- Même bouton copier courriel + toast `aria-live` 4 secondes
- Même helper de pluralisation
- Même ordre logique Documents → Tâches → Épreuves dans les compteurs

C'est volontaire : un utilisateur qui passe de `/collaborateurs` à `/profile/[id]` doit ressentir une continuité visuelle forte.

---

## 13. Badge notification sidebar

### 13.1 But

Indicateur discret et non gamifié dans la sidebar pour rappeler au propriétaire qu'il a des informations professionnelles à compléter sur son profil. Ces 3 champs (niveau, discipline, expérience) ne sont pas demandés à l'inscription, donc tout nouveau membre démarre avec 3 champs vides.

### 13.2 Position et structure HTML

L'item "Profil" de la sidebar (sous "Système") porte un petit cercle rouge en exposant collé au coin supérieur droit du mot "Profil".

**Pattern Material Design 3 standard** (équivalent au composant Badge de MUI) :

```html
<div class="sidebar-link" role="link">
  <span class="badge-wrap">
    <svg class="icon"><!-- icône user --></svg>
    <span>Profil</span>
    <span class="notif-badge">3</span>
  </span>
</div>
```

Le `.badge-wrap` est en `position: relative` et contient l'icône + le texte + le badge. Le badge est en `position: absolute` ancré sur le coin supérieur droit du conteneur via `top: 0; right: 0; transform: translate(70%, -50%)`.

**Pourquoi `transform: translate(70%, -50%)`** : pattern mathématique propre — le badge se positionne par rapport à sa propre taille, pas en pixels arbitraires. Le `70%` (au lieu du `50%` standard MUI) crée plus d'air entre le mot "Profil" et le badge, validé visuellement dans le proto.

### 13.3 Specs CSS finales

```css
.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(70%, -50%);
  transform-origin: 100% 0%;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  border-radius: 7px;
  background: #dc2626;
  color: white;
  font-size: 9px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-sizing: border-box;
  pointer-events: none;
}
```

### 13.4 Comportement

- Le badge affiche **le nombre d'infos pro manquantes** (max 3 : niveau, discipline, expérience)
- Calculé **côté serveur** depuis les pivot tables et `years_experience`
- Si `count === 0` (toutes les infos remplies) : `display: none` — badge complètement masqué
- Si `count >= 1` : badge visible avec le chiffre exact
- **Pas de "9+"** au MVP puisque le max théorique est 3

### 13.5 Risques et précautions techniques

- **Overflow parent** : si la sidebar a un `overflow: hidden` strict, le badge qui dépasse de ~10px à droite serait coupé. Solution : `overflow: visible` sur l'item parent direct (`.sidebar-link`)
- **Hover sur l'item** : le badge ne doit pas changer de position au hover (utiliser `pointer-events: none` sur le badge — le hover passe à travers)
- **Lecteur d'écran** : ajouter un `aria-label` sur le `.sidebar-link` qui inclut le compte. Exemple : `aria-label="Profil — 3 informations à compléter"`. Sans ça le badge n'est qu'un nombre nu sans contexte.

### 13.6 Contre quoi on s'est protégé (refusés)

- Une jauge de complétion (gamification)
- Un badge "Profil incomplet" en texte (trop intrusif)
- Un toast au login (interruption inutile)
- Un bandeau persistant en haut du profil (espace volé)

Le badge sidebar est le plus discret des nudges possibles tout en restant visible.

---

## 14. Cas limites et états d'erreur

### 14.1 Profil introuvable

`/profile/[id]` avec UUID invalide ou inexistant → page 404 standard.

### 14.2 Profil d'un utilisateur désactivé

Au lieu d'une 404 brutale, afficher **`[Compte désactivé]`** :

- Sur les fiches tâches/documents/épreuves : le nom de l'auteur devient `[Compte désactivé]`, lien neutralisé
- Dans la liste `/collaborateurs` : le profil n'apparaît pas du tout (filtré par `is_active = true`)
- Dans `/profile/[id]` direct : page minimale "Ce compte a été désactivé. Les contributions de cet utilisateur restent disponibles dans la banque collaborative."

Préserve la valeur des contributions sans frustrer.

### 14.3 Édition concurrente

Last-write-wins. Données simples (3 champs), conflit improbable et sans conséquence.

### 14.4 Changement de nom / école

Se propage partout via les JOINs live. Pas de dénormalisation. Le cache server est invalidé via `revalidateTag('profile-' + userId)`.

### 14.5 Champs vides dans les infos pro

- **Propriétaire** : section affichée, micro-copy spécifique par champ (voir §5.5)
- **Visiteur** : sous-section masquée individuellement, **pas de skeleton intermédiaire** — évite tout layout shift
- **Carte collaborateur** : ligne 4 (MetaPills) absente si rien rempli

### 14.6 Échec de sauvegarde

Toast d'erreur "Impossible d'enregistrer les modifications. Réessayez." Side sheet reste ouvert, focus retourne au bouton Enregistrer redevenu actif, champs intacts.

### 14.7 Timeout serveur

Après 10 secondes sans réponse : "Le serveur ne répond pas. Vérifiez votre connexion." Bouton Enregistrer réactivé, champs intacts.

### 14.8 Liste collaborateurs vide

"Aucun collaborateur inscrit pour le moment."

### 14.9 Recherche sans résultat

"Aucun enseignant trouvé pour « [terme] »." + suggestion "Vérifiez l'orthographe ou essayez un autre terme."

### 14.10 Erreur de chargement scroll infini

Message inline avec bouton "Réessayer" qui retente la requête.

### 14.11 Skeleton loading initial du profil

**Skeletons spécifiques par type de contenu :**

- **Hero** : skeleton du cercle initiales + 3 lignes de texte gris (nom, école, courriel)
- **Section infos pro** : aucun skeleton — voir §14.5 (évite le layout shift)
- **Onglets contributions** : skeleton des 3 onglets (placeholders) + 2 cartes fictives spécifiques au type :
  - Cartes Documents : 2 lignes (titre, type)
  - Cartes Tâches : 3 lignes (consigne tronquée, OI/comportement, niveau/discipline)
  - Cartes Épreuves : 2 lignes (titre, nb tâches)

---

## 15. Accessibilité (WCAG 2.2 AA volontaire)

L'app n'est pas assujettie au standard gouvernemental SGQRI 008 3.0 (service privé), mais on vise le **WCAG 2.2 AA comme objectif volontaire**.

### 15.1 Navigation clavier

- `Tab` navigue entre sections, boutons crayon, onglets, cartes
- `Enter` / `Space` ouvre le side sheet
- `Escape` ferme le side sheet (retour de focus sur le déclencheur ou, en cas de chaînage, sur le crayon de la section éditée en dernier)
- Focus trap dans le side sheet
- Onglets : `ArrowLeft` / `ArrowRight` (pattern `tablist` ARIA)
- Cartes collaborateurs : `Enter` (sont des `<Link>`)
- Bouton "Voir plus" toujours focusable (fallback du scroll infini)

### 15.2 Lecteur d'écran

- Hero : `h1` avec le nom
- Sections : `<section>` avec `aria-labelledby`
- Boutons crayon : `aria-label="Modifier les informations d'identité"`
- Bouton copier : `aria-label="Copier le courriel"`, succès annoncé via `role="status" aria-live="polite"` (toast)
- Side sheet : `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Onglets : `role="tablist"` / `role="tab"` / `role="tabpanel"` / `aria-selected` / `aria-controls` + `id` systématiques
- Compteurs onglets : `aria-label="12 tâches publiées"`
- Badge expérience : `aria-label="Contributeur actif — basé sur 24 contributions publiées"`
- **Badge notification sidebar** : `aria-label="Profil — 3 informations à compléter"` sur le `.sidebar-link`
- Cartes collaborateurs : `aria-label` avec nom + école
- Recherche : `aria-live="polite"` annonce "X résultats trouvés pour [terme]"
- Scroll infini : `aria-live="polite"` annonce les nouveaux items chargés

**Une seule région `aria-live` globale** pour tous les toasts (pattern standard de toute lib de toast — sonner, react-hot-toast, etc.) — évite la saturation des lecteurs d'écran.

### 15.3 Contraste

- Initiales teal sur gris pâle : ratio vérifié ≥ 4.5:1 (AA)
- Touch targets : 48px minimum
- Focus visible : ring teal systématique (`ring-2 ring-teal-500 ring-offset-2`)
- **Dark mode `AvatarInitials`** : à valider en QA, probablement `bg-slate-800` + `text-teal-400`

---

## 16. Responsive

### 16.1 Desktop (≥ 768px)

**Profil :**

- Page centrée, max-width aligné sur l'app
- Hero : initiales gauche, texte droite, icon button crayon en fin
- Side sheet : 400px slide droite

**Collaborateurs :**

- **Grille 2 colonnes** (`grid-cols-2 gap-3`) — breakpoint à 768px (validé par proto)
- Barre de recherche pleine largeur

### 16.2 Mobile (< 768px)

**Profil :**

- Hero : pile verticale, initiales centrées
- Boutons crayon : icon-only, top-right de la section
- Side sheet : **plein écran** avec header sticky, flèche retour
- Footer side sheet : boutons stack vertical, Enregistrer en bas (pouce friendly)

**Collaborateurs :**

- 1 colonne
- Barre de recherche sticky top

---

## 17. Sécurité, RLS et gestion des comptes

### 17.1 Lecture de profil

```sql
CREATE POLICY "profiles_select_authenticated"
ON profiles FOR SELECT TO authenticated
USING (is_active = true OR auth.jwt() ->> 'role' = 'admin');
```

Filtre sur `is_active = true` pour les utilisateurs réguliers. Les admins voient tous les profils.

### 17.2 Modification de profil

```sql
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

### 17.3 Tables pivot

```sql
CREATE POLICY "profile_disciplines_select_all"
ON profile_disciplines FOR SELECT TO authenticated USING (true);

CREATE POLICY "profile_disciplines_modify_own"
ON profile_disciplines FOR ALL TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Idem pour profile_niveaux
```

### 17.4 Désactivation de compte

**Mécanisme :**

- Colonne `is_active boolean DEFAULT true NOT NULL` sur `profiles`
- Un admin peut désactiver un compte via une action admin séparée (hors scope direct)
- Désactivation = `UPDATE profiles SET is_active = false WHERE id = ?`

**Effets :**

- Le profil n'apparaît plus dans `/collaborateurs`
- L'auteur n'est plus cliquable partout dans l'app (`[Compte désactivé]`)
- Les contributions restent publiées — valeur communautaire préservée
- Page profil direct : message minimal "Ce compte a été désactivé."

### 17.5 Suppression de compte (Loi 25)

**Droit de suppression.** La Loi 25 (Québec) accorde à chaque utilisateur le droit de demander la suppression de ses renseignements personnels. L'app offre un mécanisme self-service accessible depuis la page profil en mode propriétaire.

**Point d'entrée UI.** Un bouton discret "Supprimer mon compte" apparaît **en bas de la page profil en mode propriétaire uniquement**, visuellement séparé du reste du contenu (séparateur + espacement généreux). Style : text button `text-error` (rouge), pas de fond — volontairement discret mais visible.

**Modale de confirmation formelle (WarningModal existant).** Au clic, une modale d'avertissement s'ouvre avec :

- **Titre :** "Suppression définitive du compte"
- **Texte d'avertissement (formel) :**

  > En vertu de la Loi 25 sur la protection des renseignements personnels, cette action entraîne la suppression irréversible de toutes vos données personnelles :
  >
  > • Votre nom, courriel et informations d'établissement
  > • Vos niveaux, disciplines et années d'expérience
  > • Vos brouillons non publiés (tâches, documents, épreuves)
  > • Vos votes, favoris et notifications
  >
  > **Vos contributions publiées** (tâches, documents et épreuves) resteront accessibles dans la banque collaborative, mais votre nom sera remplacé par « [Compte supprimé] ».
  >
  > Cette action est irréversible. Vous ne pourrez pas récupérer votre compte.

- **Champ de confirmation :** input texte "Tapez SUPPRIMER pour confirmer" — le bouton de suppression reste désactivé tant que la saisie ne correspond pas exactement
- **Boutons :** "Annuler" (gauche, text button) + "Supprimer définitivement" (droite, filled button `bg-error text-white`, désactivé jusqu'à confirmation)
- **Aria :** `role="alertdialog"` (et non `dialog` — sémantique d'action destructrice irréversible)

**Flux technique — transaction atomique via RPC Supabase :**

```sql
-- supabase/schema.sql (ou migration)
CREATE OR REPLACE FUNCTION delete_account_anonymize(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- 1. Vérifier que c'est bien le user authentifié
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  -- 2. Supprimer les données privées (CASCADE couvre : wizard_drafts, votes,
  --    votes_archives, tae_usages, favoris, notifications, tae_collaborateurs)
  DELETE FROM tae WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM documents WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM evaluations WHERE auteur_id = p_user_id AND is_published = false;
  DELETE FROM commentaires WHERE auteur_id = p_user_id;

  -- 3. Vider les pivot tables profil
  DELETE FROM profile_disciplines WHERE profile_id = p_user_id;
  DELETE FROM profile_niveaux WHERE profile_id = p_user_id;

  -- 4. Anonymiser le profil (les FK RESTRICT sur tae/documents/evaluations publiés
  --    empêchent la suppression — on anonymise à la place)
  UPDATE profiles SET
    full_name = '[Compte supprimé]',
    email = 'deleted-' || p_user_id || '@anonymized.local',
    school = NULL,
    years_experience = NULL,
    status = 'suspended',
    activation_token = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
```

**Server Action :**

```ts
// lib/actions/account-delete.ts
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const Schema = z.object({
  confirmation: z.literal("SUPPRIMER"),
});

export async function deleteAccountAction(
  payload: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié." };

  const parsed = Schema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Confirmation invalide." };

  // Transaction atomique côté SQL
  const { error } = await supabase.rpc("delete_account_anonymize", {
    p_user_id: user.id,
  });

  if (error) {
    console.error("[deleteAccountAction]", error);
    return { ok: false, error: "Impossible de supprimer le compte. Réessayez." };
  }

  // Déconnecter après suppression
  await supabase.auth.signOut();
  redirect("/login");
}
```

**Composant :** `DeleteAccountSection` dans `components/profil/`, visible **uniquement en mode propriétaire**. Utilise le `WarningModal` existant.

**Effets post-suppression :**

- L'auteur apparaît comme `[Compte supprimé]` partout (même traitement que `[Compte désactivé]` — §14.2)
- Les contributions publiées restent dans la banque (valeur communautaire préservée)
- Le profil `/profile/[id]` affiche : "Ce compte a été supprimé."
- L'email anonymisé (`deleted-{uuid}@anonymized.local`) libère l'adresse email originale pour une éventuelle réinscription
- La session est détruite, redirect vers `/login`

**Ce qu'on ne fait PAS :**

- Suppression physique du row `profiles` (les FK RESTRICT l'empêchent si contenu publié)
- Suppression des contributions publiées (valeur communautaire > droit à l'effacement sur des contenus pédagogiques anonymisés)
- Période de grâce / undo (la confirmation textuelle suffit comme garde-fou)
- Suppression via `auth.admin.deleteUser()` côté Supabase Auth (le row auth.users reste orphelin mais inactif — le profil `status = 'suspended'` empêche toute reconnexion via `auth_is_active()`)

**Tests E2E :**

- Bouton visible uniquement en mode propriétaire, absent en mode visiteur
- Modale : bouton désactivé tant que "SUPPRIMER" non saisi
- Post-suppression : profil affiche "Ce compte a été supprimé"
- Post-suppression : contributions publiées toujours visibles avec auteur `[Compte supprimé]`
- Post-suppression : redirect vers `/login`, session détruite
- RLS : impossible d'appeler la RPC pour un autre user

### 17.6 Contributions visibles

Les tâches, documents et épreuves affichés sur le profil sont **publiés uniquement** (`is_published = true`).

---

## 18. Navigation et intégration dans l'app

### 18.1 Accès au profil propre

- **Sidebar** : lien "Profil" sous Système, **avec badge notification si infos incomplètes** (§13)

### 18.2 Accès au profil d'un autre

- **`/collaborateurs`** : chaque carte est un `<Link href="/profile/[id]">` avec prefetch au hover
- **Fiches tâches** : nom de l'auteur devient un lien
- **Fiches documents** : idem
- **Fiches épreuves** : idem
- **Banque collaborative** : nom de l'auteur dans chaque ligne/carte devient un lien
- **Commentaires** : si le nom est affiché, idem

---

## 19. Server Actions, queries, contrats TypeScript et performance

### 19.1 Pattern Next.js retenu

- **Lecture du profil** → Server Component qui appelle directement les queries (pas de route API)
- **Édition** → Server Actions classiques avec `revalidateTag`
- **Recherche live collaborateurs** → **route handler exception** (`app/api/collaborateurs/search/route.ts`) à cause de l'AbortController nécessaire côté client

### 19.2 Query agrégée unique pour le profil (élimine N+1)

**Pas de requêtes séparées pour profil + counts.** Une seule query agrégée :

```sql
-- fetchProfileOverview
SELECT
  p.id, p.full_name, p.email, p.role, p.school,
  p.years_experience, p.created_at, p.is_active,
  COALESCE((SELECT array_agg(discipline_slug) FROM profile_disciplines WHERE profile_id = p.id), '{}') AS disciplines,
  COALESCE((SELECT array_agg(niveau_slug) FROM profile_niveaux WHERE profile_id = p.id), '{}') AS niveaux,
  (SELECT count(*) FROM tae WHERE auteur_id = p.id AND is_published) AS task_count,
  (SELECT count(*) FROM documents WHERE auteur_id = p.id AND is_published) AS doc_count,
  (SELECT count(*) FROM evaluations WHERE auteur_id = p.id AND is_published) AS eval_count
FROM profiles p
WHERE p.id = $1 AND p.is_active = true;
```

**Total contributions** calculé côté serveur dans la même query.
**Nb infos pro manquantes** calculé côté serveur (3 - count(disciplines remplies, niveaux remplis, expérience remplie)).

### 19.3 Query Tâches avec usage_count (pas de N+1)

```sql
SELECT
  t.id, t.consigne, t.oi_id, t.comportement_id,
  t.niveau, t.discipline, t.created_at,
  COALESCE(u.usage_count, 0) AS usage_count
FROM tae t
LEFT JOIN LATERAL (
  SELECT count(*) AS usage_count
  FROM tae_usages
  WHERE tae_id = t.id
) u ON true
WHERE t.auteur_id = $1 AND t.is_published = true
ORDER BY t.created_at DESC
LIMIT 10 OFFSET $2;
```

Le `usage_count` est inclus dans la même query principale. Zéro requête par item, jamais.

### 19.4 Query collaborateurs (élimine N+1)

```sql
SELECT
  p.id, p.full_name, p.email, p.school, p.role,
  (SELECT count(*) FROM tae WHERE auteur_id = p.id AND is_published) AS task_count,
  (SELECT count(*) FROM documents WHERE auteur_id = p.id AND is_published) AS doc_count,
  (SELECT count(*) FROM evaluations WHERE auteur_id = p.id AND is_published) AS eval_count,
  COALESCE((SELECT array_agg(discipline_slug) FROM profile_disciplines WHERE profile_id = p.id), '{}') AS disciplines,
  COALESCE((SELECT array_agg(niveau_slug) FROM profile_niveaux WHERE profile_id = p.id), '{}') AS niveaux
FROM profiles p
WHERE p.id != $current_user_id
  AND p.is_active = true
  AND (
    lower(p.full_name) LIKE lower($search) || '%'
    OR p.email ILIKE '%' || $search || '%'
    OR p.school_search_text ILIKE '%' || $search || '%'
  )
ORDER BY p.full_name ASC
LIMIT 20 OFFSET $offset;
```

Plus une query séparée `count(*)` pour le total (avec les mêmes filtres).

### 19.5 Cache server-side et tag-based revalidation

Les profils changent peu (un user édite son profil quelques fois par mois max).

```ts
import { unstable_cache } from "next/cache";

const getProfileCached = (id: string) =>
  unstable_cache(() => fetchProfileOverview(id), ["profile", id], { tags: [`profile-${id}`] })();

import { revalidateTag } from "next/cache";

async function updateProfileIdentity(input) {
  // ... mise à jour SQL
  revalidateTag(`profile-${userId}`);
}
```

**Pourquoi tag-based plutôt que path-based :** `revalidateTag` est plus précis, n'invalide que ce qui est nécessaire.

### 19.6 Prefetch au hover sur les cartes collaborateurs

```tsx
<Link
  href={`/profile/${profile.id}`}
  prefetch
  onMouseEnter={() => router.prefetch(`/profile/${profile.id}`)}
>
  {/* carte */}
</Link>
```

### 19.7 Contrats TypeScript

```ts
async function fetchProfileOverview(id: string): Promise<{
  profile: {
    id: string;
    full_name: string;
    email: string;
    role: "enseignant" | "conseiller_pedagogique" | "admin";
    school: { css: string; ecole: string };
    disciplines: string[];
    niveaux: string[];
    years_experience: number | null;
    created_at: string;
    is_active: boolean;
  };
  counts: {
    documents: number; // ordre cohérent : doc → task → eval
    tasks: number;
    evaluations: number;
    total: number;
  };
  experienceLabel: "nouveau" | "neutre" | "actif" | "experimente";
  missingProInfoCount: number; // 0 à 3, alimente le badge sidebar
  isOwner: boolean;
}>;
```

### 19.8 Server Actions de modification

```ts
async function updateProfileIdentity(input: {
  full_name: string;
  school: { css: string; ecole: string };
}): Promise<{ success: boolean; error?: string }>;

async function updateProfileProfessional(input: {
  niveaux: string[];
  disciplines: string[];
  years_experience: number | null;
}): Promise<{ success: boolean; error?: string }>;
```

Validation Zod côté serveur. `revalidateTag('profile-' + userId)` après succès. **Diff intelligent** sur les pivot tables (voir §9.5).

---

## 20. Composants à créer

| Composant                    | Emplacement                  | Notes                                                                          |
| ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `AvatarInitials`             | `components/ui/`             | Couleur unique teal/gris, dark mode à valider                                  |
| `RoleBadge`                  | `components/ui/`             | Assist Chip M3                                                                 |
| `ExperienceBadge`            | `components/ui/`             | Calcul + `aria-label` enrichi                                                  |
| `CopyButton`                 | `components/ui/`             | Icon button + toast `role="status" aria-live="polite"`, 4s                     |
| `SideSheet`                  | `components/ui/`             | Drawer M3, focus initial, focus trap                                           |
| `ToastRegion`                | `components/ui/`             | Région `aria-live` globale unique                                              |
| `SidebarNotifBadge`          | `components/ui/`             | Badge rouge `translate(70%, -50%)`, 14×14px (§13)                              |
| `ProfileHero`                | `components/profile/`        | Hero card complet                                                              |
| `ProfileProfessionalInfo`    | `components/profile/`        | Niveau → Discipline → Expérience, MetaPills, micro-copy par champ              |
| `ProfileContributions`       | `components/profile/`        | Conteneur 3 onglets (Documents → Tâches → Épreuves)                            |
| `ProfileDocumentsList`       | `components/profile/`        | Liste documents + "Voir plus"                                                  |
| `ProfileTasksList`           | `components/profile/`        | Liste tâches + "Voir plus" + "Utilisée X fois"                                 |
| `ProfileEvaluationsList`     | `components/profile/`        | Liste épreuves + "Voir plus"                                                   |
| `ProfileEditIdentity`        | `components/profile/`        | Side sheet + lien chaînage                                                     |
| `ProfileEditProfessional`    | `components/profile/`        | Side sheet + lien chaînage + diff intelligent                                  |
| `ProfileEmptyState`          | `components/profile/`        | Empty state adapté                                                             |
| `ProfileSkeleton`            | `components/profile/`        | Skeletons spécifiques par type de contenu                                      |
| `CollaborateurCard`          | `components/collaborateurs/` | Carte 4 lignes, MetaPills, prefetch, micro-copy 0                              |
| `CollaborateursSearchBar`    | `components/collaborateurs/` | Cache local + server sync + `isSyncing` + AbortController cleanup              |
| `CollaborateursInfiniteList` | `components/collaborateurs/` | Scroll infini hybride + désactivation en recherche                             |
| `DeleteAccountSection`       | `components/profile/`        | Bouton + WarningModal + champ confirmation "SUPPRIMER" + Server Action (§17.5) |

**Composants existants à RÉUTILISER (ne pas recréer) :**

- `MetaPill` — pour niveaux, disciplines, expérience sur le profil ET les cartes collaborateurs
- Helper `pluralize` (à créer une seule fois dans `lib/utils/pluralize.ts`)

---

## 21. Priorisation MVP

### Phase 1 — Le strict nécessaire (livraison initiale)

**Migration SQL**

1. `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
2. Tables pivot `profile_disciplines` et `profile_niveaux`
3. Colonnes `years_experience`, `is_active`, `school_search_text` (générée)
4. Indexes
5. RLS policies pour profiles + tables pivot

**Composants UI primitives** 6. `AvatarInitials`, `RoleBadge`, `ExperienceBadge`, `CopyButton`, `SideSheet`, `ToastRegion` 7. `SidebarNotifBadge` avec specs CSS du §13.3 8. Helper `pluralize` (`lib/utils/pluralize.ts`) 9. `ProfileSkeleton` (spécifiques par type)

**Page Profil** 10. Route `/profile/[id]` Server Component avec mode propriétaire/visiteur 11. `fetchProfileOverview` query agrégée unique (cache + tag) 12. `ProfileHero` complet 13. `ProfileProfessionalInfo` avec MetaPills + ordre Niveau → Discipline → Expérience + micro-copy par champ + masquage individuel des sous-sections vides en mode visiteur 14. `ProfileContributions` avec **les 3 onglets** dans l'ordre Documents → Tâches → Épreuves 15. `ProfileDocumentsList`, `ProfileTasksList` (avec usage_count via JOIN LATERAL), `ProfileEvaluationsList` 16. `ProfileEditIdentity` (Side Sheet) 17. `ProfileEditProfessional` (Side Sheet, diff intelligent pivot tables) 18. Chaînage entre Side Sheets (lien dans toast de succès, focus géré) 19. Timeout 10s côté client

**Sidebar** 20. Intégration `SidebarNotifBadge` sur l'item "Profil" avec compteur depuis `missingProInfoCount`

**Page Collaborateurs** 21. `CollaborateurCard` cliquable avec hiérarchie 4 lignes + MetaPills + ordre compteurs `documents · tâches · épreuves` + prefetch hover + micro-copy 0 22. `CollaborateursSearchBar` avec cache local + server sync + `isSyncing` + AbortController cleanup 23. `CollaborateursInfiniteList` avec scroll infini hybride + désactivation en recherche 24. Route handler `app/api/collaborateurs/search/route.ts` 25. Grille 2 colonnes desktop / 1 mobile (breakpoint 768px)

**Intégration** 26. Liens auteur dans fiches tâches → `/profile/[id]` 27. Gestion `[Compte désactivé]` et `[Compte supprimé]` partout

**Suppression de compte** 28. RPC `delete_account_anonymize` + migration SQL 29. Server Action `deleteAccountAction` avec validation Zod `confirmation: "SUPPRIMER"` 30. `DeleteAccountSection` (bouton + WarningModal + champ confirmation) — mode propriétaire uniquement

### Phase 2 — Compléter

- Liens auteur dans la banque collaborative et les commentaires
- Liens auteur dans fiches documents et épreuves
- Signal "Utilisée X fois" pour documents et épreuves (si compteur d'usage créé)
- Tri "plus utilisées" sur l'onglet Tâches du profil

### Phase 3 — V2/V3

- Filtres niveau/discipline sur `/collaborateurs`
- Tri "Plus contributifs" sur `/collaborateurs`
- Optimistic UI (`useOptimistic`) pour l'édition
- Cursor pagination si volumes augmentent
- Migration vers une vraie table `schools` (dette technique documentée)

---

## 22. Décisions tranchées (récap)

| #   | Sujet                                           | Décision                                                                                                                        |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Terminologie                                    | Tâches / Documents / Épreuves (plus jamais "TAÉ" en UI)                                                                         |
| 2   | Routing                                         | Une seule route `/profile/[id]`, mode conditionnel                                                                              |
| 3   | Layout profil                                   | **Page scrollable simple, sans nav intra-profil** (anchor nav supprimée)                                                        |
| 4   | Ordre sections                                  | Hero → Infos pro → Contributions                                                                                                |
| 5   | Édition                                         | Side Sheet M3 par section                                                                                                       |
| 6   | Boutons side sheet                              | Annuler gauche (text) / Enregistrer droite (filled primary)                                                                     |
| 7   | Focus initial side sheet                        | Premier champ                                                                                                                   |
| 8   | Confirmation sortie                             | Seulement si `initialValues !== currentValues`                                                                                  |
| 9   | Chaînage édition                                | Lien dans toast de succès + focus retour intelligent                                                                            |
| 10  | Timeout serveur                                 | 10 secondes                                                                                                                     |
| 11  | Diff pivot tables                               | toAdd/toRemove (pas DELETE+INSERT global)                                                                                       |
| 12  | Avatar                                          | Initiales sur gris pâle, texte teal — couleur unique                                                                            |
| 13  | Initiales                                       | Première lettre prénom + première lettre nom                                                                                    |
| 14  | Rôle                                            | Badge M3 dans le hero                                                                                                           |
| 15  | Indicateur expérience                           | "Nouveau membre" / "Contributeur actif" / "Contributeur expérimenté", calcul serveur                                            |
| 16  | Courriel                                        | Visible + bouton copier (propriétaire ET visiteur)                                                                              |
| 17  | Compteurs profil                                | Toujours affichés même à zéro                                                                                                   |
| 18  | Compteurs cartes collab                         | "Aucune contribution pour le moment" si tous à 0                                                                                |
| 19  | **Ordre onglets contributions**                 | **Documents → Tâches → Épreuves** (du plus simple au plus complexe)                                                             |
| 20  | **Ordre infos pro**                             | **Niveau → Discipline → Expérience**                                                                                            |
| 21  | **Composant pour niveau/discipline/expérience** | **MetaPill existant** (icônes dédiées), pas de chips génériques                                                                 |
| 22  | **Pluralisation**                               | **Helper `pluralize(count, singular, plural)` universel** — 0 et 1 = singulier                                                  |
| 23  | **Renommage "Matières"**                        | **"Discipline enseignée" / "Disciplines enseignées"**                                                                           |
| 24  | **Saisie infos pro**                            | **Après inscription uniquement**, jamais à l'inscription                                                                        |
| 25  | **Micro-copy états vides infos pro**            | **3 messages spécifiques par champ** (voir §5.5)                                                                                |
| 26  | **Badge notification sidebar**                  | **Cercle rouge en exposant**, `translate(70%, -50%)`, 14×14px, max 3                                                            |
| 27  | Format compteurs onglets                        | `Documents (8)` (label avant compteur, pluriel dynamique)                                                                       |
| 28  | "Voir plus"                                     | Text button M3 standard, concaténation, annonce aria-live, label dynamique                                                      |
| 29  | Brouillons                                      | Jamais sur le profil                                                                                                            |
| 30  | Contributions MVP                               | Les 3 onglets dès la Phase 1                                                                                                    |
| 31  | Signal d'utilité                                | "Utilisée X fois" sur Tâches uniquement (chiffre exact, masqué si 0)                                                            |
| 32  | Champs SQL ajoutés                              | `years_experience` + `is_active` + `school_search_text` (générée) + tables pivot                                                |
| 33  | Modèle disciplines/niveaux                      | Pivot tables avec FK                                                                                                            |
| 34  | Recherche école                                 | Colonne générée + index trigram                                                                                                 |
| 35  | Validation édition                              | Client (RHF + Zod) + serveur (Zod)                                                                                              |
| 36  | Pas de bio, pas d'avatar upload                 | Spec définitive                                                                                                                 |
| 37  | `/collaborateurs` cards                         | Cliquables + prefetch hover, hiérarchie 4 lignes, MetaPills ligne 4                                                             |
| 38  | **Ordre compteurs cartes collab**               | **`documents · tâches · épreuves`** (cohérence avec onglets profil)                                                             |
| 39  | Pagination collaborateurs                       | Scroll infini hybride + fallback bouton + désactivation en recherche                                                            |
| 40  | Recherche collaborateurs                        | Cache local + server sync + `isSyncing` + AbortController cleanup                                                               |
| 41  | Tri collaborateurs                              | Alphabétique par nom                                                                                                            |
| 42  | Grille collaborateurs                           | **2 colonnes desktop dès 768px**, 1 mobile                                                                                      |
| 43  | User courant dans liste                         | Non                                                                                                                             |
| 44  | Compte désactivé                                | `is_active` boolean, `[Compte désactivé]` partout                                                                               |
| 45  | Performance N+1                                 | `fetchProfileOverview` agrégée + JOIN LATERAL pour usage_count                                                                  |
| 46  | Cache                                           | Tag-based revalidation (`revalidateTag`)                                                                                        |
| 47  | aria-live                                       | Une seule région globale pour tous les toasts                                                                                   |
| 48  | Toast durée                                     | 4 secondes max                                                                                                                  |
| 49  | WCAG                                            | 2.2 AA volontaire                                                                                                               |
| 50  | Pattern Next.js                                 | Server Components + Server Actions + 1 route handler exception (search)                                                         |
| 51  | **Suppression de compte Loi 25**                | **Anonymisation + suppression données privées**, RPC transactionnelle, confirmation textuelle "SUPPRIMER", `role="alertdialog"` |

---

## 23. Dépendances externes (Loi 25)

**Note importante :** cette spec assume qu'un mécanisme de consentement Loi 25 est en place sur la page d'inscription (`/register`).

**Exigence à ajouter à `/register` (hors scope direct mais bloquant pour le déploiement) :**

- **Case à cocher de consentement** non pré-cochée à l'inscription
- Texte : "J'accepte que mon nom, mon courriel, mon école et mes contributions soient visibles aux autres membres vérifiés de la communauté ÉduQc.IA."
- Lien vers la politique de confidentialité à proximité
- Sans cette case cochée, l'inscription est bloquée

**Retrait du consentement :** dans une plateforme de partage communautaire, le retrait du consentement à l'affichage public équivaut à la **désactivation du compte** (voir §17.4).

Loi 25 n'exige pas de toggles de consentement par champ dans une communauté professionnelle fermée — un consentement global à l'inscription suffit pour les usages déclarés.

---

## 24. Tests et critères d'acceptation

### 24.1 Tests E2E profil

- **Profil propriétaire vs visiteur** : présence/absence des icon buttons crayon
- **Bouton copier courriel** : fonctionne pour les deux modes, déclenche le toast 4s
- **Side Sheet identité** : ouvre, focus initial premier champ, sauvegarde, ferme
- **Side Sheet infos pro** : idem + multi-select MetaPills + diff intelligent vérifié (DB)
- **Ordre dans Side Sheet infos pro** : Niveau → Discipline → Expérience
- **Pluralisation** : labels et compteurs s'adaptent (0/1 = singulier, 2+ = pluriel)
- **Micro-copy états vides infos pro** : 3 messages spécifiques affichés en mode propriétaire
- **Mode visiteur infos pro** : sous-sections vides masquées individuellement
- **Chaînage édition** : lien dans toast de succès, focus retour au crayon de la dernière section éditée
- **Confirmation de sortie** : seulement si modifications, pas si valeurs identiques
- **Timeout 10s** : message s'affiche, bouton réactivé
- **Onglets contributions** : ordre Documents → Tâches → Épreuves, navigation clavier
- **Onglet par défaut** : Documents au chargement
- **Signal "Utilisée X fois"** : visible uniquement sur Tâches, masqué si 0
- **`[Compte désactivé]`** : affiché au lieu de 404

### 24.2 Tests E2E badge notification sidebar

- **3 infos manquantes** : badge "3" visible
- **2 infos manquantes** : badge "2"
- **1 info manquante** : badge "1"
- **0 info manquante** : badge masqué (display: none)
- **Position visuelle** : badge en exposant coin sup. droit du mot "Profil", `translate(70%, -50%)`
- **Lecteur d'écran** : `aria-label="Profil — N informations à compléter"` annoncé
- **Hover** : pas de déplacement du badge
- **Cliquer sur "Profil"** : navigation normale vers la page profil

### 24.3 Tests E2E collaborateurs

- **Carte cliquable** : navigue vers `/profile/[id]`
- **Prefetch hover** : vérifier en network tab que la requête profile est faite au hover
- **Bouton copier** : ne déclenche pas la navigation (`stopPropagation`)
- **Recherche live** : filtre instantané local + sync server + indicateur `isSyncing` visible
- **Recherche désactive scroll infini** : pagination simple en mode recherche
- **Sous-titre dynamique** : passe à "X résultats trouvés pour..." en mode recherche
- **Scroll infini** : Intersection Observer charge le batch suivant, `aria-live` annonce
- **Bouton "Voir plus" fallback** : focusable au clavier, label dynamique
- **MetaPills sur cartes** : niveaux + disciplines visibles ligne 4, absentes si rien rempli
- **Ordre compteurs** : `documents · tâches · épreuves` (et non `tâches · documents · épreuves`)
- **Pluralisation compteurs** : `1 document` vs `8 documents`, etc.
- **Micro-copy 0** : "Aucune contribution pour le moment" si tous compteurs à 0
- **AbortController cleanup** : pas de fuite mémoire au démontage
- **User courant exclu** de la liste
- **Profils désactivés filtrés** (n'apparaissent pas)
- **Grille responsive** : 2 colonnes ≥ 768px, 1 colonne < 768px

### 24.4 Tests E2E suppression de compte

- **Bouton visible uniquement en mode propriétaire** : absent en mode visiteur
- **Modale `role="alertdialog"`** : s'ouvre au clic, bouton suppression désactivé par défaut
- **Champ confirmation** : bouton reste désactivé tant que saisie ≠ "SUPPRIMER" (casse exacte)
- **Post-suppression : profil** affiche "Ce compte a été supprimé."
- **Post-suppression : contributions publiées** toujours visibles, auteur = `[Compte supprimé]`
- **Post-suppression : brouillons** supprimés (count = 0 en DB)
- **Post-suppression : pivot tables** vidées (disciplines, niveaux)
- **Post-suppression : session détruite**, redirect vers `/login`
- **RLS** : la RPC `delete_account_anonymize` échoue si `p_user_id != auth.uid()`

### 24.5 Tests SQL (RLS et performance)

- `profiles_select_authenticated` : un user authentifié peut lire les profils actifs uniquement
- Admin peut lire tous les profils (actifs et désactivés)
- `profiles_update_own` : un user ne peut modifier que son propre profil
- `profile_disciplines_modify_own` : idem pour les pivot tables
- **`fetchProfileOverview` : query unique** (vérifier via `EXPLAIN ANALYZE`, pas de N+1)
- **`fetchProfileTasks` avec usage_count : pas de query par item**
- **Recherche école** : utilise bien l'index trigram (`EXPLAIN` montre `Bitmap Index Scan`)
- **Diff intelligent pivot** : vérifier en log SQL que seules les lignes nécessaires sont DELETE/INSERT
- **`missingProInfoCount`** : calculé correctement (3 si tout vide, 0 si tout rempli)

### 24.5 Tests d'accessibilité

- Navigation clavier complète (Tab, Enter, Escape, ArrowLeft/Right)
- Focus visible sur tous les éléments interactifs
- Lecteur d'écran : annonces correctes (toasts, recherche, scroll infini, chaînage, badge sidebar)
- Contraste : initiales teal/gris ≥ 4.5:1 (clair et sombre)
- Touch targets ≥ 24×24px (on est à 48px+)
- `aria-controls` + `id` cohérents sur les onglets
- Une seule région `aria-live` globale pour les toasts
- `aria-label` enrichi sur badge sidebar avec compte explicite

### 24.6 Tests performance

- Skeleton loading visible pendant le fetch initial (< 100ms perçu)
- `fetchProfileOverview` : 1 seule query SQL exécutée
- `fetchProfileTasks` : 1 seule query SQL exécutée (avec usage_count via LATERAL)
- Recherche locale instantanée (0ms perçu)
- Sync server < 500ms
- Cache server : 2e visite à un profil = pas de query SQL (cache hit)
- Prefetch hover : navigation perçue instantanée

---

## 25. Reportés en V2/V3

- **Optimistic UI** (`useOptimistic`) pour l'édition de profil
- **Cursor pagination** si volumes dépassent quelques milliers
- **Tri "plus contributifs"** sur `/collaborateurs`
- **Tri "plus utilisées"** sur l'onglet Tâches du profil
- **Filtres niveau/discipline** sur `/collaborateurs`
- **Filtres internes aux contributions** d'un profil
- **Section Activité agrégée** sur le profil
- **Signal "Utilisée X fois"** pour documents et épreuves
- **Migration vers une vraie table `schools`** (dette technique documentée — actuellement JSON)
- **Onglets de la section Contributions sticky au scroll** (si profils > 50 contributions par type)

---

## 26. Refusés définitivement

- **Anchor nav / navigation intra-profil** — redondant avec les onglets Contributions, ajoute une couche inutile
- **Compteur de vues du profil** — gamification
- **Jauge de complétion / Completeness meter** — gamification (le badge sidebar est plus discret et factuel)
- **Bio / About / hobbies** — pas un réseau social
- **Avatar upload** — modération photos, complexité inutile
- **Toggles de consentement par champ** — pas exigé par Loi 25
- **Email masqué** (`g***@...`) — décision métier explicite : courriel visible
- **Routes REST partout** — pattern Next.js Server Components/Actions, exception search
- **Mode édition global** — chaînage entre Side Sheets remplit ce besoin
- **Liens d'ancres `#contributions`** dans l'URL
- **Badges sociaux / Mentor IA / Validateur** — gamification
- **Badge "Vérifié @gouv.qc.ca"** — tous les users sont vérifiés, le badge n'a aucune valeur informative
- **UX prédictive avec IA** — hors scope
- **Recherche facettée multi-critères** au MVP
- **Tray overlay mobile** pour filtres
- **Hint clavier Ctrl+K** sur la barre de recherche
- **Grille 3 colonnes** sur `/collaborateurs`
- **Export PDF/CSV des contributions** — feature séparée
- **Type contributeur différent par rôle** — décision métier hors scope
- **Tooltip hover sur badge expérience** — remplacé par `aria-label` enrichi
- **Bouton chaînage dans footer Side Sheet** — le toast est plus naturel
- **Cas mononyme `AvatarInitials`** — nom obligatoire et structuré à l'inscription
- **Seuils sur "Utilisée X fois"** — chiffre exact, masqué si 0, suffit
- **Chips génériques pour niveau/discipline/expérience** — utiliser le composant `MetaPill` existant
- **Inscription qui demande niveau/discipline/expérience** — ces 3 champs sont saisis après l'inscription uniquement
- **Onglet "Infos" dans une nav intra-profil** — la section infos pro est juste au-dessus, c'était redondant

---

## 27. Annexe : reviewers consultés et itérations de proto

### Reviewers (7 passes)

| Reviewer     | Passes | Apport principal                                                          |
| ------------ | ------ | ------------------------------------------------------------------------- |
| **DeepSeek** | ×2     | Cohérence technique, vraies failles internes, incohérences entre sections |
| **ChatGPT**  | ×2     | Pertinence produit, vrais risques UX, optimisations performance           |
| **Copilot**  | ×1     | Contrats techniques, types TypeScript, passage au dev                     |
| **Grok**     | ×2     | Raffinements de surface, validation, finition accessibilité               |
| **Gemini**   | ×1     | Cadre réglementaire (Loi 25, WCAG 2.2 critères spécifiques)               |
| **Mistral**  | ×1     | Aucune valeur ajoutée — résumé sans critique                              |

### Itérations de proto interactif (6)

| Itération | Scope          | Apport                                                                                   |
| --------- | -------------- | ---------------------------------------------------------------------------------------- |
| Proto 1   | Profil v1      | Validation visuelle hero + side sheets + onglets                                         |
| Proto 2   | Profil v2      | Suppression de l'anchor nav (décision majeure)                                           |
| Proto 3   | Profil v3      | Ordre Documents → Tâches → Épreuves + helper pluralize                                   |
| Proto 4   | Profil v4      | MetaPills + ordre Niveau → Discipline + badge sidebar + saisie post-inscription          |
| Proto 5   | Profil v5      | Micro-copy états vides spécifiques par champ                                             |
| Proto 6   | Badge sidebar  | 4 itérations CSS pour positionnement final (`translate(70%, -50%)`)                      |
| Proto 7   | Collaborateurs | Validation visuelle cartes 4 lignes, recherche hybride, MetaPills, cohérence avec profil |

**Bilan : 7 passes de revue + 6 itérations proto + 50 décisions tranchées + 30 propositions refusées avec arguments + ~40 corrections intégrées.**

**Validation finale : ✅ prête pour le développement.**
