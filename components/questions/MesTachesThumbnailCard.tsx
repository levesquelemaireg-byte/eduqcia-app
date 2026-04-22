"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FicheThumbnail } from "@/components/tache/FicheThumbnail";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { deleteWizardDraftAction } from "@/lib/actions/tache-draft";
import { deleteTacheAction } from "@/lib/actions/tache-delete";
import { toThumbnailFicheData } from "@/lib/fiche/adapters/to-thumbnail-fiche-data";
import type { MyTacheThumbnailRow } from "@/lib/queries/my-tache-thumbnails";
import { TACHE_DRAFT_STORAGE_KEY } from "@/lib/tache/tache-draft-storage-key";
import { cn } from "@/lib/utils/cn";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
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
  row: MyTacheThumbnailRow;
};

const MENU_LINK =
  "flex items-center gap-3 px-4 py-2.5 text-sm text-steel transition-colors hover:bg-surface";

/**
 * Carte vignette TAÉ pour la page Mes tâches.
 * Wizard server draft : carte simplifiée sans FicheThumbnail.
 * TAÉ normale : FicheThumbnail + menu ⋮ (Voir / Modifier / Supprimer).
 */
export function MesTachesThumbnailCard({ row }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isWizardDraft = Boolean(row.isWizardServerDraft);
  const dateLabel = formatDateFrCaMedium(row.updated_at);

  const handleConfirmDelete = () => {
    startTransition(async () => {
      if (isWizardDraft) {
        const result = await deleteWizardDraftAction();
        setConfirmOpen(false);
        if (result.ok) {
          try {
            sessionStorage.removeItem(TACHE_DRAFT_STORAGE_KEY);
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

      const result = await deleteTacheAction(row.id);
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

  /* ── Wizard server draft : carte simplifiée ── */
  if (isWizardDraft) {
    return (
      <article className="relative rounded-2xl border border-border bg-panel shadow-sm">
        <Link href="/questions/new" className="block px-5 py-4 transition-shadow hover:shadow-md">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
                "bg-warning/15 text-warning",
              )}
            >
              Brouillon
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>Modifi&eacute;e le {dateLabel}</span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-deep">
            {row.consigne || "\u2014"}
          </p>
        </Link>
        {/* Menu ⋮ overlay */}
        <div className="pointer-events-none absolute right-2 top-2 z-10">
          <div className="pointer-events-auto">
            <CardMenuButton
              open={menuOpen}
              onToggle={() => setMenuOpen((p) => !p)}
              onClose={() => setMenuOpen(false)}
            >
              <Link href="/questions/new" className={MENU_LINK} role="menuitem">
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  edit
                </span>
                Reprendre
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                  delete
                </span>
                Supprimer
              </button>
            </CardMenuButton>
          </div>
        </div>
        <DeleteModal
          open={confirmOpen}
          isPending={isPending}
          isWizardDraft
          onClose={() => !isPending && setConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </article>
    );
  }

  /* ── TAÉ normale : FicheThumbnail + menu ⋮ ── */
  const tache = toThumbnailFicheData(row);

  return (
    <article
      className="relative rounded-2xl border border-border bg-panel shadow-sm"
      data-fiche-menu-shell
    >
      <FicheThumbnail tache={tache} />
      {/* Badge + date sous la vignette */}
      <div className="flex items-center gap-2 px-4 pb-3 text-xs text-muted">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
            row.is_published ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
          )}
        >
          {row.is_published ? "Publi\u00e9" : "Brouillon"}
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>Modifi&eacute;e le {dateLabel}</span>
      </div>
      {/* Menu ⋮ overlay */}
      <div className="pointer-events-none absolute right-2 top-2 z-10">
        <div className="pointer-events-auto">
          <CardMenuButton
            open={menuOpen}
            onToggle={() => setMenuOpen((p) => !p)}
            onClose={() => setMenuOpen(false)}
          >
            <Link href={`/questions/${row.id}`} className={MENU_LINK} role="menuitem">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                visibility
              </span>
              Voir
            </Link>
            <Link href={`/questions/${row.id}/edit`} className={MENU_LINK} role="menuitem">
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                edit
              </span>
              Modifier
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
              role="menuitem"
            >
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                delete
              </span>
              Supprimer
            </button>
          </CardMenuButton>
        </div>
      </div>
      <DeleteModal
        open={confirmOpen}
        isPending={isPending}
        isWizardDraft={false}
        onClose={() => !isPending && setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </article>
  );
}

/* ─── Inline sub-components ─── */

function CardMenuButton({
  open,
  onToggle,
  onClose,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors",
          "hover:bg-surface hover:text-deep",
        )}
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[1.2em]" aria-hidden="true">
          more_vert
        </span>
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" aria-hidden="true" onClick={onClose} />
          <div
            className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-xl border border-border bg-panel py-1 shadow-lg"
            role="menu"
          >
            {children}
          </div>
        </>
      ) : null}
    </>
  );
}

function DeleteModal({
  open,
  isPending,
  isWizardDraft,
  onClose,
  onConfirm,
}: {
  open: boolean;
  isPending: boolean;
  isWizardDraft: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <SimpleModal
      open={open}
      title={
        isWizardDraft ? MY_QUESTIONS_WIZARD_DELETE_MODAL_TITLE : MY_QUESTIONS_DELETE_MODAL_TITLE
      }
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-md border border-border bg-panel px-3 py-2 text-sm font-semibold text-deep hover:bg-panel-alt disabled:opacity-60"
          >
            {MY_QUESTIONS_DELETE_MODAL_CANCEL}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="rounded-md bg-error px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {MY_QUESTIONS_DELETE_MODAL_CONFIRM}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        {isWizardDraft ? MY_QUESTIONS_WIZARD_DELETE_MODAL_BODY : MY_QUESTIONS_DELETE_MODAL_BODY}
      </p>
    </SimpleModal>
  );
}
