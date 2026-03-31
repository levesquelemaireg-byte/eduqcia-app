"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { deleteWizardDraftAction } from "@/lib/actions/tae-draft";
import { deleteTaeAction } from "@/lib/actions/tae-delete";
import { TAE_DRAFT_STORAGE_KEY } from "@/lib/tae/tae-draft-storage-key";
import { cn } from "@/lib/utils/cn";
import {
  MY_QUESTIONS_DELETE_BLOCKED_IN_EVALUATION,
  MY_QUESTIONS_DELETE_MODAL_BODY,
  MY_QUESTIONS_DELETE_MODAL_CANCEL,
  MY_QUESTIONS_DELETE_MODAL_CONFIRM,
  MY_QUESTIONS_DELETE_MODAL_TITLE,
  MY_QUESTIONS_WIZARD_DELETE_MODAL_BODY,
  MY_QUESTIONS_WIZARD_DELETE_MODAL_TITLE,
  TOAST_MES_QUESTIONS_DELETED,
  TOAST_MES_QUESTIONS_DELETE_FAILED,
  TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETED,
  TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETE_FAILED,
} from "@/lib/ui/ui-copy";

type Props = {
  id: string;
  preview: string;
  isPublished: boolean;
  updatedAtLabel: string;
  /** Brouillon serveur (`tae_wizard_drafts`) — liens vers `/questions/new`, suppression dédiée. */
  isWizardServerDraft?: boolean;
};

export function MesQuestionsRow({
  id,
  preview,
  isPublished,
  updatedAtLabel,
  isWizardServerDraft = false,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmDelete = () => {
    startTransition(async () => {
      if (isWizardServerDraft) {
        const result = await deleteWizardDraftAction();
        setConfirmOpen(false);
        if (result.ok) {
          try {
            sessionStorage.removeItem(TAE_DRAFT_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          toast.success(TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETED);
          router.refresh();
          return;
        }
        toast.error(TOAST_MES_QUESTIONS_WIZARD_DRAFT_DELETE_FAILED);
        return;
      }

      const result = await deleteTaeAction(id);
      setConfirmOpen(false);
      if (result.ok) {
        toast.success(TOAST_MES_QUESTIONS_DELETED);
        router.refresh();
        return;
      }
      if (result.code === "in_use") {
        toast.error(MY_QUESTIONS_DELETE_BLOCKED_IN_EVALUATION);
        return;
      }
      toast.error(TOAST_MES_QUESTIONS_DELETE_FAILED);
    });
  };

  return (
    <li className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-3 text-sm leading-relaxed text-deep">{preview || "—"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                isPublished ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
              )}
            >
              {isPublished ? "Publié" : "Brouillon"}
            </span>
            <span aria-hidden="true">·</span>
            <span>Modifiée le {updatedAtLabel}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={isWizardServerDraft ? "/questions/new" : `/questions/${id}`}
            className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
          >
            Voir
          </Link>
          <Link
            href={isWizardServerDraft ? "/questions/new" : `/questions/${id}/edit`}
            className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-lg border border-border bg-panel px-3 text-sm font-semibold text-deep shadow-sm transition-colors hover:bg-panel-alt"
          >
            Modifier
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-lg border border-error/30 bg-panel px-3 text-sm font-semibold text-error shadow-sm transition-colors hover:bg-error/10"
          >
            Supprimer
          </button>
        </div>
      </div>

      <SimpleModal
        open={confirmOpen}
        title={
          isWizardServerDraft
            ? MY_QUESTIONS_WIZARD_DELETE_MODAL_TITLE
            : MY_QUESTIONS_DELETE_MODAL_TITLE
        }
        onClose={() => !isPending && setConfirmOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
              className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-semibold text-deep hover:bg-panel-alt disabled:opacity-60"
            >
              {MY_QUESTIONS_DELETE_MODAL_CANCEL}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleConfirmDelete}
              className="rounded-md bg-error px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {MY_QUESTIONS_DELETE_MODAL_CONFIRM}
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          {isWizardServerDraft
            ? MY_QUESTIONS_WIZARD_DELETE_MODAL_BODY
            : MY_QUESTIONS_DELETE_MODAL_BODY}
        </p>
      </SimpleModal>
    </li>
  );
}
