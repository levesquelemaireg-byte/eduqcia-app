import type { ReactNode } from "react";
import { resolveConsigneHtmlForDisplay } from "@/lib/tache/consigne-helpers";
import { prepareNonRedactionConsigneForTeacherDisplay } from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
import { sanitize } from "@/lib/fiche/helpers";
import type { TaeFicheData } from "@/lib/types/fiche";
import { GrilleEvaluationMetaButton } from "@/components/tache/fiche/GrilleEvaluationMetaButton";
import { MetaPill } from "@/components/tache/fiche/MetaPill";
import { SkeletonConsigneBody } from "@/components/tache/fiche/FicheSkeletons";
import { FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET } from "@/lib/ui/fiche-layout";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { cn } from "@/lib/utils/cn";

type Props = {
  tae: TaeFicheData;
  /** Menu ⋮ (lecture) — coin supérieur droit du bloc consigne, sans colonne dédiée. */
  headerMenu?: ReactNode;
};

/**
 * En-tête P0 fiche — grille 96px + corps (consigne, pastilles). Séparateur sous P0 : `FicheTache` + `FICHE_HAIRLINE_RULE`.
 * FICHE-TACHE.md §3 — pastilles dès que blueprint / rédaction fournit des libellés.
 */
export function SectionConsigne({ tae, headerMenu }: Props) {
  const consigneOk = hasFicheContent(tae.consigne);
  const showOiPill = Boolean(tae.oi.titre?.trim());
  const showComportementPill = Boolean(tae.comportement.id?.trim());
  const showAspectsPill = tae.aspects_societe.length > 0;
  const showMetaPills =
    showOiPill ||
    showComportementPill ||
    showAspectsPill ||
    Boolean(tae.niveau.label?.trim()) ||
    Boolean(tae.discipline.label?.trim());
  const showOiIcon = consigneOk || showOiPill;

  return (
    <header className="relative grid min-w-0 grid-cols-[96px_minmax(0,1fr)] items-stretch">
      <div className="relative flex items-center justify-center px-1 py-0">
        {showOiIcon ? (
          <MaterialSymbolOiGlyph
            glyph={tae.oi.icone}
            className="leading-none text-accent opacity-[0.88]"
            style={{
              fontSize: "clamp(2.5rem, 4.25vmin, 3.35rem)",
              fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
            }}
            aria-hidden="true"
          />
        ) : (
          <div
            className="h-14 w-14 shrink-0 rounded-full border-2 border-dashed border-border animate-pulse"
            aria-hidden="true"
          />
        )}
        <span
          className={cn("absolute right-0 w-px bg-border", FICHE_HAIRLINE_DIVIDER_VERTICAL_INSET)}
          aria-hidden="true"
        />
      </div>

      {headerMenu ? (
        <div className="pointer-events-none absolute right-2 top-2 z-20 sm:right-3 sm:top-3">
          <div className="pointer-events-auto">{headerMenu}</div>
        </div>
      ) : null}

      <div
        className={cn("min-w-0 px-4 py-[1.35rem] sm:px-5", headerMenu ? "pr-12 sm:pr-14" : "pr-5")}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="material-symbols-outlined inline-flex shrink-0 items-center justify-center text-[1.1875rem] text-accent"
            aria-hidden="true"
          >
            quiz
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-accent">
            Consigne
          </span>
        </div>

        {consigneOk ? (
          <div
            className="mb-[1.2rem] text-xl font-semibold leading-relaxed tracking-tight text-deep md:text-2xl [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: sanitize(
                resolveConsigneHtmlForDisplay(
                  prepareNonRedactionConsigneForTeacherDisplay(tae.consigne),
                  tae.documents.length,
                ),
              ),
            }}
          />
        ) : (
          <div className="mb-[1.2rem]">
            <SkeletonConsigneBody />
          </div>
        )}

        {showMetaPills ? (
          <div className="flex flex-wrap items-stretch gap-2">
            {/* Pastille OI : icône générique catégorie ; grand glyphe marge = `MaterialSymbolOiGlyph` + `tae.oi.icone`. */}
            {showOiPill ? <MetaPill icon="psychology" label={tae.oi.titre} /> : null}
            <GrilleEvaluationMetaButton
              visible={showComportementPill}
              outilEvaluation={tae.outilEvaluation}
            />
            {tae.niveau.label?.trim() ? <MetaPill icon="school" label={tae.niveau.label} /> : null}
            {tae.discipline.label?.trim() ? (
              <MetaPill icon="menu_book" label={tae.discipline.label} />
            ) : null}
            {showAspectsPill ? (
              <MetaPill icon="deployed_code" label={tae.aspects_societe.join(" · ")} />
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
