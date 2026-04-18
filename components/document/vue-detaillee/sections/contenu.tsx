"use client";

import type { RendererDocument } from "@/lib/types/document-renderer";
import { DocumentElementRenderer } from "@/components/documents/DocumentElementRenderer";
import { sourceCitationDisplayHtml } from "@/lib/documents/source-citation-html";

type Props = {
  document: RendererDocument;
};

/**
 * Contenu du document en mode lecture (onglet Sommaire).
 * Affiche le document dans un conteneur Sand avec fond panel-alt.
 */
export function SectionContenu({ document: doc }: Props) {
  const estIconographique = doc.elements.some((el) => el.type === "iconographique");
  const estMultiElement = doc.elements.length > 1;

  return (
    <div className="space-y-3">
      {/* Conteneur Sand */}
      <div className="rounded-lg bg-panel-alt p-5">
        <div className="rounded-md border border-border bg-panel p-5">
          {/* Titre */}
          <p className="text-base font-medium text-deep">{doc.titre || "Sans titre"}</p>

          {/* Contenu selon la structure */}
          {estMultiElement ? (
            <div className="mt-4 space-y-4">
              {doc.elements.map((el) => (
                <div
                  key={el.id}
                  className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                >
                  {el.type === "textuel" && "auteur" in el && el.auteur && (
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {el.auteur}
                    </p>
                  )}
                  {"repereTemporel" in el && el.repereTemporel && (
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                      {el.repereTemporel}
                    </p>
                  )}
                  {"sousTitre" in el && el.sousTitre && (
                    <p className="mb-1 text-xs font-medium text-steel">{el.sousTitre}</p>
                  )}
                  <DocumentElementRenderer element={el} showAuteur={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3">
              {doc.elements[0] && (
                <>
                  {estIconographique ? (
                    <ElementIconographique element={doc.elements[0]} />
                  ) : (
                    <DocumentElementRenderer
                      element={doc.elements[0]}
                      showAuteur={Boolean("auteur" in doc.elements[0] && doc.elements[0].auteur)}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Source — séparateur dashed + citation italique */}
          {doc.elements[0]?.source && (
            <div className="mt-4 border-t border-dashed border-border pt-3">
              <p className="text-[11px] italic text-steel">
                <span className="not-italic font-medium uppercase tracking-wider text-muted">
                  Source
                </span>
                {" · "}
                <span
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{
                    __html: sourceCitationDisplayHtml(doc.elements[0].source),
                  }}
                />
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de mode */}
      <div className="flex items-start gap-1.5">
        <span className="material-symbols-outlined text-[14px] text-muted" aria-hidden="true">
          info
        </span>
        <p className="text-[11px] text-muted">
          Aperçu de lecture. Voir l&apos;onglet{" "}
          <span className="font-medium">Aperçu de l&apos;imprimé</span> pour le rendu exact.
        </p>
      </div>
    </div>
  );
}

/* ─── Élément iconographique — layout horizontal ──────────── */

function ElementIconographique({ element }: { element: RendererDocument["elements"][number] }) {
  if (element.type !== "iconographique") return null;

  return (
    <div className="flex gap-4">
      {/* Miniature image */}
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={element.imageUrl}
          alt={("legende" in element && element.legende) || "Document iconographique"}
          className="max-h-[160px] max-w-[220px] rounded object-contain"
        />
        {"categorieIconographique" in element && element.categorieIconographique && (
          <span className="absolute bottom-1 right-1 rounded bg-panel/90 px-1.5 py-0.5 text-[10px] font-medium text-muted">
            {element.categorieIconographique}
          </span>
        )}
      </div>

      {/* Légende + source */}
      <div className="min-w-0 flex-1 space-y-2">
        {"legende" in element && element.legende && (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Légende</p>
            <p className="text-xs leading-relaxed text-deep">{element.legende}</p>
          </div>
        )}
        {"legendePosition" in element && element.legendePosition && (
          <p className="text-[10px] text-muted">Position : {element.legendePosition}</p>
        )}
      </div>
    </div>
  );
}
