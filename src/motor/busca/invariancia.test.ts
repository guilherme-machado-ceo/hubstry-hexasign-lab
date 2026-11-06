import { readFileSync } from "node:fs";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { validarConfiguracao, validarCorrespondencias, validarDominio } from "../esquema";
import type { ConfiguracaoMotor, Dominio } from "../esquema";
import { criarContextoAvaliacao } from "../relacoes";
import { buscaGulosa } from "./gulosa";
import { listarHipotesesLocais } from "./hipoteses";
import { formarNucleos } from "./nucleos";
import { compararCandidatos } from "./ranking";

/**
 * Invariância da busca a nomes e à ordem dos argumentos simétricos (ADR-016).
 * O caso-base é o caso congelado h1-b-glm (fluxo de água × fluxo de calor),
 * em que o predicado "conecta" é simétrico.
 */
const config = (() => {
  const r = validarConfiguracao(JSON.parse(readFileSync("config/modalidades.v1.json", "utf8")));
  if (!r.ok) throw new Error("config inválida");
  return r.valor as ConfiguracaoMotor;
})();
const casoBase = JSON.parse(readFileSync("validacao/casos-classicos/h1-b-glm.json", "utf8"));

function melhorMapeamento(caso: { fonte: unknown; alvo: unknown }): Array<[string, string]> {
  const f = validarDominio(caso.fonte, config.limites);
  const a = validarDominio(caso.alvo, config.limites);
  if (!f.ok || !a.ok) throw new Error("domínio inválido");
  const corr = validarCorrespondencias([], f.valor, a.valor);
  if (!corr.ok) throw new Error("correspondências inválidas");
  const contexto = criarContextoAvaliacao(f.valor, a.valor, config, corr.valor);
  const nucleos = formarNucleos(listarHipotesesLocais(f.valor, a.valor, "homologica", contexto), contexto);
  const [melhor] = [...buscaGulosa(f.valor, a.valor, "homologica", nucleos, contexto)].sort((x, y) =>
    compararCandidatos(x, y, "homologica"),
  );
  return melhor.mapeamento.pares.map(([x, y]) => [x, y]);
}

function renomearEntidades(dominio: Dominio, nomes: Map<string, string>): Dominio {
  const n = (id: string) => nomes.get(id) ?? id;
  return {
    ...dominio,
    entidades: dominio.entidades.map((e) => ({ ...e, id: n(e.id) })),
    relacoes: dominio.relacoes.map((r) => ({
      ...r,
      args: r.args.map((arg) => (arg.tipo === "entidade" ? { ...arg, id: n(arg.id) } : arg)),
    })),
  };
}

function inverterSimetricos(dominio: Dominio): Dominio {
  const simetricos = new Set(dominio.predicados.filter((p) => p.simetrico).map((p) => p.nome));
  return {
    ...dominio,
    relacoes: dominio.relacoes.map((r) => (simetricos.has(r.predicado) ? { ...r, args: [...r.args].reverse() } : r)),
  };
}

const esperadoBase = melhorMapeamento(casoBase);

describe("invariância da busca (ADR-016)", () => {
  it("o caso-base mapeia cano → barra", () => {
    expect(esperadoBase).toContainEqual(["cano", "barra"]);
  });

  it("renomear barra → xbarra no alvo não muda a analogia escolhida", () => {
    const alvo = renomearEntidades(casoBase.alvo, new Map([["barra", "xbarra"]]));
    expect(melhorMapeamento({ fonte: casoBase.fonte, alvo })).toContainEqual(["cano", "xbarra"]);
  });

  it("inverter os argumentos de relações simétricas não muda a analogia escolhida", () => {
    const caso = { fonte: inverterSimetricos(casoBase.fonte), alvo: inverterSimetricos(casoBase.alvo) };
    expect(melhorMapeamento(caso)).toEqual(esperadoBase);
  });

  it("propriedade: renomeações injetivas do alvo e inversões simétricas preservam o mapeamento", () => {
    const ids: string[] = casoBase.alvo.entidades.map((e: { id: string }) => e.id);
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z]{1,6}$/), { minLength: ids.length, maxLength: ids.length }),
        fc.boolean(),
        fc.boolean(),
        (prefixos, inverterFonte, inverterAlvo) => {
          // Prefixo distinto por posição garante renomeação injetiva.
          const nomes = new Map(ids.map((id, i) => [id, `${prefixos[i]}${i}-${id}`]));
          let alvo = renomearEntidades(casoBase.alvo, nomes);
          if (inverterAlvo) alvo = inverterSimetricos(alvo);
          const fonte = inverterFonte ? inverterSimetricos(casoBase.fonte) : casoBase.fonte;
          const obtido = melhorMapeamento({ fonte, alvo });
          const esperado = esperadoBase.map(([x, y]) => [x, nomes.get(y)!]);
          expect([...obtido].sort((a, b) => (a[0] < b[0] ? -1 : 1))).toEqual(esperado);
        },
      ),
      { numRuns: 40, seed: 20261106 },
    );
  });
});
