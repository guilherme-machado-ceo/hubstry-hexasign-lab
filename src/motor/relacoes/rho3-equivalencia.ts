import { compararPontosDeCodigo, quantizar12 } from "../canonico";
import { chavePapel, separarChavePapel } from "../correspondencia";
import type { Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { mapaEntidades } from "./contexto";

export const VERSAO_DEFINICAO_RHO3 = "rho3-v1";

export function avaliarRho3(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  if (fonte.entidades.length === 0) return null;
  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  let soma = 0;

  for (const entidade of [...fonte.entidades].sort((a, b) =>
    compararPontosDeCodigo(a.id, b.id),
  )) {
    const idAlvo = mapa.get(entidade.id);
    if (!idAlvo) continue;
    const papeisFonte = contexto.indicesFonte.papeisPorEntidade.get(entidade.id) ?? new Set();
    const papeisAlvo = contexto.indicesAlvo.papeisPorEntidade.get(idAlvo) ?? new Set();
    let intersecao = 0;
    for (const papel of papeisFonte) {
      const { predicado, posicao } = separarChavePapel(papel);
      const predicadoAlvo = contexto.correspondencia.fonteParaAlvo.get(predicado);
      if (predicadoAlvo && papeisAlvo.has(chavePapel(predicadoAlvo, posicao))) intersecao += 1;
    }
    const uniao = papeisFonte.size + papeisAlvo.size - intersecao;
    soma += uniao === 0 ? 1 : intersecao / uniao;
  }

  return quantizar12(soma / fonte.entidades.length);
}
