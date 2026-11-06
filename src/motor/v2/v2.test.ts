import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { sha256Hex } from "../../adaptadores/sha256-node";
import { CONFIG_TESTE, criarDominioValido, LIMITES_TESTE } from "../__tests__/fixtures";
import { validarConfiguracaoV2, type ConfiguracaoMotorV2 } from "./esquema";
import { inferirRelacoesV2 } from "./inferencia";
import { calcularHomologiaV2 } from "./homologia";
import { inferirV2, mapearV2 } from "./operacoes";
import { avaliarRho3V2, avaliarRho4V2, avaliarRho5V2 } from "./relacoes";
import { criarContextoAvaliacao } from "../relacoes";
import type { Dominio, Mapeamento } from "../esquema";

const CONFIG_V2: ConfiguracaoMotorV2 = {
  ...CONFIG_TESTE,
  versao: "2.0.0",
  homologica: { exige: { sigma: 0.6 }, ordemMinima: 2, ordem: ["sistematicidade", "rho1", "chaveCanonica"] },
  thetaS: { valor: 0.6, calibrado: false },
  gentner: { rho1Alto: 0.6, sigmaAlto: 0.6 },
};
const MAPA_TOTAL: Mapeamento = { pares: [["a", "a"], ["b", "b"]] };

function contexto(fonte: Dominio, alvo: Dominio) {
  return criarContextoAvaliacao(fonte, alvo, { ...CONFIG_TESTE, homologica: { exige: { rho2: 0 }, ordem: ["sistematicidade", "rho1", "chaveCanonica"] } });
}
function valido<T>(resultado: { ok: true; valor: T } | { ok: false; erros: unknown }): T {
  if (!resultado.ok) throw new Error(JSON.stringify(resultado.erros));
  return resultado.valor;
}

async function fixture(nome: string): Promise<{ fonte: Dominio; alvo: Dominio; mapeamentoEsperado: string[][]; correspondencias: [] }> {
  return JSON.parse(await readFile(`src/motor/v2/__tests__/fixtures/${nome}.json`, "utf8")) as {
    fonte: Dominio; alvo: Dominio; mapeamentoEsperado: string[][]; correspondencias: [];
  };
}

describe("configuração e métricas v2", () => {
  it("valida a configuração v2 pré-registrada e exige θ_s não calibrado", async () => {
    const arquivo = JSON.parse(await readFile("config/modalidades.v2.json", "utf8")) as unknown;
    expect(validarConfiguracaoV2(arquivo)).toEqual({ ok: true, valor: CONFIG_V2 });
    const invalida = structuredClone(CONFIG_V2) as unknown as { thetaS: { calibrado: boolean } };
    invalida.thetaS.calibrado = true;
    expect(validarConfiguracaoV2(invalida).ok).toBe(false);
  });

  it("ρ3 v2 exclui entidade-fonte sem papel e fica indefinido sem papéis", () => {
    const fonte = criarDominioValido();
    fonte.entidades.push({ id: "isolada", atributos: {}, capacidades: [] });
    const alvo = criarDominioValido();
    alvo.entidades.push({ id: "isolada", atributos: {}, capacidades: [] });
    expect(avaliarRho3V2(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toBe(1);
    const vazio: Dominio = { id: "vazio", esquemaAtributos: {}, entidades: [{ id: "e", atributos: {}, capacidades: [] }], predicados: [], relacoes: [] };
    expect(avaliarRho3V2(vazio, vazio, { pares: [["e", "e"]] }, contexto(vazio, vazio))).toBeNull();
  });

  it("ρ4 v2 informa componentes e usa escala quando ela é avaliável", () => {
    const fonte: Dominio = {
      id: "f", esquemaAtributos: { escala: { tipo: "numerico", unidade: "u", grupo: "escala" }, ordem: { tipo: "numerico", unidade: "u", grupo: "monotono" } },
      entidades: [1, 2, 3].map((n) => ({ id: String(n), atributos: { escala: n, ordem: n }, capacidades: [] })), predicados: [], relacoes: [],
    };
    const alvo = structuredClone(fonte);
    alvo.id = "a";
    alvo.entidades.forEach((entidade, i) => { entidade.atributos.escala = (i + 1) * 2; entidade.atributos.ordem = 3 - i; });
    const resultado = avaliarRho4V2(fonte, alvo, { pares: [["1", "1"], ["2", "2"], ["3", "3"]] }, contexto(fonte, alvo));
    expect(resultado).toEqual({ escala: 1, monotono: 0, total: 1 });
  });

  it("ρ5 v2 não preserva potencial por oposição e expõe componentes", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    delete alvo.esquemaAtributos.potencial;
    alvo.entidades.forEach((entidade) => delete entidade.atributos.potencial);
    expect(avaliarRho5V2(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo))).toEqual({ potencial: 0, oposicao: 1, total: 0.5 });
  });
});

describe("inferências e homologia v2", () => {
  it("classifica as cópias internas H1 com G, Desc, π, σ e ι", async () => {
    const caso = await fixture("h1-a-claude");
    const mapeamento = { pares: caso.mapeamentoEsperado.map(([fonte, alvo]) => [fonte, alvo] as const) };
    const ctx = contexto(caso.fonte, caso.alvo);
    const inferencias = inferirRelacoesV2(caso.fonte, caso.alvo, mapeamento, ctx);
    const homologia = calcularHomologiaV2(caso.fonte, mapeamento, ctx, inferencias, 2);
    expect(inferencias.G).toEqual(["atrai-sol-planeta", "massivo-sol-planeta", "orbita-planeta-sol"]);
    expect(inferencias.inferencias.find((item) => item.relacaoFonte === "quente-sol-planeta")).toMatchObject({ classe: "SUPERFICIE", exploratoria: true });
    expect(inferencias.inferencias.find((item) => item.relacaoFonte === "e-massa-atracao")).toMatchObject({ classe: "SISTEMATICA_ANCESTRAL" });
    expect(inferencias.inferencias.find((item) => item.relacaoFonte === "causa-orbita")).toMatchObject({ classe: "SISTEMATICA_ANCESTRAL" });
    expect(inferencias.inferencias.find((item) => item.relacaoFonte === "gravitacao-sol-planeta")).toMatchObject({ classe: "SISTEMATICA_COLATERAL" });
    expect(homologia).toMatchObject({ pi: 0.375, sigma: 0.875, iota: 0.5, temOrdemMinima: true });
  });

  it("mantém superfície exploratória, reconhece sistemática colateral e separa rejeitada", async () => {
    const caso = await fixture("h1-b-glm");
    const mapeamento = { pares: caso.mapeamentoEsperado.map(([fonte, alvo]) => [fonte, alvo] as const) };
    const resultado = inferirRelacoesV2(caso.fonte, caso.alvo, mapeamento, contexto(caso.fonte, caso.alvo));
    expect(resultado.inferencias.find((item) => item.relacaoFonte === "r-pressao-a")).toMatchObject({ classe: "SUPERFICIE", exploratoria: true });
    expect(resultado.inferencias.find((item) => item.relacaoFonte === "r-pressao-b")).toMatchObject({ classe: "SUPERFICIE", exploratoria: true });
    expect(resultado.inferencias.find((item) => item.relacaoFonte === "r-causa")).toMatchObject({ classe: "SISTEMATICA_ANCESTRAL", exploratoria: false });

    const colateralFonte = criarDominioValido();
    colateralFonte.predicados.push(
      { nome: "filha", aridade: 1, classe: "comum", simetrico: false },
      { nome: "lateral", aridade: 2, classe: "comum", simetrico: false },
    );
    colateralFonte.relacoes.push(
      { id: "r5", predicado: "filha", args: [{ tipo: "entidade", id: "a" }] },
      { id: "r6", predicado: "lateral", args: [{ tipo: "relacao", id: "r5" }, { tipo: "entidade", id: "a" }] },
      { id: "r7", predicado: "causa", args: [{ tipo: "relacao", id: "r1" }, { tipo: "relacao", id: "r6" }] },
    );
    const colateral = inferirRelacoesV2(colateralFonte, criarDominioValido(), MAPA_TOTAL, contexto(colateralFonte, criarDominioValido()));
    expect(colateral.inferencias.find((item) => item.relacaoFonte === "r6")).toMatchObject({ classe: "SISTEMATICA_COLATERAL", exploratoria: false });

    const fonte = criarDominioValido();
    fonte.predicados.push({ nome: "novo", aridade: 2, classe: "comum", simetrico: false });
    fonte.relacoes.push({ id: "r5", predicado: "novo", args: [{ tipo: "entidade", id: "a" }, { tipo: "entidade", id: "b" }] });
    const alvo = criarDominioValido();
    alvo.predicados.push({ nome: "novo", aridade: 1, classe: "comum", simetrico: false });
    const rejeitada = inferirRelacoesV2(fonte, alvo, MAPA_TOTAL, contexto(fonte, alvo));
    expect(rejeitada.rejeitadas[0]).toMatchObject({ classe: "REJEITADA", exploratoria: false, relacaoFonte: "r5" });
  });

  it("aplica o filtro homológico v2 por σ e relação de ordem mínima", async () => {
    const caso = await fixture("h1-a-claude");
    const resultado = await mapearV2({ fonte: caso.fonte, alvo: caso.alvo, modalidade: "homologica", config: CONFIG_V2, estrategia: "exata" }, sha256Hex);
    expect(resultado.versaoMotor).toBe("0.3.0");
    expect(resultado.versaoConfig).toBe("2.0.0");
    expect(resultado.versoesRelacoes.sigma).toBe("sigma-v2-sustentacao");
    expect(resultado.mapeamentos[0].homologia.sigma).toBeGreaterThanOrEqual(CONFIG_V2.homologica.exige.sigma);
    expect(resultado.mapeamentos[0].homologia.temOrdemMinima).toBe(true);
  });

  it("expõe inferir-v2 sem acrescentar campos à rota v1", async () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.relacoes = alvo.relacoes.filter((relacao) => relacao.id !== "r4");
    const resultado = await inferirV2({ fonte, alvo, mapeamento: MAPA_TOTAL, config: CONFIG_V2 }, sha256Hex);
    expect(resultado.inferencias[0]).toMatchObject({ classe: "SISTEMATICA_ANCESTRAL", exploratoria: false });
    expect(resultado.homologia.ICsistematicas).toEqual(["r4"]);
  });
});
