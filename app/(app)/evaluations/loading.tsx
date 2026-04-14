import { ListSkeleton } from "@/components/ui/ListItemSkeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeaderSkeleton";

export default function EvaluationsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <PageHeaderSkeleton showSubtitle={false} />
      <ListSkeleton count={4} />
    </div>
  );
}
