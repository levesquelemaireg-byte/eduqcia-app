"use client";

import { useEffect, type ReactNode } from "react";
import { TAE_PRINT_PAGE_CSS, TAE_PRINT_PAGE_STYLE_ATTR } from "@/lib/tae/print-page-css";
import { useClearDocumentTitleForPrint } from "@/lib/tae/use-clear-document-title-for-print";

/**
 * Marque `html` pour `@media print` + injecte `@page` — route dédiée impression TAÉ.
 */
export function TaePrintRouteShell({ children }: { children: ReactNode }) {
  useClearDocumentTitleForPrint(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-tae-print-route", "");
    const style = document.createElement("style");
    style.setAttribute(TAE_PRINT_PAGE_STYLE_ATTR, "");
    style.textContent = TAE_PRINT_PAGE_CSS;
    document.head.appendChild(style);
    return () => {
      document.documentElement.removeAttribute("data-tae-print-route");
      style.remove();
    };
  }, []);

  return <div className="tae-print-document-layout min-h-full bg-steel/20">{children}</div>;
}
