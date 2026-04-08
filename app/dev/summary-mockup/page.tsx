import { notFound } from "next/navigation";
import { DevSummaryMockupShell } from "@/components/playground/DevSummaryMockupShell";

export const dynamic = "force-dynamic";

/** Route DEV uniquement — `notFound()` en production. */
export default function DevSummaryMockupPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DevSummaryMockupShell />;
}

export const metadata = {
  title: "Maquette banque (miniature + sommaire) · DEV",
  robots: { index: false, follow: false },
};
