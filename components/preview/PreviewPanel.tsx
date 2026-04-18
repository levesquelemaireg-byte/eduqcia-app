"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePreviewModes } from "@/components/preview/usePreviewModes";
import type { PreviewMode } from "@/components/preview/types";
import { cn } from "@/lib/utils/cn";
import {
  PREVIEW_PANEL_FEUILLET_ARIA,
  PREVIEW_PANEL_MODE_ARIA,
  PREVIEW_PANEL_OPTIONS_BUTTON_ARIA,
  PREVIEW_PANEL_OPTIONS_CLOSE_ARIA,
  PREVIEW_PANEL_OPTIONS_TITLE,
  PREVIEW_PANEL_PRINT_SHORT_LABEL,
  PREVIEW_PANEL_SUMMARY_SHORT_LABEL,
  PREVIEW_PANEL_VARIANT_ARIA,
} from "@/lib/ui/ui-copy";

type PreviewPanelProps = {
  modes: PreviewMode[];
  /** Id du mode « Sommaire » (affiché à gauche en bouton dédié). */
  summaryModeId?: string;
  defaultModeId?: string;
  onModeChange?: (modeId: string) => void;
  /** Reçoit `(modeId, subModeId, subSubModeId)`. */
  children: (
    currentModeId: string,
    currentSubModeId: string | null,
    currentSubSubModeId: string | null,
  ) => ReactNode;
  className?: string;
  /** Classes additionnelles appliquées au conteneur principal de la topbar. */
  switcherClassName?: string;
  /** Classes sur la topbar au-dessus du contenu d'aperçu. */
  topBarClassName?: string;
  /** Actions optionnelles affichées à droite de la topbar (ex. bouton impression). */
  actions?: ReactNode;
  /** Active la persistance URL `vue`, `mode`, `feuillet`. */
  syncUrlState?: boolean;
};

const DEFAULT_SUMMARY_MODE_ID = "sommaire";
const QUERY_PARAM_VUE = "vue";
const QUERY_PARAM_MODE = "mode";
const QUERY_PARAM_FEUILLET = "feuillet";
const VUE_SOMMAIRE = "sommaire";
const VUE_APERCU = "apercu";

type VuePreview = typeof VUE_SOMMAIRE | typeof VUE_APERCU;

function modeActifParId(
  modes: PreviewMode[] | undefined,
  modeId: string | null,
): PreviewMode | null {
  if (!modes || !modeId) return null;
  return modes.find((mode) => mode.id === modeId && !mode.disabled) ?? null;
}

type GroupeOngletsProps = {
  options: PreviewMode[];
  activeId: string | null;
  onChange: (modeId: string) => void;
  ariaLabel: string;
  idPrefix: string;
  panelId?: string;
  shortLabelsById?: Record<string, string>;
  forceIconOnly?: boolean;
  size?: "principal" | "secondaire";
  className?: string;
};

function GroupeOnglets({
  options,
  activeId,
  onChange,
  ariaLabel,
  idPrefix,
  panelId,
  shortLabelsById,
  forceIconOnly = false,
  size = "secondaire",
  className,
}: GroupeOngletsProps) {
  const optionsActives = options.filter((option) => !option.disabled);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, modeId: string) => {
    if (optionsActives.length === 0) return;

    const indexCourant = optionsActives.findIndex((option) => option.id === modeId);
    if (indexCourant < 0) return;

    let indexSuivant = indexCourant;
    if (event.key === "ArrowRight") {
      indexSuivant = (indexCourant + 1) % optionsActives.length;
    } else if (event.key === "ArrowLeft") {
      indexSuivant = (indexCourant - 1 + optionsActives.length) % optionsActives.length;
    } else if (event.key === "Home") {
      indexSuivant = 0;
    } else if (event.key === "End") {
      indexSuivant = optionsActives.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const option = optionsActives[indexSuivant];
    onChange(option.id);
    const bouton = document.getElementById(`${idPrefix}-tab-${option.id}`);
    if (bouton instanceof HTMLButtonElement) {
      bouton.focus();
    }
  };

  const classesTaille =
    size === "principal"
      ? forceIconOnly
        ? "gap-0 px-2.5 text-[13.5px] font-medium tracking-[-0.005em]"
        : "gap-[6px] px-[13px] text-[13.5px] font-medium tracking-[-0.005em]"
      : "gap-[5px] px-[11px] text-[12.5px] font-medium tracking-[-0.002em]";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex min-w-0 items-center gap-1", className)}
    >
      {options.map((option) => {
        const isActive = option.id === activeId;
        const shortLabel = shortLabelsById?.[option.id];
        return (
          <button
            key={option.id}
            id={`${idPrefix}-tab-${option.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            aria-disabled={option.disabled ? "true" : undefined}
            aria-label={forceIconOnly ? option.label : undefined}
            tabIndex={isActive || (!activeId && !option.disabled) ? 0 : -1}
            title={forceIconOnly ? option.label : undefined}
            disabled={option.disabled}
            onClick={() => onChange(option.id)}
            onKeyDown={(event) => handleKeyDown(event, option.id)}
            className={cn(
              "group inline-flex min-h-11 items-center rounded-[6px] py-2 leading-none transition-colors duration-150 ease-out focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              classesTaille,
              isActive
                ? "bg-(--preview-topnav-active) text-(--preview-topnav-ink)"
                : "text-(--preview-topnav-ink-3) hover:bg-(--preview-topnav-hover) hover:text-(--preview-topnav-ink)",
              option.disabled && "cursor-not-allowed opacity-45",
            )}
          >
            {option.icon ? (
              <span
                className={cn(
                  "material-symbols-outlined leading-none text-(--preview-topnav-accent)",
                  size === "principal" ? "text-[18px]" : "text-[16px]",
                  isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                )}
                aria-hidden="true"
              >
                {option.icon}
              </span>
            ) : null}

            {forceIconOnly ? (
              <span className="sr-only">{option.label}</span>
            ) : shortLabel && size === "principal" ? (
              <>
                <span className="max-[479px]:hidden">{option.label}</span>
                <span className="hidden max-[479px]:inline">{shortLabel}</span>
              </>
            ) : (
              <span>{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Panneau d'aperçu générique avec modes et sous-modes optionnels.
 *
 * Niveau 1 : navigation principale (Sommaire / Aperçu impression).
 * Niveau 2 : variantes d'aperçu imprimé (optionnel).
 * Niveau 3 : feuillets (optionnel, selon la variante active).
 */
export function PreviewPanel({
  modes,
  summaryModeId = DEFAULT_SUMMARY_MODE_ID,
  defaultModeId,
  onModeChange,
  children,
  className,
  switcherClassName,
  topBarClassName,
  actions,
  syncUrlState = true,
}: PreviewPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const tabPanelId = `preview-panel-content-${useId()}`;
  const topTabsPrefix = `preview-panel-top-${useId()}`;
  const subTabsPrefix = `preview-panel-sub-${useId()}`;
  const subSubTabsPrefix = `preview-panel-subsub-${useId()}`;

  const summaryMode = useMemo(
    () =>
      modeActifParId(modes, summaryModeId) ??
      modes.find((mode) => !mode.disabled) ??
      modes[0] ??
      null,
    [modes, summaryModeId],
  );

  const previewMode = useMemo(() => {
    if (!summaryMode) {
      return modes.find((mode) => !mode.disabled) ?? null;
    }
    return modes.find((mode) => mode.id !== summaryMode.id && !mode.disabled) ?? null;
  }, [modes, summaryMode]);

  const initialisation = useMemo(() => {
    const params = new URLSearchParams(queryKey);
    const vue = params.get(QUERY_PARAM_VUE);
    const mode = params.get(QUERY_PARAM_MODE);
    const feuillet = params.get(QUERY_PARAM_FEUILLET);

    const vueValide: VuePreview | null = vue === VUE_APERCU || vue === VUE_SOMMAIRE ? vue : null;

    const modeParDefaut =
      modeActifParId(modes, defaultModeId ?? null)?.id ?? summaryMode?.id ?? previewMode?.id ?? "";

    const modeFromVue =
      vueValide === VUE_APERCU
        ? (previewMode?.id ?? null)
        : vueValide === VUE_SOMMAIRE
          ? (summaryMode?.id ?? null)
          : null;

    const subModeInitial =
      vueValide === VUE_APERCU
        ? (modeActifParId(previewMode?.subModes, mode)?.id ?? undefined)
        : undefined;

    const subMode = modeActifParId(previewMode?.subModes, subModeInitial ?? null);
    const subSubModeInitial =
      vueValide === VUE_APERCU
        ? (modeActifParId(subMode?.subModes, feuillet)?.id ?? undefined)
        : undefined;

    return {
      modeId: modeFromVue ?? modeParDefaut,
      subModeId: subModeInitial,
      subSubModeId: subSubModeInitial,
    };
  }, [defaultModeId, modes, previewMode, queryKey, summaryMode]);

  const {
    currentModeId,
    setMode,
    currentSubModeId,
    currentSubModes,
    setSubMode,
    currentSubSubModeId,
    currentSubSubModes,
    setSubSubMode,
  } = usePreviewModes({
    modes,
    defaultModeId: initialisation.modeId,
    initialSubModeId: initialisation.subModeId,
    initialSubSubModeId: initialisation.subSubModeId,
    onModeChange,
  });

  const isSummaryActive = summaryMode ? currentModeId === summaryMode.id : false;
  const showSubModes = Boolean(!isSummaryActive && currentSubModes.length > 0);
  const showSubSubModes = Boolean(
    showSubModes && currentSubSubModes.length > 1 && currentSubModeId,
  );
  const showPrimaryAsIconOnly = showSubSubModes;
  const hasMobileOptions = showSubModes || showSubSubModes;

  const primaryModes = useMemo(() => {
    if (!summaryMode) {
      return modes.filter((mode) => !mode.disabled);
    }
    return [summaryMode, ...(previewMode ? [previewMode] : [])];
  }, [modes, previewMode, summaryMode]);

  const shortLabelsById = useMemo(() => {
    const labels: Record<string, string> = {};
    if (summaryMode) {
      labels[summaryMode.id] = PREVIEW_PANEL_SUMMARY_SHORT_LABEL;
    }
    if (previewMode) {
      labels[previewMode.id] = PREVIEW_PANEL_PRINT_SHORT_LABEL;
    }
    return labels;
  }, [previewMode, summaryMode]);

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const handleSetMode = (modeId: string) => {
    setMode(modeId);
    if (isOptionsOpen) {
      setIsOptionsOpen(false);
    }
  };

  const handleSetSubMode = (subModeId: string) => {
    setSubMode(subModeId);
  };

  const handleSetSubSubMode = (subSubModeId: string) => {
    setSubSubMode(subSubModeId);
  };

  useEffect(() => {
    if (!syncUrlState || !pathname || !summaryMode) return;

    const prochain = new URLSearchParams(searchParams.toString());
    if (isSummaryActive) {
      prochain.set(QUERY_PARAM_VUE, VUE_SOMMAIRE);
      prochain.delete(QUERY_PARAM_MODE);
      prochain.delete(QUERY_PARAM_FEUILLET);
    } else {
      prochain.set(QUERY_PARAM_VUE, VUE_APERCU);
      if (currentSubModeId) {
        prochain.set(QUERY_PARAM_MODE, currentSubModeId);
      } else {
        prochain.delete(QUERY_PARAM_MODE);
      }

      if (currentSubSubModeId) {
        prochain.set(QUERY_PARAM_FEUILLET, currentSubSubModeId);
      } else {
        prochain.delete(QUERY_PARAM_FEUILLET);
      }
    }

    const currentQuery = searchParams.toString();
    const nextQuery = prochain.toString();
    if (currentQuery === nextQuery) return;

    const nextUrl = nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [
    currentModeId,
    currentSubModeId,
    currentSubSubModeId,
    isSummaryActive,
    pathname,
    router,
    searchParams,
    summaryMode,
    syncUrlState,
  ]);

  return (
    <div className={cn("flex flex-col", className)}>
      {modes.length > 0 ? (
        <header
          className={cn(
            "border-b border-(--preview-topnav-line) bg-panel px-3 py-2 sm:px-4",
            topBarClassName,
          )}
        >
          <nav
            className={cn(
              "flex min-h-13 items-center gap-2 rounded-[10px] border border-(--preview-topnav-line) bg-panel px-2 py-1",
              switcherClassName,
            )}
            aria-label={PREVIEW_PANEL_MODE_ARIA}
          >
            <span
              className="material-symbols-outlined text-[20px] leading-none text-(--preview-topnav-accent)"
              aria-hidden="true"
            >
              preview
            </span>

            <span aria-hidden="true" className="h-5.5 w-px bg-(--preview-topnav-line)" />

            {primaryModes.length > 0 ? (
              <GroupeOnglets
                options={primaryModes}
                activeId={currentModeId}
                onChange={handleSetMode}
                ariaLabel={PREVIEW_PANEL_MODE_ARIA}
                idPrefix={topTabsPrefix}
                panelId={tabPanelId}
                shortLabelsById={shortLabelsById}
                forceIconOnly={showPrimaryAsIconOnly}
                size="principal"
                className="min-w-0 flex-1"
              />
            ) : null}

            <span
              aria-hidden="true"
              className={cn(
                "hidden h-4.5 w-px bg-(--preview-topnav-line) md:block",
                hasMobileOptions ? "md:block" : "md:hidden",
              )}
            />

            {showSubModes ? (
              <GroupeOnglets
                options={currentSubModes}
                activeId={currentSubModeId}
                onChange={handleSetSubMode}
                ariaLabel={PREVIEW_PANEL_VARIANT_ARIA}
                idPrefix={subTabsPrefix}
                size="secondaire"
                className="hidden md:flex"
              />
            ) : null}

            {showSubSubModes ? (
              <>
                <span
                  aria-hidden="true"
                  className="hidden h-4.5 w-px bg-(--preview-topnav-line) md:block"
                />
                <GroupeOnglets
                  options={currentSubSubModes}
                  activeId={currentSubSubModeId}
                  onChange={handleSetSubSubMode}
                  ariaLabel={PREVIEW_PANEL_FEUILLET_ARIA}
                  idPrefix={subSubTabsPrefix}
                  size="secondaire"
                  className="hidden md:flex"
                />
              </>
            ) : null}

            {hasMobileOptions ? (
              <button
                type="button"
                onClick={() => setIsOptionsOpen((value) => !value)}
                aria-label={PREVIEW_PANEL_OPTIONS_BUTTON_ARIA}
                aria-expanded={isOptionsOpen}
                aria-haspopup="dialog"
                className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] text-(--preview-topnav-ink-3) transition-colors duration-150 ease-out hover:bg-(--preview-topnav-hover) hover:text-(--preview-topnav-ink) focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:hidden"
              >
                <span
                  className="material-symbols-outlined text-[20px] leading-none text-(--preview-topnav-accent)"
                  aria-hidden="true"
                >
                  tune
                </span>
              </button>
            ) : null}

            {actions ? (
              <div className="ml-auto hidden items-center md:flex" aria-live="polite">
                {actions}
              </div>
            ) : null}
          </nav>

          {isOptionsOpen && hasMobileOptions ? (
            <div className="md:hidden">
              <button
                type="button"
                aria-label={PREVIEW_PANEL_OPTIONS_CLOSE_ARIA}
                className="fixed inset-0 z-40 bg-deep/35"
                onClick={() => setIsOptionsOpen(false)}
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-label={PREVIEW_PANEL_OPTIONS_TITLE}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-xl border border-border bg-panel p-4 shadow-[0_-12px_30px_rgb(0_0_0/0.18)]"
              >
                <div
                  className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border"
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {PREVIEW_PANEL_OPTIONS_TITLE}
                  </h3>
                  <button
                    type="button"
                    aria-label={PREVIEW_PANEL_OPTIONS_CLOSE_ARIA}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep"
                    onClick={() => setIsOptionsOpen(false)}
                  >
                    <span
                      className="material-symbols-outlined text-[20px] leading-none"
                      aria-hidden="true"
                    >
                      close
                    </span>
                  </button>
                </div>

                {showSubModes ? (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.06em] text-muted">
                      {PREVIEW_PANEL_VARIANT_ARIA}
                    </p>
                    <GroupeOnglets
                      options={currentSubModes}
                      activeId={currentSubModeId}
                      onChange={handleSetSubMode}
                      ariaLabel={PREVIEW_PANEL_VARIANT_ARIA}
                      idPrefix={`${subTabsPrefix}-mobile`}
                      size="secondaire"
                      className="flex-wrap"
                    />
                  </div>
                ) : null}

                {showSubSubModes ? (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.06em] text-muted">
                      {PREVIEW_PANEL_FEUILLET_ARIA}
                    </p>
                    <GroupeOnglets
                      options={currentSubSubModes}
                      activeId={currentSubSubModeId}
                      onChange={handleSetSubSubMode}
                      ariaLabel={PREVIEW_PANEL_FEUILLET_ARIA}
                      idPrefix={`${subSubTabsPrefix}-mobile`}
                      size="secondaire"
                      className="flex-wrap"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </header>
      ) : null}

      <div
        id={tabPanelId}
        role="tabpanel"
        aria-labelledby={`${topTabsPrefix}-tab-${currentModeId}`}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {children(currentModeId, currentSubModeId, currentSubSubModeId)}
      </div>
    </div>
  );
}
