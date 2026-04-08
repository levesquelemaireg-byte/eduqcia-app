import { notFound } from "next/navigation";
import { Oi35Bloc3Mockup } from "@/components/playground/Oi35Bloc3Mockup";

export const dynamic = "force-dynamic";

/** Route DEV uniquement — `notFound()` en production. */
export default function DevOi35Bloc3MockupPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <Oi35Bloc3Mockup />;
}

export const metadata = {
  title: "Maquette OI 3.5 Bloc 3 · DEV",
  robots: { index: false, follow: false },
};
