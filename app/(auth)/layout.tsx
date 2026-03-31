export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-bg">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-[var(--space-3)] py-[var(--space-6)] sm:px-[var(--space-4)]">
        <header className="mb-[var(--space-5)]">
          <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
            <span
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent text-white shadow-sm"
              aria-hidden="true"
            >
              <span
                className="material-symbols-outlined text-[28px] leading-none"
                aria-hidden="true"
              >
                school
              </span>
            </span>
            <h1 className="text-center text-[1.75rem] font-extrabold leading-tight tracking-tight text-deep">
              ÉduQc.IA / Univers social
            </h1>
          </div>
        </header>
        <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-[var(--space-5)] shadow-md sm:p-[var(--space-6)]">
          {children}
        </div>
      </div>
    </div>
  );
}
