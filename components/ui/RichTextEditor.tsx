"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useId, useRef } from "react";
import { simpleRichExtensions } from "@/components/tae/TaeForm/tiptap/baseExtensions";
import { RichTextEditorShell } from "@/components/ui/RichTextEditorShell";

const PROSE_MARKS =
  "ProseMirror w-full min-w-0 text-[13px] leading-relaxed text-deep focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_u]:underline";

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Hauteur minimale de la zone éditable (px). Défaut : 80. */
  minHeight?: number;
  id?: string;
  /** Identifiant stable pour `data-editor` / toolbar (défaut : `id` ou id React). */
  instanceId?: string;
  /** Persistance locale toutes les 10 s (même contrat que l’ancien `SimpleRichEditor`). */
  autosaveKey?: string;
  toolbarAriaLabel?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  className?: string;
};

/**
 * Éditeur riche TipTap (gras, italique, souligné, puces) — toolbar et chrome unifiés (`RichTextEditorShell`).
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 80,
  id,
  instanceId: instanceIdProp,
  autosaveKey,
  toolbarAriaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  className,
}: RichTextEditorProps) {
  const skipNextSyncRef = useRef(false);
  const generatedId = useId().replace(/:/g, "");
  const instanceId = instanceIdProp ?? id ?? `rte-${generatedId}`;

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: simpleRichExtensions(),
      content: value || "",
      editorProps: {
        attributes: {
          ...(id ? { id } : {}),
          class: PROSE_MARKS,
          style: `min-height: ${minHeight}px`,
          ...(ariaInvalid !== undefined ? { "aria-invalid": String(ariaInvalid) } : {}),
          ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
          ...(placeholder ? { "aria-placeholder": placeholder, "data-placeholder": placeholder } : {}),
        },
      },
      onUpdate: ({ editor: ed }) => {
        skipNextSyncRef.current = true;
        onChange(ed.getHTML());
      },
    },
    [],
  );

  useEffect(() => {
    if (!editor) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    const cur = editor.getHTML();
    if (value !== cur) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !autosaveKey) return;
    const timer = window.setInterval(() => {
      try {
        localStorage.setItem(autosaveKey, editor.getHTML());
      } catch {
        /* quota */
      }
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [editor, autosaveKey]);

  return (
    <RichTextEditorShell
      editor={editor}
      editorId={instanceId}
      toolbarAriaLabel={toolbarAriaLabel}
      className={className}
    >
      <EditorContent editor={editor} />
    </RichTextEditorShell>
  );
}
