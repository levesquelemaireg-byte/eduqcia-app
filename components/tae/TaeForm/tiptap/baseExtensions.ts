import StarterKit from "@tiptap/starter-kit";
import { DocRef } from "@/components/tae/TaeForm/tiptap/extensionDocRef";
import { FootnoteNode } from "@/components/documents/tiptap/extensionFootnote";
import { CitationEllipsis } from "@/components/documents/tiptap/extensionEllipsis";

export function consigneExtensions() {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      code: false,
    }),
    DocRef,
  ];
}

/** Corrigé + guidage — pas de DocRef. */
export function simpleRichExtensions() {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      code: false,
    }),
  ];
}

/** Champ contenu document — footnotes + troncature [...] en plus du simple. */
export function documentContentExtensions() {
  return [...simpleRichExtensions(), FootnoteNode, CitationEllipsis];
}
