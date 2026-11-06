import { compararPontosDeCodigo } from "../canonico";
import type { Dominio, Mapeamento, Modalidade } from "../esquema";
import { avaliarRho1, avaliarRho3, type ContextoAvaliacao } from "../relacoes";
import { atendeModalidade, avaliarCandidato, compararCandidatos, primeiroCriterio } from "./ranking";
import type { CandidatoBusca, ResultadoBuscaExata } from "./tipos";

function limiteSuperior(
  fonte: Dominio,
  alvo: Dominio,
  modalidade: Modalidade,
  pares: ReadonlyArray<readonly [string, string]>,
  indiceDecidido: number,
  entidadesOrdenadas: readonly string[],
  contexto: ContextoAvaliacao,
): number {
  const mapeamento: Mapeamento = { pares };
  if (modalidade === "heuristica") {
    const denominador = fonte.entidades.filter(
      (entidade) => Object.keys(entidade.atributos).length > 0,
    ).length;
    if (denominador === 0) return Number.NEGATIVE_INFINITY;
    const atual = avaliarRho1(fonte, alvo, mapeamento, contexto) ?? 0;
    const restantes = entidadesOrdenadas
      .slice(indiceDecidido)
      .filter((id) => {
        const entidade = contexto.indicesFonte.entidadesPorId.get(id)!;
        return Object.keys(entidade.atributos).length > 0;
      }).length;
    return Math.min(1, atual + restantes / denominador);
  }
  if (modalidade === "funcional") {
    if (fonte.entidades.length === 0) return Number.NEGATIVE_INFINITY;
    const atual = avaliarRho3(fonte, alvo, mapeamento, contexto) ?? 0;
    const restantes = entidadesOrdenadas.length - indiceDecidido;
    return Math.min(1, atual + restantes / fonte.entidades.length);
  }
  return 1;
}

/** Margem da poda: só poda quando o limite superior fica claramente abaixo. */
export const MARGEM_PODA = 1e-12;

function inserirIncumbente(
  incumbentes: CandidatoBusca[],
  candidato: CandidatoBusca,
  modalidade: Modalidade,
): void {
  incumbentes.push(candidato);
  incumbentes.sort((a, b) => compararCandidatos(a, b, modalidade));
  if (incumbentes.length > 3) incumbentes.pop();
}

export function buscaExata(
  fonte: Dominio,
  alvo: Dominio,
  modalidade: Modalidade,
  contexto: ContextoAvaliacao,
): ResultadoBuscaExata {
  const limite = contexto.config.limites.entidadesBuscaExata;
  if (fonte.entidades.length > limite || alvo.entidades.length > limite) {
    throw new RangeError(`busca exata aceita no máximo ${limite} entidades por domínio`);
  }

  const fontes = fonte.entidades.map((entidade) => entidade.id).sort(compararPontosDeCodigo);
  const alvos = alvo.entidades.map((entidade) => entidade.id).sort(compararPontosDeCodigo);
  const usados = new Set<string>();
  const pares: Array<readonly [string, string]> = [];
  // Incumbentes são só candidatos elegíveis na modalidade (ADR-016); o melhor
  // rejeitado é guardado à parte, para o diagnóstico quando não há elegível.
  const incumbentes: CandidatoBusca[] = [];
  let melhorRejeitado: CandidatoBusca | null = null;
  const estatisticas = { visitados: 0, podados: 0, avaliados: 0 };

  const visitar = (indice: number): void => {
    estatisticas.visitados += 1;
    if (incumbentes.length === 3) {
      const superior = limiteSuperior(fonte, alvo, modalidade, pares, indice, fontes, contexto);
      const pior = primeiroCriterio(incumbentes[incumbentes.length - 1], modalidade);
      if (superior < pior - MARGEM_PODA) {
        estatisticas.podados += 1;
        return;
      }
    }
    if (indice === fontes.length) {
      estatisticas.avaliados += 1;
      const candidato = avaliarCandidato(fonte, alvo, { pares: [...pares] }, contexto);
      if (atendeModalidade(candidato, modalidade, contexto.config)) {
        inserirIncumbente(incumbentes, candidato, modalidade);
      } else if (!melhorRejeitado || compararCandidatos(candidato, melhorRejeitado, modalidade) < 0) {
        melhorRejeitado = candidato;
      }
      return;
    }

    const idFonte = fontes[indice];
    for (const idAlvo of alvos) {
      if (usados.has(idAlvo)) continue;
      usados.add(idAlvo);
      pares.push([idFonte, idAlvo]);
      visitar(indice + 1);
      pares.pop();
      usados.delete(idAlvo);
    }
    visitar(indice + 1);
  };

  visitar(0);
  const candidatos = incumbentes.length > 0 ? incumbentes : melhorRejeitado ? [melhorRejeitado] : [];
  return { candidatos, estatisticas };
}
