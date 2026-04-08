"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Field } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { resolveConsigneHtmlForDisplay } from "@/lib/tae/consigne-helpers";
import {
  buildOi35FullHtml,
  buildOi35FullPlain,
  buildOi35TechnicalSummary,
  type Oi35Bloc3MockupInput,
  type Oi35Nature,
  type Oi35Structure,
} from "@/lib/playground/oi35-bloc3-mockup";
import { cn } from "@/lib/utils/cn";

const NATURE_OPTIONS: { value: Oi35Nature; label: string }[] = [
  { value: "acteurs", label: "Acteurs" },
  { value: "historiens", label: "Historiens" },
];

const STRUCTURE_OPTIONS: { value: Oi35Structure; label: string }[] = [
  { value: "grouped", label: "1 document (3 extraits)" },
  { value: "separate", label: "3 documents séparés" },
];

const PRESETS: { label: string; input: Oi35Bloc3MockupInput }[] = [
  {
    label: "Acteurs — groupé, 1760",
    input: {
      nature: "acteurs",
      structure: "grouped",
      enjeu: "un enjeu politique",
      repere: "en 1760",
    },
  },
  {
    label: "Acteurs — capitulation Montréal",
    input: {
      nature: "acteurs",
      structure: "grouped",
      enjeu: "la capitulation de Montréal",
      repere: "en 1760",
    },
  },
  {
    label: "Historiens — 3 docs séparés",
    input: {
      nature: "historiens",
      structure: "separate",
      enjeu: "la crise agricole",
      repere: "au XIXe siècle",
    },
  },
];

function initialInput(): Oi35Bloc3MockupInput {
  return { ...PRESETS[0]!.input };
}

/** Maquette DEV — OI 3.5 : champs variables + consigne assemblée (uniquement A–C, pas les refs de l’épreuve source). */
export function Oi35Bloc3Mockup() {
  const [input, setInput] = useState<Oi35Bloc3MockupInput>(initialInput);

  const html = useMemo(() => buildOi35FullHtml(input), [input]);
  const plain = useMemo(() => buildOi35FullPlain(input), [input]);
  const resolvedHtml = useMemo(() => resolveConsigneHtmlForDisplay(html, 3), [html]);
  const tech = useMemo(() => buildOi35TechnicalSummary(input), [input]);

  const set = <K extends keyof Oi35Bloc3MockupInput>(key: K, value: Oi35Bloc3MockupInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 text-deep">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">DEV · Maquette</p>
        <h1 className="text-xl font-semibold text-deep">OI 3.5 — Bloc 3 (consigne assemblée)</h1>
        <p className="text-sm text-muted">
          Prototype hors wizard : consigne uniquement en termes de documents A, B et C (comme la
          fiche partagée dans l’app), sans reprendre les numéros du PDF d’origine. Référentiel :{" "}
          <code className="rounded bg-panel px-1">nb_documents = 3</code>,{" "}
          <code className="rounded bg-panel px-1">nb_lignes = 5</code> (oi.json).
        </p>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/dev/fragments" className="text-accent underline-offset-2 hover:underline">
            Fragment Playground
          </Link>
          <Link
            href="/dev/summary-mockup"
            className="text-accent underline-offset-2 hover:underline"
          >
            Maquette banque
          </Link>
        </nav>
      </header>

      <section className="space-y-4 rounded-md border border-border bg-panel p-5">
        <h2 className="text-sm font-semibold text-deep">Préréglages</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={cn(
                "rounded-md border border-border px-3 py-1.5 text-left text-sm transition-colors",
                "hover:border-accent/50 hover:bg-background-info/30",
              )}
              onClick={() => setInput({ ...p.input })}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-deep">Paramètres</h2>

          <div className="space-y-2">
            <p id="oi35-nature-label" className="text-sm font-medium text-deep">
              Nature des intervenants
            </p>
            <SegmentedControl
              aria-labelledby="oi35-nature-label"
              value={input.nature}
              onChange={(v) => set("nature", v as Oi35Nature)}
              options={NATURE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>

          <div className="space-y-2">
            <p id="oi35-structure-label" className="text-sm font-medium text-deep">
              Structure documentaire
            </p>
            <SegmentedControl
              aria-labelledby="oi35-structure-label"
              value={input.structure}
              onChange={(v) => set("structure", v as Oi35Structure)}
              options={STRUCTURE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>

          <Field
            id="oi35-enjeu"
            label="Enjeu (sujet)"
            value={input.enjeu}
            onChange={(e) => set("enjeu", e.target.value)}
            placeholder="ex. la capitulation de Montréal"
          />

          <Field
            id="oi35-repere"
            label="Repère temporel"
            value={input.repere}
            onChange={(e) => set("repere", e.target.value)}
            placeholder="ex. en 1760"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-deep">Rendu</h2>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted">Texte brut (sans HTML)</p>
            <p className="rounded-md border border-border bg-background p-4 text-sm leading-relaxed">
              {plain}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted">HTML assemblé (aperçu élève)</p>
            <div
              className="prose prose-sm max-w-none rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-deep [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted">
              Après <code className="text-deep">resolveConsigneHtmlForDisplay</code> (3 docs → 1, 2,
              3)
            </p>
            <div
              className="prose prose-sm max-w-none rounded-md border border-border bg-background p-4 text-sm leading-relaxed text-deep [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: resolvedHtml }}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted">Contrat technique (mémo)</p>
            <ul className="list-inside list-disc rounded-md border border-border bg-panel p-4 text-sm text-muted">
              <li>
                <code className="text-deep">documents_new.length</code> = {tech.documentsNewCount}
              </li>
              {tech.slots.map((s) => (
                <li key={s.slotId}>
                  <code className="text-deep">{s.slotId}</code> →{" "}
                  <code className="text-deep">newIndex</code> {s.newIndex} — {s.note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
