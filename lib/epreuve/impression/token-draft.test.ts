import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { signerTokenDraft, verifierTokenDraft } from "./token-draft";

const TEST_SECRET = "a]3Fk$9vPm2!xR7wQz#Bc8Ld+Yj6Hn0T";

describe("token-draft HMAC", () => {
  beforeEach(() => {
    vi.stubEnv("DRAFT_TOKEN_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signer puis vérifier un token valide retourne { valide: true, payloadId }", () => {
    const payloadId = "test-payload-123";
    const token = signerTokenDraft(payloadId);
    const result = verifierTokenDraft(token);

    expect(result).toEqual({ valide: true, payloadId: "test-payload-123" });
  });

  it("token expiré retourne { valide: false }", () => {
    const payloadId = "test-expired";
    const token = signerTokenDraft(payloadId);

    // Décoder, modifier exp dans le passé, re-signer avec la bonne signature
    const json = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
    json.exp = Date.now() - 1000; // expiré depuis 1 seconde

    // Recréer un token avec exp modifié mais signature originale (invalide)
    const tamperedToken = Buffer.from(JSON.stringify(json), "utf-8").toString("base64url");
    const result = verifierTokenDraft(tamperedToken);

    expect(result).toEqual({ valide: false });
  });

  it("token falsifié (signature modifiée) retourne { valide: false }", () => {
    const payloadId = "test-tampered";
    const token = signerTokenDraft(payloadId);

    const json = JSON.parse(Buffer.from(token, "base64url").toString("utf-8"));
    json.signature = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    const tamperedToken = Buffer.from(JSON.stringify(json), "utf-8").toString("base64url");
    const result = verifierTokenDraft(tamperedToken);

    expect(result).toEqual({ valide: false });
  });

  it("token malformé (base64 invalide) retourne { valide: false }", () => {
    const result = verifierTokenDraft("!!!not-valid-base64!!!");

    expect(result).toEqual({ valide: false });
  });

  it("token avec JSON invalide retourne { valide: false }", () => {
    const token = Buffer.from("not json at all", "utf-8").toString("base64url");
    const result = verifierTokenDraft(token);

    expect(result).toEqual({ valide: false });
  });

  it("token sans champs requis retourne { valide: false }", () => {
    const token = Buffer.from(JSON.stringify({ foo: "bar" }), "utf-8").toString("base64url");
    const result = verifierTokenDraft(token);

    expect(result).toEqual({ valide: false });
  });
});
