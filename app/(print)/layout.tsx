import type { ReactNode } from "react";
import { TaePrintRouteShell } from "@/components/tache/print/TaePrintRouteShell";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";

/** Shell minimal (pas d’`AppShell`) — impression TAÉ et épreuve sans chrome applicatif. */
export default async function PrintSegmentLayout({ children }: { children: ReactNode }) {
  await requireActiveAppUser();
  return <TaePrintRouteShell>{children}</TaePrintRouteShell>;
}
