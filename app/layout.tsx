import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "ÉduQc.IA",
  description: "Tâches d’apprentissage et d’évaluation — univers social",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${manrope.variable} h-full antialiased`}>
      <head>
        {/* Material Symbols : `display=swap` obligatoire — avec `optional` le navigateur peut ne jamais appliquer la police (glyphes = texte littéral). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- police d’icônes (pas d’équivalent next/font pour tout le jeu de glyphes variables) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-deep">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
