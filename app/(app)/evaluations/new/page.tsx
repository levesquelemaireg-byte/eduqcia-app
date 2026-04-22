import { redirect } from "next/navigation";
import { EvaluationCompositionEditor } from "@/components/evaluations/EvaluationCompositionEditor";
import { createClient } from "@/lib/supabase/server";
import {
  getEvaluationPickerBankPage,
  getEvaluationPickerMinePage,
} from "@/lib/queries/evaluation-tache-picker";

export default async function NewEvaluationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [bank, mine] = await Promise.all([
    getEvaluationPickerBankPage(0),
    getEvaluationPickerMinePage(0),
  ]);

  return (
    <EvaluationCompositionEditor
      mode="new"
      initialEvaluationId={null}
      initialTitre=""
      initialCart={[]}
      initialBank={bank}
      initialMine={mine}
    />
  );
}
