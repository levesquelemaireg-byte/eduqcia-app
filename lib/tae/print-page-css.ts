/** Attribut sur la balise `<style>` injectée — éviter les doublons au démontage. */
export const TAE_PRINT_PAGE_STYLE_ATTR = "data-tae-print-page-rules";

/**
 * Marge `@page` sur **chaque** page imprimée. À garder aligné sur **`--tae-print-sheet-padding`**
 * dans `app/globals.css` (même valeur que le `padding` de `.paper` à l’aperçu écran).
 */
export const TAE_PRINT_PAGE_MARGIN = "2cm";

/**
 * Règles `@page` pour l’impression fiche TAÉ (modale wizard + route `/questions/[id]/print`).
 *
 * - **`margin: TAE_PRINT_PAGE_MARGIN`** : marges blanches **répétées sur toutes les pages**. Le
 *   **`padding`** sur un bloc qui fragmente (`#tae-wizard-printable-fiche`) ne se réapplique pas
 *   en haut des pages suivantes dans les navigateurs — d’où l’usage de `@page` pour l’impression.
 * - En print, **`#tae-wizard-printable-fiche`** a **`padding: 0`** (`app/globals.css` @media print)
 *   pour ne pas doubler ces marges.
 * - **`size: letter portrait`** : cohérent avec la feuille Letter.
 * - En print, la feuille utilise **`width: 100%`** + **`max-width: none`** dans `globals.css` pour
 *   remplir la zone utile délimitée par `@page` (évite la bande centrale étroite d’un parent).
 *
 * Typographie fiche (consigne, documents, etc.) : **Arial**, **11pt** / **line-height 1.5** sur la feuille
 * (`globals.css` @media print + `printable-fiche-preview.module.css` `.paper` à l’écran). Les `<text>` SVG
 * de la frise ligne du temps utilisent `font-family: var(--font-sans)` ; **`--font-sans`** est forcé à
 * Arial sur `#tae-wizard-printable-fiche` (print) et sur `.paper` (aperçu).
 * Figures iconographiques : **`--tae-print-document-figure-*`** sur `:root` — consommées par `.documentFigure`.
 * Barèmes HTML : tailles explicites dans `eval-grid.module.css` sur `table`.
 * Repère DOM grilles : attribut `data-tae-print-eval-grid` sur `GrilleEvalTable`.
 */
export const TAE_PRINT_PAGE_CSS = `@media print {
  @page {
    size: letter portrait;
    margin: ${TAE_PRINT_PAGE_MARGIN};
  }
}`;
