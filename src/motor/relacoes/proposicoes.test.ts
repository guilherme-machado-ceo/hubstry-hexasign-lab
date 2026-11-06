import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CONFIG_TESTE, LIMITES_TESTE } from "../__tests__/fixtures";
import { chavePapel, separarChavePapel } from "../correspondencia";
import { validarDominio, type Dominio, type Mapeamento } from "../esquema";
import { criarContextoAvaliacao, type ContextoAvaliacao } from "./contexto";
import { avaliarRho2, detectarIsomorfismo, resolverImagensRelacoes } from "./rho2-homologia";
import { avaliarRho3 } from "./rho3-equivalencia";

/**
 * Proposições 1 e 2 da teoria v2 (§4) verificadas como propriedades sobre
 * domínios aleatórios e isomorfismos gerados por renomeação (ADR-016).
 */

const PREDICADOS: Dominio["predicados"] = [
  { nome: "liga", aridade: 2, classe: "comum", simetrico: false },
  { nome: "marca", aridade: 1, classe: "comum", simetrico: false },
  { nome: "opoe", aridade: 2, classe: "oposicao", simetrico: true },
  { nome: "combina", aridade: 2, classe: "emergencia", simetrico: true, capacidadesExigidas: ["x", "y"] },
  { nome: "causa", aridade: 2, classe: "comum", simetrico: false },
];

interface Semente {
  n: number;
  basicas: Array<[predicado: number, a: number, b: number]>;
  superiores: Array<[a: number, b: number]>;
  capacidades: boolean[][];
}

const sementeArb: fc.Arbitrary<Semente> = fc
  .integer({ min: 2, max: 5 })
  .chain((n) =>
    fc.record({
      n: fc.constant(n),
      basicas: fc.array(
        fc.tuple(fc.integer({ min: 0, max: 3 }), fc.nat({ max: n - 1 }), fc.nat({ max: n - 1 })),
        { minLength: 1, maxLength: 6 },
      ),
      superiores: fc.array(fc.tuple(fc.nat({ max: 5 }), fc.nat({ max: 5 })), { maxLength: 2 }),
      capacidades: fc.array(fc.tuple(fc.boolean(), fc.boolean()).map(([x, y]) => [x, y]), {
        minLength: n,
        maxLength: n,
      }),
    }),
  );

/** Constrói o domínio; descarta repetições e auto-relações, que o esquema rejeita. */
function construir(semente: Semente, nome: (i: number) => string, id: string): Dominio {
  const nomes = ["liga", "marca", "opoe", "combina"];
  const vistas = new Set<string>();
  const relacoes: Dominio["relacoes"] = [];
  semente.basicas.forEach(([p, a, b]) => {
    const predicado = nomes[p];
    const args = predicado === "marca" ? [a] : [a, b];
    if (args.length === 2 && a === b) return;
    const ordem = predicado === "opoe" || predicado === "combina" ? [...args].sort() : args;
    const chave = JSON.stringify([predicado, ordem]);
    if (vistas.has(chave)) return;
    vistas.add(chave);
    relacoes.push({
      id: `r${relacoes.length}`,
      predicado,
      args: args.map((i) => ({ tipo: "entidade" as const, id: nome(i) })),
    });
  });
  const basicas = relacoes.length;
  semente.superiores.forEach(([a, b], i) => {
    if (a >= basicas || b >= basicas || a === b) return;
    relacoes.push({
      id: `s${i}`,
      predicado: "causa",
      args: [
        { tipo: "relacao", id: `r${a}` },
        { tipo: "relacao", id: `r${b}` },
      ],
    });
  });
  return {
    id,
    esquemaAtributos: {},
    entidades: Array.from({ length: semente.n }, (_, i) => ({
      id: nome(i),
      atributos: {},
      capacidades: (["x", "y"] as const).filter((_, k) => semente.capacidades[i][k]),
    })),
    predicados: PREDICADOS,
    relacoes,
  };
}

function papeisLocaisIguais(entidade: string, imagem: string, contexto: ContextoAvaliacao): boolean {
  const fonte = contexto.indicesFonte.papeisPorEntidade.get(entidade) ?? new Set<string>();
  const alvo = contexto.indicesAlvo.papeisPorEntidade.get(imagem) ?? new Set<string>();
  if (fonte.size !== alvo.size) return false;
  for (const papel of fonte) {
    const { predicado, posicao } = separarChavePapel(papel);
    const correspondente = contexto.correspondencia.fonteParaAlvo.get(predicado);
    if (!correspondente || !alvo.has(chavePapel(correspondente, posicao))) return false;
  }
  return true;
}

function jaccardLocal(entidade: string, imagem: string, contexto: ContextoAvaliacao): number {
  const fonte = contexto.indicesFonte.papeisPorEntidade.get(entidade) ?? new Set<string>();
  const alvo = contexto.indicesAlvo.papeisPorEntidade.get(imagem) ?? new Set<string>();
  let intersecao = 0;
  for (const papel of fonte) {
    const { predicado, posicao } = separarChavePapel(papel);
    const correspondente = contexto.correspondencia.fonteParaAlvo.get(predicado);
    if (correspondente && alvo.has(chavePapel(correspondente, posicao))) intersecao += 1;
  }
  const uniao = fonte.size + alvo.size - intersecao;
  return uniao === 0 ? 1 : intersecao / uniao;
}

function inverterArgumentosSimetricos(dominio: Dominio): Dominio {
  const simetricos = new Set(
    dominio.predicados.filter((predicado) => predicado.simetrico).map((predicado) => predicado.nome),
  );
  return {
    ...dominio,
    relacoes: dominio.relacoes.map((relacao) =>
      simetricos.has(relacao.predicado) ? { ...relacao, args: [...relacao.args].reverse() } : relacao,
    ),
  };
}

/** Fonte e alvo isomorfos: o alvo é a fonte renomeada por uma permutação. */
const isomorfosArb = sementeArb.chain((semente) =>
  fc
    .shuffledSubarray(
      Array.from({ length: semente.n }, (_, i) => i),
      { minLength: semente.n, maxLength: semente.n },
    )
    .map((permutacao) => {
      const fonte = construir(semente, (i) => `f${i}`, "fonte");
      const alvo = construir(semente, (i) => `t${permutacao[i]}`, "alvo");
      alvo.relacoes = [...alvo.relacoes].reverse();
      const mapeamento: Mapeamento = {
        pares: Array.from({ length: semente.n }, (_, i) => [`f${i}`, `t${permutacao[i]}`] as const),
      };
      return { semente, fonte, alvo, mapeamento };
    }),
);

function validos(fonte: Dominio, alvo: Dominio): boolean {
  return validarDominio(fonte, LIMITES_TESTE).ok && validarDominio(alvo, LIMITES_TESTE).ok;
}

describe("proposições da teoria v2 como propriedades", () => {
  it("Proposição 1: sob isomorfismo, o Jaccard local de papéis vale 1 em cada entidade", () => {
    fc.assert(
      fc.property(isomorfosArb, ({ fonte, alvo, mapeamento }) => {
        fc.pre(validos(fonte, alvo));
        const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
        expect(detectarIsomorfismo(fonte, alvo, mapeamento, contexto)).toBe(true);
        for (const [s, t] of mapeamento.pares) {
          expect(papeisLocaisIguais(s, t, contexto)).toBe(true);
        }
        expect(avaliarRho3(fonte, alvo, mapeamento, contexto)).toBe(1);
      }),
      { seed: 20261106, numRuns: 150 },
    );
  });

  it("ρ₃ é invariante sob renomeação e inversão de argumentos simétricos", () => {
    fc.assert(
      fc.property(isomorfosArb, ({ fonte, alvo, mapeamento }) => {
        const alvoInvertido = inverterArgumentosSimetricos(alvo);
        fc.pre(validos(fonte, alvoInvertido));
        const contexto = criarContextoAvaliacao(fonte, alvoInvertido, CONFIG_TESTE);
        for (const [s, t] of mapeamento.pares) {
          expect(jaccardLocal(s, t, contexto)).toBe(1);
        }
        expect(avaliarRho3(fonte, alvoInvertido, mapeamento, contexto)).toBe(1);
      }),
      { seed: 20261106, numRuns: 150 },
    );
  });

  it("atribui papel canônico a predicado simétrico com argumentos invertidos", () => {
    const fonte: Dominio = {
      id: "S",
      esquemaAtributos: {},
      entidades: [
        { id: "a", atributos: {}, capacidades: [] },
        { id: "b", atributos: {}, capacidades: [] },
      ],
      predicados: [{ nome: "conecta", aridade: 2, classe: "comum", simetrico: true }],
      relacoes: [
        {
          id: "r",
          predicado: "conecta",
          args: [
            { tipo: "entidade", id: "a" },
            { tipo: "entidade", id: "b" },
          ],
        },
      ],
    };
    const alvo: Dominio = {
      ...fonte,
      id: "T",
      entidades: [
        { id: "x", atributos: {}, capacidades: [] },
        { id: "y", atributos: {}, capacidades: [] },
      ],
      relacoes: [
        {
          id: "r",
          predicado: "conecta",
          args: [
            { tipo: "entidade", id: "y" },
            { tipo: "entidade", id: "x" },
          ],
        },
      ],
    };
    const mapeamento: Mapeamento = { pares: [["a", "x"], ["b", "y"]] };
    expect(validos(fonte, alvo)).toBe(true);
    const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
    expect(jaccardLocal("a", "x", contexto)).toBe(1);
    expect(avaliarRho3(fonte, alvo, mapeamento, contexto)).toBe(1);
  });
  it("Proposição 2: ρ₂ = 1 preserva as classes oposição e emergência, mas não a complementaridade", () => {
    fc.assert(
      fc.property(
        isomorfosArb,
        fc.array(fc.tuple(fc.boolean(), fc.boolean()), { minLength: 5, maxLength: 5 }),
        ({ semente, fonte, alvo, mapeamento }, novasCapacidades) => {
          // Capacidades do alvo trocadas ao acaso: a estrutura continua igual.
          alvo.entidades = alvo.entidades.map((e, i) => ({
            ...e,
            capacidades: (["x", "y"] as const).filter((_, k) => novasCapacidades[i % semente.n][k]),
          }));
          fc.pre(validos(fonte, alvo));
          const contexto = criarContextoAvaliacao(fonte, alvo, CONFIG_TESTE);
          if (avaliarRho2(fonte, alvo, mapeamento, contexto) !== 1) return;
          const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
          for (const relacao of fonte.relacoes) {
            const classe = contexto.indicesFonte.predicadosPorNome.get(relacao.predicado)!.classe;
            if (classe === "comum") continue;
            const imagem = imagens.get(relacao.id);
            expect(imagem).toBeDefined();
            expect(contexto.indicesAlvo.predicadosPorNome.get(imagem!.predicado)!.classe).toBe(classe);
          }
        },
      ),
      { seed: 20261106, numRuns: 150 },
    );
  });
});
