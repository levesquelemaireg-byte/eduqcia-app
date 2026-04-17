"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { consigneExtensions } from "@/components/tae/TaeForm/tiptap/baseExtensions";
import {
  buildAmorceInlineContent,
  insertAmorceDocumentaire,
} from "@/components/tae/TaeForm/tiptap/insertAmorce";
import { RichTextEditorShell } from "@/components/ui/RichTextEditorShell";
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
  templateButton?: { label: string; onClick: () => void };
};

export function ConsigneTipTapEditor({
  value,
  onChange,
  nbDocuments,
  documentSlotIds,
  templateButton,
}: Props) {
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const amorceInsertedRef = useRef(false);
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
            "ProseMirror min-h-[100px] w-full min-w-0 text-[13px] leading-relaxed text-deep focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_em]:italic [&_u]:underline",
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
    if (amorceInsertedRef.current) return;
    if (!nbDocuments) return;
    if (!editor.isEmpty) {
      amorceInsertedRef.current = true;
      return;
    }
    insertAmorceDocumentaire(editor, nbDocuments);
    amorceInsertedRef.current = true;
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
      insertAmorceDocumentaire(editor, nbDocuments);
      return;
    }
    setRestoreModalOpen(true);
  }, [editor, nbDocuments]);

  const insertAtStart = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContentAt(0, buildAmorceInlineContent(nbDocuments)).run();
    setRestoreModalOpen(false);
  }, [editor, nbDocuments]);

  const insertAtCursor = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent(buildAmorceInlineContent(nbDocuments)).run();
    setRestoreModalOpen(false);
  }, [editor, nbDocuments]);

  const html = editor?.getHTML() ?? value;
  const missing = getMissingDocLetters(html, nbDocuments);

  const docInsertButtons = documentSlotIds.map((slotId) => {
    const letter = slotIdToLetter(slotId);
    return {
      slot: slotId,
      label: `Document ${letter}`,
      onInsert: () => {
        editor?.chain().focus().insertContent({ type: "docRef", attrs: { letter } }).run();
      },
    };
  });

  return (
    <div className="mt-2 space-y-2">
      {docInsertButtons.length > 0 ? (
        <p className="mb-1.5 flex items-center gap-1 text-xs text-muted">
          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
            info
          </span>
          Placez votre curseur dans le texte, puis cliquez sur un document pour l&apos;y insérer.
        </p>
      ) : null}

      <RichTextEditorShell
        editor={editor}
        editorId="consigne"
        toolbarAriaLabel="Mise en forme de la consigne"
        showRestoreAmorce={nbDocuments > 0}
        onRestoreAmorce={handleRestoreToolbar}
        templateButton={templateButton}
        docInsertButtons={docInsertButtons}
      >
        <EditorContent editor={editor} />
      </RichTextEditorShell>

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
        title="Réinsérer l'amorce documentaire"
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
