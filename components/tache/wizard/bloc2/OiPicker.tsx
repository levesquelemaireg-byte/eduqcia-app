"use client";

import { useEffect, useRef, useState } from "react";
import {
  LISTBOX_DROPDOWN_PANEL_CLASSES,
  LISTBOX_OPTION_ROW_CLASSES,
  listboxFieldClassName,
} from "@/components/ui/formSelectClasses";
import { cn } from "@/lib/utils/cn";
import { MaterialSymbolOiGlyph } from "@/components/ui/MaterialSymbolOiGlyph";
import { BLOC2_STEPPER_ICON } from "@/components/tache/wizard/bloc2-stepper-icons";
import { LabelWithInfo } from "@/components/tache/wizard/bloc2/LabelWithInfo";
import { materialIconTooltip } from "@/lib/tache/icon-justifications";
import type { OiEntryJson } from "@/lib/types/oi";
import {
  BLOC2_OI_COMING_SOON,
  BLOC2_OI_FIELD_HELP,
  BLOC2_OI_PREREQ_DISCIPLINE,
  SELECT_PLACEHOLDER_OI,
} from "@/lib/ui/ui-copy";

type Props = {
  oiList: OiEntryJson[];
  oiId: string;
  disciplineSet: boolean;
  selectedOi: OiEntryJson | undefined;
  onSelectOi: (id: string) => void;
  onInfoClick: () => void;
};

export function OiPicker({
  oiList,
  oiId,
  disciplineSet,
  selectedOi,
  onSelectOi,
  onInfoClick,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

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
          id="tache-oi-label"
          labelText="Opération intellectuelle"
          leadingIcon={BLOC2_STEPPER_ICON.oi}
          leadingIconTitle={materialIconTooltip(BLOC2_STEPPER_ICON.oi)}
          onInfoClick={onInfoClick}
        />
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={menuOpen}
          aria-labelledby="tache-oi-label"
          disabled={!disciplineSet}
          onClick={() => setMenuOpen((o) => !o)}
          className={listboxFieldClassName({
            className: "mt-2 max-w-xl items-center! gap-3 py-2.5",
          })}
        >
          {selectedOi ? (
            <>
              <MaterialSymbolOiGlyph
                glyph={selectedOi.icone}
                className="shrink-0 text-2xl text-accent"
                aria-hidden="true"
              />
              <span className="min-w-0 font-medium text-deep">{selectedOi.titre}</span>
            </>
          ) : (
            <span className="text-muted">{SELECT_PLACEHOLDER_OI}</span>
          )}
          <span className="material-symbols-outlined ml-auto text-muted" aria-hidden="true">
            expand_more
          </span>
        </button>
        {menuOpen && disciplineSet ? (
          <div
            className={`${LISTBOX_DROPDOWN_PANEL_CLASSES} left-0 right-0 max-w-xl`}
            role="listbox"
          >
            {oiList.map((oi) => {
              const selectable = oi.status === "active";
              const selected = oiId === oi.id;
              return (
                <button
                  key={oi.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!selectable}
                  onClick={() => {
                    if (!selectable) return;
                    onSelectOi(oi.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    LISTBOX_OPTION_ROW_CLASSES,
                    "icon-lead",
                    selected ? "bg-accent/10" : "hover:bg-panel-alt",
                    !selectable && "cursor-not-allowed opacity-55",
                  )}
                >
                  <MaterialSymbolOiGlyph
                    glyph={oi.icone}
                    className={cn(
                      "shrink-0 text-2xl leading-none",
                      selectable ? "text-accent" : "text-muted",
                    )}
                    aria-hidden="true"
                    title={materialIconTooltip(oi.icone)}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-deep">{oi.titre}</span>
                    {!selectable ? (
                      <span className="block text-xs text-muted">{BLOC2_OI_COMING_SOON}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-muted">
        {disciplineSet ? BLOC2_OI_FIELD_HELP : BLOC2_OI_PREREQ_DISCIPLINE}
      </p>
    </div>
  );
}
