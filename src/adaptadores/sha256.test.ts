import { describe, expect, it } from "vitest";
import { bytesCanonicos } from "../motor/canonico";
import { sha256Hex as sha256Browser } from "./sha256-browser";
import { sha256Hex as sha256Node } from "./sha256-node";

describe("adaptadores SHA-256", () => {
  it.each([
    [new Uint8Array(), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    [
      Uint8Array.from([0x61, 0x62, 0x63]),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    ],
  ])("produz vetor conhecido em Node", async (entrada, esperado) => {
    await expect(sha256Node(entrada)).resolves.toBe(esperado);
  });

  it("produz o mesmo hexadecimal em Node e Web Crypto", async () => {
    const bytes = bytesCanonicos({ texto: "ação", valor: 1 });
    await expect(sha256Browser(bytes)).resolves.toBe(await sha256Node(bytes));
  });

  it("é sensível a qualquer campo fora de resumoSaida", async () => {
    const a = await sha256Node(bytesCanonicos({ valor: 1 }));
    const b = await sha256Node(bytesCanonicos({ valor: 2 }));
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
