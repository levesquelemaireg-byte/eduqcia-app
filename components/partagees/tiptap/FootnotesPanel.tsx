"use client";

import { useCallback, useEffect, useState } from "react";
import type { Editor } from "@tiptap/core";
import styles from "@/components/partagees/tiptap/document-content-editor.module.css";

type NoteEntry = {
  pos: number;
  noteId: number;
  definition: string;
};

/**
 * Section « Notes » affichée sous le champ TipTap contenu document.
 *
 * Scanne les nodes `footnoteRef` dans le document TipTap pour lire les
 * définitions (stockées dans `data-footnote-def` pour la persistance HTML).
 * Les inputs de définition sont des éléments React normaux qui mettent à jour
 * les attributs du node TipTap correspondant — PAS du contenu TipTap éditeur.
 */
export function FootnotesPanel({ editor }: { editor: Editor | null }) {
  const [notes, setNotes] = useState<NoteEntry[]>([]);

  const scanNotes = useCallback(() => {
    if (!editor) return;
    const found: NoteEntry[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "footnoteRef") {
        found.push({
          pos,
          noteId: (node.attrs.noteId as number) ?? found.length + 1,
          definition: (node.attrs.definition as string) ?? "",
        });
      }
    });
    // Renuméroter séquentiellement
    found.forEach((n, i) => {
      n.noteId = i + 1;
    });
    setNotes(found);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => scanNotes();
    queueMicrotask(handler);
    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
    };
  }, [editor, scanNotes]);

  // Renuméroter les nodes dans le document si nécessaire
  useEffect(() => {
    if (!editor || notes.length === 0) return;
    const { tr } = editor.state;
    let changed = false;
    let idx = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "footnoteRef") {
        idx++;
        if (node.attrs.noteId !== idx) {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, noteId: idx });
          changed = true;
        }
      }
    });
    if (changed) {
      editor.view.dispatch(tr);
    }
  }, [editor, notes.length]);

  const updateDefinition = useCallback(
    (index: number, value: string) => {
      if (!editor || !notes[index]) return;
      // Mettre à jour le state local immédiatement (réactivité input)
      setNotes((prev) => prev.map((n, i) => (i === index ? { ...n, definition: value } : n)));
      // Mettre à jour l'attribut du node TipTap (persistance HTML)
      const { tr } = editor.state;
      // Retrouver le node à sa position actuelle
      let currentPos: number | null = null;
      let nodeIdx = 0;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "footnoteRef") {
          if (nodeIdx === index) currentPos = pos;
          nodeIdx++;
        }
      });
      if (currentPos !== null) {
        const node = editor.state.doc.nodeAt(currentPos);
        if (node) {
          tr.setNodeMarkup(currentPos, undefined, { ...node.attrs, definition: value });
          editor.view.dispatch(tr);
        }
      }
    },
    [editor, notes],
  );

  const deleteNote = useCallback(
    (index: number) => {
      if (!editor) return;
      // Trouver et supprimer le node footnoteRef correspondant
      let nodeIdx = 0;
      let targetPos: number | null = null;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "footnoteRef") {
          if (nodeIdx === index) targetPos = pos;
          nodeIdx++;
        }
      });
      if (targetPos !== null) {
        const { tr } = editor.state;
        tr.delete(targetPos, targetPos + 1);
        editor.view.dispatch(tr);
      }
    },
    [editor],
  );

  if (notes.length === 0) return null;

  return (
    <div className={styles.notesSection}>
      <p className={styles.notesLabel}>Notes</p>
      {notes.map((note, i) => (
        <div key={`fn-${i}-${note.pos}`} className={styles.noteRow}>
          <span className={styles.noteNumber}>{i + 1}.</span>
          <input
            type="text"
            className={styles.noteInput}
            value={note.definition}
            onChange={(e) => updateDefinition(i, e.target.value)}
            placeholder="Entrez la définition…"
          />
          <button
            type="button"
            className={styles.noteDelete}
            onClick={() => deleteNote(i)}
            aria-label={`Supprimer la note ${i + 1}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
