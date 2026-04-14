import { CardGridSkeleton } from "@/components/ui/CardGridSkeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeaderSkeleton";

export default function QuestionsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <PageHeaderSkeleton />

      {/* Filtres */}
      <div className="mt-4 flex gap-2 animate-pulse">
        <div className="h-9 w-24 rounded-full bg-border" />
        <div className="h-9 w-28 rounded-full bg-border" />
        <div className="h-9 w-20 rounded-full bg-border" />
      </div>

      {/* Grille de cartes */}
      <div className="mt-6">
        <CardGridSkeleton count={4} cols={2} />
      </div>
    </div>
  );
}
