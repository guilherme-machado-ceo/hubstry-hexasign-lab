import { compararPontosDeCodigo, chaveReferencia } from "./canonico";
import type { Dominio, Mapeamento, Referencia } from "./esquema";
import type { ContextoAvaliacao } from "./relacoes";
import { mapaEntidades, resolverImagensRelacoes } from "./relacoes";

export interface EntidadeHipotetica {
  id: string;
  origem: { dominio: string; entidade: string };
  hipotetica: true;
}

export interface Inferencia {
  relacaoFonte: string;
  idProjetado: string;
  predicado: string;
  argsAlvo: Referencia[];
  entidadesHipoteticas: EntidadeHipotetica[];
  suporte: Referencia[];
}

function componente(valor: string): string {
  return encodeURIComponent(valor);
}

export function idEntidadeHipotetica(dominioFonte: string, entidadeFonte: string): string {
  return `hip:${componente(dominioFonte)}:${componente(entidadeFonte)}`;
}

export function idRelacaoProjetada(dominioFonte: string, relacaoFonte: string): string {
  return `proj:${componente(dominioFonte)}:${componente(relacaoFonte)}`;
}

export function inferirRelacoes(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
): Inferencia[] {
  const entidades = mapaEntidades(fonte, alvo, mapeamento);
  const imagens = resolverImagensRelacoes(fonte, alvo, mapeamento, contexto).porRelacaoFonte;
  const projetadas = new Map<string, string>();
  const inferencias: Inferencia[] = [];

  for (const relacao of contexto.indicesFonte.ordemTopologica) {
    if (imagens.has(relacao.id)) continue;
    const predicadoAlvo = contexto.correspondencia.fonteParaAlvo.get(relacao.predicado);
    if (!predicadoAlvo) continue;

    const suporte = relacao.args.filter((arg) =>
      arg.tipo === "entidade" ? entidades.has(arg.id) : imagens.has(arg.id),
    );
    if (suporte.length === 0) continue;

    const entidadesHipoteticas = new Map<string, EntidadeHipotetica>();
    const argsAlvo: Referencia[] = [];
    let resolvida = true;
    for (const arg of relacao.args) {
      if (arg.tipo === "entidade") {
        const idAlvo = entidades.get(arg.id);
        if (idAlvo) {
          argsAlvo.push({ tipo: "entidade", id: idAlvo });
        } else {
          const id = idEntidadeHipotetica(fonte.id, arg.id);
          const hipotetica: EntidadeHipotetica = {
            id,
            origem: { dominio: fonte.id, entidade: arg.id },
            hipotetica: true,
          };
          entidadesHipoteticas.set(id, hipotetica);
          argsAlvo.push({ tipo: "entidade", id });
        }
      } else {
        const imagem = imagens.get(arg.id);
        const idProjetado = projetadas.get(arg.id);
        if (imagem) argsAlvo.push({ tipo: "relacao", id: imagem.id });
        else if (idProjetado) argsAlvo.push({ tipo: "relacao", id: idProjetado });
        else {
          resolvida = false;
          break;
        }
      }
    }
    if (!resolvida) continue;

    const predicado = contexto.indicesAlvo.predicadosPorNome.get(predicadoAlvo)!;
    if (predicado.simetrico) {
      argsAlvo.sort((a, b) => compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)));
    }
    const idProjetado = idRelacaoProjetada(fonte.id, relacao.id);
    projetadas.set(relacao.id, idProjetado);
    inferencias.push({
      relacaoFonte: relacao.id,
      idProjetado,
      predicado: predicadoAlvo,
      argsAlvo,
      entidadesHipoteticas: [...entidadesHipoteticas.values()].sort((a, b) =>
        compararPontosDeCodigo(a.id, b.id),
      ),
      suporte: [...suporte].sort((a, b) =>
        compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)),
      ),
    });
  }

  return inferencias;
}
