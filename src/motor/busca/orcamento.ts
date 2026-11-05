export class ErroOrcamentoBusca extends Error {
  readonly codigo = "ORCAMENTO_BUSCA_EXCEDIDO" as const;

  constructor(
    readonly recurso: "hipotesesLocais" | "nucleos",
    readonly limite: number,
  ) {
    super(`orçamento de ${recurso} excedido: limite ${limite}`);
    this.name = "ErroOrcamentoBusca";
  }
}

export function verificarOrcamento(
  recurso: "hipotesesLocais" | "nucleos",
  quantidade: number,
  limite: number,
): void {
  if (quantidade > limite) throw new ErroOrcamentoBusca(recurso, limite);
}
