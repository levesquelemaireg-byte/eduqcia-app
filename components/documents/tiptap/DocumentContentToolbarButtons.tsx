"use client";

import type { Editor } from "@tiptap/core";
import { TOOLBAR_BTN_INACTIVE, TOOLBAR_SEP_CLASS } from "@/components/ui/RichTextEditorToolbar";

type Props = {
  editor: Editor | null;
};

/**
 * Boutons toolbar « outils de citation » — note de bas de page, troncature, guillemets.
 * UN séparateur avant le groupe, puis les 3 boutons.
 * Réutilise exactement les mêmes classes que les boutons B/I/U/liste.
 */
export function DocumentContentToolbarButtons({ editor }: Props) {
  const handleFootnote = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;

    let count = 0;
    editor.state.doc.descendants((node) => {
      if (node.type.name === "footnoteRef") count++;
    });

    editor
      .chain()
      .focus()
      .setTextSelection(to)
      .insertContent({ type: "footnoteRef", attrs: { noteId: count + 1 } })
      .run();
  };

  const handleEllipsis = () => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: "citationEllipsis" }).run();
  };

  const handleGuillemets = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const nbsp = "\u00A0";

    if (from === to) {
      editor.chain().focus().insertContent(`«${nbsp}${nbsp}»`).run();
      const pos = editor.state.selection.from - 2;
      editor.chain().setTextSelection(pos).run();
    } else {
      const selectedText = editor.state.doc.textBetween(from, to);
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent(`«${nbsp}${selectedText}${nbsp}»`)
        .run();
    }
  };

  return (
    <>
      <span className={TOOLBAR_SEP_CLASS} aria-hidden="true" />
      <button
        type="button"
        title="Note de bas de page"
        aria-label="Note de bas de page"
        className={TOOLBAR_BTN_INACTIVE}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleFootnote}
      >
        <span className="text-[14px] font-bold" aria-hidden="true">
          a<sup style={{ fontSize: "0.65em", lineHeight: 1 }}>1</sup>
        </span>
      </button>
      <button
        type="button"
        title="Troncature de citation"
        aria-label="Troncature de citation"
        className={TOOLBAR_BTN_INACTIVE}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleEllipsis}
      >
        <span className="text-[14px] font-bold" aria-hidden="true">
          […]
        </span>
      </button>
      <button
        type="button"
        title="Guillemets français"
        aria-label="Guillemets français"
        className={TOOLBAR_BTN_INACTIVE}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleGuillemets}
      >
        <span className="text-[14px] font-bold" aria-hidden="true">
          «&thinsp;»
        </span>
      </button>
    </>
  );
}
