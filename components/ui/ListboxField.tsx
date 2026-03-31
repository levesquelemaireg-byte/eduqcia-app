"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import {
  LISTBOX_DROPDOWN_PANEL_CLASSES,
  LISTBOX_OPTION_ROW_CLASSES,
  listboxFieldClassName,
} from "@/components/ui/formSelectClasses";

export type ListboxOption = { value: string; label: string };

export type ListboxFieldProps = {
  id: string;
  options: ListboxOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Libellé quand `value === ""` (et première ligne si `allowEmpty`). */
  placeholder?: string;
  /** Affiche une valeur vide : première option avec `value` "" */
  allowEmpty?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

/**
 * Listbox accessible — remplace le `<select>` natif partout dans l’app.
 * Libellés avec retours à la ligne (`wrap-break-word`, `leading-snug`).
 */
export const ListboxField = forwardRef<HTMLButtonElement, ListboxFieldProps>(function ListboxField(
  {
    id,
    options,
    value,
    onChange,
    onBlur,
    placeholder = "Sélectionner",
    allowEmpty = false,
    disabled,
    error,
    className,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = containerRef.current;
      if (el && el.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = value === "" ? placeholder : (selected?.label ?? placeholder);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={ref}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onBlur={onBlur}
        className={listboxFieldClassName({ error, className })}
      >
        <span className="min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-snug text-deep">
          {display}
        </span>
        <span className="material-symbols-outlined mt-0.5 shrink-0 text-muted" aria-hidden="true">
          expand_more
        </span>
      </button>
      {open && !disabled ? (
        <div id={listboxId} className={LISTBOX_DROPDOWN_PANEL_CLASSES} role="listbox">
          {allowEmpty ? (
            <button
              type="button"
              role="option"
              aria-selected={value === ""}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`${LISTBOX_OPTION_ROW_CLASSES} ${
                value === "" ? "bg-accent/10" : "hover:bg-panel-alt"
              }`}
            >
              <span className="block whitespace-normal wrap-break-word">{placeholder}</span>
            </button>
          ) : null}
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`${LISTBOX_OPTION_ROW_CLASSES} ${
                  isSelected ? "bg-accent/10" : "hover:bg-panel-alt"
                }`}
              >
                <span className="block whitespace-normal wrap-break-word">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
