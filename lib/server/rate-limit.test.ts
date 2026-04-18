import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/server/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("autorise la première requête", () => {
    expect(checkRateLimit("test-first", 5)).toBe(true);
  });

  it("autorise les requêtes successives sous la limite", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test-under", 5)).toBe(true);
    }
  });

  it("bloque au-delà de la limite", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-over", 5);
    }
    expect(checkRateLimit("test-over", 5)).toBe(false);
  });

  it("réinitialise après expiration de la fenêtre (60s)", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test-reset", 5);
    }
    expect(checkRateLimit("test-reset", 5)).toBe(false);

    // Avancer au-delà de la fenêtre de 60s
    vi.advanceTimersByTime(61_000);

    expect(checkRateLimit("test-reset", 5)).toBe(true);
  });

  it("isole les clés différentes", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-a", 5);
    }
    expect(checkRateLimit("key-a", 5)).toBe(false);
    expect(checkRateLimit("key-b", 5)).toBe(true);
  });

  it("gère max=1 correctement", () => {
    expect(checkRateLimit("test-max1", 1)).toBe(true);
    expect(checkRateLimit("test-max1", 1)).toBe(false);
  });

  it("ne réinitialise pas avant l'expiration de la fenêtre", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("test-notreset", 3);
    }
    expect(checkRateLimit("test-notreset", 3)).toBe(false);

    // 30s — pas encore expiré
    vi.advanceTimersByTime(30_000);
    expect(checkRateLimit("test-notreset", 3)).toBe(false);

    // 31s de plus (total 61s) — expiré
    vi.advanceTimersByTime(31_000);
    expect(checkRateLimit("test-notreset", 3)).toBe(true);
  });
});
