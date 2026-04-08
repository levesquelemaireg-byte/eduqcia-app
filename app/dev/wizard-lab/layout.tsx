import type { ReactNode } from "react";

/** Pleine largeur — même pattern que /questions/new. */
export default function WizardLabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-[var(--color-panel)]">
      {children}
    </div>
  );
}
