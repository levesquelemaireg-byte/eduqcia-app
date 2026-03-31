import { describe, expect, it } from "vitest";
import {
  sourceCitationDisplayHtml,
  stripHtmlToPlainText,
} from "@/lib/documents/source-citation-html";

describe("sourceCitationDisplayHtml", () => {
  it("wraps plain text in a paragraph with escaped HTML", () => {
    expect(sourceCitationDisplayHtml("Archives <script>")).toBe("<p>Archives &lt;script&gt;</p>");
  });

  it("preserves TipTap-like HTML", () => {
    const html = "<p><strong>ANQ</strong>, 1837.</p>";
    expect(sourceCitationDisplayHtml(html)).toBe(html);
  });
});

describe("stripHtmlToPlainText", () => {
  it("strips tags for list previews", () => {
    expect(stripHtmlToPlainText("<p>Hello <em>world</em></p>")).toBe("Hello world");
  });
});
