"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { consigneExtensions } from "@/components/tae/TaeForm/tiptap/baseExtensions";
import {
  buildIntroInlineContent,
  insertIntroPhrase,
} from "@/components/tae/TaeForm/tiptap/insertIntro";
import { CONSIGNE_DOC_INSERT_BUTTON_CLASS } from "@/components/tae/TaeForm/tiptap/consigneDocBadgeStyles";
import { RichEditorToolbar } from "@/components/tae/TaeForm/tiptap/RichEditorToolbar";
import { getMissingDocLetters } from "@/lib/tae/consigne-helpers";
import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";

const AUTOSAVE_KEY = "eduqcia-tae-consigne-new";

function slotIdToLetter(slotId: DocumentSlotId): "A" | "B" | "C" | "D" {
  if (slotId === "doc_A") return "A";
  if (slotId === "doc_B") return "B";
  if (slotId === "doc_C") return "C";
  return "D";
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  nbDocuments: number;
  documentSlotIds: DocumentSlotId[];
};

export function ConsigneTipTapEditor({ value, onChange, nbDocuments, documentSlotIds }: Props) {
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const introInsertedRef = useRef(false);
  const skipNextSyncRef = useRef(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      extensions: consigneExtensions(),
      content: value || "",
      editorProps: {
        attributes: {
          class:
            "ProseMirror min-h-[100px] px-4 py-2.5 text-sm leading-relaxed text-deep focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_u]:underline",
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
    if (introInsertedRef.current) return;
    if (!nbDocuments) return;
    if (!editor.isEmpty) {
      introInsertedRef.current = true;
      return;
    }
    insertIntroPhrase(editor, nbDocuments);
    introInsertedRef.current = true;
  }, [editor, nbDocuments]);

  useEffect(() => {
    if (!editor) return;
    const id = window.setInterval(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, editor.getHTML());
      } catch {
        /* quota */
      }
    }, 10_000);
    return () => window.clearInterval(id);
  }, [editor]);

  const handleRestoreToolbar = useCallback(() => {
    if (!editor) return;
    if (editor.isEmpty) {
      insertIntroPhrase(editor, nbDocuments);
      return;
    }
    setRestoreModalOpen(true);
  }, [editor, nbDocuments]);

  const insertAtStart = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContentAt(0, buildIntroInlineContent(nbDocuments)).run();
    setRestoreModalOpen(false);
  }, [editor, nbDocuments]);

  const insertAtCursor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent(buildIntroInlineContent(nbDocuments)).run();
    setRestoreModalOpen(false);
  }, [editor, nbDocuments]);

  const html = editor?.getHTML() ?? value;
  const missing = getMissingDocLetters(html, nbDocuments);

  return (
    <div className="mt-2 space-y-2">
      <div
        className="flex flex-wrap gap-2"
        data-doc-badges
        aria-label="Insérer une référence de document"
      >
        {documentSlotIds.map((slotId) => {
          const letter = slotIdToLetter(slotId);
          return (
            <button
              key={slotId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor?.chain().focus().insertContent({ type: "docRef", attrs: { letter } }).run();
              }}
              className={CONSIGNE_DOC_INSERT_BUTTON_CLASS}
            >
              <span className="material-symbols-outlined text-[0.9em]" aria-hidden="true">
                add
              </span>
              Doc {letter}
            </button>
          );
        })}
      </div>

      <div>
        <RichEditorToolbar
          editor={editor}
          editorId="consigne"
          showRestoreIntro={nbDocuments > 0}
          onRestoreIntro={handleRestoreToolbar}
        />
        <div
          data-editor="consigne"
          className="rounded-b-lg border border-t-0 border-border bg-panel focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {missing.length > 0 ? (
        <div
          className="flex items-center gap-2 text-xs text-warning"
          role="alert"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            warning
          </span>
          <span>
            {missing.length === 1
              ? `Le document ${missing[0]} n'est pas mentionné dans la consigne.`
              : `Les documents ${missing.join(", ")} ne sont pas mentionnés dans la consigne.`}
          </span>
        </div>
      ) : null}

      <SimpleModal
        open={restoreModalOpen}
        title="Réinsérer la phrase d'introduction"
        onClose={() => setRestoreModalOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-border bg-panel px-3 py-2 text-sm font-medium text-deep"
              onClick={() => setRestoreModalOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rounded-lg border border-border bg-panel px-3 py-2 text-sm font-medium text-deep"
              onClick={insertAtStart}
            >
              Insérer au début
            </button>
            <button
              type="button"
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white"
              onClick={insertAtCursor}
            >
              Insérer au curseur
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-deep">
          Votre consigne contient déjà du texte. Souhaitez-vous insérer la phrase
          d&apos;introduction au début du document ou à la position du curseur ?
        </p>
      </SimpleModal>
    </div>
  );
}
