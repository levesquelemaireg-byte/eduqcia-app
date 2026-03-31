"use client";

/**
 * Modale d’avertissement (risque / conséquence) — distincte de **`SimpleModal`** + **`titleStyle="info-help"`** (aide).
 * En-tête : glyphe Material **`warning`** en **`text-warning`**, fond d’en-tête **`bg-warning/10`**, bordure **`border-warning/25`**.
 * Focus : à l’ouverture, le panneau **`role="dialog"`** reçoit le focus (`tabIndex={-1}`) pour le piégeage tab basique avec le navigateur.
 *
 * @see docs/DESIGN-SYSTEM.md — Modales (warning vs info-tooltip)
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type WarningModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  panelClassName?: string;
  fitContentHeight?: boolean;
};

export function WarningModal({
  open,
  title,
  onClose,
  children,
  footer,
  panelClassName,
  fitContentHeight = false,
}: WarningModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const panel = (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "relative z-10 flex w-full flex-col rounded-md border border-warning/35 bg-panel shadow-lg outline-none",
        fitContentHeight ? "pointer-events-auto max-h-none" : "max-h-[min(90vh,720px)]",
        panelClassName ?? "max-w-lg",
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-warning/25 bg-warning/10 px-4 py-3 md:px-5">
        <h2
          id={titleId}
          className="icon-text min-w-0 flex-1 text-lg font-semibold leading-snug text-deep"
        >
          <span
            className="material-symbols-outlined shrink-0 text-[1.15em] text-warning"
            aria-hidden="true"
          >
            warning
          </span>
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-panel hover:text-deep"
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            close
          </span>
        </button>
      </header>
      <div
        className={cn(
          "px-4 py-3 text-sm text-deep md:px-5 md:py-4",
          fitContentHeight
            ? "shrink-0 overflow-x-clip overflow-y-visible"
            : "min-h-0 flex-1 overflow-y-auto",
        )}
      >
        {children}
      </div>
      {footer != null ? (
        <footer className="shrink-0 border-t border-border px-4 py-3 md:px-5">{footer}</footer>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 p-4",
        fitContentHeight ? "overflow-y-auto" : "flex items-center justify-center",
      )}
      role="presentation"
    >
      <button
        type="button"
        className={cn(
          "cursor-pointer bg-black/50",
          fitContentHeight ? "fixed inset-0 z-0" : "absolute inset-0",
        )}
        aria-label="Fermer la fenêtre"
        onClick={onClose}
      />
      {fitContentHeight ? (
        <div className="pointer-events-none relative z-10 flex min-h-full w-full flex-col items-center justify-center py-8">
          {panel}
        </div>
      ) : (
        panel
      )}
    </div>
  );
}
