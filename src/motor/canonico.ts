import type {
  ConfiguracaoMotor,
  Dominio,
  Predicado,
  Referencia,
  TabelaCorrespondencia,
} from "./esquema";

export function compararPontosDeCodigo(a: string, b: string): number {
  const iteradorA = a[Symbol.iterator]();
  const iteradorB = b[Symbol.iterator]();
  while (true) {
    const proximoA = iteradorA.next();
    const proximoB = iteradorB.next();
    if (proximoA.done || proximoB.done) {
      if (proximoA.done && proximoB.done) return 0;
      return proximoA.done ? -1 : 1;
    }
    const pontoA = proximoA.value.codePointAt(0)!;
    const pontoB = proximoB.value.codePointAt(0)!;
    if (pontoA !== pontoB) return pontoA - pontoB;
  }
}

export function arredondar12(valor: number): number {
  if (!Number.isFinite(valor)) throw new TypeError("valor deve ser finito");
  const arredondado = Math.round(valor * 1e12) / 1e12;
  return Object.is(arredondado, -0) ? 0 : arredondado;
}

export function quantizar12(escore: number): number {
  if (!Number.isFinite(escore) || escore < 0 || escore > 1) {
    throw new TypeError("escore deve ser finito e estar entre 0 e 1");
  }
  return arredondar12(escore);
}

export function numeroCanonico(valor: number): string {
  if (!Number.isFinite(valor)) throw new TypeError("número canônico deve ser finito");
  const normalizado = Object.is(valor, -0) ? 0 : valor;
  return JSON.stringify(normalizado);
}

function stringCanonica(valor: string): string {
  return JSON.stringify(valor.normalize("NFC"));
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export function jsonCanonico(valor: unknown): string {
  if (valor === null) return "null";
  if (typeof valor === "string") return stringCanonica(valor);
  if (typeof valor === "number") return numeroCanonico(valor);
  if (typeof valor === "boolean") return valor ? "true" : "false";
  if (Array.isArray(valor)) return `[${valor.map(jsonCanonico).join(",")}]`;
  if (!ehObjeto(valor)) throw new TypeError(`tipo não serializável: ${typeof valor}`);

  const entradas = new Map<string, unknown>();
  Object.keys(valor).forEach((chave) => {
    const normalizada = chave.normalize("NFC");
    if (entradas.has(normalizada)) {
      throw new TypeError(`chaves colidem após normalização NFC: ${normalizada}`);
    }
    const item = valor[chave];
    if (item === undefined) throw new TypeError(`valor indefinido em ${normalizada}`);
    entradas.set(normalizada, item);
  });
  return `{${[...entradas.entries()]
    .sort(([a], [b]) => compararPontosDeCodigo(a, b))
    .map(([chave, item]) => `${stringCanonica(chave)}:${jsonCanonico(item)}`)
    .join(",")}}`;
}

function utf8(texto: string): Uint8Array {
  const bytes: number[] = [];
  for (const caractere of texto) {
    const ponto = caractere.codePointAt(0)!;
    if (ponto <= 0x7f) {
      bytes.push(ponto);
    } else if (ponto <= 0x7ff) {
      bytes.push(0xc0 | (ponto >> 6), 0x80 | (ponto & 0x3f));
    } else if (ponto <= 0xffff) {
      bytes.push(
        0xe0 | (ponto >> 12),
        0x80 | ((ponto >> 6) & 0x3f),
        0x80 | (ponto & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (ponto >> 18),
        0x80 | ((ponto >> 12) & 0x3f),
        0x80 | ((ponto >> 6) & 0x3f),
        0x80 | (ponto & 0x3f),
      );
    }
  }
  return Uint8Array.from(bytes);
}

export function bytesCanonicos(valor: unknown): Uint8Array {
  return utf8(jsonCanonico(valor));
}

export function chaveReferencia(referencia: Referencia): string {
  return `${referencia.tipo}:${referencia.id.normalize("NFC")}`;
}

function referenciaCanonica(referencia: Referencia): Referencia {
  return { tipo: referencia.tipo, id: referencia.id.normalize("NFC") };
}

function predicadosPorNome(dominio: Dominio): Map<string, Predicado> {
  return new Map(dominio.predicados.map((predicado) => [predicado.nome, predicado]));
}

export function dominioCanonico(dominio: Dominio): Dominio {
  const porNome = predicadosPorNome(dominio);
  return {
    id: dominio.id.normalize("NFC"),
    esquemaAtributos: Object.fromEntries(
      Object.entries(dominio.esquemaAtributos)
        .sort(([a], [b]) => compararPontosDeCodigo(a, b))
        .map(([nome, definicao]) => [nome.normalize("NFC"), { ...definicao }]),
    ),
    entidades: dominio.entidades
      .map((entidade) => ({
        id: entidade.id.normalize("NFC"),
        atributos: Object.fromEntries(
          Object.entries(entidade.atributos)
            .sort(([a], [b]) => compararPontosDeCodigo(a, b))
            .map(([nome, valor]) => [
              nome.normalize("NFC"),
              typeof valor === "string" ? valor.normalize("NFC") : Object.is(valor, -0) ? 0 : valor,
            ]),
        ),
        capacidades: entidade.capacidades
          .map((capacidade) => capacidade.normalize("NFC"))
          .sort(compararPontosDeCodigo),
      }))
      .sort((a, b) => compararPontosDeCodigo(a.id, b.id)),
    predicados: dominio.predicados
      .map((predicado) => ({
        ...predicado,
        nome: predicado.nome.normalize("NFC"),
        ...(predicado.capacidadesExigidas === undefined
          ? {}
          : {
              capacidadesExigidas: predicado.capacidadesExigidas
                .map((capacidade) => capacidade.normalize("NFC"))
                .sort(compararPontosDeCodigo),
            }),
      }))
      .sort((a, b) => compararPontosDeCodigo(a.nome, b.nome)),
    relacoes: dominio.relacoes
      .map((relacao) => {
        const predicado = porNome.get(relacao.predicado);
        const args = relacao.args.map(referenciaCanonica);
        if (predicado?.simetrico) {
          args.sort((a, b) => compararPontosDeCodigo(chaveReferencia(a), chaveReferencia(b)));
        }
        return {
          id: relacao.id.normalize("NFC"),
          predicado: relacao.predicado.normalize("NFC"),
          args,
        };
      })
      .sort((a, b) => compararPontosDeCodigo(a.id, b.id)),
  };
}

export function configuracaoCanonica(config: ConfiguracaoMotor): ConfiguracaoMotor {
  return JSON.parse(jsonCanonico(config)) as ConfiguracaoMotor;
}

export function correspondenciasCanonicas(
  tabela: TabelaCorrespondencia,
): TabelaCorrespondencia {
  return tabela
    .map((item) => ({
      fonte: item.fonte.normalize("NFC"),
      alvo: item.alvo.normalize("NFC"),
      peso: 1 as const,
    }))
    .sort(
      (a, b) =>
        compararPontosDeCodigo(a.fonte, b.fonte) ||
        compararPontosDeCodigo(a.alvo, b.alvo),
    );
}

export function saidaSemResumoSaida<T extends Record<string, unknown>>(
  resultado: T,
): Omit<T, "resumoSaida"> {
  const { resumoSaida: _resumoIgnorado, ...restante } = resultado;
  return restante;
}
