/**
 * Bloc d'impression perspectives — 2 ou 3 colonnes côte à côte.
 * Réutilisé par : aperçu wizard, fiche lecture, impression TAÉ, impression épreuve.
 * Spec : docs/SPEC-TEMPLATES-CONSIGNE.md § Composant d'impression générique
 */
import { sanitize } from "@/lib/fiche/helpers";
import { perspectiveSectionLabel } from "@/lib/tache/oi-perspectives/perspectives-helpers";
import type { PerspectiveData } from "@/lib/tache/oi-perspectives/perspectives-types";

type Props = {
  perspectives: PerspectiveData[];
  titre?: string;
  count: 2 | 3;
};

export function PerspectivesPrintBlock({ perspectives, titre, count }: Props) {
  const colClass = count === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="overflow-hidden rounded-md border border-border">
      {titre ? (
        <div className="border-b border-border bg-panel px-3 py-2">
          <p className="text-sm font-semibold text-deep">Document A — {titre}</p>
        </div>
      ) : null}
      <div className={`grid ${colClass}`}>
        {perspectives.slice(0, count).map((p, i) => (
          <div
            key={i}
            className={`space-y-2 px-3 py-2.5 ${i < count - 1 ? "border-r border-border" : ""}`}
          >
            <p className="text-xs font-semibold text-deep">{perspectiveSectionLabel(i)}</p>
            <p className="text-sm font-medium text-deep">{p.acteur || "—"}</p>
            {p.contenu ? (
              <div
                className="prose-print text-sm leading-relaxed text-deep"
                dangerouslySetInnerHTML={{ __html: sanitize(p.contenu) }}
              />
            ) : null}
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-muted">Source :</p>
              {p.source ? (
                <div
                  className="text-xs leading-relaxed text-muted"
                  dangerouslySetInnerHTML={{ __html: sanitize(p.source) }}
                />
              ) : (
                <p className="text-xs text-muted">—</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
