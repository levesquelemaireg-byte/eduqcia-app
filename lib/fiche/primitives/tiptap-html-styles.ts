/**
 * Classes Tailwind pour rendre du HTML généré par TipTap (listes, gras, italique, etc.).
 * À utiliser sur tout élément qui reçoit du `dangerouslySetInnerHTML` avec du contenu TipTap.
 */
export const TIPTAP_HTML_STYLES =
  "[&_strong]:font-bold [&_em]:italic [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_li]:pl-1";
