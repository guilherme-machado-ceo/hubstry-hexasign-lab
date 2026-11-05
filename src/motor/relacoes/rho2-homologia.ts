import { quantizar12 } from "../canonico";
import { criarIndicesDominio } from "../correspondencia";
import type { Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { mapaEntidades } from "./contexto";
import { inverterCorrespondencia, resolverImagensRelacoesCom } from "./imagem";

export const VERSAO_DEFINICAO_RHO2 = "rho2-v1";

export function resolverImagensRelacoes(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
) {
  return resolverImagensRelacoesCom(
    fonte,
    alvo,
    mapeamento,
    contexto.correspondencia,
    contexto.indicesFonte,
    contexto.indicesAlvo,
  );
}

export function avaliarRho2(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  if (fonte.relacoes.length === 0) return null;
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto);
  return quantizar12(imagens.porRelacaoFonte.size / fonte.relacoes.length);
}

export function detectarIsomorfismo(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): boolean {
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  if (
    mapa.size !== fonte.entidades.length ||
    mapa.size !== alvo.entidades.length ||
    new Set(mapa.values()).size !== alvo.entidades.length
  ) {
    return false;
  }

  const ida = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto);
  if (ida.porRelacaoFonte.size !== fonte.relacoes.length) return false;

  const inverso: Mapeamento = {
    pares: [...mapa.entries()].map(([idFonte, idAlvo]) => [idAlvo, idFonte] as const),
  };
  const volta = resolverImagensRelacoesCom(
    alvo,
    fonte,
    inverso,
    inverterCorrespondencia(contexto.correspondencia),
    contexto.indicesAlvo,
    contexto.indicesFonte,
  );
  return volta.porRelacaoFonte.size === alvo.relacoes.length;
}

export function preservaTodasRelacoes(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): boolean {
  if (contexto.indicesFonte.relacoesPorId.size !== fonte.relacoes.length) {
    throw new TypeError("índices da fonte incompatíveis");
  }
  if (contexto.indicesAlvo.relacoesPorId.size !== alvo.relacoes.length) {
    throw new TypeError("índices do alvo incompatíveis");
  }
  return resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte.size === fonte.relacoes.length;
}

export function indicesParaIsomorfismo(dominio: Dominio) {
  return criarIndicesDominio(dominio);
}
