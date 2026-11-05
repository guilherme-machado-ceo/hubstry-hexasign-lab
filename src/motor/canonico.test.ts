import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  bytesCanonicos,
  compararPontosDeCodigo,
  correspondenciasCanonicas,
  dominioCanonico,
  jsonCanonico,
  numeroCanonico,
  quantizar12,
  saidaSemResumoSaida,
} from "./canonico";
import { criarDominioValido } from "./__tests__/fixtures";

function embaralhar<T>(itens: T[]): T[] {
  return [...itens].reverse();
}

describe("serialização canônica", () => {
  it("ordena chaves, normaliza NFC e remove espaços", () => {
    expect(jsonCanonico({ z: 1, a: "e\u0301" })).toBe('{"a":"é","z":1}');
    expect(jsonCanonico({ a: "é", z: 1 })).toBe('{"a":"é","z":1}');
  });

  it("ordena por ponto de código, não por unidade UTF-16", () => {
    const privada = "\ue000";
    const emoji = "😀";
    expect(compararPontosDeCodigo(privada, emoji)).toBeLessThan(0);
    expect(jsonCanonico({ [emoji]: 2, [privada]: 1 })).toBe(`{"${privada}":1,"${emoji}":2}`);
  });

  it("normaliza -0 e rejeita números não finitos", () => {
    expect(numeroCanonico(-0)).toBe("0");
    expect(jsonCanonico([-0, 1.5, 1e21])).toBe("[0,1.5,1e+21]");
    expect(() => numeroCanonico(Number.NaN)).toThrow("finito");
  });

  it("quantiza escores a doze casas", () => {
    expect(quantizar12(0.1234567890124)).toBe(0.123456789012);
    expect(quantizar12(0.1234567890126)).toBe(0.123456789013);
    expect(() => quantizar12(1.1)).toThrow("entre 0 e 1");
  });

  it("produz UTF-8 sem BOM", () => {
    expect([...bytesCanonicos("á")]).toEqual([0x22, 0xc3, 0xa1, 0x22]);
  });

  it("omite somente o resumo superior da saída", () => {
    expect(
      saidaSemResumoSaida({
        resumoSaida: "anterior",
        payload: { resumoSaida: "interno", valor: 1 },
      }),
    ).toEqual({ payload: { resumoSaida: "interno", valor: 1 } });
  });
});

describe("canonização contextual", () => {
  it("ignora a ordem de coleções-set", () => {
    const a = criarDominioValido();
    const b = criarDominioValido();
    b.entidades = embaralhar(b.entidades);
    b.predicados = embaralhar(b.predicados);
    b.relacoes = embaralhar(b.relacoes);
    b.entidades.forEach((entidade) => {
      entidade.capacidades = embaralhar(entidade.capacidades);
    });
    expect(jsonCanonico(dominioCanonico(a))).toBe(jsonCanonico(dominioCanonico(b)));
  });

  it("canoniza argumentos simétricos e preserva os não simétricos", () => {
    const original = criarDominioValido();
    const alterado = criarDominioValido();
    alterado.relacoes.find((relacao) => relacao.id === "r2")!.args.reverse();
    expect(jsonCanonico(dominioCanonico(alterado))).toBe(jsonCanonico(dominioCanonico(original)));

    alterado.relacoes.find((relacao) => relacao.id === "r1")!.args.reverse();
    expect(jsonCanonico(dominioCanonico(alterado))).not.toBe(jsonCanonico(dominioCanonico(original)));
  });

  it("ordena correspondências por fonte e alvo", () => {
    expect(
      correspondenciasCanonicas([
        { fonte: "z", alvo: "b", peso: 1 },
        { fonte: "a", alvo: "c", peso: 1 },
      ]),
    ).toEqual([
      { fonte: "a", alvo: "c", peso: 1 },
      { fonte: "z", alvo: "b", peso: 1 },
    ]);
  });
});

describe("propriedades do comparador e do JSON canônico", () => {
  it("o comparador é antissimétrico e transitivo", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
        const ab = Math.sign(compararPontosDeCodigo(a, b));
        const ba = Math.sign(compararPontosDeCodigo(b, a));
        if (ab === 0) expect(ba).toBe(0);
        else expect(ab).toBe(-ba);
        if (compararPontosDeCodigo(a, b) <= 0 && compararPontosDeCodigo(b, c) <= 0) {
          expect(compararPontosDeCodigo(a, c)).toBeLessThanOrEqual(0);
        }
      }),
      { seed: 20261105, numRuns: 50 },
    );
  });

  it("a ordem de inserção das chaves não altera os bytes", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.string(), { maxLength: 20 }), (chaves) => {
        const direto = Object.fromEntries(chaves.map((chave, indice) => [chave, indice]));
        const inverso = Object.fromEntries(
          [...chaves].reverse().map((chave) => [chave, chaves.indexOf(chave)]),
        );
        expect(bytesCanonicos(direto)).toEqual(bytesCanonicos(inverso));
      }),
      { seed: 20261105, numRuns: 50 },
    );
  });
});
