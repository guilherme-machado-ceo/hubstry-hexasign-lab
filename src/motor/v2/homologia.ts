import { compararPontosDeCodigo, quantizar12 } from "../canonico";
import type { Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "../relacoes";
import type { ResultadoInferenciasV2 } from "./inferencia";

export interface HomologiaV2 {
  pi: number | null;
  sigma: number | null;
  iota: number | null;
  G: string[];
  ICsistematicas: string[];
  temOrdemMinima: boolean;
}

export function calcularHomologiaV2(
  fonte: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
  inferencias: ResultadoInferenciasV2,
  ordemMinima: number,
): HomologiaV2 {
  // Mapeamento é recebido para documentar a dependência da avaliação e manter
  // uma assinatura paralela aos avaliadores de relação; G já foi calculado na
  // mesma projeção que classificou as inferências.
  void mapeamento;
  if (fonte.relacoes.length === 0) {
    return { pi: null, sigma: null, iota: null, G: [], ICsistematicas: [], temOrdemMinima: false };
  }
  const G = new Set(inferencias.G);
  const IC = new Set(
    inferencias.inferencias
      .filter((inferencia) => inferencia.classe === "SISTEMATICA_ANCESTRAL" || inferencia.classe === "SISTEMATICA_COLATERAL")
      .map((inferencia) => inferencia.relacaoFonte)
      .filter((id) => !G.has(id)),
  );
  const todos = new Set([...G, ...IC]);
  const temOrdemMinima = [...todos].some(
    (id) => (contexto.indicesFonte.profundidadePorRelacao.get(id) ?? 0) + 1 >= ordemMinima,
  );
  const pi = quantizar12(G.size / fonte.relacoes.length);
  const sigma = quantizar12((G.size + IC.size) / fonte.relacoes.length);
  return {
    pi,
    sigma,
    iota: quantizar12(sigma - pi),
    G: [...G].sort(compararPontosDeCodigo),
    ICsistematicas: [...IC].sort(compararPontosDeCodigo),
    temOrdemMinima,
  };
}
