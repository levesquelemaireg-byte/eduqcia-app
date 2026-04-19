"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { PeriodeIcon } from "@/components/ui/PeriodeIcon";
import {
  DOC_MINIATURE_ACTION_MODIFIER,
  DOC_MINIATURE_ACTION_OUVRIR,
  DOC_MINIATURE_ACTION_REUTILISER,
  DOC_MINIATURE_ACTION_SUPPRIMER,
  DOC_MINIATURE_ACTIONS_ARIA,
  DOC_MINIATURE_AUTEUR_PREFIX,
  DOC_MINIATURE_STATUT_BROUILLON,
  DOC_MINIATURE_STATUT_PUBLIE,
  DOC_MINIATURE_UPDATED_PREFIX,
  DOC_MINIATURE_UTILISATION_AUCUNE,
  DOC_MINIATURE_UTILISATION_PLURIEL,
  DOC_MINIATURE_UTILISATION_SINGULIER,
} from "@/lib/ui/copy/document";
import { cn } from "@/lib/utils/cn";
import type {
  DocumentEnrichedConnaissance,
  DocumentEnrichedRow,
} from "@/lib/types/document-enriched";
import type { DocumentElementJson } from "@/lib/types/document-element-json";

export type DocumentMiniatureContext = "owner" | "profile" | "bank";

type Props = {
  document: DocumentEnrichedRow;
  context: DocumentMiniatureContext;
  /** `/documents/<id>` — href principal (clic sur la ligne + action « Ouvrir la fiche »). */
  href: string;
  /** Banque : bouton kebab « Réutiliser dans une tâche » (callback client). */
  onReuse?: () => void;
  /** Banque : bouton kebab « Réutiliser dans une tâche » (deep-link server-renderable). */
  reuseHref?: string;
  /** Propriétaire (Mes documents) : bouton kebab « Supprimer ». */
  onDelete?: () => void;
  /** Propriétaire (Mes documents) : href « Modifier ». */
  editHref?: string;
  /** Clic sur le nom de l'auteur (banque uniquement). */
  authorHref?: string;
};

const MINIATURE_DATE_FORMATTER = new Intl.DateTimeFormat("fr-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatUsageLabel(n: number): string {
  if (n <= 0) return DOC_MINIATURE_UTILISATION_AUCUNE;
  if (n === 1) return DOC_MINIATURE_UTILISATION_SINGULIER;
  return DOC_MINIATURE_UTILISATION_PLURIEL(n);
}

function formatDate(iso: string): string {
  try {
    return MINIATURE_DATE_FORMATTER.format(new Date(iso));
  } catch {
    return iso;
  }
}

function getPrimaryElement(elements: DocumentElementJson[]): DocumentElementJson | null {
  return elements[0] ?? null;
}

/** Les 2 derniers niveaux de l'arborescence connaissances (SPEC §3.3). */
function pickDeepestBranch(
  breadcrumbs: DocumentEnrichedConnaissance[],
): { parent: string | null; leaf: string } | null {
  if (breadcrumbs.length === 0) return null;
  // Branche la plus profonde = celle avec sous_section renseignée si présente, sinon la première.
  const withDepth = breadcrumbs.find((c) => c.sous_section && c.sous_section.trim().length > 0);
  const chosen = withDepth ?? breadcrumbs[0];
  const leaf = chosen.enonce;
  const parent = chosen.sous_section ?? chosen.section ?? null;
  if (!parent || parent === leaf) {
    return { parent: null, leaf };
  }
  return { parent, leaf };
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        published ? "bg-success/10 text-success" : "bg-warning/10 text-warning",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", published ? "bg-success" : "bg-warning")}
        aria-hidden="true"
      />
      {published ? DOC_MINIATURE_STATUT_PUBLIE : DOC_MINIATURE_STATUT_BROUILLON}
    </span>
  );
}

function MetaBadge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-1 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

function IconGlyph({ icon }: { icon: string }) {
  return (
    <span className="material-symbols-outlined text-[0.9em] text-accent" aria-hidden="true">
      {icon}
    </span>
  );
}

function KnowledgeBadge({ parent, leaf }: { parent: string | null; leaf: string }) {
  return (
    <span className="inline-flex min-h-7 items-center gap-1 rounded-lg bg-panel-alt px-2.5 py-1 text-xs font-bold text-deep">
      <IconGlyph icon="lightbulb" />
      {parent ? (
        <>
          <span className="truncate">{parent}</span>
          <span
            className="material-symbols-outlined text-[0.85em] text-muted"
            style={{ transform: "scaleX(-1)" }}
            aria-hidden="true"
          >
            keyboard_return
          </span>
          <span className="truncate">{leaf}</span>
        </>
      ) : (
        <span className="truncate">{leaf}</span>
      )}
    </span>
  );
}

function LeftGlyph({ document }: { document: DocumentEnrichedRow }) {
  const element = getPrimaryElement(document.elements);
  const imageUrl =
    document.type === "iconographique" && element?.image_url ? element.image_url : null;

  if (imageUrl) {
    return (
      <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-panel-alt">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
          aria-hidden="true"
        />
      </span>
    );
  }

  return (
    <span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
      aria-hidden="true"
    >
      <span className="material-symbols-outlined text-[24px]">article</span>
    </span>
  );
}

type KebabAction = {
  key: string;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  /** Action dangereuse (supprimer) → couleur rouge. */
  dangerous?: boolean;
  /** Ouvre dans un nouvel onglet. */
  external?: boolean;
};

function KebabMenu({ actions }: { actions: KebabAction[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onClick = (e: globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-panel-alt hover:text-deep"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={DOC_MINIATURE_ACTIONS_ARIA}
      >
        <span className="material-symbols-outlined text-[1.2em]" aria-hidden="true">
          more_vert
        </span>
      </button>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-border bg-panel py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action) => {
            const rowClass = cn(
              "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors",
              action.dangerous ? "text-error hover:bg-error/5" : "text-deep hover:bg-panel-alt",
            );
            const icon = (
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                {action.icon}
              </span>
            );
            if (action.href) {
              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className={rowClass}
                  role="menuitem"
                  onClick={close}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                >
                  {icon}
                  {action.label}
                </Link>
              );
            }
            return (
              <button
                key={action.key}
                type="button"
                className={rowClass}
                role="menuitem"
                onClick={() => {
                  close();
                  action.onClick?.();
                }}
              >
                {icon}
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function DocumentMiniature({
  document,
  context,
  href,
  onReuse,
  reuseHref,
  onDelete,
  editHref,
  authorHref,
}: Props) {
  const router = useRouter();

  const disciplinesLabel = document.disciplines_labels.join(" · ");
  const niveauxLabel = document.niveaux_labels.join(" · ");
  const aspectsLabel = document.aspects_societe.join(" · ");
  const connaissanceBranch = useMemo(
    () => pickDeepestBranch(document.connaissances_breadcrumbs),
    [document.connaissances_breadcrumbs],
  );

  const annee = document.annee_normalisee;
  const hasAnchor = Boolean(document.repere_temporel || (annee !== null && annee !== undefined));

  const showStatus = context === "owner";
  const showAuthor = context === "bank";
  const showUsage = context === "owner";

  const auteurNom = document.auteur.display_name ?? "";

  const navigate = useCallback(
    (target: string) => {
      router.push(target);
    },
    [router],
  );

  const onRowClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("[data-miniature-action]")) return;
      navigate(href);
    },
    [href, navigate],
  );

  const onRowKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        if ((e.target as HTMLElement).closest("[data-miniature-action]")) return;
        e.preventDefault();
        navigate(href);
      }
    },
    [href, navigate],
  );

  const kebabActions = useMemo<KebabAction[]>(() => {
    const out: KebabAction[] = [
      {
        key: "open",
        icon: "visibility",
        label: DOC_MINIATURE_ACTION_OUVRIR,
        href,
      },
    ];
    if (context === "bank" && (onReuse || reuseHref)) {
      out.push({
        key: "reuse",
        icon: "add_notes",
        label: DOC_MINIATURE_ACTION_REUTILISER,
        onClick: onReuse,
        href: onReuse ? undefined : reuseHref,
      });
    }
    if (context === "owner" && editHref) {
      out.push({
        key: "edit",
        icon: "edit",
        label: DOC_MINIATURE_ACTION_MODIFIER,
        href: editHref,
      });
    }
    if (context === "owner" && onDelete) {
      out.push({
        key: "delete",
        icon: "delete",
        label: DOC_MINIATURE_ACTION_SUPPRIMER,
        onClick: onDelete,
        dangerous: true,
      });
    }
    return out;
  }, [context, editHref, href, onDelete, onReuse, reuseHref]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onRowClick}
      onKeyDown={onRowKey}
      className={cn(
        "group relative grid cursor-pointer gap-3.5 rounded-lg py-3.5 pl-3.5 pr-11 transition-colors hover:bg-panel-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
      )}
      style={{ gridTemplateColumns: "48px minmax(0, 1fr)" }}
    >
      <LeftGlyph document={document} />

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-deep">
            {document.titre}
          </h3>
          {showStatus ? <StatusPill published={document.is_published} /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {disciplinesLabel ? (
            <MetaBadge icon={<IconGlyph icon="menu_book" />}>{disciplinesLabel}</MetaBadge>
          ) : null}
          {niveauxLabel ? (
            <MetaBadge icon={<IconGlyph icon="school" />}>{niveauxLabel}</MetaBadge>
          ) : null}
          {hasAnchor ? (
            <MetaBadge icon={<PeriodeIcon className="text-accent" />}>
              {document.repere_temporel ?? (annee !== null ? String(annee) : "")}
            </MetaBadge>
          ) : null}
          {aspectsLabel ? (
            <MetaBadge icon={<IconGlyph icon="deployed_code" />}>{aspectsLabel}</MetaBadge>
          ) : null}
          {connaissanceBranch ? (
            <KnowledgeBadge parent={connaissanceBranch.parent} leaf={connaissanceBranch.leaf} />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {showAuthor && auteurNom ? (
            authorHref ? (
              <Link
                data-miniature-action
                href={authorHref}
                className="inline-flex items-center gap-1 hover:text-deep hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  person
                </span>
                {DOC_MINIATURE_AUTEUR_PREFIX} {auteurNom}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  person
                </span>
                {DOC_MINIATURE_AUTEUR_PREFIX} {auteurNom}
              </span>
            )
          ) : null}
          {showUsage ? (
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                link
              </span>
              {formatUsageLabel(document.nb_utilisations)}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              history
            </span>
            {DOC_MINIATURE_UPDATED_PREFIX} {formatDate(document.updated_at)}
          </span>
        </div>
      </div>

      <div
        data-miniature-action
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <KebabMenu actions={kebabActions} />
      </div>
    </div>
  );
}

/** Conteneur liste aligné sur la SPEC §3.6. */
export function DocumentMiniatureList({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-1.5">
      <div className="divide-y divide-[color:var(--color-line-soft)]">{children}</div>
    </div>
  );
}
