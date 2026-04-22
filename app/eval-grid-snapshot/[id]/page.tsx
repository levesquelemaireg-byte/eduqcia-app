import { readFile } from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import { GrilleEvalTable } from "@/components/tache/grilles/GrilleEvalTable";
import type { GrilleEntry } from "@/components/tache/wizard/bloc2/types";

async function loadGrilles(): Promise<GrilleEntry[]> {
  const file = path.join(process.cwd(), "public/data/grilles-evaluation.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as unknown;
  return Array.isArray(data) ? (data as GrilleEntry[]) : [];
}

export async function generateStaticParams() {
  const grilles = await loadGrilles();
  return grilles.map((g) => ({ id: g.id }));
}

type PageProps = { params: Promise<{ id: string }> };

/** Page statique pour captures Playwright (`toHaveScreenshot`) — non listée dans la nav. */
export default async function EvalGridSnapshotPage({ params }: PageProps) {
  const { id } = await params;
  const grilles = await loadGrilles();
  const entry = grilles.find((g) => g.id === id);
  if (!entry) {
    notFound();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#fff",
        boxSizing: "border-box",
      }}
    >
      <div className="max-w-full overflow-x-auto" data-testid={`eval-grid-${entry.id}`}>
        <GrilleEvalTable entry={entry} />
      </div>
    </div>
  );
}
