import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Décalage contenu sous titres de section (≈ icône 1rem + 0.4rem), aligné maquette. */
const SECTION_INSET = "pl-[calc(1rem+0.4rem)]";

function SectionTitle({ id, icon, children }: { id: string; icon: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-[0.65rem] flex items-center gap-[0.4rem] text-[11px] font-bold uppercase tracking-[0.08em] text-accent"
    >
      <span
        className="material-symbols-outlined text-[1rem] text-accent opacity-80"
        aria-hidden="true"
      >
        {icon}
      </span>
      {children}
    </h2>
  );
}

function SectionDivider() {
  return (
    <div
      className="pointer-events-none absolute left-2 right-2 top-0 z-[1] h-px bg-border"
      aria-hidden="true"
    />
  );
}

/**
 * Reproduction Tailwind de la fiche remplie (`maquette/fiche-maquette-finale.html`).
 * Icônes produit : corrigé `task_alt`, documents `article`, compétence `license`.
 */
export function MaquetteFicheFinaleTailwind() {
  return (
    <article
      className="mx-auto max-w-[1040px] min-w-0 overflow-hidden rounded-br-[18px] rounded-tr-[18px] border border-border border-l-2 border-l-accent bg-panel shadow-sm"
      aria-label="Fiche TAÉ remplie"
    >
      {/* HEADER P0 */}
      <header className="grid grid-cols-[96px_minmax(0,1fr)] items-stretch">
        <div className="relative flex items-center justify-center px-1 py-0">
          <span
            className="material-symbols-outlined leading-none text-accent opacity-[0.88]"
            style={{
              fontSize: "clamp(2.5rem, 4.25vmin, 3.35rem)",
              fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 200, "opsz" 48',
            }}
            aria-hidden="true"
          >
            hourglass
          </span>
          <span className="absolute right-0 top-2 bottom-2 w-px bg-border" aria-hidden="true" />
        </div>
        <div className="min-w-0 px-4 py-[1.35rem] pr-5 sm:px-5">
          <div className="mb-2 flex items-center gap-[0.45rem]">
            <span
              className="material-symbols-outlined inline-flex h-[1.1875rem] w-[1.1875rem] shrink-0 items-center justify-center text-[1.1875rem] text-accent"
              aria-hidden="true"
            >
              quiz
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-accent">
              Consigne
            </span>
          </div>
          <p className="mb-[1.2rem] line-clamp-4 text-[1.625rem] font-semibold leading-[1.34] tracking-[-0.028em] text-deep">
            À partir des documents fournis, situez chronologiquement les faits présentés et
            expliquez comment ils s&apos;enchaînent dans le contexte de la conquête du pouvoir par
            les Britanniques.
          </p>
          <div className="flex flex-wrap gap-[0.35rem]">
            <span className="inline-flex items-center gap-[0.28rem] rounded-md bg-panel-alt px-2.5 py-[5px] text-xs font-semibold tracking-wide text-steel">
              <span
                className="material-symbols-outlined text-[1.05rem] text-accent"
                aria-hidden="true"
              >
                psychology
              </span>
              Situer dans le temps
            </span>
            <button
              type="button"
              title="Voir la grille de correction"
              aria-label="Voir la grille de correction"
              className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-md bg-panel-alt text-accent transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <span className="material-symbols-outlined text-[1.1rem]" aria-hidden="true">
                table_eye
              </span>
            </button>
            <span className="inline-flex items-center gap-[0.28rem] rounded-md bg-panel-alt px-2.5 py-[5px] text-xs font-semibold tracking-wide text-steel">
              <span
                className="material-symbols-outlined text-[1.05rem] text-accent"
                aria-hidden="true"
              >
                school
              </span>
              Secondaire 4
            </span>
            <span className="inline-flex items-center gap-[0.28rem] rounded-md bg-panel-alt px-2.5 py-[5px] text-xs font-semibold tracking-wide text-steel">
              <span
                className="material-symbols-outlined text-[1.05rem] text-accent"
                aria-hidden="true"
              >
                menu_book
              </span>
              Histoire du Québec et du Canada
            </span>
            <span className="inline-flex items-center gap-[0.28rem] rounded-md bg-panel-alt px-2.5 py-[5px] text-xs font-semibold tracking-wide text-steel">
              <span
                className="material-symbols-outlined text-[1.05rem] text-accent"
                aria-hidden="true"
              >
                deployed_code
              </span>
              Politique, Territorial
            </span>
          </div>
        </div>
      </header>

      {/* BODY 60/40 — breakpoint 800px comme la maquette */}
      <div className="relative grid min-h-0 grid-cols-1 min-[800px]:grid-cols-[6fr_4fr]">
        <div
          className="pointer-events-none absolute left-2 right-2 top-0 z-[1] h-px bg-border"
          aria-hidden="true"
        />

        <div className="relative min-w-0 bg-panel">
          {/* Corrigé */}
          <section className="relative px-5 py-4" aria-labelledby="mq-corrige">
            <SectionTitle id="mq-corrige" icon="task_alt">
              Corrigé
            </SectionTitle>
            <div className={SECTION_INSET}>
              <p className="text-base font-medium leading-[1.62] text-error">
                Ordre attendu : traité de Paris (1763) → Proclamation royale → Acte de Québec
                (1774), avec justification brève du lien causal entre chaque étape. L&apos;élève
                doit démontrer une compréhension de la séquence temporelle et de ses implications
                politiques sur l&apos;organisation territoriale de la Nouvelle-France devenue
                Province of Quebec.
              </p>
            </div>
          </section>

          {/* Documents */}
          <section className="relative px-5 py-4" aria-labelledby="mq-docs">
            <SectionDivider />
            <div className="pt-4">
              <SectionTitle id="mq-docs" icon="article">
                Document(s)
              </SectionTitle>
              <div className={cn(SECTION_INSET, "flex flex-col gap-[0.65rem]")}>
                <article className="block rounded-lg border border-border bg-panel p-3.5 shadow-[0_1px_2px_rgba(15,18,30,0.03)] transition-[border-color,box-shadow] hover:border-border hover:shadow-md">
                  <h3 className="mb-[0.3rem] text-sm font-bold tracking-tight text-deep">
                    Document 1 — Texte : Proclamation royale de 1763 (extrait)
                  </h3>
                  <p className="mb-[0.35rem] text-[15px] leading-[1.55] text-steel">
                    Extraits sur l&apos;organisation provisoire des colonies dans les territoires
                    cédés par la France après la guerre de Sept Ans, jusqu&apos;à ce que le
                    Parlement fixe des conditions de gouvernement stables pour le Québec, la
                    Nouvelle-Écosse et d&apos;autres dépendances.
                  </p>
                  <p className="text-xs font-medium text-muted">
                    Source : George III, proclamation royale du 7 octobre 1763. Texte officiel —
                    extrait restitué.
                  </p>
                </article>
                <article className="block rounded-lg border border-border bg-panel p-3.5 shadow-[0_1px_2px_rgba(15,18,30,0.03)] transition-[border-color,box-shadow] hover:border-border hover:shadow-md">
                  <h3 className="mb-[0.3rem] text-sm font-bold tracking-tight text-deep">
                    Document 2 — Texte : Acte de Québec, 1774 (extrait)
                  </h3>
                  <p className="mb-[0.35rem] text-[15px] leading-[1.55] text-steel">
                    Dispositions relatives au rétablissement des lois civiles françaises, à la
                    liberté de culte catholique et à l&apos;extension des frontières de la Province
                    of Quebec vers les Grands Lacs et la vallée de l&apos;Ohio.
                  </p>
                  <p className="text-xs font-medium text-muted">
                    Source : Parlement de Westminster, Acte de Québec, 22 juin 1774. Texte officiel
                    — extrait.
                  </p>
                </article>
                <article className="flex items-start gap-[0.85rem] rounded-lg border border-border bg-panel p-3.5 shadow-[0_1px_2px_rgba(15,18,30,0.03)] transition-[border-color,box-shadow] hover:border-border hover:shadow-md">
                  <div className="flex h-[90px] w-[118px] shrink-0 items-center justify-center rounded-md border-2 border-dashed border-border bg-panel-alt">
                    <span
                      className="material-symbols-outlined text-[2.5rem] text-muted opacity-55"
                      style={{ fontVariationSettings: '"FILL" 0, "wght" 200, "GRAD" 0, "opsz" 48' }}
                      aria-hidden="true"
                    >
                      image
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-[0.3rem] text-sm font-bold tracking-tight text-deep">
                      Document 3 — Image : La signature du traité de Paris
                    </h3>
                    <p className="text-xs font-medium text-muted">
                      Source : John Wollaston, <em>The Signature of the Treaty of Paris</em>, vers
                      1763. Yale University Art Gallery (domaine public).
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="relative min-w-0 bg-panel max-[799px]:border-t max-[799px]:border-border min-[800px]:border-l min-[800px]:border-border">
          <div className="relative px-5 py-4">
            <SectionTitle id="mq-guidage" icon="tooltip_2">
              Guidage
            </SectionTitle>
            <div className={SECTION_INSET}>
              <p className="text-[15px] font-medium leading-[1.58] text-steel">
                Repérez les dates clés dans chaque document avant de les classer. Utilisez la ligne
                du temps du cahier comme repère.
              </p>
            </div>
          </div>

          <div className="relative px-5 py-4">
            <SectionDivider />
            <div className="pt-4">
              <SectionTitle id="mq-cd" icon="license">
                Compétence disciplinaire
              </SectionTitle>
              <div className={SECTION_INSET}>
                <MaquetteTreeCd />
              </div>
            </div>
          </div>

          <div className="relative px-5 py-4">
            <SectionDivider />
            <div className="pt-4">
              <SectionTitle id="mq-conn" icon="lightbulb">
                Connaissances
              </SectionTitle>
              <div className={SECTION_INSET}>
                <MaquetteTreeConn />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="relative flex flex-wrap items-center gap-x-[1.15rem] gap-y-[0.65rem] border-t border-border px-5 py-3 text-xs font-medium tracking-tight text-muted">
        <span className="inline-flex items-center gap-[0.35rem] rounded-sm text-muted">
          <span className="material-symbols-outlined text-[0.95rem] text-muted" aria-hidden="true">
            person
          </span>
          <a href="#" className="font-semibold text-steel no-underline hover:text-accent">
            Jean Lavoie
          </a>
          <span className="mx-px text-muted" aria-hidden="true">
            &middot;
          </span>
          <a href="#" className="font-semibold text-steel no-underline hover:text-accent">
            Stéphane Pelletier
          </a>
        </span>
        <span className="inline-flex items-center gap-[0.35rem]">
          <span className="material-symbols-outlined text-[0.95rem] text-muted" aria-hidden="true">
            calendar_month
          </span>
          <time dateTime="2026-03-11">11 mars 2026</time>
        </span>
        <span className="inline-flex items-center gap-[0.35rem]">
          <span className="material-symbols-outlined text-[0.95rem] text-muted" aria-hidden="true">
            format_line_spacing
          </span>
          <span className="text-steel">8 lignes</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-[0.45rem] rounded-full border border-accent/35 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-accent">
          <span
            className="size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_0_2px_hsla(195,70%,45%,0.2)]"
            aria-hidden="true"
          />
          Publiée
        </span>
      </footer>
    </article>
  );
}

function MaquetteTreeCd() {
  return (
    <ul className="m-0 list-none p-0 text-[13px] font-medium leading-[1.55] text-steel" role="tree">
      <li className="relative m-0">
        <span className="block py-0.5 text-[13.5px] font-bold tracking-tight text-deep">
          Lire l&apos;organisation d&apos;une société
        </span>
        <ul className="relative m-0 list-none pl-4 before:absolute before:top-0 before:bottom-[0.6em] before:left-[0.35rem] before:w-px before:bg-border before:content-['']">
          <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
            <span className="block py-0.5">
              Situer des faits dans le temps et dans l&apos;espace
            </span>
            <ul className="relative m-0 list-none pl-4 before:absolute before:top-0 before:bottom-[0.6em] before:left-[0.35rem] before:w-px before:bg-border before:content-['']">
              <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold leading-snug text-deep">
                  Exactitude de la localisation spatiale et temporelle
                  <span
                    className="material-symbols-outlined text-[0.85rem] text-accent"
                    aria-hidden="true"
                  >
                    check
                  </span>
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  );
}

function MaquetteTreeConn() {
  return (
    <ul className="m-0 list-none p-0 text-[13px] font-medium leading-[1.55] text-steel" role="tree">
      <li className="relative m-0">
        <span className="block py-0.5 text-[13.5px] font-bold tracking-tight text-deep">
          Économie et développement
        </span>
        <ul className="relative m-0 list-none pl-4 before:absolute before:top-0 before:bottom-[0.6em] before:left-[0.35rem] before:w-px before:bg-border before:content-['']">
          <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
            <span className="block py-0.5">Agriculture et seigneurie</span>
            <ul className="relative m-0 list-none pl-4 before:absolute before:top-0 before:bottom-[0.6em] before:left-[0.35rem] before:w-px before:bg-border before:content-['']">
              <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
                <span className="block py-0.5">Le régime seigneurial</span>
                <ul className="relative m-0 list-none pl-4 before:absolute before:top-0 before:bottom-[0.6em] before:left-[0.35rem] before:w-px before:bg-border before:content-['']">
                  <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold leading-snug text-deep">
                      L&apos;élève décrit l&apos;organisation du système seigneurial.
                      <span
                        className="material-symbols-outlined text-[0.85rem] text-accent"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    </span>
                  </li>
                  <li className="relative m-0 pl-3 before:absolute before:top-[0.7em] before:-left-[0.65rem] before:h-px before:w-[0.55rem] before:bg-border before:content-['']">
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold leading-snug text-deep">
                      L&apos;élève situe les seigneuries sur le territoire laurentien.
                      <span
                        className="material-symbols-outlined text-[0.85rem] text-accent"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    </span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  );
}
