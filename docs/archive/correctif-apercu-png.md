# Correctifs useApercuPng — Synthèse finale

> **APPLIQUÉ le 2026-04-17** — commit `707b155`, fichier `hooks/epreuve/use-apercu-png.ts`.
> Les 7 correctifs ont été implémentés. Ce document est archivé.

> Synthèse de 5 analyses indépendantes (Grok, DeepSeek, ChatGPT, Gemini, Copilot)
>
> - analyse interne.

---

## Correctifs retenus

| #   | Bug                                            | Correctif                                                           | Source                           |
| --- | ---------------------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| 1   | Race condition — pas d'AbortController         | Ref AbortController + signal sur tous les fetch + cleanup useEffect | Unanime (5/5)                    |
| 2   | Pas de timeout PDF                             | `setTimeout` 30s + `controller.abort()` + toast erreur              | Grok (meilleur que Promise.race) |
| 3   | Token KV expiré → erreur générique             | Détection 410 + retry récursif `tentative < 2`                      | DeepSeek                         |
| 4   | `tokenRef` jamais reseté au changement de deps | `useEffect` reset quand payload/mode/estCorrige changent            | ChatGPT + Copilot                |
| 5   | `calculerRendu` recalculé à chaque render      | `useMemo` sur payload/mode/estCorrige                               | ChatGPT + Copilot + interne      |
| 6   | Pas de guard anti double-clic                  | `if (etat.statut === "chargement") return` en début de `generer`    | ChatGPT                          |
| 7   | Erreur PDF silencieuse                         | `toast.error()` via sonner dans le catch                            | Unanime                          |

## Correctifs refusés

| Proposition                           | Source   | Raison du refus                                             |
| ------------------------------------- | -------- | ----------------------------------------------------------- |
| `isMountedRef` boolean                | DeepSeek | Redondant avec AbortController. Pattern pré-React 18.       |
| `useCallback` sur `obtenirToken`      | DeepSeek | Complexité inutile, fonction appelée impérativement.        |
| Supprimer `calculerRendu` côté client | ChatGPT  | Nécessaire pour le sommaire wizard (SPEC-PRINT-ENGINE §D0). |
| `fast-json-stable-stringify`          | Copilot  | Dépendance npm non justifiée. `JSON.stringify` suffit.      |
| `requestId` Symbol                    | Copilot  | Overkill — AbortController suffit.                          |
| `pagesParFeuillet` via API            | ChatGPT  | Reporté — à évaluer après les fixes prioritaires.           |

---

## Prompt Claude Code

````
Corrige le hook `hooks/epreuve/use-apercu-png.ts` selon les 7 correctifs
ci-dessous. Ne touche à aucun autre fichier sauf si un import change.

Lis d'abord le fichier actuel, puis applique les modifications.

### Correctif 1 — AbortController + cleanup

Ajoute un `useRef<AbortController | null>` au niveau du hook.

Dans `generer` :
- Abort le controller précédent : `abortRef.current?.abort()`
- Crée un nouveau controller et le stocke dans le ref
- Passe `controller.signal` aux deux fetch (obtenirToken et apercu-png)
- Dans le catch : si `err.name === "AbortError"`, return silencieusement
- Dans le finally : `if (abortRef.current === controller) abortRef.current = null`

Ajoute un `useEffect` de cleanup :
```ts
useEffect(() => {
  return () => {
    abortRef.current?.abort();
    tokenRef.current = null;
  };
}, []);
````

Modifie `obtenirToken` pour accepter `signal?: AbortSignal` et le passer
au fetch interne.

### Correctif 2 — Timeout PDF 30s

Dans `telechargerPdf` :

- Crée un AbortController local
- `const timeout = setTimeout(() => controller.abort(), 30_000)`
- Passe `controller.signal` au fetch PDF
- Passe aussi le signal à `obtenirToken` si le token doit être régénéré
- Dans le catch : si AbortError, afficher `toast.error("Le téléchargement
a pris trop de temps. Réessayez.")`
- Dans le finally : `clearTimeout(timeout)` + `setPdfEnCours(false)`

Importe toast depuis sonner :

```ts
import { toast } from "sonner";
```

### Correctif 3 — Retry sur token expiré (410)

Dans `generer`, ajoute un paramètre `tentative = 1`.

Après le fetch apercu-png, si `res.status === 410 && tentative < 2` :

- `tokenRef.current = null`
- `return generer(tentative + 1)` (retry récursif, max 1 retry)

### Correctif 4 — Reset tokenRef au changement de deps

Ajoute un useEffect qui invalide le token quand les inputs changent :

```ts
useEffect(() => {
  tokenRef.current = null;
}, [payload, mode, estCorrige]);
```

### Correctif 5 — useMemo sur calculerRendu

Remplace l'appel direct :

```ts
const rendu = calculerRendu(payload, mode, estCorrige);
```

Par :

```ts
const rendu = useMemo(() => calculerRendu(payload, mode, estCorrige), [payload, mode, estCorrige]);
```

Supprime le 2e appel à `calculerRendu` dans `generer`. Utilise le `rendu`
mémoïsé directement :

```ts
const pagesParFeuillet = rendu.ok
  ? extrairePagesParFeuillet(rendu)
  : { "dossier-documentaire": 0, questionnaire: 0, "cahier-reponses": 0 };
```

### Correctif 6 — Guard anti double-clic

Au début de `generer`, avant l'AbortController :

```ts
if (etat.statut === "chargement") return;
```

Note : accéder à `etat` dans le callback nécessite soit de l'ajouter
aux deps du useCallback, soit d'utiliser un ref. Utilise un ref :

```ts
const estEnCoursRef = useRef(false);
```

Set à true au début de generer, false dans le finally.
Check `if (estEnCoursRef.current) return` au début.

### Correctif 7 — Toast erreur PDF

Dans le catch de `telechargerPdf`, remplace le catch vide par :

```ts
catch (err) {
  if (err instanceof DOMException && err.name === "AbortError") {
    toast.error("Le téléchargement a pris trop de temps. Réessayez.");
    return;
  }
  const message = err instanceof Error ? err.message : "Erreur inconnue";
  toast.error(`Échec du téléchargement : ${message}`);
  console.error("Erreur téléchargement PDF", err);
}
```

### Règles

- Ne supprime RIEN d'autre dans le hook. Les types, helpers
  (extrairePagesParFeuillet, construireBodyTokenDraft, mesureurPlaceholder),
  et la structure générale restent identiques.
- Ne crée pas de nouveau fichier.
- Ne modifie pas les routes API.
- Garde les imports existants, ajoute seulement `useMemo`, `useEffect`
  (si pas déjà importés) et `import { toast } from "sonner"`.
- Retire les `// eslint-disable-next-line react-hooks/exhaustive-deps`
  — les deps sont maintenant correctes.
- Teste que le fichier compile sans erreur TypeScript.

```

---

## Note sur le mesureurPlaceholder

ChatGPT a identifié un problème structurel : `mesureurPlaceholder` retourne
200 hardcodé, ce qui peut faire diverger l'empreinte locale de l'empreinte
serveur et causer des `estInvalide` permanents.

Ce problème est **hors scope de ce correctif** — il relève de l'architecture
du print engine (SPEC-PRINT-ENGINE §D2 mesureur isomorphe). Le correctif
actuel stabilise le hook ; le mesureur sera adressé dans un chantier séparé.
```
