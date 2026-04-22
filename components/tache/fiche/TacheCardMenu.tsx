"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { WIZARD_PRINT_PREVIEW_COPY } from "@/components/tache/wizard/preview/wizard-print-preview-copy";
import { cn } from "@/lib/utils/cn";

type MenuContext = "lecture" | "list";

type Props = {
  tacheId: string;
  isAuteur: boolean;
  /** `lecture` : pas de « Voir » (déjà sur la fiche). `list` : vignette / liste. */
  menuContext?: MenuContext;
  /** Lecture : route impression dédiée (nouvel onglet). */
  printHref?: string;
  /** Wizard / autre : ouvre la modale « Aperçu avant impression ». */
  onOpenPrint?: () => void;
};

function computeMenuCoords(trigger: HTMLElement): { top: number; right: number } | null {
  const shell = trigger.closest("[data-fiche-menu-shell]");
  const br = trigger.getBoundingClientRect();
  const margin = 8;
  /** Marge intérieure : aligner le panneau sur le bord droit « carte », pas sur le seul bouton. */
  const shellInset = 12;
  const right = shell
    ? Math.max(margin, window.innerWidth - shell.getBoundingClientRect().right + shellInset)
    : Math.max(margin, window.innerWidth - br.right);
  return { top: br.bottom + margin, right };
}

function useMenuCoordsWhileOpen(open: boolean, triggerRef: RefObject<HTMLButtonElement | null>) {
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  const measureFromRef = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return null;
    return computeMenuCoords(el);
  }, [triggerRef]);

  useEffect(() => {
    if (!open) return;
    const handler = () => {
      const m = measureFromRef();
      if (m) setCoords(m);
    };
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, measureFromRef]);

  const pos = open ? coords : null;
  return { coords, setCoords, measureFromRef, pos };
}

/** FICHE-TACHE.md §19.4 — menu ⋮ ; lecture : sans « Voir », dropdown fixé au bord carte. */
export function TacheCardMenu({
  tacheId,
  isAuteur,
  menuContext = "list",
  printHref,
  onOpenPrint,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { setCoords, measureFromRef, pos } = useMenuCoordsWhileOpen(open, triggerRef);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setCoords(null);
  }, [setCoords]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!isAuteur) return;
    if (typeof window !== "undefined" && window.confirm("Supprimer cette tâche ?")) {
      /* branchement API à venir */
      router.refresh();
    }
  }, [isAuteur, router]);

  const showVoir = menuContext === "list";

  if (menuContext === "lecture" && !isAuteur && !printHref && !onOpenPrint) {
    return null;
  }

  const linkRow =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-steel transition-colors hover:bg-surface";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) {
            setCoords(null);
            setOpen(false);
            return;
          }
          const m = measureFromRef();
          setCoords(m);
          setOpen(true);
        }}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors",
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
          <div className="fixed inset-0 z-10" aria-hidden="true" onClick={closeMenu} />
          {pos ? (
            <div
              className="fixed z-20 min-w-[160px] max-w-[min(100vw-1rem,16rem)] rounded-xl border border-border bg-panel py-1 shadow-lg"
              style={{ top: pos.top, right: pos.right }}
              role="menu"
            >
              {showVoir ? (
                <Link
                  href={`/questions/${tacheId}`}
                  className={linkRow}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    visibility
                  </span>
                  Voir
                </Link>
              ) : null}
              {isAuteur ? (
                <Link
                  href={`/questions/${tacheId}/edit`}
                  className={linkRow}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    edit
                  </span>
                  Modifier
                </Link>
              ) : null}
              {menuContext === "lecture" && printHref ? (
                <Link
                  href={printHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkRow}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    print
                  </span>
                  {WIZARD_PRINT_PREVIEW_COPY.print}
                </Link>
              ) : null}
              {menuContext === "lecture" && !printHref && onOpenPrint ? (
                <button
                  type="button"
                  className={cn(linkRow, "w-full text-left")}
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onOpenPrint();
                  }}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    print
                  </span>
                  {WIZARD_PRINT_PREVIEW_COPY.print}
                </button>
              ) : null}
              {isAuteur ? (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleDelete();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                  role="menuitem"
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    delete
                  </span>
                  Supprimer
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
