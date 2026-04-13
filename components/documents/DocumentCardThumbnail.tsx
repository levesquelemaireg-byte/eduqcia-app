import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { stripHtmlToPlainText } from "@/lib/documents/strip-html";
import { getCategoryIcon, getDocumentTypeIcon } from "@/lib/tae/document-categories-helpers";
import {
  documentStructureBadgeLabel,
  DOCUMENT_MODULE_SOURCE_PRIMAIRE,
  DOCUMENT_MODULE_SOURCE_SECONDAIRE,
} from "@/lib/ui/ui-copy";

type Props = {
  id: string;
  titre: string;
  type: "textuel" | "iconographique";
  sourceType: "primaire" | "secondaire";
  structure: "simple" | "perspectives" | "deux_temps";
  elementCount: number;
  /** HTML content for textual documents — first element. */
  contenuHtml: string | null;
  /** Image URL for iconographic documents — first element. */
  imageUrl: string | null;
  /** Category id of the first element (textuel or iconographic). */
  categorieId: string | null;
};

/**
 * Miniature pour la liste de la banque collaborative.
 *
 * Affiche titre (tronqué 2 lignes), aperçu du contenu, icône catégorie,
 * badge source type, badge structure. Clic → fiche document.
 *
 * Spec : `docs/specs/document-renderer.md` §4.4.
 */
export function DocumentCardThumbnail({
  id,
  titre,
  type,
  sourceType,
  structure,
  elementCount,
  contenuHtml,
  imageUrl,
  categorieId,
}: Props) {
  const categoryIcon = categorieId ? getCategoryIcon(categorieId) : getDocumentTypeIcon(type);
  const structureLabel = documentStructureBadgeLabel(structure, elementCount);
  const sourceLabel =
    sourceType === "primaire" ? DOCUMENT_MODULE_SOURCE_PRIMAIRE : DOCUMENT_MODULE_SOURCE_SECONDAIRE;

  const textPreview =
    type === "textuel" && contenuHtml ? truncateText(stripHtmlToPlainText(contenuHtml), 120) : null;

  return (
    <Link
      href={`/documents/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-sm",
        "transition-shadow duration-150 hover:shadow-md",
        "w-full",
      )}
    >
      {/* Preview zone — ratio approx Letter US (8.5:11 ≈ 0.77) */}
      <div className="relative flex aspect-[77/100] w-full items-center justify-center overflow-hidden bg-panel-alt">
        {type === "iconographique" && imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- thumbnail, public URL
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : textPreview ? (
          <p className="line-clamp-5 px-3 py-2 text-xs leading-relaxed text-deep">{textPreview}</p>
        ) : (
          <span
            className="material-symbols-outlined text-muted/40"
            style={{ fontSize: "3rem" }}
            aria-hidden="true"
          >
            {type === "textuel" ? "article" : "image_inset"}
          </span>
        )}
      </div>

      {/* Info zone */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-2.5">
        {/* Title — truncated 2 lines */}
        <div className="flex items-start gap-[0.35em]">
          {categoryIcon ? (
            <span
              className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none text-accent"
              aria-hidden="true"
            >
              {categoryIcon}
            </span>
          ) : null}
          <h3 className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-deep group-hover:text-accent">
            {titre || "Sans titre"}
          </h3>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-md bg-steel/15 px-1.5 py-0.5 text-[11px] font-medium text-muted">
            {structureLabel}
          </span>
          <span className="inline-flex items-center gap-[0.35em] rounded-md bg-steel/15 px-1.5 py-0.5 text-[11px] font-medium text-muted">
            <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
              {sourceType === "primaire" ? "counter_1" : "counter_2"}
            </span>
            {sourceLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}
