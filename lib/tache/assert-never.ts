/**
 * Utilitaire d'exhaustivité TypeScript pour les unions discriminées.
 * À utiliser dans la branche `default:` d'un switch exhaustif ou dans
 * un bloc inaccessible après narrowing, pour forcer une erreur de
 * compilation si un nouveau cas est ajouté à l'union sans être géré.
 *
 * @example
 * switch (variant.type) {
 *   case "a": return doA();
 *   case "b": return doB();
 *   default: return assertNever(variant.type);
 * }
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Valeur inattendue : ${JSON.stringify(value)}`);
}
