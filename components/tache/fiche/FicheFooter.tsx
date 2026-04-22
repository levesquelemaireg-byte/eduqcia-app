import type { TacheFicheData } from "@/lib/types/fiche";
import { BLUEPRINT_INITIAL_NB_LIGNES } from "@/lib/tache/blueprint-helpers";
import { formatFicheDate } from "@/lib/tache/fiche-helpers";
import { getDisplayName } from "@/lib/utils/profile-display";
import {
  SkeletonFooterLine,
  SkeletonFooterNbLignes,
} from "@/components/tache/fiche/FicheSkeletons";

type Props = {
  tache: TacheFicheData;
  /** TacheCard (§19) — pied de carte compact. */
  compact?: boolean;
  /** Sommaire wizard : éviter « N lignes » tant que c’est le défaut sans cadre (comportement). */
  mode?: "lecture" | "sommaire";
};

export function FicheFooter({ tache, compact, mode = "lecture" }: Props) {
  const auteurs = tache.auteurs.map((a) => getDisplayName(a.first_name, a.last_name)).join(" · ");
  const hasMeta = auteurs.length > 0 || tache.created_at;
  const hideNbLignesInFooter = tache.showStudentAnswerLines === false;
  const sommaireNbLignesSkeleton =
    !hideNbLignesInFooter &&
    mode === "sommaire" &&
    !tache.comportement.id &&
    tache.nb_lignes === BLUEPRINT_INITIAL_NB_LIGNES;

  if (compact) {
    return (
      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        {hasMeta ? (
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="material-symbols-outlined shrink-0 text-[1em]" aria-hidden="true">
                person
              </span>
              <span className="truncate">{auteurs || "—"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                calendar_today
              </span>
              {formatFicheDate(tache.created_at)}
            </span>
          </div>
        ) : (
          <SkeletonFooterLine />
        )}
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            tache.is_published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${tache.is_published ? "bg-success" : "bg-warning"}`}
          />
          {tache.is_published ? "Publiée" : "Brouillon"}
        </span>
      </footer>
    );
  }

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-3 text-xs text-muted">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            person
          </span>
          {auteurs || "—"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            calendar_today
          </span>
          {formatFicheDate(tache.created_at)}
        </span>
        {hideNbLignesInFooter ? null : sommaireNbLignesSkeleton ? (
          <SkeletonFooterNbLignes />
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              format_line_spacing
            </span>
            {tache.nb_lignes} lignes
          </span>
        )}
      </div>

      <span
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
          tache.is_published ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${tache.is_published ? "bg-success" : "bg-warning"}`}
        />
        {tache.is_published ? "Publiée" : "Brouillon"}
      </span>
    </footer>
  );
}
