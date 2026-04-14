"use client";

import { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils/cn";
import {
  LISTBOX_DROPDOWN_PANEL_CLASSES,
  LISTBOX_OPTION_ROW_CLASSES,
  listboxFieldClassName,
} from "@/components/ui/formSelectClasses";

export type ComboboxOption = { value: string; label: string };

export type ComboboxFieldProps = {
  id: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
};

/**
 * Combobox accessible — pour les longues listes (CSS, écoles).
 * Filtrage local avec recherche textuelle.
 * Styles cohérents avec ListboxField via les classes partagées.
 */
export function ComboboxField({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Rechercher…",
  disabled,
  error,
  loading,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filtered =
    query.trim() === ""
      ? options
      : options.filter((o) => normalize(o.label).includes(normalize(query)));

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll vers l'option active
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const active = listRef.current.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function handleSelect(val: string) {
    onChange(val);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  const displayValue = open ? query : (selected?.label ?? "");

  return (
    <div className="relative" ref={containerRef}>
      <div className={listboxFieldClassName({ error, className })}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-activedescendant={
            open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={(e) => {
            // Ne pas fermer si on clique dans le dropdown
            if (containerRef.current?.contains(e.relatedTarget as Node)) return;
            setOpen(false);
            setQuery("");
            onBlur?.();
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-deep outline-none placeholder:text-muted"
        />
        {loading ? (
          <span
            className="material-symbols-outlined shrink-0 animate-spin text-[1em] leading-none text-muted"
            aria-hidden="true"
          >
            progress_activity
          </span>
        ) : (
          <span
            className="material-symbols-outlined shrink-0 text-[1em] leading-none text-muted"
            aria-hidden="true"
          >
            {open ? "expand_less" : "expand_more"}
          </span>
        )}
      </div>

      {open && !disabled ? (
        <div id={listboxId} ref={listRef} className={LISTBOX_DROPDOWN_PANEL_CLASSES} role="listbox">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-muted">Aucun résultat</div>
          ) : (
            filtered.map((opt, i) => {
              const isSelected = value === opt.value;
              const isActive = activeIndex === i;
              return (
                <button
                  key={opt.value}
                  id={`${listboxId}-opt-${i}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    LISTBOX_OPTION_ROW_CLASSES,
                    isSelected && "bg-accent/10",
                    isActive && !isSelected && "bg-panel-alt",
                    !isSelected && !isActive && "hover:bg-panel-alt",
                  )}
                >
                  <span className="block min-w-0 whitespace-normal wrap-break-word">
                    {opt.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
