/**
 * Reconstruit public/data/grilles-templates.html à partir des <table> dans
 * maquette/grilles-preview.html (cartes dont le titre commence par OIx_SOy).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const previewPath = path.join(root, "maquette", "grilles-preview.html");
const outPath = path.join(root, "public", "data", "grilles-templates.html");

const header = `<!--
  LEGACY — remplacé par GrilleOI3SO5.tsx / OI6SO3Grid.tsx (GrilleOI6SO3) /
  GrilleOI7SO1.tsx dans components/tache/grilles/. Conserver pour référence
  historique uniquement ; le rendu produit consomme grilles-evaluation.json
  et les composants React.

  Grilles d'évaluation — Templates HTML (extrait maquette/grilles-preview.html)
  Généré : scripts/extract-grilles-templates-from-preview.mjs
-->

`;

const html = fs.readFileSync(previewPath, "utf8");
const seen = new Set();
const blocks = [];

let searchFrom = 0;
while (searchFrom < html.length) {
  const h2 = html.indexOf('<h2 class="card__title">', searchFrom);
  if (h2 === -1) break;
  const idMatch = html.slice(h2, h2 + 120).match(/<h2 class="card__title">(OI\d+_SO\d+)/);
  if (!idMatch) {
    searchFrom = h2 + 1;
    continue;
  }
  const id = idMatch[1];
  const rel = html.slice(h2);
  const bodyIdx = rel.indexOf('<div class="card__body">');
  if (bodyIdx === -1) {
    searchFrom = h2 + 1;
    continue;
  }
  const fromBody = rel.slice(bodyIdx);
  const tableOpen = fromBody.indexOf("<table");
  if (tableOpen === -1) {
    searchFrom = h2 + 1;
    continue;
  }
  const t0 = fromBody.slice(tableOpen);
  const tableClose = t0.indexOf("</table>");
  if (tableClose === -1) {
    searchFrom = h2 + 1;
    continue;
  }
  const table = t0.slice(0, tableClose + 8).trim();
  if (!seen.has(id)) {
    seen.add(id);
    blocks.push({ id, table });
  }
  searchFrom = h2 + 20;
}

let out = header;
for (const { id, table } of blocks) {
  out += `<template id="${id}">\n  ${table.replace(/\n/g, "\n  ")}\n</template>\n\n`;
}

fs.writeFileSync(outPath, out.trimEnd() + "\n", "utf8");
console.log("Wrote", blocks.length, "templates to", outPath);
