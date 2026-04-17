"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { fetchEvaluationPickerPageAction } from "@/lib/actions/evaluation-picker";
import {
  saveEvaluationCompositionAction,
  type SaveEvaluationErrorCode,
  type SaveEvaluationResult,
} from "@/lib/actions/evaluation-save";
import { genererTokenApercuEpreuve } from "@/lib/actions/evaluation-apercu";
import {
  cumulativeDocRanges,
  formatDocRangeLabel,
  questionIndexForSlot,
} from "@/lib/evaluations/composition-numbering";
import type { EvaluationCartItem } from "@/lib/queries/evaluation-composition";
import type {
  EvaluationPickerPage,
  EvaluationPickerRow,
  EvaluationPickerSource,
} from "@/lib/queries/evaluation-tae-picker";
import {
  EVAL_COMP_ADD,
  EVAL_COMP_ALREADY_ADDED,
  EVAL_COMP_BADGE_BANK,
  EVAL_COMP_BADGE_MINE,
  EVAL_COMP_CART_EMPTY,
  EVAL_COMP_CART_TITLE,
  EVAL_COMP_LOAD_MORE,
  EVAL_COMP_MOVE_DOWN_LABEL,
  EVAL_COMP_MOVE_UP_LABEL,
  EVAL_COMP_PAGE_TITLE_EDIT,
  EVAL_COMP_PAGE_TITLE_NEW,
  EVAL_COMP_PREVIEW,
  EVAL_COMP_PICKER_TAB_BANK,
  EVAL_COMP_PICKER_TAB_MINE,
  EVAL_COMP_PUBLISH,
  EVAL_COMP_QUESTION_PREFIX,
  EVAL_COMP_REMOVE_LABEL,
  EVAL_COMP_SAVE_DRAFT,
  EVAL_COMP_TITLE_LABEL,
  evalCompCartCount,
  TOAST_EVAL_AUTH,
  TOAST_EVAL_GENERIC,
  TOAST_EVAL_NOT_FOUND,
  TOAST_EVAL_PUBLISH_EMPTY,
  TOAST_EVAL_PUBLISH_OK,
  TOAST_EVAL_RPC_MISSING,
  TOAST_EVAL_SAVE_DRAFT_OK,
  TOAST_EVAL_TAE_INELIGIBLE,
  TOAST_EVAL_TITRE_REQUIS,
} from "@/lib/ui/ui-copy";
import { plainConsigneForMiniature } from "@/lib/tae/consigne-helpers";
import { truncateText } from "@/lib/utils/stripHtml";
import { cn } from "@/lib/utils/cn";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

function toastForSaveError(code: SaveEvaluationErrorCode): void {
  switch (code) {
    case "auth":
      toast.error(TOAST_EVAL_AUTH);
      break;
    case "titre_requis":
    case "validation":
      toast.error(TOAST_EVAL_TITRE_REQUIS);
      break;
    case "publication_sans_tache":
      toast.error(TOAST_EVAL_PUBLISH_EMPTY);
      break;
    case "evaluation_introuvable":
      toast.error(TOAST_EVAL_NOT_FOUND);
      break;
    case "tache_non_eligible":
      toast.error(TOAST_EVAL_TAE_INELIGIBLE);
      break;
    case "rpc_function_missing":
      toast.error(TOAST_EVAL_RPC_MISSING);
      break;
    default:
      toast.error(TOAST_EVAL_GENERIC);
  }
}

export type EvaluationCompositionEditorProps = {
  mode: "new" | "edit";
  initialEvaluationId: string | null;
  initialTitre: string;
  initialCart: EvaluationCartItem[];
  initialBank: EvaluationPickerPage;
  initialMine: EvaluationPickerPage;
};

export function EvaluationCompositionEditor({
  mode,
  initialEvaluationId,
  initialTitre,
  initialCart,
  initialBank,
  initialMine,
}: EvaluationCompositionEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [evalId, setEvalId] = useState<string | null>(initialEvaluationId);
  const [titre, setTitre] = useState(initialTitre);
  const [cart, setCart] = useState<EvaluationCartItem[]>(initialCart);
  const [tab, setTab] = useState<EvaluationPickerSource>("bank");
  const [bankPage, setBankPage] = useState<EvaluationPickerPage>(initialBank);
  const [minePage, setMinePage] = useState<EvaluationPickerPage>(initialMine);

  const picker = tab === "bank" ? bankPage : minePage;

  const cartIds = useMemo(() => new Set(cart.map((c) => c.id)), [cart]);
  const docRanges = useMemo(() => cumulativeDocRanges(cart.map((c) => c.nbDocuments)), [cart]);

  const titreOk = titre.trim().length > 0;
  const canPublish = titreOk && cart.length > 0;

  const runSave = useCallback(
    (publish: boolean) => {
      startTransition(async () => {
        const payload = {
          evaluationId: evalId,
          titre: titre.trim(),
          taeIds: cart.map((c) => c.id),
        };
        const result: SaveEvaluationResult = await saveEvaluationCompositionAction(
          payload,
          publish,
        );
        if (!result.ok) {
          toastForSaveError(result.code);
          return;
        }
        if (publish) {
          toast.success(TOAST_EVAL_PUBLISH_OK);
        } else {
          toast.success(TOAST_EVAL_SAVE_DRAFT_OK);
        }
        setEvalId(result.evaluationId);
        if (mode === "new" || evalId !== result.evaluationId) {
          router.replace(`/evaluations/${result.evaluationId}/edit`);
        }
        router.refresh();
      });
    },
    [cart, evalId, mode, router, titre],
  );

  const runPreview = useCallback(() => {
    startTransition(async () => {
      const payload = {
        evaluationId: evalId,
        titre: titre.trim(),
        taeIds: cart.map((c) => c.id),
      };
      const result: SaveEvaluationResult = await saveEvaluationCompositionAction(payload, false);
      if (!result.ok) {
        toastForSaveError(result.code);
        return;
      }
      setEvalId(result.evaluationId);
      if (mode === "new" || evalId !== result.evaluationId) {
        router.replace(`/evaluations/${result.evaluationId}/edit`);
      }
      const tokenResult = await genererTokenApercuEpreuve(result.evaluationId);
      if (!tokenResult.ok) {
        toast.error(tokenResult.error);
        return;
      }
      window.open(
        `/apercu/${encodeURIComponent(tokenResult.token)}`,
        "_blank",
        "noopener,noreferrer",
      );
      router.refresh();
    });
  }, [cart, evalId, mode, router, titre]);

  const addRow = useCallback(
    (row: EvaluationPickerRow) => {
      if (cartIds.has(row.id)) return;
      setCart((prev) => [
        ...prev,
        { id: row.id, consigne: row.consigne, nbDocuments: row.nb_documents },
      ]);
    },
    [cartIds],
  );

  const removeAt = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((index: number, dir: -1 | 1) => {
    setCart((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const t = next[index]!;
      next[index] = next[j]!;
      next[j] = t;
      return next;
    });
  }, []);

  const loadMore = useCallback(() => {
    startTransition(async () => {
      const current = tab === "bank" ? bankPage : minePage;
      const nextPage = current.page + 1;
      const next = await fetchEvaluationPickerPageAction(tab, nextPage);
      const merge = (prev: EvaluationPickerPage): EvaluationPickerPage => ({
        ...next,
        rows: [...prev.rows, ...next.rows],
      });
      if (tab === "bank") setBankPage(merge);
      else setMinePage(merge);
    });
  }, [bankPage, minePage, tab]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
        {mode === "new" ? EVAL_COMP_PAGE_TITLE_NEW : EVAL_COMP_PAGE_TITLE_EDIT}
      </h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <Field
            id="evaluation-titre"
            label={EVAL_COMP_TITLE_LABEL}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
            maxLength={500}
            autoComplete="off"
          />

          <div className="mt-6 flex gap-2 border-b border-border">
            <button
              type="button"
              className={cn(
                "min-h-11 border-b-2 px-3 text-sm font-semibold transition-colors",
                tab === "bank"
                  ? "border-accent text-deep"
                  : "border-transparent text-muted hover:text-deep",
              )}
              onClick={() => setTab("bank")}
            >
              {EVAL_COMP_PICKER_TAB_BANK}
            </button>
            <button
              type="button"
              className={cn(
                "min-h-11 border-b-2 px-3 text-sm font-semibold transition-colors",
                tab === "mine"
                  ? "border-accent text-deep"
                  : "border-transparent text-muted hover:text-deep",
              )}
              onClick={() => setTab("mine")}
            >
              {EVAL_COMP_PICKER_TAB_MINE}
            </button>
          </div>

          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
            {picker.rows.length === 0 ? (
              <li className="p-6 text-sm text-muted">—</li>
            ) : (
              picker.rows.map((row) => {
                const preview = truncateText(plainConsigneForMiniature(row.consigne), 200);
                const inCart = cartIds.has(row.id);
                const meta = [row.oi_titre, row.niveau_label, row.discipline_label].filter(Boolean);
                return (
                  <li key={row.id} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            row.source === "bank"
                              ? "bg-accent/15 text-accent"
                              : "bg-muted/40 text-deep",
                          )}
                        >
                          {row.source === "bank" ? EVAL_COMP_BADGE_BANK : EVAL_COMP_BADGE_MINE}
                        </span>
                        <p className="line-clamp-3 text-sm leading-relaxed text-deep">
                          {preview || "—"}
                        </p>
                        {meta.length > 0 ? (
                          <p className="mt-2 text-xs text-muted">{meta.join(" · ")}</p>
                        ) : null}
                      </div>
                      <div className="shrink-0">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-11"
                          disabled={inCart || isPending}
                          onClick={() => addRow(row)}
                        >
                          {inCart ? EVAL_COMP_ALREADY_ADDED : EVAL_COMP_ADD}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          {picker.hasMore ? (
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                className="min-h-11"
                disabled={isPending}
                onClick={() => loadMore()}
              >
                {EVAL_COMP_LOAD_MORE}
              </Button>
            </div>
          ) : null}
        </div>

        <aside className="mt-10 lg:col-span-4 lg:mt-0">
          <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col rounded-2xl border border-border bg-panel shadow-sm">
            <div className="border-b border-border p-4">
              <h2 className="text-lg font-semibold text-deep">{EVAL_COMP_CART_TITLE}</h2>
              <p className="mt-1 text-sm text-muted">{evalCompCartCount(cart.length)}</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted">{EVAL_COMP_CART_EMPTY}</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {cart.map((item, i) => {
                    const preview = truncateText(plainConsigneForMiniature(item.consigne), 160);
                    const dr = docRanges[i] ?? { from: 0, to: 0 };
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-border bg-panel-alt/40 p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-muted">{i + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-3 text-sm text-deep">{preview || "—"}</p>
                            <p className="mt-2 text-xs text-muted">
                              {EVAL_COMP_QUESTION_PREFIX} {questionIndexForSlot(i)} ·{" "}
                              {formatDocRangeLabel(dr)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="icon-text inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-panel text-deep hover:bg-panel-alt"
                            aria-label={EVAL_COMP_MOVE_UP_LABEL}
                            disabled={i === 0 || isPending}
                            onClick={() => move(i, -1)}
                          >
                            <span className="material-symbols-outlined text-[1em]" aria-hidden>
                              arrow_upward
                            </span>
                          </button>
                          <button
                            type="button"
                            className="icon-text inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-panel text-deep hover:bg-panel-alt"
                            aria-label={EVAL_COMP_MOVE_DOWN_LABEL}
                            disabled={i >= cart.length - 1 || isPending}
                            onClick={() => move(i, 1)}
                          >
                            <span className="material-symbols-outlined text-[1em]" aria-hidden>
                              arrow_downward
                            </span>
                          </button>
                          <button
                            type="button"
                            className="icon-text inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-error/40 bg-panel px-3 text-sm text-error hover:bg-error/5"
                            aria-label={EVAL_COMP_REMOVE_LABEL}
                            disabled={isPending}
                            onClick={() => removeAt(i)}
                          >
                            <span className="material-symbols-outlined text-[1em]" aria-hidden>
                              close
                            </span>
                            {EVAL_COMP_REMOVE_LABEL}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="border-t border-border p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 w-full sm:order-first sm:w-auto sm:flex-none"
                  disabled={!titreOk || cart.length === 0 || isPending}
                  onClick={() => runPreview()}
                >
                  {EVAL_COMP_PREVIEW}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 flex-1"
                  disabled={!titreOk || isPending}
                  onClick={() => runSave(false)}
                >
                  {EVAL_COMP_SAVE_DRAFT}
                </Button>
                <Button
                  type="button"
                  className="min-h-11 flex-1"
                  disabled={!canPublish || isPending}
                  onClick={() => runSave(true)}
                >
                  {EVAL_COMP_PUBLISH}
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
