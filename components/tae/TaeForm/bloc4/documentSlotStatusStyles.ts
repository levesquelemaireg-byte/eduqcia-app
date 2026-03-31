import type { SlotUiStatus } from "@/lib/tae/document-helpers";

export function statusBadgeClasses(status: SlotUiStatus): string {
  if (status === "complete") return "bg-success/12 text-success ring-1 ring-inset ring-success/25";
  if (status === "in_progress") return "bg-accent/10 text-accent ring-1 ring-inset ring-accent/20";
  return "bg-panel-alt text-muted ring-1 ring-inset ring-border/60";
}

export function statusTextClasses(status: SlotUiStatus): string {
  if (status === "complete") return "text-success";
  if (status === "in_progress") return "text-accent";
  return "text-muted";
}

export function documentSlotLetterBadgeClass(status: SlotUiStatus): string {
  return `flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${statusBadgeClasses(status)}`;
}
