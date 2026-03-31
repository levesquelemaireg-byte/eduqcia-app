"use client";

import type { Editor } from "@tiptap/core";

type Cmd = "bold" | "italic" | "underline" | "bulletList";

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
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={pressed}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md text-deep transition-colors hover:bg-panel-alt ${
        pressed ? "bg-accent/15 text-accent" : "text-muted"
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
      <span className="material-symbols-outlined text-[1.25rem]" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

export function RichEditorToolbar({
  editor,
  editorId,
  showRestoreIntro,
  onRestoreIntro,
  toolbarAriaLabel,
}: {
  editor: Editor | null;
  editorId: string;
  showRestoreIntro?: boolean;
  onRestoreIntro?: () => void;
  /** Surcharge du `aria-label` du toolbar (ex. source documentaire). */
  toolbarAriaLabel?: string;
}) {
  const b = editor?.isActive("bold") ?? false;
  const i = editor?.isActive("italic") ?? false;
  const u = editor?.isActive("underline") ?? false;
  const bl = editor?.isActive("bulletList") ?? false;

  const defaultToolbarLabel =
    editorId === "consigne" ? "Mise en forme de la consigne" : "Mise en forme";

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-border bg-panel-alt/80 px-2 py-1.5"
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
      <span className="mx-1 h-6 w-px border-l border-border" aria-hidden="true" />
      <ToolbarBtn
        editor={editor}
        cmd="bulletList"
        title="Liste à puces"
        icon="format_list_bulleted"
        pressed={bl}
      />
      {showRestoreIntro && onRestoreIntro ? (
        <>
          <span className="mx-1 h-6 w-px border-l border-border" aria-hidden="true" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRestoreIntro}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-accent hover:bg-accent/10"
          >
            <span className="material-symbols-outlined text-[1.1rem]" aria-hidden="true">
              refresh
            </span>
            Réinsérer l&apos;introduction
          </button>
        </>
      ) : null}
    </div>
  );
}
