import { redirect } from "next/navigation";
import { BankDocumentsPanel } from "@/components/bank/BankDocumentsPanel";
import { BankEvaluationsPanel } from "@/components/bank/BankEvaluationsPanel";
import { BankOnglets } from "@/components/bank/BankOnglets";
import { BankTasksPanel } from "@/components/bank/BankTasksPanel";
import {
  parseBankDocumentIconoCategories,
  type BankDocumentFilters,
} from "@/lib/queries/bank-documents";
import {
  parseBankListPage,
  parseBankOnglet,
  parseBankTaeQueryFromSearchParams,
} from "@/lib/queries/bank-tasks";
import { createClient } from "@/lib/supabase/server";
import {
  PAGE_BANK_EVALUATIONS_SUBTITLE,
  PAGE_BANK_TASKS_SUBTITLE,
  PAGE_BANK_TITLE,
} from "@/lib/ui/ui-copy";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BankPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const onglet = parseBankOnglet(sp.onglet);
  const listPage = parseBankListPage(sp);

  const docFilters: BankDocumentFilters = {};
  if (typeof sp.q === "string" && sp.q.trim()) docFilters.search = sp.q.trim();
  const disc = Number(sp.discipline);
  if (Number.isFinite(disc) && disc > 0) docFilters.disciplineId = disc;
  const niv = Number(sp.niveau);
  if (Number.isFinite(niv) && niv > 0) docFilters.niveauId = niv;
  if (sp.dtype === "textuel" || sp.dtype === "iconographique") docFilters.docType = sp.dtype;
  const icats = parseBankDocumentIconoCategories(sp);
  if (icats.length > 0) docFilters.iconoCategories = icats;

  const evalQ = typeof sp.q === "string" ? sp.q : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
          {PAGE_BANK_TITLE}
        </h1>
        {onglet === "taches" ? (
          <p className="mt-2 text-sm text-muted md:text-base">{PAGE_BANK_TASKS_SUBTITLE}</p>
        ) : null}
        {onglet === "evaluations" ? (
          <p className="mt-2 text-sm text-muted md:text-base">{PAGE_BANK_EVALUATIONS_SUBTITLE}</p>
        ) : null}
      </div>

      <BankOnglets actif={onglet} />

      {onglet === "taches" ? (
        <BankTasksPanel query={parseBankTaeQueryFromSearchParams(sp)} />
      ) : null}

      {onglet === "documents" ? <BankDocumentsPanel filters={docFilters} page={listPage} /> : null}

      {onglet === "evaluations" ? (
        <BankEvaluationsPanel viewerId={user.id} q={evalQ} page={listPage} />
      ) : null}
    </div>
  );
}
