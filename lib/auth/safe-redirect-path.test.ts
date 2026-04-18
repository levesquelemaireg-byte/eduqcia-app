import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/auth/safe-redirect-path";

describe("safeRedirectPath", () => {
  it("retourne /dashboard pour null", () => {
    expect(safeRedirectPath(null)).toBe("/dashboard");
  });

  it("retourne /dashboard pour chaîne vide", () => {
    expect(safeRedirectPath("")).toBe("/dashboard");
  });

  it("accepte un chemin interne simple", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/profile")).toBe("/profile");
    expect(safeRedirectPath("/questions/abc-123")).toBe("/questions/abc-123");
  });

  it("accepte des chemins avec tirets, underscores et points", () => {
    expect(safeRedirectPath("/my-page")).toBe("/my-page");
    expect(safeRedirectPath("/my_page")).toBe("/my_page");
    expect(safeRedirectPath("/path/file.html")).toBe("/path/file.html");
  });

  it("bloque les URLs protocol-relative (//)", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com/path")).toBe("/dashboard");
  });

  it("bloque les URLs absolues avec schéma", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("http://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("bloque les chemins qui ne commencent pas par /", () => {
    expect(safeRedirectPath("dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("evil.com")).toBe("/dashboard");
  });

  it("bloque les chemins avec caractères spéciaux dangereux", () => {
    expect(safeRedirectPath("/path?param=value")).toBe("/dashboard");
    expect(safeRedirectPath("/path#fragment")).toBe("/dashboard");
    expect(safeRedirectPath("/path%00null")).toBe("/dashboard");
    expect(safeRedirectPath("/path\nnewline")).toBe("/dashboard");
    expect(safeRedirectPath("/path with spaces")).toBe("/dashboard");
    expect(safeRedirectPath("/path@user")).toBe("/dashboard");
    expect(safeRedirectPath("/path\\backslash")).toBe("/dashboard");
  });

  it("bloque les tentatives d'injection via encodage", () => {
    expect(safeRedirectPath("/%2F%2Fevil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });
});
