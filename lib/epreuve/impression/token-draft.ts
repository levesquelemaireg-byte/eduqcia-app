import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signature HMAC et vérification du draft-token — print-engine v2.1 §4.6.
 *
 * Le token encode { payloadId, exp } signé HMAC-SHA256 avec DRAFT_TOKEN_SECRET.
 * Format : base64url(JSON({ payloadId, exp, signature })).
 * TTL : 10 minutes.
 */

const TTL_MS = 10 * 60 * 1000;

export type PayloadTokenDraft = {
  payloadId: string;
  exp: number;
  signature: string;
};

function getSecret(): Buffer {
  const secret = process.env.DRAFT_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DRAFT_TOKEN_SECRET manquant ou trop court (min 32 caractères).");
  }
  return Buffer.from(secret, "utf-8");
}

function signer(payloadId: string, exp: number): string {
  const message = `${payloadId}:${exp}`;
  return createHmac("sha256", getSecret()).update(message).digest("base64url");
}

/**
 * Signe un draft-token pour un payloadId donné.
 * Retourne un token base64url prêt à être utilisé dans une URL.
 */
export function signerTokenDraft(payloadId: string): string {
  const exp = Date.now() + TTL_MS;
  const signature = signer(payloadId, exp);
  const payload: PayloadTokenDraft = { payloadId, exp, signature };
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

/**
 * Vérifie un draft-token.
 * Retourne `{ valide: true, payloadId }` si le token est valide et non expiré,
 * `{ valide: false }` sinon.
 */
export function verifierTokenDraft(token: string): { valide: boolean; payloadId?: string } {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    const parsed: unknown = JSON.parse(json);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("payloadId" in parsed) ||
      !("exp" in parsed) ||
      !("signature" in parsed)
    ) {
      return { valide: false };
    }

    const { payloadId, exp, signature } = parsed as PayloadTokenDraft;

    if (typeof payloadId !== "string" || typeof exp !== "number" || typeof signature !== "string") {
      return { valide: false };
    }

    // Vérifier l'expiration
    if (Date.now() > exp) {
      return { valide: false };
    }

    // Vérifier la signature en temps constant
    const expected = signer(payloadId, exp);
    const sigBuffer = Buffer.from(signature, "base64url");
    const expectedBuffer = Buffer.from(expected, "base64url");

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valide: false };
    }

    if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valide: false };
    }

    return { valide: true, payloadId };
  } catch {
    return { valide: false };
  }
}
