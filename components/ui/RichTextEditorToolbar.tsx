"use client";

import type { Editor } from "@tiptap/core";
import { HoverTip } from "@/components/ui/HoverTip";

type Cmd = "bold" | "italic" | "underline" | "bulletList";

/** Classes du bouton toolbar — réutilisées par les boutons custom (citation, etc.). */
export const TOOLBAR_BTN_BASE =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[color-mix(in_srgb,var(--color-muted)_10%,transparent)]";
export const TOOLBAR_BTN_INACTIVE = `${TOOLBAR_BTN_BASE} text-[color:var(--color-text-secondary)]`;
export const TOOLBAR_SEP_CLASS =
  "mx-0.5 h-3.5 w-0 shrink-0 self-center border-l-[0.5px] border-solid border-[color:var(--color-border-tertiary)]";

function ToolbarBtn({
  editor,
  cmd,
  title,
  icon,
  pressed,
}: {
  editor: Editor | null;
  cmd: Cmd;
  title: string;
  icon: string;
  pressed: boolean;
}) {
  return (
    <HoverTip label={title}>
      <button
        type="button"
        aria-label={title}
        aria-pressed={pressed}
        className={`${TOOLBAR_BTN_BASE} ${
          pressed ? "bg-accent/15 text-accent" : "text-[color:var(--color-text-secondary)]"
        }`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!editor) return;
          const chain = editor.chain().focus();
          if (cmd === "bold") chain.toggleBold().run();
          else if (cmd === "italic") chain.toggleItalic().run();
          else if (cmd === "underline") chain.toggleUnderline().run();
          else if (cmd === "bulletList") chain.toggleBulletList().run();
        }}
      >
        <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
          {icon}
        </span>
      </button>
    </HoverTip>
  );
}

function ToolbarSep() {
  return <span className={TOOLBAR_SEP_CLASS} aria-hidden="true" />;
}

export type RichTextEditorToolbarProps = {
  editor: Editor | null;
  editorId: string;
  showRestoreAmorce?: boolean;
  onRestoreAmorce?: () => void;
  toolbarAriaLabel?: string;
  /** Bouton optionnel « Utiliser un modèle de consigne » (perspectives OI3). */
  templateButton?: { label: string; onClick: () => void };
  /** Boutons d'insertion de référence document — un par slot actif (Bloc 3 consigne). */
  docInsertButtons?: ReadonlyArray<{
    slot: string;
    label: string;
    onInsert: () => void;
  }>;
  /** Contenu supplémentaire rendu à la fin de la toolbar (ex. boutons citation). */
  extraContent?: React.ReactNode;
};

/**
 * Barre B / I / U / puces — unique implémentation pour tous les éditeurs TipTap « simples » et la consigne.
 */
export function RichTextEditorToolbar({
  editor,
  editorId,
  showRestoreAmorce,
  onRestoreAmorce,
  toolbarAriaLabel,
  templateButton,
  docInsertButtons,
  extraContent,
}: RichTextEditorToolbarProps) {
  const b = editor?.isActive("bold") ?? false;
  const i = editor?.isActive("italic") ?? false;
  const u = editor?.isActive("underline") ?? false;
  const bl = editor?.isActive("bulletList") ?? false;

  const defaultToolbarLabel =
    editorId === "consigne" ? "Mise en forme de la consigne" : "Mise en forme";

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 bg-transparent px-2 py-1"
      role="toolbar"
      aria-label={toolbarAriaLabel ?? defaultToolbarLabel}
    >
      <ToolbarBtn editor={editor} cmd="bold" title="Gras" icon="format_bold" pressed={b} />
      <ToolbarBtn editor={editor} cmd="italic" title="Italique" icon="format_italic" pressed={i} />
      <ToolbarBtn
        editor={editor}
        cmd="underline"
        title="Souligné"
        icon="format_underlined"
        pressed={u}
      />
      <ToolbarSep />
      <ToolbarBtn
        editor={editor}
        cmd="bulletList"
        title="Liste à puces"
        icon="format_list_bulleted"
        pressed={bl}
      />
      {docInsertButtons && docInsertButtons.length > 0 ? (
        <>
          <ToolbarSep />
          {docInsertButtons.map((btn) => {
            return (
              <button
                key={btn.slot}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={btn.onInsert}
                aria-label={`Insérer ${btn.label}`}
                className="inline-flex h-7 max-w-full cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-1.5 text-[12px] font-medium text-accent hover:bg-accent/10"
              >
                <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
                  article
                </span>
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </>
      ) : null}
      {showRestoreAmorce && onRestoreAmorce ? (
        <>
          <ToolbarSep />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRestoreAmorce}
            className="inline-flex h-7 max-w-full items-center gap-1 rounded-md px-1.5 text-xs font-medium text-accent hover:bg-accent/10"
          >
            <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
              refresh
            </span>
            <span className="truncate">Réinsérer l&apos;amorce</span>
          </button>
        </>
      ) : null}
      {templateButton ? (
        <>
          <ToolbarSep />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={templateButton.onClick}
            className="inline-flex h-7 max-w-full items-center gap-1 rounded-md px-1.5 text-xs font-medium text-accent hover:bg-accent/10"
          >
            <span className="material-symbols-outlined text-[12px]" aria-hidden="true">
              auto_fix_high
            </span>
            <span className="truncate">{templateButton.label}</span>
          </button>
        </>
      ) : null}
      {extraContent}
    </div>
  );
}
