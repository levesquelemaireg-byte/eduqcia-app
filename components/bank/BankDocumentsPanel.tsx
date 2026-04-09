import Link from "next/link";
import {
  countPublishedUsagesByDocumentIds,
  getBankPublishedDocumentsPage,
  serializeBankDocumentsQueryForHref,
  type BankDocumentFilters,
} from "@/lib/queries/bank-documents";
import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import { getDocumentFormRefOptions } from "@/lib/queries/document-ref-data";
import { copyDocumentPublishedTaeUsageCount } from "@/lib/ui/ui-copy";
import {
  BANK_DOCUMENT_FILTER_RESET,
  BANK_DOCUMENT_FILTER_SUBMIT,
  BANK_DOCUMENT_LINK_FICHE,
  BANK_FILTER_ICONO_CATEGORY_LABEL,
  BANK_TASK_LOAD_MORE,
  FILTER_LABEL_ALL_DISCIPLINES,
  FILTER_LABEL_ALL_NIVEAUX,
  DOCUMENT_TYPE_ICONO_BADGE_SHORT,
  DOCUMENT_TYPE_ICONO_LABEL,
  DOCUMENT_TYPE_ICONO_SLUGS,
  PAGE_BANK_DOCUMENTS_CTA_INTRO,
  PAGE_BANK_DOCUMENTS_CTA_LINK,
  PAGE_BANK_DOCUMENTS_EMPTY,
  PAGE_BANK_DOCUMENTS_FILTER_DISCIPLINE,
  PAGE_BANK_DOCUMENTS_FILTER_ICONO_ALL,
  PAGE_BANK_DOCUMENTS_FILTER_NIVEAU,
  PAGE_BANK_DOCUMENTS_FILTER_TYPE,
  PAGE_BANK_DOCUMENTS_FILTER_TYPE_ALL,
  PAGE_BANK_DOCUMENTS_FILTER_TYPE_IMAGE,
  PAGE_BANK_DOCUMENTS_FILTER_TYPE_TEXT,
  PAGE_BANK_DOCUMENTS_SEARCH_LABEL,
  DOCUMENT_MODULE_TYPE_IMAGE,
  DOCUMENT_MODULE_TYPE_TEXT,
} from "@/lib/ui/ui-copy";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import type { DocumentTypeIconoSlug } from "@/lib/ui/ui-copy";
import { stripHtmlToPlainText } from "@/lib/documents/source-citation-html";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/server";

type Props = {
  filters: BankDocumentFilters;
  page: number;
};

export async function BankDocumentsPanel({ filters, page }: Props) {
  const supabase = await createClient();
  const [{ niveaux, disciplines }, pageResult] = await Promise.all([
    getDocumentFormRefOptions(),
    getBankPublishedDocumentsPage(supabase, filters, page),
  ]);
  const { rows, total } = pageResult;
  const hasMore = (page + 1) * BANK_PAGE_SIZE < total;
  const usageMap = await countPublishedUsagesByDocumentIds(
    supabase,
    rows.map((r) => r.id),
  );

  const q = filters.search ?? "";
  const d = filters.disciplineId != null ? String(filters.disciplineId) : "";
  const n = filters.niveauId != null ? String(filters.niveauId) : "";
  const t = filters.docType ?? "";
  const icatSet = new Set(filters.iconoCategories ?? []);
  const showIconoCategoryFilter = t !== "textuel";

  return (
    <div className="mt-8 space-y-6">
      <p className="text-sm text-muted">
        {PAGE_BANK_DOCUMENTS_CTA_INTRO}{" "}
        <Link
          href="/documents/new"
          className="font-medium text-accent underline-offset-2 hover:underline"
        >
          {PAGE_BANK_DOCUMENTS_CTA_LINK}
        </Link>
        .
      </p>

      <form
        method="get"
        action="/bank"
        className="flex flex-col gap-4 rounded-2xl border border-border bg-panel p-4 shadow-sm md:flex-row md:flex-wrap md:items-end"
      >
        <input type="hidden" name="onglet" value="documents" />
        <input type="hidden" name="page" value="0" />
        <div className="min-w-[12rem] flex-1 space-y-1">
          <label htmlFor="bank-doc-q" className="text-xs font-semibold text-muted">
            {PAGE_BANK_DOCUMENTS_SEARCH_LABEL}
          </label>
          <input
            id="bank-doc-q"
            name="q"
            type="search"
            defaultValue={q}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          />
        </div>
        <div className="min-w-[10rem] space-y-1">
          <label htmlFor="bank-doc-disc" className="text-xs font-semibold text-muted">
            {PAGE_BANK_DOCUMENTS_FILTER_DISCIPLINE}
          </label>
          <select
            id="bank-doc-disc"
            name="discipline"
            defaultValue={d}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{FILTER_LABEL_ALL_DISCIPLINES}</option>
            {disciplines.map((x) => (
              <option key={x.id} value={String(x.id)}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[10rem] space-y-1">
          <label htmlFor="bank-doc-niv" className="text-xs font-semibold text-muted">
            {PAGE_BANK_DOCUMENTS_FILTER_NIVEAU}
          </label>
          <select
            id="bank-doc-niv"
            name="niveau"
            defaultValue={n}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{FILTER_LABEL_ALL_NIVEAUX}</option>
            {niveaux.map((x) => (
              <option key={x.id} value={String(x.id)}>
                {x.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[10rem] space-y-1">
          <label htmlFor="bank-doc-type" className="text-xs font-semibold text-muted">
            {PAGE_BANK_DOCUMENTS_FILTER_TYPE}
          </label>
          <select
            id="bank-doc-type"
            name="dtype"
            defaultValue={t}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{PAGE_BANK_DOCUMENTS_FILTER_TYPE_ALL}</option>
            <option value="textuel">{PAGE_BANK_DOCUMENTS_FILTER_TYPE_TEXT}</option>
            <option value="iconographique">{PAGE_BANK_DOCUMENTS_FILTER_TYPE_IMAGE}</option>
          </select>
        </div>
        {showIconoCategoryFilter ? (
          <fieldset className="min-w-[12rem] space-y-2">
            <legend className="text-xs font-semibold text-muted">
              {BANK_FILTER_ICONO_CATEGORY_LABEL}
            </legend>
            <p className="text-[11px] leading-snug text-muted">
              {PAGE_BANK_DOCUMENTS_FILTER_ICONO_ALL}
            </p>
            <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border bg-panel-alt p-2">
              {DOCUMENT_TYPE_ICONO_SLUGS.map((slug: DocumentTypeIconoSlug) => (
                <label
                  key={slug}
                  className="flex cursor-pointer items-center gap-2 text-xs text-deep"
                >
                  <input
                    type="checkbox"
                    name="icat"
                    value={slug}
                    defaultChecked={icatSet.has(slug)}
                    className="h-4 w-4 rounded border-border text-accent"
                  />
                  <span>{DOCUMENT_TYPE_ICONO_LABEL[slug]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <div className="flex gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-white"
          >
            {BANK_DOCUMENT_FILTER_SUBMIT}
          </button>
          <Link
            href="/bank?onglet=documents"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-deep"
          >
            {BANK_DOCUMENT_FILTER_RESET}
          </Link>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-10 text-center text-sm text-muted">
          {PAGE_BANK_DOCUMENTS_EMPTY}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
            {rows.map((row) => {
              const usages = usageMap.get(row.id) ?? 0;
              const sourcePlain = stripHtmlToPlainText(row.source_citation);
              const sourcePreview =
                sourcePlain.length > 140 ? `${sourcePlain.slice(0, 137)}…` : sourcePlain;
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-deep">
                      <span>{row.titre}</span>
                      {(() => {
                        const slug = parseTypeIconographique(row.type_iconographique);
                        return slug ? (
                          <span className="rounded-md bg-steel/20 px-1.5 py-0.5 text-[11px] font-medium text-muted">
                            {DOCUMENT_TYPE_ICONO_BADGE_SHORT[slug]}
                          </span>
                        ) : null;
                      })()}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {row.type === "textuel"
                        ? DOCUMENT_MODULE_TYPE_TEXT
                        : DOCUMENT_MODULE_TYPE_IMAGE}{" "}
                      · {sourcePreview || "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {copyDocumentPublishedTaeUsageCount(usages)}
                    </p>
                  </div>
                  <Link
                    href={`/documents/${row.id}`}
                    className={cn(
                      "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-accent",
                      "hover:bg-accent/5",
                    )}
                  >
                    {BANK_DOCUMENT_LINK_FICHE}
                  </Link>
                </li>
              );
            })}
          </ul>
          {hasMore ? (
            <div className="flex justify-center">
              <Link
                href={serializeBankDocumentsQueryForHref(filters, page + 1)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-panel px-5 text-sm font-semibold text-deep shadow-sm",
                  "hover:bg-panel-alt",
                )}
              >
                {BANK_TASK_LOAD_MORE}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
