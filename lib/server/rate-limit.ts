import "server-only";

/**
 * Rate limiter en mémoire — fenêtre fixe par clé.
 *
 * Suffisant pour la protection basique en serverless (instances réutilisées
 * pendant leur durée de vie). Ne remplace pas un rate limiter distribué
 * (Redis / KV) pour une protection à grande échelle.
 */

const WINDOW_MS = 60_000;

const store = new Map<string, { count: number; windowStart: number }>();

/**
 * Vérifie si la requête est autorisée sous la limite `max` par minute.
 *
 * @param key — clé unique (ex: `pdf:${userId}`, `collab:${userId}`)
 * @param max — nombre max de requêtes par fenêtre de 60s
 * @returns `true` si autorisé, `false` si limité
 */
export function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count++;
  return true;
}
