"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { simpleRichExtensions } from "@/components/tae/TaeForm/tiptap/baseExtensions";
import { RichEditorToolbar } from "@/components/tae/TaeForm/tiptap/RichEditorToolbar";

type Props = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  minHeightClass?: string;
  autosaveKey: string;
};

export function SimpleRichEditor({
  id,
  value,
  onChange,
  minHeightClass = "min-h-[100px]",
  autosaveKey,
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
          class: `ProseMirror ${minHeightClass} px-4 py-3 text-sm leading-relaxed text-deep focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_u]:underline`,
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
    if (!editor) return;
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
    <div className="mt-2">
      <RichEditorToolbar editor={editor} editorId={id} />
      <div
        data-editor={id}
        className="rounded-b-lg border border-t-0 border-border bg-panel focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
