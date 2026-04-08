import { useMemo, useState, type ReactNode } from "react";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import { GrilleEvalTable } from "@/components/tae/grilles/GrilleEvalTable";
import grillesJson from "../../../public/data/grilles-evaluation.json";

const grilles = grillesJson as GrilleEntry[];

/** Même largeur de calage que l’app (`eval-grid.module.css` — `--eval-grid-base-width`). */
const LAB_GRID_WIDTH_PX = 660;

function pngDevUrl(outilImage: string | undefined): string | null {
  if (!outilImage?.trim()) return null;
  const base = pathBasename(outilImage);
  if (!base.endsWith(".png")) return null;
  return `/maquette-img/${encodeURIComponent(base)}`;
}

function pathBasename(p: string): string {
  const n = p.replace(/\\/g, "/").split("/").pop();
  return n ?? p;
}

const REACT_COL_WIDTH_MIN = 200;
const REACT_COL_WIDTH_MAX = LAB_GRID_WIDTH_PX;

export default function App() {
  const [id, setId] = useState(grilles[0]?.id ?? "OI0_SO1");
  const [pngFailed, setPngFailed] = useState(false);
  /** Réduire pour forcer les retours à la ligne (parenthèses : `tieAsciiParentheses` dans l’app). */
  const [reactColWidth, setReactColWidth] = useState(LAB_GRID_WIDTH_PX);
  const entry = useMemo(() => grilles.find((g) => g.id === id) ?? null, [id]);
  const pngSrc = entry ? pngDevUrl(entry.outil_image) : null;

  return (
    <div style={{ padding: 20, width: "100%", overflowX: "auto", boxSizing: "border-box" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>
          Lab grilles — comparaison PNG / React
        </h1>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
          Données : <code>public/data/grilles-evaluation.json</code> · PNG servis depuis{" "}
          <code>maquette/img/</code> (URL <code>/maquette-img/&lt;fichier&gt;</code>) · Calage PNG{" "}
          <strong>{LAB_GRID_WIDTH_PX}px</strong> — le bloc React réutilise le même code que l’app (
          <code>GrilleEvalTable</code> via alias Vite <code>@/</code>) — voir{" "}
          <code>docs/ARCHITECTURE.md</code> (grilles).
        </p>
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
          <span>Outil</span>
          <select
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setPngFailed(false);
            }}
            style={{ minWidth: 220, padding: "6px 8px" }}
          >
            {grilles.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!entry ? (
        <p>Entrée introuvable.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            alignItems: "center",
          }}
        >
          <LabColumn title={`PNG (${entry.outil_image ?? "—"})`} widthPx={LAB_GRID_WIDTH_PX}>
            {pngSrc && !pngFailed ? (
              <img
                src={pngSrc}
                alt=""
                width={LAB_GRID_WIDTH_PX}
                style={{
                  width: LAB_GRID_WIDTH_PX,
                  minWidth: LAB_GRID_WIDTH_PX,
                  height: "auto",
                  display: "block",
                }}
                onError={() => setPngFailed(true)}
              />
            ) : (
              <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
                {pngSrc
                  ? `Impossible de charger ${entry.outil_image} — vérifie que le fichier est dans maquette/img/ puis redémarre le serveur Vite.`
                  : `Pas de fichier PNG référencé pour cet outil.`}
              </p>
            )}
          </LabColumn>

          <LabColumn
            title={`Composant React (prod) — ${reactColWidth}px`}
            widthPx={LAB_GRID_WIDTH_PX}
          >
            <div
              style={{
                padding: "0 12px 12px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                <span>
                  Largeur du rendu React (test césure / parenthèses <code>tieAsciiParentheses</code>
                  ) : <strong>{reactColWidth}px</strong>
                </span>
                <input
                  type="range"
                  min={REACT_COL_WIDTH_MIN}
                  max={REACT_COL_WIDTH_MAX}
                  value={reactColWidth}
                  onChange={(e) => setReactColWidth(Number(e.target.value))}
                  style={{ width: "100%", maxWidth: 360 }}
                />
              </label>
            </div>
            <div
              style={{
                margin: 0,
                padding: 0,
                background: "#fff",
                width: reactColWidth,
                minWidth: reactColWidth,
                maxWidth: "100%",
                boxSizing: "border-box",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <GrilleEvalTable entry={entry} />
            </div>
          </LabColumn>
        </div>
      )}
    </div>
  );
}

function LabColumn({
  title,
  widthPx,
  children,
}: {
  title: string;
  widthPx: number;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        width: widthPx,
        minWidth: widthPx,
        flexShrink: 0,
        boxSizing: "border-box",
        margin: 0,
        background: "#111827",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          fontSize: 14,
          margin: 0,
          padding: "12px 12px 8px",
          color: "#e5e7eb",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      <div style={{ background: "#fff", padding: 0 }}>{children}</div>
    </section>
  );
}
