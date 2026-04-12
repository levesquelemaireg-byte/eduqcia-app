# ÉduQc.IA — Instructions Claude Code

## Lire avant toute session

Ordre minimal obligatoire :

1. `docs/DECISIONS.md` — règles normatives, protocoles, icônes, terminologie
2. `docs/UI-COPY.md` — registre des textes visibles (source de vérité copy)
3. `docs/FEATURES.md` — règles métier TAÉ, OI, comportements, banque, épreuves
4. `docs/ARCHITECTURE.md` — stack, routes, schéma SQL, RPC, déploiement
5. `docs/DESIGN-SYSTEM.md` — tokens, composants, formulaires (checklist)
6. `docs/BACKLOG.md` — état du produit, dette technique, anti-dette
7. `docs/WORKFLOWS.md` — wizard, stepper, blocs, impression, édition

---

## Arbitrages en cas de conflit

- Copy UI → `docs/UI-COPY.md` gagne
- Règle / icône / protocole → `docs/DECISIONS.md` gagne
- Architecture / dossier → `docs/ARCHITECTURE.md` gagne
- Doute sur une décision → **demander au développeur, ne rien inventer**

---

## Règles absolues projet — ne jamais enfreindre

### Fichiers docs/

Ne jamais modifier un fichier `docs/` de sa propre initiative. Exception : une demande de livraison explicite autorise les mises à jour listées dans le tableau de `docs/BACKLOG.md` pour ce lot uniquement. Ne jamais éditer les fichiers `docs/` avec des scripts Node.js ou des opérations find/replace en ligne de commande — les éditer directement comme des fichiers texte.

### Copy UI

- Tout texte visible vient exclusivement de `docs/UI-COPY.md` et `lib/ui/ui-copy.ts`
- Copy absente → ne pas inventer, **demander au développeur** le libellé exact
- Ne jamais fusionner, découper ou réécrire partiellement une entrée du registre sans validation
- Placeholders : `{{user_name}}`, `{{date}}`, `{{discipline}}`, `{{niveau}}`, `{{oi}}`, `{{comportement}}`

### Terminologie — acronymes interdits en UI

| Interdit                      | Forme officielle                      |
| ----------------------------- | ------------------------------------- |
| OI                            | Opération intellectuelle              |
| TAÉ                           | Tâche d'apprentissage et d'évaluation |
| CD                            | Compétence disciplinaire              |
| HEC / HQC                     | Formes longues complètes              |
| Preview / Aperçu (formulaire) | Sommaire                              |
| Sous-opération                | Comportement attendu                  |
| Bibliothèque / Répertoire     | Banque collaborative                  |
| 5 blocs                       | 7 étapes                              |

### Données JSON `public/data/`

`oi.json`, `grilles-evaluation.json`, `hec-cd.json`, `hec-sec1-2.json`, `hqc-cd.json`, `hqc-sec3-4.json`, `css.json`, `css-ecoles.json` sont des **référentiels immuables**. Pas de reformulation, traduction ou correction des énoncés pédagogiques officiels.

### Ce qu'on ne fait jamais sans demander au développeur

- Créer une nouvelle route
- Modifier le schéma Supabase
- Ajouter une dépendance npm
- Changer la structure des dossiers
- Écrire de la copy UI non listée dans `docs/UI-COPY.md`
- Renommer un composant ou une constante existante

---

## Standards Next.js App Router — best practices

### Modèle mental fondamental : Server-first

```
Règle d'or : tout est Server Component par défaut.
'use client' = exception justifiée, pas une habitude.
```

**Quand `'use client'` est légitime :**

- Interactivité locale (`useState`, `useEffect`, event handlers)
- Accès aux APIs navigateur (`window`, `localStorage`, `IntersectionObserver`)
- Bibliothèques tierces qui requièrent le client (TipTap, certains charts)

**Jamais `'use client'` pour :**

- Fetch de données (utiliser Server Components ou Server Actions)
- Validation (faire les deux : Zod client ET serveur)
- Formatage / helpers purs (les déplacer dans `lib/`)

### Data fetching — patterns corrects

```typescript
// ✅ Server Component : fetch direct, pas de useEffect
export default async function Page() {
  const data = await getMyData() // lib/queries/
  return <Component data={data} />
}

// ✅ Parallel fetching — éviter les waterfalls
const [tae, documents, grilles] = await Promise.all([
  getTae(id),
  getDocuments(id),
  getGrilles(),
])

// ✅ Suspense boundaries pour les parties lentes
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>

// ❌ Anti-pattern : fetch dans useEffect
useEffect(() => { fetch('/api/...').then(...) }, []) // jamais
```

### Server Actions — pattern sécurisé et typé

```typescript
// lib/actions/exemple.ts
"use server";

import { z } from "zod";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";

// 1. Schema Zod strict — toujours valider côté serveur
const Schema = z.object({
  titre: z.string().min(1).max(200),
  niveau_id: z.coerce.number().int().positive(),
});

// 2. Return type explicite — jamais de throw non géré
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function monAction(formData: unknown): Promise<ActionResult<{ id: string }>> {
  // 3. Auth vérifiée en premier — toujours
  const user = await requireActiveAppUser();

  // 4. Validation typée
  const parsed = Schema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Données invalides." };
  }

  // 5. Logique métier isolée dans lib/
  try {
    const result = await createSomething(user.id, parsed.data);
    return { success: true, data: result };
  } catch (err) {
    console.error("[monAction]", err);
    return { success: false, error: "Erreur serveur. Réessayez." };
  }
}
```

**Règles Server Actions :**

- Auth vérifiée en premier, toujours — `requireActiveAppUser()`
- Zod `safeParse` côté serveur même si validation client existe
- Return type explicite `ActionResult<T>` — pas de throw non capturé
- Logique métier dans `lib/`, pas dans l'action elle-même
- Jamais de `revalidatePath('/')` global — cibler précisément

### Caching et revalidation

```typescript
// ✅ Cache fonction pure (Next.js cache)
import { cache } from "react";
export const getOiList = cache(async () => {
  // appelé une seule fois par requête, même si plusieurs composants l'importent
  return fetchOiFromJson();
});

// ✅ Revalidation ciblée après mutation
import { revalidatePath, revalidateTag } from "next/cache";
revalidatePath("/questions/[id]", "page"); // page précise
revalidateTag("tae-list"); // tag groupé

// ✅ fetch avec tags pour invalidation groupée
const data = await fetch("/api/...", {
  next: { tags: ["tae-list"], revalidate: 3600 },
});
```

### Route handlers — uniquement si Server Actions ne suffisent pas

Server Actions couvrent 95% des cas. Route handlers (`app/api/`) pour :

- Webhooks (Stripe, services tiers)
- Export PDF / fichiers binaires
- Endpoints consommés par des clients externes

---

## Standards TypeScript strict — best practices

### Types : précision maximale, zéro fuite

```typescript
// ✅ Discriminated unions pour les états — pas de booleans parallèles
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

// ❌ Anti-pattern : booleans parallèles
// const [isLoading, setIsLoading] = useState(false)
// const [error, setError] = useState<string | null>(null)
// const [data, setData] = useState<T | null>(null)

// ✅ satisfies : valide sans élargir le type inféré
const ICON_MAP = {
  consigne: 'quiz',
  guidage: 'tooltip_2',
  corrige: 'task_alt',
} satisfies Record<string, string>

// ✅ Branded types pour les IDs — éviter les confusions uuid/uuid
type TaeId = string & { readonly _brand: 'TaeId' }
type DocumentId = string & { readonly _brand: 'DocumentId' }

// ✅ const assertions pour les littéraux
const NIVEAUX = ['sec1', 'sec2', 'sec3', 'sec4'] as const
type Niveau = typeof NIVEAUX[number]

// ✅ Exhaustivité sur les unions
function assertNever(x: never): never {
  throw new Error(`Cas non géré : ${JSON.stringify(x)}`)
}
// Utiliser dans les switch/if pour garantir l'exhaustivité

// ❌ Jamais
any
as unknown as T   // double cast = red flag
// @ts-ignore     // commenter POURQUOI si absolument nécessaire
```

### Zod — patterns avancés

```typescript
// ✅ Schéma réutilisable avec transformation
const NiveauIdSchema = z.coerce.number().int().min(1).max(4);

// ✅ Refine pour validation métier
const DocumentSchema = z
  .object({
    titre: z.string().min(1, "Titre requis").max(200),
    type: z.enum(["textuel", "iconographique"]),
    source_type: z.enum(["primaire", "secondaire"]),
    image_legende: z.string().max(500).optional(),
  })
  .refine((d) => d.type === "textuel" || d.image_legende !== undefined || true, {
    message: "Légende requise pour document iconographique",
    path: ["image_legende"],
  });

// ✅ Inférer les types depuis Zod — une seule source de vérité
type Document = z.infer<typeof DocumentSchema>;

// ✅ Partial pour les updates
const DocumentUpdateSchema = DocumentSchema.partial();
```

### Gestion d'erreurs — pattern Result

```typescript
// lib/utils/result.ts
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E = string>(error: E): Result<never, E> => ({ ok: false, error });

// Usage dans lib/ — pas de try/catch partout dans les composants
async function publishTae(payload: TaePayload): Promise<Result<string>> {
  const { data, error } = await supabase.rpc("publish_tae_transaction", { p_payload: payload });
  if (error) return err(normalizeRpcError(error));
  return ok(data);
}
```

---

## Standards Supabase — best practices

### Clients : règle absolue

```typescript
// ✅ Server Component / Server Action / Route Handler
import { createServerClient } from "@/lib/supabase/server";
const supabase = await createServerClient();

// ✅ Client Component (rare — lecture temps réel uniquement)
import { createBrowserClient } from "@/lib/supabase/client";

// ❌ Jamais service_role côté client
// ❌ Jamais createServerClient() dans un Client Component
// ❌ Jamais d'appel Supabase direct dans un composant — passer par lib/queries/ ou lib/actions/
```

### Queries — patterns typés et sécurisés

```typescript
// lib/queries/tae.ts

// ✅ Toujours typer le retour depuis database.types.ts
import type { Database } from "@/lib/types/database";
type TaeRow = Database["public"]["Tables"]["tae"]["Row"];

// ✅ Sélection explicite des colonnes — jamais select('*') en prod
const { data, error } = await supabase
  .from("tae")
  .select("id, consigne, is_published, created_at, auteur_id")
  .eq("auteur_id", userId)
  .order("created_at", { ascending: false });

// ✅ Vérifier l'erreur avant d'utiliser data
if (error)
  throw (
    new Error(`[getTaeList] ${error.message}`)

      // ✅ Pagination cursor-based (scalable) plutôt qu'offset
      .range(cursor, cursor + PAGE_SIZE - 1)
  ); // offset OK pour petits volumes
// Pour volumes > 10k lignes : keyset pagination sur created_at + id

// ✅ RLS comme seule ligne de défense — jamais filtrer côté app seulement
// La query échoue ou retourne vide si RLS bloque — c'est voulu

// ✅ Transactions complexes → RPC (déjà en place : publish_tae_transaction, etc.)
```

### Mutations — via Server Actions uniquement

```typescript
// ❌ Jamais depuis un Client Component
const { error } = await supabase.from('tae').insert(...)  // dans un composant

// ✅ Server Action → lib/queries/ ou RPC directement
'use server'
const supabase = await createServerClient()
const { error } = await supabase.rpc('publish_tae_transaction', { p_payload })
```

### Migrations — discipline stricte

```
Workflow obligatoire pour tout changement schéma :
1. Modifier supabase/schema.sql (source de vérité)
2. Créer supabase/migrations/YYYYMMDDHHMMSS_description.sql
3. Appliquer sur Supabase (SQL Editor ou supabase db push)
4. npm run gen:types → lib/types/database.ts
5. npm run ci
6. Mettre à jour docs/ARCHITECTURE.md
```

---

## Architecture React — composants scalables

### Hiérarchie de responsabilité

```
Page (app/)
  └── Layout Components (components/layout/)
        └── Feature Components (components/tae/, components/documents/, etc.)
              └── UI Primitives (components/ui/)
                    └── Fonctions pures (lib/)
```

**Règle de dépendance :** les couches ne dépendent que des couches inférieures. Un composant `ui/` ne connaît pas `tae/`. Une primitive ne connaît pas les règles métier.

### Taille et découpage

```typescript
// Repères de découpage :
// > 200 lignes → signal de découpage
// > 3 responsabilités dans un fichier → extraire
// > 3 props booléennes → discriminated union ou sous-composants
// > 5 useState dans un composant → custom hook

// ✅ Custom hook pour isoler la logique
function useCollaborateurSearch(currentUserId: string) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [state, setState] = useState<AsyncState<Profile[]>>({ status: 'idle' })
  // ...logique isolée, testable
  return { query, setQuery, results, state }
}

// ✅ Composant = présentation + handlers minces seulement
function CollaborateurSearchField({ currentUserId }: Props) {
  const { query, setQuery, results, state } = useCollaborateurSearch(currentUserId)
  return (/* JSX pur */)
}
```

### Props — design défensif

```typescript
// ✅ Props exhaustives avec types discriminés
type DocumentSlotProps =
  | { status: "empty"; onAdd: () => void }
  | { status: "loading" }
  | { status: "filled"; document: DocumentData; onRemove: () => void };

// ✅ Éviter les prop drilling > 2 niveaux → Context ou composition
// Context existant : WizardSessionContext — réutiliser avant d'en créer un nouveau

// ✅ children composition plutôt que render props complexes
// ✅ Ref forwarding sur les primitives ui/ qui wrappent des éléments HTML natifs
```

### Mémoïsation — règles d'application

```typescript
// Mémoïser SEULEMENT si :
// 1. Le composant est expensive à rendre (listes longues, grilles)
// 2. Les props sont stables (référentiellement)
// 3. Profilage Profiler confirme un problème réel

// ✅ React.memo pour les lignes de liste avec props stables
const TaeCard = React.memo(function TaeCard({ tae }: { tae: TaeData }) {
  return (/* ... */)
})

// ✅ useMemo pour les calculs coûteux
const filteredTaes = useMemo(
  () => taes.filter(filterFn),
  [taes, filterFn]  // dépendances précises
)

// ✅ useCallback pour les handlers passés à des enfants mémoïsés
const handleRemove = useCallback((id: string) => {
  dispatch({ type: 'REMOVE_CONNAISSANCE', id })
}, [dispatch])

// ❌ Ne pas mémoïser systématiquement — overhead réel si mal utilisé
```

---

## Patterns d'état — wizard et formulaires complexes

### Reducer pattern pour les états complexes (déjà en place)

```typescript
// ✅ Pattern existant à respecter : tae-form-reducer.ts
// Actions typées exhaustivement
type WizardAction =
  | { type: "SET_NIVEAU"; niveau: Niveau }
  | { type: "SET_COMPORTEMENT"; comportement: Comportement }
  | { type: "SET_GUIDAGE"; guidage: string };
// ... toutes les actions

// Reducer pur — facilement testable
function taeFormReducer(state: FormState, action: WizardAction): FormState {
  switch (action.type) {
    case "SET_COMPORTEMENT":
      return {
        ...state,
        blueprint: { ...state.blueprint, comportement: action.comportement },
        redaction: { ...state.redaction, guidage: "" }, // reset guidage — règle métier
      };
    // ...
    default:
      return assertNever(action); // exhaustivité garantie
  }
}
```

### FormState — source unique de vérité

```
Règle absolue : FormState (wizard) est la seule source de vérité.
Jamais de useState parallèles pour la même donnée.
Jamais de state local qui duplique FormState.
La colonne sommaire (FicheSommaireColumn) dérive de FormState via formStateToTae().
```

### React Hook Form — patterns corrects

```typescript
// ✅ Controller pour les composants custom (ListboxField, RichTextEditor, etc.)
<Controller
  name="niveau_id"
  control={control}
  render={({ field, fieldState }) => (
    <ListboxField
      {...field}
      error={fieldState.error?.message}
    />
  )}
/>

// ✅ mode: 'onBlur' par défaut — validation à la sortie du champ
const form = useForm({
  resolver: zodResolver(Schema),
  mode: 'onBlur',
  defaultValues: { ... }
})

// ✅ trigger() explicite pour la validation par étape (wizard document)
const isValid = await trigger(['titre', 'type', 'source_type'])
if (!isValid) return

// ✅ reset() après succès — éviter des données périmées
form.reset(defaultValues)
```

---

## Performance — patterns concrets

### Dynamic imports pour les composants lourds

```typescript
// ✅ TipTap, grilles complexes, modales rarement ouvertes
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  {
    loading: () => <div className="h-32 animate-pulse bg-panel rounded-md" />,
    ssr: false, // TipTap requiert le navigateur
  }
)

const GrilleEvalTable = dynamic(
  () => import('@/components/tae/grilles/GrilleEvalTable'),
  { loading: () => <GrilleSkeleton /> }
)
```

### Images

```typescript
// ✅ Next.js Image pour toutes les images servies par l'app
import Image from 'next/image'
<Image
  src={document.image_url}
  alt={document.titre}
  width={660}
  height={400}
  className="object-contain"
/>

// ✅ Redimensionnement Sharp déjà en place (lib/images/) — ne pas contourner
// Boîte max 660×400px, sans agrandissement
```

### Bundle — règles

```typescript
// ✅ Imports nommés depuis les packages (tree-shaking)
import { formatDate } from "date-fns"; // ✅
import dateFns from "date-fns"; // ❌ importe tout

// ✅ Barrel exports dans lib/ — mais éviter les index.ts trop larges
// Si un barrel importe tout le module, les dynamic imports ne fonctionnent plus

// ✅ Vérifier le bundle avant merge si ajout d'une dépendance lourde
// next build → .next/analyze (si @next/bundle-analyzer configuré)
```

---

## Accessibilité (a11y) — standards WCAG 2.1 AA

```typescript
// ✅ Sémantique HTML correcte — priorité aux éléments natifs
<button>       // pas <div onClick>
<nav>          // pas <div className="nav">
<main>         // une seule par page
<h1> → <h6>   // hiérarchie stricte, jamais sauter un niveau

// ✅ Labels explicites sur tous les contrôles
<label htmlFor="niveau">Niveau scolaire <RequiredMark /></label>
<select id="niveau" aria-describedby="niveau-hint" />
<p id="niveau-hint">...</p>

// ✅ aria-live pour les mises à jour dynamiques (toasts, erreurs)
<div aria-live="polite" aria-atomic="true">{message}</div>

// ✅ Focus management dans les modales
// SimpleModal gère déjà le focus trap — ne pas contourner

// ✅ Textes alternatifs significatifs
<Image alt="Carte de l'Amérique du Nord en 1763" />  // ✅ descriptif
<Image alt="image" />                                  // ❌

// ✅ Ratio de contraste : 4.5:1 minimum (corps), 3:1 (grands textes)
// Les tokens CSS du projet sont calibrés — ne pas introduire de valeurs hors tokens

// ✅ Pas de dépendance à la couleur seule pour véhiculer une information
// Toujours icône + texte OU couleur + motif/forme

// ✅ Curseurs : tout bouton activable → cursor: pointer (déjà dans globals.css)
// États désactivés → cursor: not-allowed + aria-disabled="true"
```

---

## Sécurité — règles non négociables

```typescript
// ✅ RLS Supabase = seule ligne de défense côté données
// Ne jamais supposer que le filtrage côté app est suffisant
// Tester les politiques avec deux comptes distincts (RLS-CHECKLIST.md)

// ✅ Validation des inputs côté serveur — toujours, même si validé côté client
// Zod safeParse dans chaque Server Action

// ✅ Variables d'environnement
NEXT_PUBLIC_ * // côté client — jamais de secrets
  SUPABASE_SERVICE_ROLE_KEY; // serveur uniquement, jamais dans un Client Component

// ✅ sanitisation HTML — TipTap génère du HTML contrôlé
// Pour afficher du HTML externe : DOMPurify ou équivalent
// PrintableHtml existant : vérifier qu'il sanitise bien les inputs

// ✅ Pas de eval(), new Function(), dangerouslySetInnerHTML non contrôlé

// ✅ CSRF : Server Actions Next.js sont protégées nativement (origin check)
// Route handlers custom : vérifier l'origine si exposés publiquement
```

---

## Testing — stratégie

### Pyramide de tests

```
         /\
        /E2E\          Playwright — parcours critiques (grilles, RLS)
       /------\
      /  Intég. \      Vitest — Server Actions + queries Supabase
     /------------\
    /   Unitaires  \   Vitest — fonctions pures lib/, reducers, helpers
   /________________\
```

### Tests unitaires — ce qui DOIT être testé

```typescript
// ✅ Fonctions pures lib/ — toujours testables sans mock
// lib/tae/*.test.ts déjà en place — continuer ce pattern

// Priorité haute :
// - tae-form-reducer.ts (logique critique du wizard)
// - consigne-helpers.ts (transformations affichage)
// - publish-tae-payload.ts (construction payload RPC)
// - connaissances-helpers.ts (filtrage Miller)
// - document-annee.ts (extraction année, OI1)
// - ordre-chronologique-*.ts (génération options)

// Pattern de test :
import { describe, it, expect } from "vitest";
import { taeFormReducer } from "@/lib/tae/tae-form-reducer";

describe("SET_COMPORTEMENT", () => {
  it("remet guidage à vide lors du changement de comportement", () => {
    const state = { ...initialState, redaction: { guidage: "texte existant" } };
    const next = taeFormReducer(state, {
      type: "SET_COMPORTEMENT",
      comportement: mockComportement,
    });
    expect(next.redaction.guidage).toBe("");
  });
});
```

### Tests E2E Playwright — ce qui est déjà en place

```
tests/e2e/eval-grids.spec.ts  — grilles pixel-perfect (garder les baselines win32)
```

**Parcours à couvrir en priorité :**

- Publication d'une TAÉ complète (happy path)
- Blocage RLS : un enseignant ne peut pas voir les brouillons d'un autre
- Wizard document : création + apparition en banque

---

## Structure du projet (repères clés)

```
app/
  (auth)/          # login, register, activate
  (app)/           # shell connecté — dashboard, questions, bank, evaluations, profile
  (print)/         # routes impression hors AppShell
components/
  ui/              # primitives : Button, Field, ListboxField, SimpleModal, RichTextEditor…
  layout/          # AppShell, Sidebar
  tae/             # TaeForm (wizard), FicheTache, grilles, print, non-redaction
  documents/       # AutonomousDocumentWizard, étapes, aperçu
  evaluations/     # EvaluationCompositionEditor
  bank/            # BankTasksPanel, BankDocumentsPanel, BankEvaluationsPanel
  wizard/          # WizardStepper (partagé)
lib/
  actions/         # Server Actions — auth vérifiée en premier, Zod safeParse, Result<T>
  queries/         # lectures Supabase — select explicite, pas de select('*')
  tae/             # helpers métier, publish, hydrate, print, non-redaction
  ui/              # ui-copy.ts, colon.ts, fichiers copy dédiés
  schemas/         # Zod — source de vérité des types de formulaire
  types/           # TypeScript — database.ts généré, types métier
  utils/           # cn(), result.ts, helpers purs
public/data/       # JSON référentiels — immuables
supabase/
  schema.sql       # source de vérité SQL canonique
  migrations/      # SQL incrémental daté YYYYMMDDHHMMSS
```

---

## Wizard TAÉ — 7 étapes (ordre immuable)

1. Auteur(s) — seul ou équipe, recherche profils actifs (`profiles.status = active`)
2. Paramètres — niveau, discipline, OI, comportement, espace de production (lecture seule depuis `oi.json`)
3. Consigne et guidage complémentaire — consigne TipTap (ou template perspectives), guidage
4. Documents historiques — slots doc_A à doc_D selon `nb_documents` (immuable)
5. Corrigé et options — corrigé rédactionnel, séquences NR, intrus perspectives
6. Compétence disciplinaire — Miller 3 niveaux
7. Connaissances relatives — Miller multi-sélection, 3 ou 4 niveaux (HEC vs HQC)

`nb_documents` est figé par le comportement attendu — retour au Bloc 2 pour changer.

---

## Icônes Material Symbols — mapping clé

| Concept                    | Glyphe                                           |
| -------------------------- | ------------------------------------------------ |
| Consigne                   | `quiz`                                           |
| Guidage                    | `tooltip_2`                                      |
| Corrigé                    | `task_alt`                                       |
| Niveau                     | `school`                                         |
| Discipline                 | `menu_book`                                      |
| Opération intellectuelle   | `psychology`                                     |
| Comportement / grille      | `table`                                          |
| Nombre de lignes           | `format_line_spacing`                            |
| Documents                  | `article`                                        |
| Compétence disciplinaire   | `license`                                        |
| Connaissances              | `lightbulb`                                      |
| Documentation légale       | `gavel` (exclusif — composant `LegalNoticeIcon`) |
| Valeur auto-générée        | `settings`                                       |
| Création document (navbar) | `add_notes`                                      |

Pas d'icône devant le **titre d'étape** (`<h2>`) dans le wizard.

---

## Composants — règles anti-spaghetti

- Une responsabilité par fichier ; PascalCase ; props typées
- ≤ ~200 lignes ; au-delà → hook ou sous-composant
- ≥ 3 responsabilités mélangées → extraire
- Pas de god component ; pas de duplication de schémas Zod / types existants
- Provisoire → `PROVISOIRE — …` + référence spec

### Règle de scalabilité — extraction immédiate des patterns visuels

**Dès la PREMIÈRE occurrence** d'un pattern visuel (bannière, badge, indicateur, état, feedback, etc.), l'extraire dans un composant réutilisable dans `components/ui/`. Ne jamais écrire du JSX inline pour un pattern qui a vocation à être réutilisé, même si on ne voit qu'un seul usage immédiat.

**Pourquoi** : si le design change, l'enseignant ou le développeur doit pouvoir modifier l'apparence **à un seul endroit** et que tout le projet suive. Du JSX inline copié-collé crée de la dette invisible qui explose au prochain changement de design.

**Comment décider** : si le bloc JSX contient une icône + du texte + un style spécifique (couleur, layout, taille) et qu'il représente un **concept UI** (avertissement, statut, compteur, badge, etc.), c'est un composant — pas du JSX inline.

**En cas de doute** : demander au développeur « est-ce que je dois extraire ce pattern en composant réutilisable ? » plutôt que de le laisser inline.

**Exemples existants** : `InlineWarning` (bannières d'avertissement), `LimitCounterPill` (compteurs de limite), `RequiredMark` (astérisque champ obligatoire). Chacun vit dans un seul fichier et est documenté dans `DESIGN-SYSTEM.md`.

---

## Formulaires — contrat du dépôt

Lire `docs/DESIGN-SYSTEM.md` section **Formulaires** avant tout code de formulaire.

Checklist avant merge :

- [ ] `htmlFor` lié à `id` sur chaque contrôle
- [ ] Focus visible (`globals.css`, `.auth-input`)
- [ ] `aria-invalid` + `aria-describedby` sur les erreurs
- [ ] Submit désactivé pendant soumission
- [ ] Pas de double soumission
- [ ] Validation Zod côté serveur — toujours
- [ ] Erreurs inline sous le champ ; globales en toast
- [ ] `autoComplete` et bons `type`
- [ ] Hauteur tactile 44px minimum (`min-h-11`)
- [ ] Parcours clavier testé
- [ ] Responsive < 768px
- [ ] Pas de `<select>` natif — `ListboxField`
- [ ] Champs obligatoires : `RequiredMark` (astérisque `text-error`)
- [ ] Libellés sans `*` dans le texte

---

## CSS & styles

- Tailwind + tokens — jamais de couleur en dur, jamais `gray-*` génériques
- `cn()` depuis `lib/utils/cn.ts` pour toute fusion de classes
- Valeurs arbitraires `text-[…]` : dernier recours documenté
- Pas de classes dynamiques construites par string concatenation (casse le scan Tailwind)
- Deux-points UI : espace avant et après `:` — `lib/ui/colon.ts`

### Co-localisation des styles — obligatoire

- `globals.css` est réservé aux tokens globaux (`:root`), resets (`html`, `body`, `input`, `button`), utilitaires génériques (3+ composants non liés), et règles `@media print` globales. Jamais de styles spécifiques à un composant dans `globals.css`.
- Styles de composant → Tailwind dans le JSX (préféré) ou CSS module co-localisé si complexité l'exige (container queries, pseudo-éléments, animations).
- Avant d'ajouter une ligne dans `globals.css`, se demander : « est-ce que ce style est utilisé par plus de 3 composants non liés ? » Si non → dans le composant.
- Avant de modifier un style existant, vérifier si le pattern visuel existe à plusieurs endroits. Si oui, centraliser dans un composant réutilisable d'abord, modifier ensuite.

---

## Obligation — documentation de progression

**Déclencheur :** tout changement qui touche comportement utilisateur, route, données, copy UI, exploitation, convention de dossiers.

| Après quoi ?                       | Mettre à jour                                                 |
| ---------------------------------- | ------------------------------------------------------------- |
| Feature visible                    | `docs/BACKLOG.md` + `docs/BACKLOG-HISTORY.md` (ligne en tête) |
| Copy UI                            | `docs/UI-COPY.md` + `lib/ui/ui-copy.ts`                       |
| Règle / icône / protocole          | `docs/DECISIONS.md`                                           |
| Règle métier ou parcours           | `docs/FEATURES.md` / `docs/WORKFLOWS.md`                      |
| SQL / RPC / migrations / structure | `docs/ARCHITECTURE.md`                                        |
| Nouvelle racine de doc             | `docs/README.md`                                              |

**Interdit :** laisser des lignes BACKLOG fausses (feature livrée encore décrite comme « à venir »).

---

## Checklist avant livraison

- `npm run build` — zéro erreur
- `npm run format:check` — zéro erreur
- `npm run lint` — zéro erreur ESLint
- `npm run ci` — pipeline complet avant merge
- Zéro `console.log` de debug
- Zéro copy inventée
- Zéro `any` TypeScript
- Documentation de progression complète
- RLS non contournée — tester avec deux comptes si la feature touche les données

---

## Design frontend — jugement esthétique ÉduQc.IA

### Identité visuelle — ce que l'app EST

ÉduQc.IA est un outil professionnel pour enseignants du secondaire québécois. Le ton juste est **éditorial sobre et chaleureux** — ni corporate froid, ni app grand public colorée. L'enseignant doit sentir qu'il travaille dans un espace sérieux, efficace, et agréable à habiter au quotidien.

Direction esthétique : **minimalisme éditorial structuré** — comme une publication pédagogique haut de gamme, pas un dashboard SaaS générique.

### Typographie — déjà établie, à exploiter à fond

La police **Manrope** (400–800) est choisie et non négociable. C'est une police géométrique humaniste avec du caractère — l'exploiter pleinement :

```css
/* Hiérarchie à respecter et amplifier */
font-weight: 800  /* Titres de page, chiffres clés, accroches */
font-weight: 700  /* Titres de section, labels importants */
font-weight: 600  /* Sous-titres, boutons CTA */
font-weight: 500  /* Corps standard, labels formulaire */
font-weight: 400  /* Texte secondaire, hints, métadonnées */

/* Taille de base : 112.5% (≈18px) — ne pas descendre sous 14px en UI */
/* leading-normal: 1.375 — plus serré que Tailwind par défaut, intentionnel */
```

**Jamais** : Arial pour l'UI (réservé aux grilles ministérielles print), Inter, Roboto, system-ui dans les composants.

### Couleurs — tokens existants, hiérarchie forte

```css
/* Palette du projet — à utiliser avec intention */
--color-accent    /* Teal — point focal, CTA primaires, états actifs */
--color-deep      /* Texte principal — profond, pas noir pur */
--color-surface   /* Fonds de cartes et panneaux */
--color-bg        /* Fond général de l'app */
--color-panel     /* Panneaux formulaire, colonnes */
--color-muted     /* Texte secondaire, placeholders, inactifs */
--color-success   /* Validé, publié, complété */
--color-warning   /* Attention, avertissement */
--color-error     /* Erreur, requis manquant */
--color-border    /* Séparateurs, contours discrets */
```

**Principe hiérarchie couleur :**

- Une couleur dominante par écran (`--color-surface` ou `--color-bg`)
- L'accent teal réservé aux éléments d'action et de focus — pas décoratif
- Jamais de couleur en dur — toujours les tokens
- Contraste minimum 4.5:1 corps, 3:1 grands textes (WCAG AA)

### Espacement et composition — ce qui distingue le bon design

```
Règle d'or : générosité là où l'œil se pose, densité là où on travaille.

Pages principales (dashboard, banque) : espace généreux, respiration
Wizard formulaire : densité contrôlée, information accessible sans scroll excessif
Impression : géométrie précise — Letter portrait, marges 2cm, variables --tae-print-*
```

**Grille et alignement :**

- Utiliser les gaps et paddings des tokens (`--space-1` à `--space-8`)
- Préférer les grilles CSS pour les layouts complexes (déjà en place : docsGrid, split wizard)
- Alignement optique des icônes avec le texte : `margin-top: 0.125em` sur `.icon-lead` — déjà dans `globals.css`, ne pas contourner

**Ce qui donne du caractère sans briser les conventions :**

- Filets fins (`0.5px`, `1px`) plutôt que borders épaisses
- Ombres subtiles pour la profondeur (`--wizard-preview-card-shadow`)
- Arrondis cohérents : `rounded-md` sur les panneaux (moins arrondi = plus éditorial)
- Fonds de canevas distincts du contenu (ex. `.tae-wizard-preview-canvas` gris moyen)

### Animations et micro-interactions — sobres et purposeful

```css
/* Principe : une animation doit avoir une raison fonctionnelle */
/* Durées recommandées */
--duration-fast: 150ms /* Hover, focus, toggle */ --duration-normal: 250ms
  /* Apparition d'éléments, transitions d'état */ --duration-slow: 400ms
  /* Modales, panneaux, chargements */ /* Easing recommandé */ ease-out /* Éléments qui entrent */
  ease-in /* Éléments qui sortent */ ease-in-out /* Transitions bidirectionnelles */;
```

**Ce qui est approprié pour ÉduQc.IA :**

- Transitions d'état sur les pastilles du stepper (complété → actif → à venir)
- Apparition douce des toasts (`opacity` + `translateY`)
- Hover sur les cartes de la banque (`box-shadow` subtil, pas de scale)
- Focus ring animé sur les contrôles clés
- Spinner `progress_activity` + `animate-spin` pendant les soumissions

**Ce qui est interdit :**

- Animations de page entière ou de layout
- Parallax, effets 3D, rotations décoratives
- `transition: all` (trop large, imprévisible)
- Animations qui bloquent l'interaction ou réduisent l'accessibilité (`prefers-reduced-motion` à respecter)

```css
/* Toujours respecter prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Nouveaux écrans — processus de design avant de coder

Avant d'écrire une ligne de JSX pour un nouvel écran ou composant :

1. **Identifier le rôle** — Est-ce une page de travail (wizard, formulaire) ou de découverte (banque, dashboard) ?
2. **Choisir la densité** — Travail = dense et structuré. Découverte = aéré et scannable.
3. **Identifier le point focal** — Un seul élément doit attirer l'œil en premier (CTA, titre, donnée clé).
4. **Vérifier la cohérence** — L'écran ressemble-t-il aux autres pages de l'app ? Mêmes espacements, même hiérarchie typographique.
5. **Tester mentalement le parcours clavier** — Tab → contrôle logique suivant, Escape → fermer les modales.

### Ce qu'on ne fait jamais

- Introduire une police autre que Manrope dans l'UI (Arial = print grilles uniquement)
- Utiliser des couleurs hors tokens
- Copier des patterns génériques de UI kits sans les adapter au ton ÉduQc.IA
- Ajouter des animations décoratives non purposeful
- Créer un nouveau composant visuel sans vérifier si une primitive `components/ui/` couvre déjà le besoin
- Utiliser `<select>` natif (toujours `ListboxField`)
- Icône Material Symbols autre que Outlined
- Icône devant le titre d'étape du wizard (`<h2>`)

### Alignement icône + texte — règle unique

Chaque fois qu'une icône Material Symbols apparaît à côté d'un texte, utiliser UN SEUL pattern. Pas de `vertical-align` ad hoc, pas de `margin-top` au pif, pas de padding pour compenser.

```tsx
// Icône + texte sur une même ligne (labels, boutons, liens, badges)
<span className="inline-flex items-center gap-[0.35em]">
  <span className="material-symbols-outlined text-[1em] leading-none">icon_name</span>
  Texte à côté
</span>
```

**Les règles :**

- Toujours `inline-flex items-center` sur le conteneur — jamais d'alignement au doigt mouillé
- Gap en `em` (pas en `px`) pour que l'espacement scale avec la taille du texte : `gap-[0.35em]`
- L'icône a `text-[1em] leading-none` — elle prend la taille du texte ambiant, pas une taille fixe arbitraire
- Si l'icône doit être plus grande que le texte, utiliser `text-[1.2em]` ou `text-[1.5em]` — toujours relatif, jamais de `px`
- Si le texte est multi-lignes et que l'icône doit s'aligner avec la première ligne : remplacer `items-center` par `items-start` et ajouter `mt-[0.125em]` sur l'icône
- Les patterns `.icon-text`, `.icon-lead`, `.icon-text-block` existent déjà dans `globals.css` — les utiliser OU utiliser le pattern Tailwind inline ci-dessus, mais ne jamais inventer un troisième approach

**Ce qu'on ne fait JAMAIS :**

- `vertical-align: middle` sur une icône sans flex parent — ça aligne sur le x-height, pas le centre visuel
- `margin-top: 2px` ou `margin-top: 3px` pour « ajuster » — ça casse à une autre taille de texte
- Taille d'icône en `px` fixe (`text-[14px]`, `text-[20px]`) quand l'icône accompagne du texte — utiliser `em`

### Références visuelles dans le code existant

```
components/ui/              → primitives de référence — s'en inspirer
app/globals.css             → tokens, patterns icônes, interlignes, print
components/tae/TaeForm/     → wizard split — référence layout
printable-fiche-preview.module.css → référence impression
eval-grid.module.css        → référence typographie dense et précise
```

---

## Git — commits

Commits atomiques et clairs. Un commit = un changement logique. Format :

```
type(scope): description courte en français

Ex: feat(wizard): ajouter repère temporel au Bloc 4
    fix(grilles): corriger fusion cellules OI3_SO5
    docs(architecture): documenter RPC update_tae_transaction
```

---

## Rôle de l'IA

- Code conforme à `docs/DECISIONS.md`, `docs/UI-COPY.md`, `docs/FEATURES.md`, `docs/ARCHITECTURE.md`
- Structuré, sans duplication, sans dette silencieuse
- **Refuser** : spaghetti volontaire, hacks permanents, contournement copy / terminologie / formulaires
- **À chaque livraison visible** : exécuter la checklist documentation de progression
- Doute sur une décision → **demander au développeur**
- Développeur solo — pas de PO séparé : ne rien inventer, ne rien combler seul

## Règles — nouveaux composants wizard

Tout nouveau composant Bloc 3 doit :

1. Avoir un guard correspondant dans
   lib/tae/wizard-publish-guards.ts
2. Être branché dans StepperNavFooter.tsx

Tout accordéon séquentiel doit :

1. Header = <div role="button"> jamais <button>
   (le contenu peut contenir des éléments interactifs)
2. Contenu = <div> frère du header, jamais enfant

Tout nouveau bloc avec champs obligatoires doit :

1. Lister les champs requis dans le prompt
2. Spécifier le guard avant le composant

Tout nouveau comportement implémenté doit :

1. Vérifier visuellement que le sommaire (colonne droite)
   affiche correctement : consigne, corrigé, documents
2. Si données manquantes → vérifier formStateToTae()
   et adapter le mapping avant de considérer la tâche terminée
3. Ne jamais marquer une livraison complète sans avoir
   confirmé que le sommaire reflète les données saisies

---

## Architecture Server/Client

### Règle : Séparation du code serveur et client

Tout nouveau fichier utilisant des modules Node.js natifs (`sharp`, `fs`, `path`, `crypto`, `child_process`, Prisma, connexion DB, etc.) DOIT :

1. Être placé dans `lib/server/` (créer le dossier si inexistant)
2. Commencer par `import "server-only"` en première ligne

Tout nouveau fichier utilisant des APIs browser (`window`, `document`, `localStorage`, etc.) DOIT :

1. Être placé dans `lib/client/` (créer le dossier si inexistant)
2. Commencer par `import "client-only"` en première ligne

### Structure cible

```
lib/
├── server/          # Code Node.js uniquement
├── client/          # Code browser uniquement
├── shared/          # Code universel (types, constantes, helpers purs)
└── [existant]/      # Code legacy — ne pas déplacer sauf refactoring planifié
```

### Décision rapide : où placer un nouveau fichier ?

| Le fichier utilise...                         | Emplacement             | Première ligne         |
| --------------------------------------------- | ----------------------- | ---------------------- |
| `sharp`, `fs`, `path`, Prisma, DB             | `lib/server/`           | `import "server-only"` |
| `window`, `document`, `localStorage`          | `lib/client/`           | `import "client-only"` |
| Uniquement types, constantes, fonctions pures | `lib/shared/` ou `lib/` | Rien                   |
| Server Actions qui importent du code Node.js  | Ajouter en tête         | `import "server-only"` |

### Packages requis

```bash
npm install server-only client-only
```

### Pourquoi cette règle ?

- Empêche Storybook/Vite de planter sur les modules Node.js
- Génère une erreur au BUILD si du code serveur est importé côté client
- Best practice officielle Next.js
