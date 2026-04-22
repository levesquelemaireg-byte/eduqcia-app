import { describe, expect, it } from "vitest";
import { classifyPublishRpcError } from "@/lib/tache/publish-tae-rpc-errors";

describe("classifyPublishRpcError", () => {
  it("23503 → rpc_foreign_key", () => {
    expect(classifyPublishRpcError({ code: "23503", message: "" })).toBe("rpc_foreign_key");
  });

  it("message foreign key → rpc_foreign_key", () => {
    expect(classifyPublishRpcError({ message: "foreign key violation" })).toBe("rpc_foreign_key");
  });

  it("22P02 → rpc_invalid_enum", () => {
    expect(classifyPublishRpcError({ code: "22P02" })).toBe("rpc_invalid_enum");
  });

  it("invalid enum dans le texte → rpc_invalid_enum", () => {
    expect(classifyPublishRpcError({ message: "invalid input value for enum aspects" })).toBe(
      "rpc_invalid_enum",
    );
  });

  it("défaut → tae_insert", () => {
    expect(classifyPublishRpcError({ message: "something else" })).toBe("tae_insert");
  });
});
