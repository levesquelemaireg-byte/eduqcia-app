import { notFound } from "next/navigation";
import { FragmentPlayground } from "@/components/playground/FragmentPlayground";

/** Évite la prérendu statique : la garde `NODE_ENV` doit s’exécuter à la requête. */
export const dynamic = "force-dynamic";

/** Route DEV uniquement — désactivée en production (`NODE_ENV === "production"`). */
export default function DevFragmentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <FragmentPlayground />;
}

export const metadata = {
  title: "Fragment Playground · DEV",
  robots: { index: false, follow: false },
};
