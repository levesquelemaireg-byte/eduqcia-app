<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## ÉduQc.IA — repères

- **Documentation** : `docs/README.md` (navigation). Ordre : `docs/DECISIONS.md`, `docs/UI-COPY.md` (textes visibles), `docs/FEATURES.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN-SYSTEM.md`, `docs/BACKLOG.md` (pilotage, anti-dette, produit abouti).
- **Après toute livraison** qui change produit, routes, données, copy ou déploiement : **obligatoire** — appliquer le tableau `docs/BACKLOG.md` → **Documentation et traçabilité** ; mettre à jour BACKLOG et [BACKLOG-HISTORY.md](./docs/BACKLOG-HISTORY.md) si chronologie, **`docs/UI-COPY.md`** si copy UI, **`docs/DECISIONS.md`** si règle / protocole / icônes, et les autres specs touchées. Règle détaillée : `.cursor/rules/eduqcia.mdc` → **Obligation — documentation de progression**. Ne pas clore sans doc alignée.
- **Classes Tailwind** : tokens du thème ; fusion avec `import { cn } from "@/lib/utils/cn"` (`docs/DESIGN-SYSTEM.md` — section Tailwind).
- **Qualité** : `npm run ci` (format + lint + test + build) ou équivalent ; 0 erreur ESLint / Prettier check. CI GitHub : `.github/workflows/ci.yml`.
