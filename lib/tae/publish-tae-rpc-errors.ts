import type { PublishTaeFailureCode } from "@/lib/tae/publish-tae-types";

export function classifyPublishRpcError(err: {
  message?: string;
  code?: string;
  details?: string;
}): PublishTaeFailureCode {
  const pg = err.code ?? "";
  const text = `${err.message ?? ""}\n${err.details ?? ""}`.toLowerCase();
  if (
    text.includes("utilisée dans une évaluation") ||
    text.includes("utilisée dans une épreuve") ||
    text.includes("evaluation_tae")
  )
    return "tae_locked_evaluation";
  if (
    pg === "PGRST202" ||
    text.includes("could not find the function") ||
    text.includes("no matches were found in the schema cache")
  ) {
    return "rpc_function_missing";
  }
  if (pg === "23503" || text.includes("foreign key")) return "rpc_foreign_key";
  if (pg === "22P02" || text.includes("invalid input value for enum")) return "rpc_invalid_enum";
  return "tae_insert";
}
