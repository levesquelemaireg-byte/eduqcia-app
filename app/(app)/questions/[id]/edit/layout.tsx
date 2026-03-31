import type { ReactNode } from "react";

/** Même enveloppe que `questions/new` — split wizard pleine largeur (`docs/WORKFLOWS.md`). */
export default function EditQuestionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--color-panel)] -mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6">
      {children}
    </div>
  );
}
