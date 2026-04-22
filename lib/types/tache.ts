import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** TAÉ — à compléter quand les types générés incluent `tae`. */
export type TacheRow = {
  id: string;
  auteur_id: string;
  consigne: string | null;
  is_published: boolean;
};
