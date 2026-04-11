"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/ui/miller-columns-layout.module.css";

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type RootProps = {
  children: ReactNode;
  /** Nombre de colonnes visibles (détermine la classe grid). */
  columnCount?: 3 | 4;
  /** Callback du bouton Réinitialiser dans le footer. */
  onReset?: () => void;
  /** Désactive le bouton Réinitialiser. */
  resetDisabled?: boolean;
  className?: string;
};

function Root({ children, columnCount = 3, onReset, resetDisabled, className }: RootProps) {
  const gridClass = columnCount === 4 ? styles.grid4 : styles.grid3;

  return (
    <div className={cn(styles.host, "w-full min-w-0", className)}>
      <div className="overflow-hidden rounded border border-border">
        <div className={cn(styles.grid, gridClass)}>{children}</div>
        {onReset ? (
          <div className="flex items-center justify-end border-t border-border bg-surface px-3 py-1">
            <button
              type="button"
              disabled={resetDisabled}
              onClick={onReset}
              className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted transition-colors hover:text-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[11px]" aria-hidden="true">
                restart_alt
              </span>
              Réinitialiser
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

type ColumnProps = {
  label: string;
  ariaLabel?: string;
  children: ReactNode;
};

function Column({ label, ariaLabel, children }: ColumnProps) {
  return (
    <div className={styles.col}>
      <div className="border-b border-border bg-surface px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
      <ul
        className="flex flex-col gap-0.5 p-1.5 text-left"
        role="listbox"
        aria-label={ariaLabel ?? label}
      >
        {children}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavItem (colonnes de navigation — avec chevron)
// ---------------------------------------------------------------------------

type NavItemProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function NavItem({ active, onClick, children }: NavItemProps) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-left text-sm leading-snug transition-colors",
          "min-w-0 max-w-full whitespace-normal break-words",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          active ? "bg-accent/10 font-medium text-accent" : "text-steel hover:bg-surface",
        )}
      >
        <span className="min-w-0">{children}</span>
        <span
          className="material-symbols-outlined shrink-0 text-[14px] opacity-40"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// CheckItem (dernière colonne — checkbox multi-select)
// ---------------------------------------------------------------------------

type CheckItemProps = {
  checked: boolean;
  onClick: () => void;
  children: ReactNode;
};

function CheckItem({ checked, onClick, children }: CheckItemProps) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={checked}
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-2.5 rounded-sm px-3 py-2 text-left text-sm leading-snug transition-colors",
          "min-w-0 max-w-full whitespace-normal break-words",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          checked ? "bg-accent/10 font-medium text-deep" : "text-steel hover:bg-surface",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-colors",
            checked ? "border-accent bg-accent" : "border-border",
          )}
        >
          {checked ? (
            <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
              <path
                d="M2 6.5L4.5 9L10 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0">{children}</span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// RadioItem (sélection unique — comme CheckItem mais radio)
// ---------------------------------------------------------------------------

type RadioItemProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
};

function RadioItem({ selected, onClick, children }: RadioItemProps) {
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onClick}
        className={cn(
          "flex w-full items-start gap-2.5 rounded-sm px-3 py-2 text-left text-sm leading-snug transition-colors",
          "min-w-0 max-w-full whitespace-normal break-words",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          selected ? "bg-accent/10 font-medium text-deep" : "text-steel hover:bg-surface",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
            selected ? "border-accent bg-accent" : "border-border",
          )}
        >
          {selected ? (
            <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
              <path
                d="M2 6.5L4.5 9L10 3"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0">{children}</span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return (
    <li className="flex flex-col items-center justify-center px-3 py-8 text-center">
      <span className="material-symbols-outlined text-[24px] text-muted/40" aria-hidden="true">
        arrow_selector_tool
      </span>
      <span className="mt-1 text-xs text-muted/60">{message}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Export compound
// ---------------------------------------------------------------------------

export const MillerColumnsLayout = Object.assign(Root, {
  Column,
  NavItem,
  CheckItem,
  RadioItem,
  EmptyState,
});
