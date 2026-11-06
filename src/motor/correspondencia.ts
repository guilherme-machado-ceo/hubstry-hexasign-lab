import { compararPontosDeCodigo, chaveReferencia } from "./canonico";
import type {
  Dominio,
  Entidade,
  Predicado,
  Referencia,
  Relacao,
  TabelaCorrespondencia,
} from "./esquema";

export interface CorrespondenciaVocabulario {
  fonteParaAlvo: ReadonlyMap<string, string>;
  alvoParaFonte: ReadonlyMap<string, string>;
}

export interface IndicesDominio {
  entidadesPorId: ReadonlyMap<string, Entidade>;
  predicadosPorNome: ReadonlyMap<string, Predicado>;
  relacoesPorId: ReadonlyMap<string, Relacao>;
  relacoesPorPredicado: ReadonlyMap<string, readonly Relacao[]>;
  papeisPorEntidade: ReadonlyMap<string, ReadonlySet<string>>;
  ordemTopologica: readonly Relacao[];
  profundidadePorRelacao: ReadonlyMap<string, number>;
  relacoesNivelMaisAlto: readonly Relacao[];
}

function predicadosCompativeis(fonte: Predicado, alvo: Predicado): boolean {
  return (
    fonte.aridade === alvo.aridade &&
    fonte.classe === alvo.classe &&
    fonte.simetrico === alvo.simetrico
  );
}

export function criarCorrespondenciaVocabulario(
  fonte: Dominio,
  alvo: Dominio,
  tabela: TabelaCorrespondencia = [],
): CorrespondenciaVocabulario {
  const predicadosFonte = new Map(fonte.predicados.map((predicado) => [predicado.nome, predicado]));
  const predicadosAlvo = new Map(alvo.predicados.map((predicado) => [predicado.nome, predicado]));
  const fonteParaAlvo = new Map<string, string>();
  const alvoParaFonte = new Map<string, string>();

  for (const item of [...tabela].sort(
    (a, b) =>
      compararPontosDeCodigo(a.fonte, b.fonte) || compararPontosDeCodigo(a.alvo, b.alvo),
  )) {
    if (item.peso !== 1) {
      throw new TypeError("o MVP aceita somente correspondências com peso 1");
    }
    const predicadoFonte = predicadosFonte.get(item.fonte);
    const predicadoAlvo = predicadosAlvo.get(item.alvo);
    if (!predicadoFonte || !predicadoAlvo || !predicadosCompativeis(predicadoFonte, predicadoAlvo)) {
      throw new TypeError(`correspondência incompatível: ${item.fonte} -> ${item.alvo}`);
    }
    if (fonteParaAlvo.has(item.fonte) || alvoParaFonte.has(item.alvo)) {
      throw new TypeError(`correspondência conflitante: ${item.fonte} -> ${item.alvo}`);
    }
    fonteParaAlvo.set(item.fonte, item.alvo);
    alvoParaFonte.set(item.alvo, item.fonte);
  }

  for (const nome of [...predicadosFonte.keys()].sort(compararPontosDeCodigo)) {
    if (fonteParaAlvo.has(nome) || alvoParaFonte.has(nome)) continue;
    const predicadoFonte = predicadosFonte.get(nome)!;
    const predicadoAlvo = predicadosAlvo.get(nome);
    if (!predicadoAlvo || !predicadosCompativeis(predicadoFonte, predicadoAlvo)) continue;
    fonteParaAlvo.set(nome, nome);
    alvoParaFonte.set(nome, nome);
  }

  return { fonteParaAlvo, alvoParaFonte };
}

export function predicadosCorrespondem(
  predicadoFonte: string,
  predicadoAlvo: string,
  correspondencia: CorrespondenciaVocabulario,
): boolean {
  return correspondencia.fonteParaAlvo.get(predicadoFonte) === predicadoAlvo;
}

export function chavePapel(predicado: string, posicao: number | "*"): string {
  return JSON.stringify([predicado, posicao]);
}

export function separarChavePapel(chave: string): { predicado: string; posicao: number | "*" } {
  const [predicado, posicao] = JSON.parse(chave) as [string, number | "*"];
  return { predicado, posicao };
}

function compararReferencias(a: Referencia, b: Referencia): number {
  return compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b));
}

export function assinaturaRelacao(relacao: Relacao, predicado: Predicado): string {
  const argumentos = relacao.args.map((arg) => ({ ...arg }));
  if (predicado.simetrico) argumentos.sort(compararReferencias);
  return JSON.stringify([
    relacao.predicado,
    argumentos.map((arg) => [arg.tipo, arg.id]),
  ]);
}

export function criarIndicesDominio(dominio: Dominio): IndicesDominio {
  const entidadesPorId = new Map(
    [...dominio.entidades]
      .sort((a, b) => compararPontosDeCodigo(a.id, b.id))
      .map((entidade) => [entidade.id, entidade]),
  );
  const predicadosPorNome = new Map(
    [...dominio.predicados]
      .sort((a, b) => compararPontosDeCodigo(a.nome, b.nome))
      .map((predicado) => [predicado.nome, predicado]),
  );
  const relacoesOrdenadas = [...dominio.relacoes].sort((a, b) =>
    compararPontosDeCodigo(a.id, b.id),
  );
  const relacoesPorId = new Map(relacoesOrdenadas.map((relacao) => [relacao.id, relacao]));

  const porPredicadoMutavel = new Map<string, Relacao[]>();
  relacoesOrdenadas.forEach((relacao) => {
    const existentes = porPredicadoMutavel.get(relacao.predicado) ?? [];
    existentes.push(relacao);
    porPredicadoMutavel.set(relacao.predicado, existentes);
  });
  const relacoesPorPredicado = new Map<string, readonly Relacao[]>(
    [...porPredicadoMutavel.entries()].sort(([a], [b]) => compararPontosDeCodigo(a, b)),
  );

  const papeisMutaveis = new Map<string, Set<string>>();
  entidadesPorId.forEach((_, id) => papeisMutaveis.set(id, new Set()));
  relacoesOrdenadas.forEach((relacao) => {
    const predicado = predicadosPorNome.get(relacao.predicado)!;
    relacao.args.forEach((arg, posicao) => {
      if (arg.tipo !== "entidade") return;
      papeisMutaveis.get(arg.id)?.add(
        chavePapel(relacao.predicado, predicado.simetrico ? "*" : posicao),
      );
    });
  });
  const papeisPorEntidade = new Map<string, ReadonlySet<string>>(
    [...papeisMutaveis.entries()].map(([id, papeis]) => [
      id,
      new Set([...papeis].sort(compararPontosDeCodigo)),
    ]),
  );

  const dependentes = new Map<string, string[]>();
  const dependenciasRestantes = new Map<string, number>();
  const profundidadePorRelacao = new Map<string, number>();
  const relacoesReferenciadas = new Set<string>();
  relacoesOrdenadas.forEach((relacao) => {
    dependenciasRestantes.set(relacao.id, 0);
    profundidadePorRelacao.set(relacao.id, 0);
  });
  relacoesOrdenadas.forEach((relacao) => {
    relacao.args.forEach((arg) => {
      if (arg.tipo !== "relacao") return;
      relacoesReferenciadas.add(arg.id);
      dependenciasRestantes.set(
        relacao.id,
        (dependenciasRestantes.get(relacao.id) ?? 0) + 1,
      );
      dependentes.set(arg.id, [...(dependentes.get(arg.id) ?? []), relacao.id]);
    });
  });

  const fila = [...dependenciasRestantes.entries()]
    .filter(([, quantidade]) => quantidade === 0)
    .map(([id]) => id)
    .sort(compararPontosDeCodigo);
  const ordemTopologica: Relacao[] = [];
  while (fila.length > 0) {
    const id = fila.shift()!;
    ordemTopologica.push(relacoesPorId.get(id)!);
    for (const dependente of [...(dependentes.get(id) ?? [])].sort(compararPontosDeCodigo)) {
      profundidadePorRelacao.set(
        dependente,
        Math.max(
          profundidadePorRelacao.get(dependente) ?? 0,
          (profundidadePorRelacao.get(id) ?? 0) + 1,
        ),
      );
      const restantes = (dependenciasRestantes.get(dependente) ?? 0) - 1;
      dependenciasRestantes.set(dependente, restantes);
      if (restantes === 0) {
        fila.push(dependente);
        fila.sort(compararPontosDeCodigo);
      }
    }
  }
  if (ordemTopologica.length !== relacoesOrdenadas.length) {
    throw new TypeError("domínio inválido: relações formam ciclo");
  }

  const relacoesNivelMaisAlto = relacoesOrdenadas.filter(
    (relacao) => !relacoesReferenciadas.has(relacao.id),
  );

  return {
    entidadesPorId,
    predicadosPorNome,
    relacoesPorId,
    relacoesPorPredicado,
    papeisPorEntidade,
    ordemTopologica,
    profundidadePorRelacao,
    relacoesNivelMaisAlto,
  };
}
