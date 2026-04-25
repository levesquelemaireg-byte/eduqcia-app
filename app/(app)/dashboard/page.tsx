import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";

function DashboardSkeleton() {
  return (
    <>
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
      <CardGridSkeleton count={4} cols={2} />
    </>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={user.id} />
      </Suspense>
    </div>
  );
}
