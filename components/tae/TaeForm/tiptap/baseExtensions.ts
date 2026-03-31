import StarterKit from "@tiptap/starter-kit";
import { DocRef } from "@/components/tae/TaeForm/tiptap/extensionDocRef";

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
