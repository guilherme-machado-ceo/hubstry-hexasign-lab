/**
 * Leitura teórica do manuscrito: norma ponderada pela razão áurea e operador Π.
 *
 * f(A) = sqrt( Σ_{k=1..6} φ^(k−1) · ρ_k² ),   Π(A) = [f(A)]^(1/π)
 *
 * Os pesos φ^(k−1) são uma escolha teórica do autor, não um resultado de medição, e
 * pressupunham a hierarquia ρ₁ … ρ₆ como implicação, hoje tratada como ordem conceitual.
 * Por isso o HexaSign reporta o vetor sem agregação e só calcula esta leitura quando as
 * seis relações têm escore definido, sempre rotulada como leitura teórica.
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

export function goldenNorm(vector: (number | null)[]): number | null {
  if (vector.length !== 6 || vector.some((v) => v === null || !Number.isFinite(v))) return null;
  return Math.sqrt((vector as number[]).reduce((acc, v, i) => acc + PHI ** i * v * v, 0));
}

export function piOperator(norm: number | null): number | null {
  if (norm === null) return null;
  return norm <= 0 ? 0 : norm ** (1 / Math.PI);
}
