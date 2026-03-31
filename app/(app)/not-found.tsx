import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import {
  PAGE_APP_NOT_FOUND_CTA_DASHBOARD,
  PAGE_APP_NOT_FOUND_CTA_EVALUATIONS,
  PAGE_APP_NOT_FOUND_DESCRIPTION,
  PAGE_APP_NOT_FOUND_TITLE,
} from "@/lib/ui/ui-copy";

const linkClass =
  "inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-panel-alt px-4 py-2.5 text-sm font-semibold text-deep transition-[background-color] hover:bg-surface";

export default function AppNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold text-deep">{PAGE_APP_NOT_FOUND_TITLE}</h1>
      <p className="text-sm leading-relaxed text-muted">{PAGE_APP_NOT_FOUND_DESCRIPTION}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/dashboard" className={linkClass}>
          {PAGE_APP_NOT_FOUND_CTA_DASHBOARD}
        </Link>
        <Link href="/evaluations" className={cn(linkClass)}>
          {PAGE_APP_NOT_FOUND_CTA_EVALUATIONS}
        </Link>
      </div>
    </div>
  );
}
