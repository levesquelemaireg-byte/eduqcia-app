"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { deleteEvaluationAction } from "@/lib/actions/evaluation-delete";
import {
  MY_EVALUATIONS_DELETE_MODAL_BODY,
  MY_EVALUATIONS_DELETE_MODAL_CANCEL,
  MY_EVALUATIONS_DELETE_MODAL_CONFIRM,
  MY_EVALUATIONS_DELETE_MODAL_TITLE,
  TOAST_MES_EVALUATIONS_DELETED,
  TOAST_MES_EVALUATIONS_DELETE_FAILED,
} from "@/lib/ui/ui-copy";

type Props = {
  evaluationId: string;
};

export function DeleteEvaluationButton({ evaluationId }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    startTransition(async () => {
      const result = await deleteEvaluationAction(evaluationId);
      setConfirmOpen(false);
      if (result.ok) {
        toast.success(TOAST_MES_EVALUATIONS_DELETED);
        router.refresh();
      } else {
        toast.error(TOAST_MES_EVALUATIONS_DELETE_FAILED);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-error shadow-sm transition-colors hover:bg-error/5"
      >
        Supprimer
      </button>

      <SimpleModal
        open={confirmOpen}
        title={MY_EVALUATIONS_DELETE_MODAL_TITLE}
        onClose={() => !isPending && setConfirmOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
              className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-semibold text-deep hover:bg-panel-alt disabled:opacity-60"
            >
              {MY_EVALUATIONS_DELETE_MODAL_CANCEL}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirmDelete}
              className="rounded-md bg-error px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {isPending ? "Suppression…" : MY_EVALUATIONS_DELETE_MODAL_CONFIRM}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">{MY_EVALUATIONS_DELETE_MODAL_BODY}</p>
      </SimpleModal>
    </>
  );
}
