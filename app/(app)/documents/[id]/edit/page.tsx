import { notFound, redirect } from "next/navigation";
import { AutonomousDocumentForm } from "@/components/documents/AutonomousDocumentForm";
import { loadAutonomousDocumentForEditForm } from "@/lib/queries/autonomous-document-edit";
import { getDocumentFormRefOptions } from "@/lib/queries/document-ref-data";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DocumentEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const initialValues = await loadAutonomousDocumentForEditForm(supabase, id, user.id);
  if (!initialValues) notFound();

  const { niveaux, disciplines } = await getDocumentFormRefOptions();

  return (
    <div className="min-h-0 w-full">
      <AutonomousDocumentForm
        niveaux={niveaux}
        disciplines={disciplines}
        mode="edit"
        documentId={id}
        initialValues={initialValues}
      />
    </div>
  );
}
