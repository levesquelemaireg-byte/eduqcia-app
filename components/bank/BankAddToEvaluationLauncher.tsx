"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  listDraftEvaluationsAction,
  type DraftEvaluationOption,
} from "@/lib/actions/evaluation-save";
import { Button } from "@/components/ui/Button";
import { SimpleModal } from "@/components/ui/SimpleModal";
import {
  BANK_TASK_ADD_TO_EVALUATION,
  EVAL_BANK_MODAL_CANCEL,
  EVAL_BANK_MODAL_EMPTY,
  EVAL_BANK_MODAL_GO,
  EVAL_BANK_MODAL_TITLE,
} from "@/lib/ui/ui-copy";

type Props = {
  tacheId: string;
};

export function BankAddToEvaluationLauncher({ tacheId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<DraftEvaluationOption[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleOpen = () => {
    setOpen(true);
    setPicked(null);
    startTransition(async () => {
      const d = await listDraftEvaluationsAction();
      setDrafts(d);
    });
  };

  const handleGo = () => {
    if (!picked) return;
    router.push(`/evaluations/${picked}/edit?addTache=${encodeURIComponent(tacheId)}`);
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="secondary" className="min-h-11" onClick={handleOpen}>
        {BANK_TASK_ADD_TO_EVALUATION}
      </Button>
      <SimpleModal
        open={open}
        title={EVAL_BANK_MODAL_TITLE}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => setOpen(false)}
            >
              {EVAL_BANK_MODAL_CANCEL}
            </Button>
            <Button
              type="button"
              className="min-h-11"
              disabled={!picked || pending}
              onClick={handleGo}
            >
              {EVAL_BANK_MODAL_GO}
            </Button>
          </div>
        }
      >
        {pending && drafts.length === 0 ? (
          <p className="text-sm text-muted">…</p>
        ) : drafts.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">{EVAL_BANK_MODAL_EMPTY}</p>
        ) : (
          <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto" role="listbox">
            {drafts.map((d) => (
              <li key={d.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-panel-alt/40 p-3">
                  <input
                    type="radio"
                    name="draft-eval"
                    className="mt-1 accent-accent"
                    checked={picked === d.id}
                    onChange={() => setPicked(d.id)}
                  />
                  <span className="text-sm text-deep">{d.titre}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </SimpleModal>
    </>
  );
}
