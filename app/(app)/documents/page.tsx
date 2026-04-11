import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripHtmlToPlainText } from "@/lib/documents/source-citation-html";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import { formatDateFrCaMedium } from "@/lib/utils/format-date-fr-ca";
import {
  CTA_CREER_UN_DOCUMENT,
  LISTE_DOCUMENTS_VIDE,
  PAGE_LISTE_MES_DOCUMENTS_SUBTITLE,
  PAGE_LISTE_MES_DOCUMENTS_TITLE,
  DOCUMENT_MODULE_TYPE_TEXT,
  DOCUMENT_MODULE_TYPE_IMAGE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export default async function MesDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("documents")
    .select("id, titre, type, elements, is_published, created_at")
    .eq("auteur_id", user.id)
    .order("created_at", { ascending: false });

  const documents = rows ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
            {PAGE_LISTE_MES_DOCUMENTS_TITLE}
          </h1>
          <p className="mt-2 text-sm text-muted md:text-base">
            {PAGE_LISTE_MES_DOCUMENTS_SUBTITLE}
          </p>
        </div>
        <Link
          href="/documents/new"
          className={cn(
            "icon-text inline-flex min-h-11 shrink-0 items-center justify-center gap-[0.35em] rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95",
          )}
        >
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            add_notes
          </span>
          {CTA_CREER_UN_DOCUMENT}
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">{LISTE_DOCUMENTS_VIDE}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
          {documents.map((doc) => {
            const rawEls = (
              Array.isArray(doc.elements) ? doc.elements : []
            ) as DocumentElementJson[];
            const sourcePlain = stripHtmlToPlainText(rawEls[0]?.source_citation ?? "");
            const sourcePreview =
              sourcePlain.length > 120 ? `${sourcePlain.slice(0, 117)}…` : sourcePlain;
            return (
              <li
                key={doc.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-deep">
                    <span>{doc.titre}</span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                        doc.is_published ? "bg-success/15 text-success" : "bg-steel/20 text-muted",
                      )}
                    >
                      {doc.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {doc.type === "textuel"
                      ? DOCUMENT_MODULE_TYPE_TEXT
                      : DOCUMENT_MODULE_TYPE_IMAGE}
                    {" · "}
                    {sourcePreview || "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted">{formatDateFrCaMedium(doc.created_at)}</p>
                </div>
                <Link
                  href={`/documents/${doc.id}`}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-accent",
                    "hover:bg-accent/5",
                  )}
                >
                  Voir
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
