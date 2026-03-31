"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { simpleRichExtensions } from "@/components/tae/TaeForm/tiptap/baseExtensions";
import { RichEditorToolbar } from "@/components/tae/TaeForm/tiptap/RichEditorToolbar";

type Props = {
  value: string;
  onChange: (html: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** Libellé accessibilité de la barre d’outils — défaut : mise en forme de la source. */
  toolbarAriaLabel?: string;
};

/**
 * Source documentaire — gras, italique, souligné, puces (même socle que corrigé / guidage, sans DocRef).
 */
export function DocumentSourceRichEditor({
  value,
  onChange,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  toolbarAriaLabel = "Mise en forme de la source",
}: Props) {
  const skipNextSyncRef = useRef(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: simpleRichExtensions(),
      content: value || "",
      editorProps: {
        attributes: {
          ...(id ? { id } : {}),
          class:
            "ProseMirror min-h-[88px] px-4 py-2.5 text-sm leading-relaxed text-deep focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_u]:underline",
          ...(ariaInvalid !== undefined ? { "aria-invalid": String(ariaInvalid) } : {}),
          ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
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

  return (
    <div className="space-y-0">
      <RichEditorToolbar
        editor={editor}
        editorId="source-citation"
        toolbarAriaLabel={toolbarAriaLabel}
      />
      <div
        data-editor="source-citation"
        className="rounded-b-lg border border-t-0 border-border bg-panel focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
