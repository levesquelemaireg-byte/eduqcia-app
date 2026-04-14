import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeaderSkeleton";

export default function BankLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <PageHeaderSkeleton />

      {/* Onglets */}
      <div className="mt-4 flex gap-1 border-b border-border animate-pulse">
        <div className="h-10 w-24 rounded-t-md bg-border" />
        <div className="h-10 w-28 rounded-t-md bg-border/50" />
        <div className="h-10 w-24 rounded-t-md bg-border/50" />
      </div>

      {/* Contenu du panel actif */}
      <div className="mt-6">
        <CardGridSkeleton count={6} cols={2} />
      </div>
    </div>
  );
}
