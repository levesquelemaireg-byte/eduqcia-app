"use client";

import { useEffect, type ReactNode } from "react";
import { TACHE_PRINT_PAGE_CSS, TACHE_PRINT_PAGE_STYLE_ATTR } from "@/lib/tache/print-page-css";
import { useClearDocumentTitleForPrint } from "@/lib/tache/use-clear-document-title-for-print";

/**
 * Marque `html` pour `@media print` + injecte `@page` — route dédiée impression TAÉ.
 */
export function TachePrintRouteShell({ children }: { children: ReactNode }) {
  useClearDocumentTitleForPrint(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-tache-print-route", "");
    const style = document.createElement("style");
    style.setAttribute(TACHE_PRINT_PAGE_STYLE_ATTR, "");
    style.textContent = TACHE_PRINT_PAGE_CSS;
    document.head.appendChild(style);
    return () => {
      document.documentElement.removeAttribute("data-tache-print-route");
      style.remove();
    };
  }, []);

  return <div className="tache-print-document-layout min-h-full bg-steel/20">{children}</div>;
}
