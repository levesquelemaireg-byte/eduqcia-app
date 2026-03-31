export type GrilleEntry = {
  id: string;
  operation: string;
  comportement_enonce: string;
  outil_image?: string;
  bareme: {
    max_points: number;
    /** Légende sous le tableau (ex. astérisque OI6_SO3). */
    note?: string;
    echelle: { points: number; label: string; description: string }[];
  };
};
