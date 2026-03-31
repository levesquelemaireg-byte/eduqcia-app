"use server";

import {
  getEvaluationPickerBankPage,
  getEvaluationPickerMinePage,
  type EvaluationPickerPage,
  type EvaluationPickerSource,
} from "@/lib/queries/evaluation-tae-picker";

export async function fetchEvaluationPickerPageAction(
  source: EvaluationPickerSource,
  page: number,
): Promise<EvaluationPickerPage> {
  const safePage = Number.isFinite(page) && page >= 0 ? Math.floor(page) : 0;
  if (source === "mine") return getEvaluationPickerMinePage(safePage);
  return getEvaluationPickerBankPage(safePage);
}
