import type { ReactNode } from "react";
import { TachePrintRouteShell } from "@/components/tache/print/TachePrintRouteShell";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";

/** Shell minimal (pas d’`AppShell`) — impression TAÉ et épreuve sans chrome applicatif. */
export default async function PrintSegmentLayout({ children }: { children: ReactNode }) {
  await requireActiveAppUser();
  return <TachePrintRouteShell>{children}</TachePrintRouteShell>;
}
