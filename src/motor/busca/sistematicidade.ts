import { quantizar12 } from "../canonico";
import type { Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "../relacoes";
import { resolverImagensRelacoes } from "../relacoes";

export function calcularSistematicidade(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): number | null {
  if (fonte.relacoes.length === 0) return null;
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
  let total = 0;
  let preservado = 0;
  contexto.indicesFonte.relacoesPorId.forEach((relacao, id) => {
    const peso = 1 + (contexto.indicesFonte.profundidadePorRelacao.get(id) ?? 0);
    total += peso;
    if (imagens.has(relacao.id)) preservado += peso;
  });
  return quantizar12(preservado / total);
}
