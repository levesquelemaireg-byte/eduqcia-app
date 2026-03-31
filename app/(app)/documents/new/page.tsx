import { AutonomousDocumentForm } from "@/components/documents/AutonomousDocumentForm";
import { getDocumentFormRefOptions } from "@/lib/queries/document-ref-data";

export default async function DocumentsNewPage() {
  const { niveaux, disciplines } = await getDocumentFormRefOptions();
  return (
    <div className="min-h-0 w-full">
      <AutonomousDocumentForm niveaux={niveaux} disciplines={disciplines} />
    </div>
  );
}
