import Link from "next/link";
import { redirect } from "next/navigation";

import { DocumentMiniatureList } from "@/components/document/miniature";
import { OwnerDocumentMiniatureEntry } from "@/components/document/miniature/owner-entry";
import { documentsRepository } from "@/lib/repositories/documents-repository";
import { createClient } from "@/lib/supabase/server";
import {
  CTA_CREER_UN_DOCUMENT,
  LISTE_DOCUMENTS_VIDE,
  PAGE_LISTE_MES_DOCUMENTS_SUBTITLE,
  PAGE_LISTE_MES_DOCUMENTS_TITLE,
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

export default async function MesDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const documents = await documentsRepository.listForOwner(user.id, {
    includeDrafts: true,
    orderBy: "created_at_desc",
    limit: 200,
  });

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
        <div className="mt-6">
          <DocumentMiniatureList>
            {documents.map((doc) => (
              <OwnerDocumentMiniatureEntry key={doc.id} document={doc} />
            ))}
          </DocumentMiniatureList>
        </div>
      )}
    </div>
  );
}
