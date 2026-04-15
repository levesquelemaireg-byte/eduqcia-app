/**
 * SectionDocument — rendu d'un document historique numerote dans le PDF.
 *
 * Document textuel : titre + contenu HTML.
 * Document iconographique : titre + image avec echelle.
 * Le titre est deja traite par les regles de visibilite (vide si masque).
 *
 * Invariants : Arial, noir, pas de decoration.
 */

import type { DocumentReference } from "@/lib/tache/contrats/donnees";

export type ContenuDocument = {
  numeroGlobal: number;
  document: DocumentReference;
};

export type SectionDocumentProps = {
  contenu: ContenuDocument;
};

const STYLE_BASE: React.CSSProperties = {
  fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif',
  color: "#000",
  marginBottom: "12px",
};

export function SectionDocument({ contenu }: SectionDocumentProps) {
  const { numeroGlobal, document: doc } = contenu;

  return (
    <div className="bloc-document" style={STYLE_BASE}>
      {/* Titre du document (vide si masque par les regles de visibilite) */}
      {doc.titre && (
        <p
          style={{
            fontSize: "11pt",
            fontWeight: 700,
            marginBottom: "4px",
            marginTop: 0,
          }}
        >
          Document {numeroGlobal} — {doc.titre}
        </p>
      )}
      {!doc.titre && (
        <p
          style={{
            fontSize: "11pt",
            fontWeight: 700,
            marginBottom: "4px",
            marginTop: 0,
          }}
        >
          Document {numeroGlobal}
        </p>
      )}

      {/* Contenu selon le type */}
      {doc.kind === "textuel" && (
        <div
          style={{ fontSize: "11pt", lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: doc.contenu }}
        />
      )}

      {doc.kind === "iconographique" && (
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doc.contenu}
            alt={doc.titre || `Document ${numeroGlobal}`}
            style={{
              maxWidth: "100%",
              height: "auto",
              transform: doc.echelle ? `scale(${doc.echelle})` : undefined,
              transformOrigin: "top center",
            }}
          />
        </div>
      )}
    </div>
  );
}
