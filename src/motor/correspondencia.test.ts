import { describe, expect, it } from "vitest";
import {
  criarCorrespondenciaVocabulario,
  criarIndicesDominio,
  predicadosCorrespondem,
  separarChavePapel,
} from "./correspondencia";
import type { TabelaCorrespondencia } from "./esquema";
import { criarDominioValido } from "./__tests__/fixtures";

describe("correspondência de vocabulário", () => {
  it("corresponde automaticamente predicados compatíveis de mesmo nome", () => {
    const dominio = criarDominioValido();
    const contexto = criarCorrespondenciaVocabulario(dominio, dominio);
    expect(predicadosCorrespondem("liga", "liga", contexto)).toBe(true);
    expect(predicadosCorrespondem("liga", "opoe", contexto)).toBe(false);
  });

  it("usa tabela unitária para nomes diferentes", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    alvo.predicados.find((item) => item.nome === "liga")!.nome = "conecta";
    alvo.relacoes.find((item) => item.predicado === "liga")!.predicado = "conecta";
    const contexto = criarCorrespondenciaVocabulario(fonte, alvo, [
      { fonte: "liga", alvo: "conecta", peso: 1 },
    ]);
    expect(predicadosCorrespondem("liga", "conecta", contexto)).toBe(true);
  });

  it("reserva fontes e alvos explícitos antes das correspondências por nome", () => {
    const fonte = criarDominioValido();
    const alvo = criarDominioValido();
    fonte.predicados.push({ nome: "conecta", aridade: 2, classe: "comum", simetrico: false });
    alvo.predicados.push({ nome: "conecta", aridade: 2, classe: "comum", simetrico: false });
    const contexto = criarCorrespondenciaVocabulario(fonte, alvo, [
      { fonte: "liga", alvo: "conecta", peso: 1 },
    ]);
    expect(contexto.fonteParaAlvo.get("liga")).toBe("conecta");
    expect(contexto.fonteParaAlvo.has("conecta")).toBe(false);
  });

  it("impede que peso gradual alcance os índices", () => {
    const dominio = criarDominioValido();
    const invalida = [{ fonte: "liga", alvo: "liga", peso: 0.5 }] as unknown as TabelaCorrespondencia;
    expect(() => criarCorrespondenciaVocabulario(dominio, dominio, invalida)).toThrow(
      "somente correspondências com peso 1",
    );
  });
});

describe("índices do domínio", () => {
  it("indexa relações por predicado em ordem canônica", () => {
    const dominio = criarDominioValido();
    dominio.relacoes.reverse();
    const indices = criarIndicesDominio(dominio);
    expect(indices.relacoesPorPredicado.get("liga")?.map((item) => item.id)).toEqual(["r1"]);
    expect([...indices.relacoesPorId.keys()]).toEqual(["r1", "r2", "r3", "r4"]);
  });

  it("indexa papéis diretos e usa posição canônica em predicados simétricos", () => {
    const indices = criarIndicesDominio(criarDominioValido());
    const papeisA = [...(indices.papeisPorEntidade.get("a") ?? [])].map(separarChavePapel);
    expect(papeisA).toContainEqual({ predicado: "liga", posicao: 0 });
    expect(papeisA).toContainEqual({ predicado: "opoe", posicao: "*" });
    expect(papeisA).toContainEqual({ predicado: "combina", posicao: "*" });
    expect(papeisA.some((papel) => papel.predicado === "causa")).toBe(false);
  });

  it("ordena sub-relações antes das relações que as recebem", () => {
    const indices = criarIndicesDominio(criarDominioValido());
    const ordem = indices.ordemTopologica.map((item) => item.id);
    expect(ordem.indexOf("r1")).toBeLessThan(ordem.indexOf("r4"));
    expect(ordem.indexOf("r2")).toBeLessThan(ordem.indexOf("r4"));
    expect(indices.profundidadePorRelacao.get("r4")).toBe(1);
    expect(indices.relacoesNivelMaisAlto.map((item) => item.id)).toEqual(["r3", "r4"]);
  });
});
