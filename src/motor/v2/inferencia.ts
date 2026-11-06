import { compararPontosDeCodigo } from "../canonico";
import type { Dominio, Mapeamento } from "../esquema";
import { inferirRelacoes, type ConflitoPredicadoInferencia, type Inferencia } from "../inferencia";
import type { ContextoAvaliacao } from "../relacoes";
import { resolverImagensRelacoes } from "../relacoes";

export type ClasseInferenciaV2 =
  | "SISTEMATICA_ANCESTRAL"
  | "SISTEMATICA_COLATERAL"
  | "SUPERFICIE"
  | "REJEITADA";

export interface InferenciaV2 extends Inferencia {
  classe: Exclude<ClasseInferenciaV2, "REJEITADA">;
  exploratoria: boolean;
  motivo: string;
}

export interface InferenciaRejeitadaV2 extends ConflitoPredicadoInferencia {
  classe: "REJEITADA";
  exploratoria: false;
  motivo: string;
}

export interface ResultadoInferenciasV2 {
  G: string[];
  Desc: string[];
  inferencias: InferenciaV2[];
  rejeitadas: InferenciaRejeitadaV2[];
}

/** Fecho de uma relação pelos seus argumentos relacionais, em direção às folhas. */
export function calcularDesc(
  contexto: ContextoAvaliacao,
  idRelacao: string,
  acumulado = new Set<string>(),
): Set<string> {
  const relacao = contexto.indicesFonte.relacoesPorId.get(idRelacao);
  if (!relacao) return acumulado;
  for (const argumento of relacao.args) {
    if (argumento.tipo !== "relacao" || acumulado.has(argumento.id)) continue;
    acumulado.add(argumento.id);
    calcularDesc(contexto, argumento.id, acumulado);
  }
  return acumulado;
}

function classificacaoEstrutural(
  contexto: ContextoAvaliacao,
  G: ReadonlySet<string>,
): { ancestrais: Set<string>; colaterais: Set<string> } {
  const ancestrais = new Set<string>();
  const descendentes = new Map<string, Set<string>>();
  for (const relacao of contexto.indicesFonte.ordemTopologica) {
    const desc = calcularDesc(contexto, relacao.id);
    descendentes.set(relacao.id, desc);
    if (!G.has(relacao.id) && [...desc].some((id) => G.has(id))) ancestrais.add(relacao.id);
  }
  const referenciadas = new Set<string>();
  for (const relacao of contexto.indicesFonte.ordemTopologica) {
    for (const argumento of relacao.args) if (argumento.tipo === "relacao") referenciadas.add(argumento.id);
  }
  const colaterais = new Set<string>();
  for (const raiz of ancestrais) {
    if (referenciadas.has(raiz)) continue;
    for (const descendente of descendentes.get(raiz) ?? []) {
      if (!G.has(descendente) && !ancestrais.has(descendente)) colaterais.add(descendente);
    }
  }
  return { ancestrais, colaterais };
}

export function inferirRelacoesV2(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): ResultadoInferenciasV2 {
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
  const G = new Set(imagens.keys());
  const { ancestrais, colaterais } = classificacaoEstrutural(contexto, G);
  const base = inferirRelacoes(fonte, alvo, mapeamento, contexto);
  const inferencias = base.inferencias.map((inferencia) => {
    if (ancestrais.has(inferencia.relacaoFonte)) {
      return { ...inferencia, classe: "SISTEMATICA_ANCESTRAL" as const, exploratoria: false, motivo: "relação ancestral de uma relação preservada" };
    }
    if (colaterais.has(inferencia.relacaoFonte)) {
      return { ...inferencia, classe: "SISTEMATICA_COLATERAL" as const, exploratoria: false, motivo: "relação em Desc(raiz ancestral), sem ser ancestral" };
    }
    return { ...inferencia, classe: "SUPERFICIE" as const, exploratoria: true, motivo: "relação fora da estrutura sistemática" };
  });
  const rejeitadas = base.conflitos.map((conflito) => ({
    ...conflito,
    classe: "REJEITADA" as const,
    exploratoria: false as const,
    motivo: "predicado homônimo incompatível no alvo",
  }));
  return {
    G: [...G].sort(compararPontosDeCodigo),
    Desc: [...new Set([...ancestrais, ...colaterais])].sort(compararPontosDeCodigo),
    inferencias,
    rejeitadas,
  };
}
