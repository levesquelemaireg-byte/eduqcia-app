"use client";

/** Corps riche de la modale d’aide « Consigne » (étape 3) — registre `docs/UI-COPY.md` (page Créer une TAÉ, Étape 3). */
import { CONSIGNE_DOC_HELP_MODAL_BADGE_CLASS } from "@/components/tae/TaeForm/tiptap/consigneDocBadgeStyles";

export function Bloc3ConsigneHelpModalBody() {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-deep">
      <p>
        La consigne comprend deux parties : une phrase d&apos;introduction générée automatiquement,
        qui invite l&apos;élève à consulter les documents requis, par exemple : « Consultez les
        documents A et B. », suivie de la consigne rédigée par l&apos;enseignant.
      </p>
      <p>
        Utilisez les boutons <span className={CONSIGNE_DOC_HELP_MODAL_BADGE_CLASS}>Doc A</span> et{" "}
        <span className={CONSIGNE_DOC_HELP_MODAL_BADGE_CLASS}>Doc B</span> pour insérer une
        référence à un document à l&apos;endroit précis souhaité dans le texte. Les références
        apparaissent sous forme de lettres dans le sommaire et sont automatiquement numérotées à
        l&apos;impression, selon l&apos;ordre des documents dans le dossier documentaire de
        l&apos;épreuve.
      </p>
      <p>
        L&apos;éditeur prend en charge la mise en forme enrichie : gras, italique, souligné et
        listes à puces{" "}
        <span
          className="icon-text inline-flex items-center align-middle text-deep [--icon-gap-em:0.15em]"
          aria-hidden
        >
          <span className="material-symbols-outlined text-[1em] leading-none text-deep">list</span>
        </span>
        .
      </p>
    </div>
  );
}
