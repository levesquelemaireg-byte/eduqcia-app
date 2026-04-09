"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import {
  LISTBOX_DROPDOWN_PANEL_CLASSES,
  LISTBOX_OPTION_ROW_CLASSES,
  listboxFieldClassName,
} from "@/components/ui/formSelectClasses";
import { cn } from "@/lib/utils/cn";

export type ListboxOption = {
  value: string;
  label: string;
  /**
   * Icône Material Symbols Outlined optionnelle, affichée à gauche du label
   * dans le bouton sélectionné et dans chaque ligne du dropdown.
   * Si aucune option n'a d'icône, le rendu est strictement identique au mode texte pur.
   */
  icon?: string;
  /**
   * Option visible mais non sélectionnable (rendu grisé).
   * Utile pour annoncer un futur niveau / catégorie « bientôt disponible ».
   */
  disabled?: boolean;
};

export type ListboxFieldProps = {
  id: string;
  options: ListboxOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /**
   * Texte affiché quand `value === ""` (et première ligne du dropdown si `allowEmpty`).
   * Doit suivre la convention « Sélectionner un/une [label] » — voir
   * `docs/DESIGN-SYSTEM.md` § « Règles absolues des selects ».
   */
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
 * Listbox accessible — remplace le `<select>` natif partout dans l'app.
 * Libellés avec retours à la ligne (`wrap-break-word`, `leading-snug`).
 * Supporte optionnellement une icône Material Symbols Outlined par option.
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
  const isPlaceholder = value === "" || selected === undefined;
  const display = isPlaceholder ? placeholder : selected.label;
  const selectedIcon = selected?.icon;

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
        {selectedIcon && !isPlaceholder ? (
          <span
            className="material-symbols-outlined shrink-0 text-[1.1em] text-accent"
            aria-hidden="true"
          >
            {selectedIcon}
          </span>
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 whitespace-normal wrap-break-word text-left leading-snug",
            isPlaceholder ? "text-muted" : "text-deep",
          )}
        >
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
              <span className="block whitespace-normal wrap-break-word text-muted">
                {placeholder}
              </span>
            </button>
          ) : null}
          {options.map((opt) => {
            const isSelected = value === opt.value;
            const isDisabled = opt.disabled === true;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  LISTBOX_OPTION_ROW_CLASSES,
                  opt.icon && "flex items-center gap-2",
                  isSelected ? "bg-accent/10" : !isDisabled && "hover:bg-panel-alt",
                  isDisabled && "cursor-not-allowed opacity-55",
                )}
              >
                {opt.icon ? (
                  <span
                    className="material-symbols-outlined shrink-0 text-[1.1em] text-accent"
                    aria-hidden="true"
                  >
                    {opt.icon}
                  </span>
                ) : null}
                <span className="block min-w-0 flex-1 whitespace-normal wrap-break-word">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
});
