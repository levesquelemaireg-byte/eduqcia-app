import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* En-tête profil */}
      <div className="animate-pulse rounded-xl border border-border bg-panel p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="h-7 w-48 rounded bg-border" />
            <div className="mt-2 h-4 w-64 rounded bg-border" />
          </div>
          <div className="h-10 w-40 rounded-md bg-border" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-lg bg-panel-alt px-3 py-2">
              <div className="h-3 w-20 rounded bg-border" />
              <div className="mt-2 h-5 w-10 rounded bg-border" />
            </div>
          ))}
        </div>
      </div>

      {/* Widgets */}
      <CardGridSkeleton count={4} cols={2} />
    </div>
  );
}
