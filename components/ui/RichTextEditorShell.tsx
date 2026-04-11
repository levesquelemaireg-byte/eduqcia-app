"use client";

import type { ReactNode } from "react";
import {
  RichTextEditorToolbar,
  type RichTextEditorToolbarProps,
} from "@/components/ui/RichTextEditorToolbar";
import { cn } from "@/lib/utils/cn";

export type RichTextEditorShellProps = Omit<RichTextEditorToolbarProps, "editor"> & {
  editor: RichTextEditorToolbarProps["editor"];
  /** Contenu : typiquement `<EditorContent editor={editor} />`. */
  children: ReactNode;
  className?: string;
  /** Contenu supplémentaire après les boutons standard dans la toolbar. */
  extraToolbarContent?: ReactNode;
};

/**
 * Cadre commun (bordure, focus, toolbar, zone de saisie) — éditeurs TipTap avec toolbar standard.
 */
export function RichTextEditorShell({
  editor,
  editorId,
  toolbarAriaLabel,
  showRestoreAmorce,
  onRestoreAmorce,
  templateButton,
  docInsertButtons,
  className,
  children,
  extraToolbarContent,
}: RichTextEditorShellProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border-[0.5px] border-solid border-[color:var(--color-border-secondary)] transition-colors duration-150 focus-within:border-[color:var(--color-border-info)]",
        className,
      )}
      data-rich-text-root={editorId}
    >
      <RichTextEditorToolbar
        editor={editor}
        editorId={editorId}
        toolbarAriaLabel={toolbarAriaLabel}
        showRestoreAmorce={showRestoreAmorce}
        onRestoreAmorce={onRestoreAmorce}
        templateButton={templateButton}
        docInsertButtons={docInsertButtons}
        extraContent={extraToolbarContent}
      />
      <div
        className="border-t-[0.5px] border-solid border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)] px-[11px] py-2"
        data-editor={editorId}
      >
        {children}
      </div>
    </div>
  );
}
