import Link from "next/link";

import { DocumentMiniature, DocumentMiniatureList } from "@/components/document/miniature";
import { BANK_PAGE_SIZE } from "@/lib/queries/bank-tasks";
import {
  serializeBankDocumentsQueryForHref,
  type BankDocumentFilters,
} from "@/lib/queries/bank-documents";
import { getDocumentFormRefOptions } from "@/lib/queries/document-ref-data";
import { documentsRepository } from "@/lib/repositories/documents-repository";
import { getAllCategoriesIconographiques } from "@/lib/tache/document-categories-helpers";
import type { DocumentEnrichedRow } from "@/lib/types/document-enriched";
import {
  BANK_DOCUMENT_FILTER_RESET,
  BANK_DOCUMENT_FILTER_SUBMIT,
  BANK_FILTER_ICONO_CATEGORY_LABEL,
  BANK_TASK_LOAD_MORE,
  FILTER_LABEL_ALL_DISCIPLINES,
  FILTER_LABEL_ALL_NIVEAUX,
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
} from "@/lib/ui/ui-copy";
import { cn } from "@/lib/utils/cn";

type Props = {
  filters: BankDocumentFilters;
  page: number;
};

const BANK_OVERFETCH_MULTIPLIER = 4;

function applyIconoFilter(
  rows: DocumentEnrichedRow[],
  iconoCategories: string[] | undefined,
): DocumentEnrichedRow[] {
  if (!iconoCategories || iconoCategories.length === 0) return rows;
  const set = new Set(iconoCategories);
  return rows.filter((row) => {
    if (row.type !== "iconographique") return true;
    const first = row.elements[0];
    const cat = first?.categorie_iconographique ?? null;
    return cat !== null && set.has(cat);
  });
}

export async function BankDocumentsPanel({ filters, page }: Props) {
  const { niveaux, disciplines } = await getDocumentFormRefOptions();

  const hasIconoFilter =
    filters.docType !== "textuel" &&
    filters.iconoCategories !== undefined &&
    filters.iconoCategories.length > 0;

  // Pagination : sans filtre icono, on pagine via offset/limit RPC.
  // Avec filtre icono, on sur-récupère puis on filtre en mémoire (PostgREST ne filtre pas dans JSONB array).
  const offset = page * BANK_PAGE_SIZE;
  const limit = hasIconoFilter ? BANK_PAGE_SIZE * BANK_OVERFETCH_MULTIPLIER : BANK_PAGE_SIZE + 1;

  const rawRows = await documentsRepository.listForBank({
    search: filters.search,
    niveauIds: filters.niveauId != null ? [filters.niveauId] : undefined,
    disciplineIds: filters.disciplineId != null ? [filters.disciplineId] : undefined,
    type: filters.docType,
    orderBy: "created_at_desc",
    offset: hasIconoFilter ? 0 : offset,
    limit,
  });

  const filteredRows = applyIconoFilter(rawRows, filters.iconoCategories);

  const pagedRows = hasIconoFilter
    ? filteredRows.slice(offset, offset + BANK_PAGE_SIZE)
    : filteredRows.slice(0, BANK_PAGE_SIZE);

  const hasMore = hasIconoFilter
    ? filteredRows.length > offset + BANK_PAGE_SIZE
    : filteredRows.length > BANK_PAGE_SIZE;

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
              {getAllCategoriesIconographiques().map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-deep"
                >
                  <input
                    type="checkbox"
                    name="icat"
                    value={cat.id}
                    defaultChecked={icatSet.has(cat.id)}
                    className="h-4 w-4 rounded border-border text-accent"
                  />
                  <span>{cat.label}</span>
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

      {pagedRows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-panel-alt/50 px-6 py-10 text-center text-sm text-muted">
          {PAGE_BANK_DOCUMENTS_EMPTY}
        </p>
      ) : (
        <>
          <DocumentMiniatureList>
            {pagedRows.map((row) => (
              <DocumentMiniature
                key={row.id}
                document={row}
                context="bank"
                href={`/documents/${row.id}`}
                reuseHref={`/questions/new?doc=${row.id}&slot=A`}
                authorHref={`/profile/${row.auteur_id}`}
              />
            ))}
          </DocumentMiniatureList>
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
