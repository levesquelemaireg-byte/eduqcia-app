import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Prototype visuel / a11y — maquette fiche lecture (cible layout).
 * Hors `(app)` pour consultation sans auth. Libellés factices.
 */
export const metadata: Metadata = {
  title: "Prototype — fiche lecture (maquette)",
  robots: { index: false, follow: false },
};

/** Alignement corps sous titres h3 : icône 1em + gap-2 (0.5rem), comme les sections fiche. */
const SECTION_BODY_INSET = "pl-[calc(1em+0.5rem)]";

function SectionBlock({
  titleId,
  icon,
  title,
  children,
}: {
  titleId: string;
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={titleId}>
      <h3
        id={titleId}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h3>
      <div className={`mt-3 ${SECTION_BODY_INSET}`}>{children}</div>
    </section>
  );
}

export default function PrototypeFicheLectureMaquettePage() {
  return (
    <main id="prototype-fiche-main" className="min-h-full bg-surface px-4 py-8 text-deep">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-sm text-muted">
          Prototype — consigne dans l’en-tête (colonne titre), corps : blocs latéraux en colonne
          unique ; corrigé en <span className="text-error">text-error</span>.
        </p>

        <article
          className="min-w-0 overflow-hidden rounded-br-xl rounded-tr-xl border-b border-l-[3px] border-t border-border border-l-accent border-r-0 bg-panel shadow-sm"
          aria-labelledby="fiche-prototype-title"
        >
          <header className="grid grid-cols-1 border-b border-border md:grid-cols-[96px_minmax(0,1fr)]">
            <div className="flex items-center justify-center border-border py-4 md:border-r md:py-5">
              <span
                className="material-symbols-outlined leading-none text-accent"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                history_edu
              </span>
            </div>
            <div className="min-w-0 px-4 py-4 sm:px-5 md:py-5">
              <h1
                id="fiche-prototype-title"
                className="text-2xl font-bold tracking-tight text-deep"
              >
                Titre factice de la tâche
              </h1>
              <p className="mt-1 text-sm text-muted">
                Secondaire 3 · Univers social · Auteur fictif
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-steel">
                  Pastille méta (exemple)
                </span>
                <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-steel">
                  Autre pastille
                </span>
              </div>

              <div className="mt-6 border-t border-border pt-6">
                <h2
                  id="proto-consigne-heading"
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    quiz
                  </span>
                  Consigne
                </h2>
                <div
                  className={`mt-3 ${SECTION_BODY_INSET} text-xl font-semibold leading-relaxed text-deep md:text-2xl`}
                >
                  <p>
                    Paragraphe de consigne factice : le corps est décalé pour s’aligner avec le
                    texte du libellé, pas sous l’icône.
                  </p>
                </div>
                <div className={`mt-4 flex flex-wrap gap-2 ${SECTION_BODY_INSET}`}>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-steel">
                    Outil d’évaluation (ex.)
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="min-w-0 space-y-8 px-4 py-5 sm:px-5">
            <SectionBlock titleId="proto-docs" icon="docs" title="Document(s)">
              <p className="text-sm text-steel">
                Liste ou cartes documents (placeholder) — même glyphe docs que l’app.
              </p>
            </SectionBlock>

            <SectionBlock titleId="proto-guidage" icon="tooltip_2" title="Guidage">
              <p className="text-sm leading-relaxed text-steel">
                Texte de guidage factice, aligné avec le même décalage que les autres sections.
              </p>
            </SectionBlock>

            <SectionBlock titleId="proto-cd" icon="license" title="Compétence disciplinaire">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-deep">Compétence (exemple)</p>
                <div className="ml-4 border-l border-border pl-3">
                  <p className="text-sm text-steel">Composante</p>
                  <div className="mt-0.5 ml-4 border-l border-border pl-3">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-deep">
                      Critère
                      <span
                        className="material-symbols-outlined text-[0.9em] text-success"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock titleId="proto-corrige" icon="task_alt" title="Corrigé">
              <div className="text-sm leading-relaxed text-error [&_strong]:font-bold">
                <p>Corps du corrigé en rouge token (text-error) — glyphe task_alt inchangée.</p>
              </div>
            </SectionBlock>

            <SectionBlock titleId="proto-conn" icon="lightbulb" title="Connaissances">
              <p className="text-sm text-steel">Arborescence factice des connaissances ciblées.</p>
            </SectionBlock>

            <section aria-labelledby="proto-votes-title">
              <h3
                id="proto-votes-title"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
              >
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  how_to_vote
                </span>
                Évaluation par les pairs
              </h3>
              <div className={`mt-3 space-y-3 ${SECTION_BODY_INSET}`}>
                <div>
                  <p className="text-xs font-medium text-steel">Rigueur historique</p>
                  <p className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                    <span>Niveau 1 : 0</span>
                    <span>Niveau 2 : 2</span>
                    <span>Niveau 3 : 1</span>
                  </p>
                </div>
                <p className="text-xs text-muted">3 votes</p>
                <button
                  type="button"
                  className="text-xs text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Voter sur cette tâche
                </button>
              </div>
            </section>
          </div>

          <footer className="border-t border-border px-4 py-3 sm:px-5">
            <p className="text-xs text-muted">Version 1 — pied de fiche factice</p>
          </footer>
        </article>
      </div>
    </main>
  );
}
