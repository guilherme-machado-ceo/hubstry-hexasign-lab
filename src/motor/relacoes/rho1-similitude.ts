import { compararPontosDeCodigo, quantizar12 } from "../canonico";
import type { DefinicaoAtributo, Dominio, Mapeamento } from "../esquema";
import type { ContextoAvaliacao } from "./contexto";
import { mapaEntidades } from "./contexto";

export const VERSAO_DEFINICAO_RHO1 = "rho1-v1";

function concordanciaNumerica(x: number, y: number): number {
  if (x === 0 && y === 0) return 1;
  if (x === 0 || y === 0 || Math.sign(x) !== Math.sign(y)) return 0;
  const menor = Math.min(Math.abs(x), Math.abs(y));
  const maior = Math.max(Math.abs(x), Math.abs(y));
  const proporcao = menor / maior;
  return (2 * proporcao) / (1 + proporcao);
}

function compativeis(a: DefinicaoAtributo | undefined, b: DefinicaoAtributo | undefined): boolean {
  if (!a || !b || a.tipo !== b.tipo) return false;
  return a.tipo === "categorico" || (b.tipo === "numerico" && a.unidade === b.unidade);
}

export function avaliarRho1(
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  _contexto: ContextoAvaliacao,
): number | null {
  const avaliaveis = fonte.entidades
    .filter((entidade) => Object.keys(entidade.atributos).length > 0)
    .sort((a, b) => compararPontosDeCodigo(a.id, b.id));
  if (avaliaveis.length === 0) return null;

  const mapa = mapaEntidades(fonte, alvo, mapeamento);
  const alvos = new Map(alvo.entidades.map((entidade) => [entidade.id, entidade]));
  let soma = 0;
  for (const entidadeFonte of avaliaveis) {
    const idAlvo = mapa.get(entidadeFonte.id);
    if (!idAlvo) continue;
    const entidadeAlvo = alvos.get(idAlvo)!;
    const nomes = [...new Set([
      ...Object.keys(entidadeFonte.atributos),
      ...Object.keys(entidadeAlvo.atributos),
    ])].sort(compararPontosDeCodigo);
    let concordancias = 0;
    for (const nome of nomes) {
      const valorFonte = entidadeFonte.atributos[nome];
      const valorAlvo = entidadeAlvo.atributos[nome];
      const definicaoFonte = fonte.esquemaAtributos[nome];
      const definicaoAlvo = alvo.esquemaAtributos[nome];
      if (valorFonte === undefined || valorAlvo === undefined) continue;
      if (!compativeis(definicaoFonte, definicaoAlvo)) continue;
      if (definicaoFonte.tipo === "categorico" && definicaoAlvo.tipo === "categorico") {
        concordancias += valorFonte === valorAlvo ? 1 : 0;
      } else if (typeof valorFonte === "number" && typeof valorAlvo === "number") {
        concordancias += concordanciaNumerica(valorFonte, valorAlvo);
      }
    }
    soma += concordancias / nomes.length;
  }
  return quantizar12(soma / avaliaveis.length);
}
