"use client";

import Link from "next/link";
import {
  PAGE_APP_ERROR_CTA_DASHBOARD,
  PAGE_APP_ERROR_CTA_RETRY,
  PAGE_APP_ERROR_DESCRIPTION,
  PAGE_APP_ERROR_TITLE,
} from "@/lib/ui/ui-copy";

const linkClass =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel-alt px-4 py-2.5 text-sm font-semibold text-deep transition-[background-color] hover:bg-surface";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold text-deep">{PAGE_APP_ERROR_TITLE}</h1>
      <p className="text-sm leading-relaxed text-muted">{PAGE_APP_ERROR_DESCRIPTION}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <button onClick={reset} className={linkClass}>
          <span className="inline-flex items-center gap-[0.35em]">
            <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
              refresh
            </span>
            {PAGE_APP_ERROR_CTA_RETRY}
          </span>
        </button>
        <Link href="/dashboard" className={linkClass}>
          {PAGE_APP_ERROR_CTA_DASHBOARD}
        </Link>
      </div>
    </div>
  );
}
