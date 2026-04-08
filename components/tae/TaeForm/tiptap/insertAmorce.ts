import type { Editor, JSONContent } from "@tiptap/core";

const DOC_LETTERS = ["A", "B", "C", "D"] as const;

function docNodesForCount(nbDocs: number): JSONContent[] {
  const n = Math.min(Math.max(nbDocs, 0), 4);
  return DOC_LETTERS.slice(0, n).map((letter) => ({
    type: "docRef",
    attrs: { letter },
  }));
}

/** Contenu inline pour insertion au début ou au curseur (CONSIGNE-EDITOR.md §10). */
export function buildAmorceInlineContent(nbDocs: number): JSONContent[] {
  const docNodes = docNodesForCount(nbDocs);
  const n = docNodes.length;
  if (n === 0) return [];
  if (n === 1) {
    return [
      { type: "text", text: "Consultez le document " },
      docNodes[0]!,
      { type: "text", text: ". " },
    ];
  }
  if (n === 2) {
    return [
      { type: "text", text: "Consultez les documents " },
      docNodes[0]!,
      { type: "text", text: " et " },
      docNodes[1]!,
      { type: "text", text: ". " },
    ];
  }
  if (n === 3) {
    return [
      { type: "text", text: "Consultez les documents " },
      docNodes[0]!,
      { type: "text", text: ", " },
      docNodes[1]!,
      { type: "text", text: " et " },
      docNodes[2]!,
      { type: "text", text: ". " },
    ];
  }
  return [
    { type: "text", text: "Consultez les documents " },
    docNodes[0]!,
    { type: "text", text: ", " },
    docNodes[1]!,
    { type: "text", text: ", " },
    docNodes[2]!,
    { type: "text", text: " et " },
    docNodes[3]!,
    { type: "text", text: ". " },
  ];
}

/** CONSIGNE-EDITOR.md §6 — insère l'amorce documentaire + paragraphe vide pour le curseur. */
export function insertAmorceDocumentaire(editor: Editor, nbDocs: number) {
  if (!editor.isEmpty) return;
  const docNodes = docNodesForCount(nbDocs);
  const n = docNodes.length;
  if (n === 0) return;

  let phraseContent: JSONContent[] = [];
  if (n === 1) {
    phraseContent = [
      { type: "text", text: "Consultez le document " },
      docNodes[0]!,
      { type: "text", text: "." },
    ];
  } else if (n === 2) {
    phraseContent = [
      { type: "text", text: "Consultez les documents " },
      docNodes[0]!,
      { type: "text", text: " et " },
      docNodes[1]!,
      { type: "text", text: "." },
    ];
  } else if (n === 3) {
    phraseContent = [
      { type: "text", text: "Consultez les documents " },
      docNodes[0]!,
      { type: "text", text: ", " },
      docNodes[1]!,
      { type: "text", text: " et " },
      docNodes[2]!,
      { type: "text", text: "." },
    ];
  } else {
    phraseContent = [
      { type: "text", text: "Consultez les documents " },
      docNodes[0]!,
      { type: "text", text: ", " },
      docNodes[1]!,
      { type: "text", text: ", " },
      docNodes[2]!,
      { type: "text", text: " et " },
      docNodes[3]!,
      { type: "text", text: "." },
    ];
  }

  editor.commands.setContent({
    type: "doc",
    content: [
      { type: "paragraph", content: phraseContent },
      { type: "paragraph", content: [] },
    ],
  });
  editor.commands.focus("end");
}
