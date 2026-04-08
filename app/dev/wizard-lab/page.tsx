import { notFound } from "next/navigation";
import { WizardLab } from "@/components/dev/wizard-lab/WizardLab";

/** Évite la prérendu statique : la garde `NODE_ENV` doit s'exécuter à la requête. */
export const dynamic = "force-dynamic";

/** Route DEV uniquement — désactivée en production (`NODE_ENV === "production"`). */
export default function WizardLabPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <WizardLab />;
}

export const metadata = {
  title: "Wizard Lab · DEV",
  robots: { index: false, follow: false },
};
