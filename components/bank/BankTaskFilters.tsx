import {
  ASPECT_KEY_TO_DB,
  ASPECT_SOCIETE_KEYS,
  parseAspectKeysFromParam,
} from "@/lib/bank/bank-aspect-param";
import type { BankTaeFilterRefs } from "@/lib/queries/bank-filter-ref-data";
import type { BankTaeQuery } from "@/lib/queries/bank-tasks";
import {
  BANK_TASK_FILTER_CD,
  BANK_TASK_FILTER_CD_HINT,
  BANK_TASK_FILTER_COMPORTEMENT,
  BANK_TASK_FILTER_COMPORTEMENT_HINT,
  BANK_TASK_FILTER_CONNAISSANCES,
  BANK_TASK_FILTER_DISCIPLINE,
  BANK_TASK_FILTER_NIVEAU,
  BANK_TASK_FILTER_OI,
  BANK_TASK_FILTER_RESET,
  BANK_TASK_FILTER_SEARCH,
  BANK_TASK_FILTER_SORT,
  BANK_TASK_FILTER_SUBMIT,
  BANK_TASK_SORT_POPULAR,
  BANK_TASK_SORT_RECENT,
  DOCUMENT_MODULE_ASPECTS_LABEL,
  FILTER_LABEL_ALL_COMPORTEMENTS,
  FILTER_LABEL_ALL_DISCIPLINES,
  FILTER_LABEL_ALL_NIVEAUX,
  FILTER_LABEL_ALL_OIS,
} from "@/lib/ui/ui-copy";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

type Props = {
  refs: BankTaeFilterRefs;
  query: BankTaeQuery;
};

export function BankTaskFilters({ refs, query }: Props) {
  const { filters, sort } = query;
  const aspectsOn = new Set(parseAspectKeysFromParam(filters.aspectKeys));

  return (
    <form
      method="get"
      action="/bank"
      className="space-y-4 rounded-2xl border border-border bg-panel p-4 shadow-sm"
    >
      <input type="hidden" name="onglet" value="taches" />
      <input type="hidden" name="page" value="0" />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="bank-tae-q" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_SEARCH}
          </label>
          <input
            id="bank-tae-q"
            name="q"
            type="search"
            defaultValue={filters.q ?? ""}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-sort" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_SORT}
          </label>
          <select
            id="bank-tae-sort"
            name="sort"
            defaultValue={sort}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="recent">{BANK_TASK_SORT_RECENT}</option>
            <option value="popular">{BANK_TASK_SORT_POPULAR}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-oi" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_OI}
          </label>
          <select
            id="bank-tae-oi"
            name="oi"
            defaultValue={filters.oiId ?? ""}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{FILTER_LABEL_ALL_OIS}</option>
            {refs.ois.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="bank-tae-comp" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_COMPORTEMENT}
          </label>
          <select
            id="bank-tae-comp"
            name="comportement"
            defaultValue={filters.comportementId ?? ""}
            disabled={!filters.oiId || refs.comportements.length === 0}
            className={cn(
              "auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep",
              (!filters.oiId || refs.comportements.length === 0) && "opacity-60",
            )}
          >
            <option value="">{FILTER_LABEL_ALL_COMPORTEMENTS}</option>
            {refs.comportements.map((c) => (
              <option key={c.id} value={c.id}>
                {c.enonce}
              </option>
            ))}
          </select>
          {!filters.oiId ? (
            <p className="text-xs text-muted">{BANK_TASK_FILTER_COMPORTEMENT_HINT}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-niv" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_NIVEAU}
          </label>
          <select
            id="bank-tae-niv"
            name="niveau"
            defaultValue={filters.niveauId != null ? String(filters.niveauId) : ""}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{FILTER_LABEL_ALL_NIVEAUX}</option>
            {refs.niveaux.map((n) => (
              <option key={n.id} value={String(n.id)}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-disc" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_DISCIPLINE}
          </label>
          <select
            id="bank-tae-disc"
            name="discipline"
            defaultValue={filters.disciplineId != null ? String(filters.disciplineId) : ""}
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          >
            <option value="">{FILTER_LABEL_ALL_DISCIPLINES}</option>
            {refs.disciplines.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-cd" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_CD}
          </label>
          <input
            id="bank-tae-cd"
            name="cd"
            type="number"
            min={1}
            step={1}
            defaultValue={filters.cdId != null ? String(filters.cdId) : ""}
            aria-describedby="bank-tae-cd-hint"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          />
          <p id="bank-tae-cd-hint" className="text-xs text-muted">
            {BANK_TASK_FILTER_CD_HINT}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="bank-tae-conn" className="text-xs font-semibold text-muted">
            {BANK_TASK_FILTER_CONNAISSANCES}
          </label>
          <input
            id="bank-tae-conn"
            name="connaissances"
            type="text"
            defaultValue={filters.connaissancesIds ?? ""}
            autoComplete="off"
            className="auth-input h-11 w-full rounded-lg border border-border bg-panel-alt px-3 text-sm text-deep"
          />
        </div>
      </div>

      <fieldset className="space-y-2 rounded-lg border border-border border-dashed p-3">
        <legend className="px-1 text-xs font-semibold text-muted">
          {DOCUMENT_MODULE_ASPECTS_LABEL}
        </legend>
        <div className="flex flex-wrap gap-3">
          {ASPECT_SOCIETE_KEYS.map((key: AspectSocieteKey) => (
            <label key={key} className="inline-flex items-center gap-2 text-sm text-deep">
              <input
                type="checkbox"
                name="aspects"
                value={key}
                defaultChecked={aspectsOn.has(key)}
                className="h-4 w-4 rounded border-border"
              />
              <span>{ASPECT_KEY_TO_DB[key]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-white"
        >
          {BANK_TASK_FILTER_SUBMIT}
        </button>
        <Link
          href="/bank"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold text-deep"
        >
          {BANK_TASK_FILTER_RESET}
        </Link>
      </div>
    </form>
  );
}
