import type { Editor, JSONContent } from "@tiptap/core";

function docNodesForCount(nbDocs: number): JSONContent[] {
  const n = Math.min(Math.max(nbDocs, 0), 12);
  return Array.from({ length: n }, (_, i) => ({
    type: "docRef",
    attrs: { numero: i + 1 },
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
  return assemblerAmorceInline(docNodes, ". ");
}

/** CONSIGNE-EDITOR.md §6 — insère l'amorce documentaire + paragraphe vide pour le curseur. */
export function insertAmorceDocumentaire(editor: Editor, nbDocs: number) {
  if (!editor.isEmpty) return;
  const docNodes = docNodesForCount(nbDocs);
  const n = docNodes.length;
  if (n === 0) return;

  const phraseContent: JSONContent[] =
    n === 1
      ? [
          { type: "text", text: "Consultez le document " },
          docNodes[0]!,
          { type: "text", text: "." },
        ]
      : assemblerAmorceInline(docNodes, ".");

  editor.commands.setContent({
    type: "doc",
    content: [
      { type: "paragraph", content: phraseContent },
      { type: "paragraph", content: [] },
    ],
  });
  editor.commands.focus("end");
}

/** Assemble « Consultez les documents X, Y, Z et W[terminator] » pour ≥ 2 documents. */
function assemblerAmorceInline(docNodes: JSONContent[], terminator: string): JSONContent[] {
  const n = docNodes.length;
  const parts: JSONContent[] = [{ type: "text", text: "Consultez les documents " }];
  for (let i = 0; i < n; i++) {
    parts.push(docNodes[i]!);
    if (i < n - 2) {
      parts.push({ type: "text", text: ", " });
    } else if (i === n - 2) {
      parts.push({ type: "text", text: " et " });
    } else {
      parts.push({ type: "text", text: terminator });
    }
  }
  return parts;
}
