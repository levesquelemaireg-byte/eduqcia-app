import { notFound, redirect } from "next/navigation";
import { EvaluationCompositionEditor } from "@/components/evaluations/EvaluationCompositionEditor";
import { createClient } from "@/lib/supabase/server";
import {
  getEvaluationEditBundle,
  getTaeMetaForEvaluationCart,
} from "@/lib/queries/evaluation-composition";
import {
  getEvaluationPickerBankPage,
  getEvaluationPickerMinePage,
} from "@/lib/queries/evaluation-tae-picker";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ addTae?: string }>;
};

export default async function EditEvaluationPage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  if (!UUID_RE.test(id)) notFound();

  const bundle = await getEvaluationEditBundle(id);
  if (!bundle) notFound();

  let cart = bundle.cart;
  const rawAdd = sp.addTae;
  const addTae = typeof rawAdd === "string" && UUID_RE.test(rawAdd) ? rawAdd : null;
  if (addTae) {
    const meta = await getTaeMetaForEvaluationCart(addTae);
    if (meta && !cart.some((c) => c.id === meta.id)) {
      cart = [...cart, { id: meta.id, consigne: meta.consigne, nbDocuments: meta.nbDocuments }];
    }
  }

  const [bank, mine] = await Promise.all([
    getEvaluationPickerBankPage(0),
    getEvaluationPickerMinePage(0),
  ]);

  return (
    <EvaluationCompositionEditor
      mode="edit"
      initialEvaluationId={bundle.evaluationId}
      initialTitre={bundle.titre}
      initialCart={cart}
      initialBank={bank}
      initialMine={mine}
    />
  );
}
