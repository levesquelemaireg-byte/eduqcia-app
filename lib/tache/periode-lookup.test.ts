import { describe, expect, it } from "vitest";
import { lookupPeriode } from "@/lib/tache/periode-lookup";

describe("lookupPeriode", () => {
  it("retourne la période pour une réalité sociale HEC", () => {
    expect(lookupPeriode("La sédentarisation")).toBe(
      "Du 9ᵉ millénaire av. J.-C. à 3 300 av. J.-C.",
    );
  });

  it("retourne la période pour une réalité sociale HEC avec apostrophe typographique", () => {
    expect(lookupPeriode("L\u2019essor urbain et commercial")).toBe("Du 11ᵉ au 15ᵉ siècle");
  });

  it("retourne la période pour une réalité sociale HQC (nom pur)", () => {
    expect(lookupPeriode("L\u2019expérience des Autochtones et le projet de colonie")).toBe(
      "Des origines à 1608",
    );
  });

  it("retourne la période pour une réalité sociale HQC (format concaténé ancien)", () => {
    expect(
      lookupPeriode(
        "Des origines à 1608 — L\u2019expérience des Autochtones et le projet de colonie",
      ),
    ).toBe("Des origines à 1608");
  });

  it("retourne null pour une réalité sociale inconnue", () => {
    expect(lookupPeriode("Réalité inconnue")).toBeNull();
  });

  it("couvre les 12 réalités sociales HEC", () => {
    const hecRealities = [
      "La sédentarisation",
      "L\u2019émergence d\u2019une civilisation",
      "Une première expérience de démocratie",
      "La romanisation",
      "La christianisation de l\u2019Occident",
      "L\u2019essor urbain et commercial",
      "Le renouvellement de la vision de l\u2019homme",
      "L\u2019expansion européenne dans le monde",
      "Les révolutions américaine ou française",
      "L\u2019industrialisation : une révolution économique et sociale",
      "L\u2019expansion du monde industriel",
      "La reconnaissance des libertés et des droits civils",
    ];
    for (const rs of hecRealities) {
      expect(lookupPeriode(rs), `Missing periode for: ${rs}`).not.toBeNull();
    }
  });

  it("couvre les 8 réalités sociales HQC", () => {
    const hqcRealities = [
      "L\u2019expérience des Autochtones et le projet de colonie",
      "L\u2019évolution de la société coloniale sous l\u2019autorité de la métropole française",
      "La Conquête et le changement d\u2019empire",
      "Les revendications et les luttes nationales",
      "La formation du régime fédéral canadien",
      "Les nationalismes et l\u2019autonomie du Canada",
      "La modernisation du Québec et la Révolution tranquille",
      "Les choix de société dans le Québec contemporain",
    ];
    for (const rs of hqcRealities) {
      expect(lookupPeriode(rs), `Missing periode for: ${rs}`).not.toBeNull();
    }
  });
});
