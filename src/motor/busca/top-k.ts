export class HeapTopK<T> {
  private readonly itens: T[] = [];

  constructor(
    private readonly k: number,
    private readonly comparar: (a: T, b: T) => number,
  ) {
    if (!Number.isInteger(k) || k <= 0) throw new RangeError("k deve ser inteiro positivo");
  }

  adicionar(item: T): void {
    if (this.itens.length < this.k) {
      this.itens.push(item);
      this.subir(this.itens.length - 1);
      return;
    }
    if (this.comparar(item, this.itens[0]) >= 0) return;
    this.itens[0] = item;
    this.descer(0);
  }

  valoresOrdenados(): T[] {
    return [...this.itens].sort(this.comparar);
  }

  private piorQue(a: T, b: T): boolean {
    return this.comparar(a, b) > 0;
  }

  private subir(indiceInicial: number): void {
    let indice = indiceInicial;
    while (indice > 0) {
      const pai = Math.floor((indice - 1) / 2);
      if (!this.piorQue(this.itens[indice], this.itens[pai])) break;
      [this.itens[indice], this.itens[pai]] = [this.itens[pai], this.itens[indice]];
      indice = pai;
    }
  }

  private descer(indiceInicial: number): void {
    let indice = indiceInicial;
    while (true) {
      const esquerda = indice * 2 + 1;
      const direita = esquerda + 1;
      let pior = indice;
      if (esquerda < this.itens.length && this.piorQue(this.itens[esquerda], this.itens[pior])) {
        pior = esquerda;
      }
      if (direita < this.itens.length && this.piorQue(this.itens[direita], this.itens[pior])) {
        pior = direita;
      }
      if (pior === indice) return;
      [this.itens[indice], this.itens[pior]] = [this.itens[pior], this.itens[indice]];
      indice = pior;
    }
  }
}
