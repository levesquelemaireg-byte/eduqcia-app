"use client";

import { useEffect, useRef, useState } from "react";
import {
  LISTBOX_DROPDOWN_PANEL_CLASSES,
  LISTBOX_OPTION_ROW_CLASSES,
  listboxFieldClassName,
} from "@/components/ui/formSelectClasses";
import { BLOC2_STEPPER_ICON } from "@/components/tae/TaeForm/bloc2-stepper-icons";
import { LabelWithInfo } from "@/components/tae/TaeForm/bloc2/LabelWithInfo";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import type { ComportementAttenduJson } from "@/lib/types/oi";
import {
  BLOC2_COMPORTEMENT_FIELD_HELP,
  BLOC2_COMPORTEMENT_PREREQ_OI,
  SELECT_PLACEHOLDER_COMPORTEMENT,
} from "@/lib/ui/ui-copy";

const LABEL_ID = "tae-comportement-label";

type Props = {
  comportements: ComportementAttenduJson[];
  comportementId: string;
  disabled: boolean;
  /** Affiche le hint long ou le message de prérequis OI */
  oiSelected: boolean;
  onSelectComportement: (c: ComportementAttenduJson) => void;
  onInfoClick: () => void;
};

/**
 * Listbox custom — libellés longs avec retours à la ligne (`docs/DESIGN-SYSTEM.md` §3, select + texte long).
 * Le `<select>` natif ne permet pas de wrapper les options de façon fiable.
 */
export function ComportementPicker({
  comportements,
  comportementId,
  disabled,
  oiSelected,
  onSelectComportement,
  onInfoClick,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const selected = comportements.find((c) => c.id === comportementId);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = anchorRef.current;
      if (el && el.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div className="space-y-2">
      <div className="relative" ref={anchorRef}>
        <LabelWithInfo
          id={LABEL_ID}
          labelText="Comportement attendu"
          leadingIcon={BLOC2_STEPPER_ICON.comportement}
          leadingIconTitle={materialIconTooltip(BLOC2_STEPPER_ICON.comportement)}
          onInfoClick={onInfoClick}
        />
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-labelledby={LABEL_ID}
          disabled={disabled}
          onClick={() => setMenuOpen((o) => !o)}
          className={listboxFieldClassName({ className: "mt-2 max-w-2xl" })}
        >
          <span
            className={`min-w-0 flex-1 whitespace-normal wrap-break-word leading-snug ${
              selected ? "text-deep" : "text-muted"
            }`}
          >
            {selected ? selected.enonce : SELECT_PLACEHOLDER_COMPORTEMENT}
          </span>
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-muted" aria-hidden="true">
            expand_more
          </span>
        </button>
        {menuOpen && !disabled ? (
          <div
            className={`${LISTBOX_DROPDOWN_PANEL_CLASSES} max-w-2xl`}
            role="listbox"
            aria-labelledby={LABEL_ID}
          >
            {comportements.map((c) => {
              const isSelected = comportementId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelectComportement(c);
                    setMenuOpen(false);
                  }}
                  className={`${LISTBOX_OPTION_ROW_CLASSES} ${
                    isSelected ? "bg-accent/10" : "hover:bg-panel-alt"
                  }`}
                >
                  <span className="block whitespace-normal wrap-break-word">{c.enonce}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {oiSelected ? (
        <p className="text-sm leading-relaxed text-muted">{BLOC2_COMPORTEMENT_FIELD_HELP}</p>
      ) : (
        <p className="text-sm leading-relaxed text-muted">{BLOC2_COMPORTEMENT_PREREQ_OI}</p>
      )}
    </div>
  );
}
