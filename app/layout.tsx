import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
// Règles d'impression scopées par parcours NR (`[data-*-eleve]`) — chargées
// au root pour couvrir tous les contextes : aperçu live wizard, wizard
// édition (TimeLine), aperçu impression /apercu/[token]. Toutes les
// règles sont scopées par data-attribute → aucune pollution sur l'app.
import "@/styles/impression/index.css";

export const metadata: Metadata = {
  title: "ÉduQc.IA",
  description: "Tâches — univers social",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans text-deep">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
