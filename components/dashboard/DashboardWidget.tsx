import type { ReactNode } from "react";

type Props = {
  title: string;
  icon: string;
  badge?: number;
  children: ReactNode;
};

export function DashboardWidget({ title, icon, badge, children }: Props) {
  return (
    <section className="flex min-h-[140px] flex-col rounded-xl border border-border bg-panel shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="icon-text min-w-0 flex-1 flex-wrap text-sm font-semibold text-deep">
          <span
            className="material-symbols-outlined shrink-0 text-[1.375em] text-accent"
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="truncate">{title}</span>
        </h2>
        {badge != null && badge > 0 ? (
          <span className="shrink-0 self-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </header>
      <div className="flex flex-1 flex-col p-4 text-sm text-muted">{children}</div>
    </section>
  );
}
