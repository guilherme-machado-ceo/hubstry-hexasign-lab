import { quantizar12 } from "../canonico";
import type { Dominio, Entidade, Mapeamento, Relacao } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { resolverImagensRelacoes } from "./rho2-homologia";

export const VERSAO_DEFINICAO_RHO6 = "rho6-v1-emergencia-v1";

function complementar(
  relacao: Relacao,
  dominio: Dominio,
  entidadesPorId: ReadonlyMap<string, Entidade>,
): boolean {
  const predicado = dominio.predicados.find((item) => item.nome === relacao.predicado);
  if (!predicado || predicado.classe !== "emergencia" || !predicado.capacidadesExigidas) {
    return false;
  }
  const conjuntos = relacao.args.map((arg) => {
    if (arg.tipo !== "entidade") return null;
    const entidade = entidadesPorId.get(arg.id);
    return entidade ? new Set(entidade.capacidades) : null;
  });
  if (conjuntos.some((conjunto) => conjunto === null)) return false;
  for (let i = 0; i < conjuntos.length; i += 1) {
    for (let j = i + 1; j < conjuntos.length; j += 1) {
      for (const capacidade of conjuntos[i]!) {
        if (conjuntos[j]!.has(capacidade)) return false;
      }
    }
  }
  const uniao = new Set(conjuntos.flatMap((conjunto) => [...conjunto!]));
  return predicado.capacidadesExigidas.every((capacidade) => uniao.has(capacidade));
}

export function avaliarRho6(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  const emergencias = fonte.relacoes.filter(
    (relacao) => contexto.indicesFonte.predicadosPorNome.get(relacao.predicado)?.classe === "emergencia",
  );
  if (emergencias.length === 0) return null;
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
  let preservadas = 0;
  for (const emergencia of emergencias) {
    const imagem = imagens.get(emergencia.id);
    if (
      imagem &&
      complementar(emergencia, fonte, contexto.indicesFonte.entidadesPorId) &&
      complementar(imagem, alvo, contexto.indicesAlvo.entidadesPorId)
    ) {
      preservadas += 1;
    }
  }
  return quantizar12(preservadas / emergencias.length);
}

export { complementar as argumentosSaoComplementares };
