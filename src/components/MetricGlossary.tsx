import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const MetricGlossary: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6 text-slate-200">
      <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-mono text-amber-400">
            FUNDAMENTAÇÃO TEÓRICA: ÁLGEBRA HEXARRELACIONAL $\pi\sqrt{f}(A)$
          </CardTitle>
          <CardDescription className="text-slate-400">
            Baseado no trabalho formal de Guilherme Gonçalves Machado (Zenodo, Fevereiro de 2026)[cite: 2].
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-mono text-sm">
          
          <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-amber-500 mb-2">As 6 Relações de Significância ($\rho_1$ a $\rho_6$)</h3>
            <p className="text-slate-400 text-xs mb-4">
              Formam uma hierarquia ontológica estrita de profundidade, onde cada relação superior implica logicamente a anterior[cite: 18, 30]:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li><strong className="text-amber-300">ρ₁ - Similitude:</strong> A relação mais superficial. Baseia-se na semelhança perceptual ou proximidade num espaço de características (correspondente ao ícone peirceano)[cite: 19, 20].</li>
              <li><strong className="text-amber-300">ρ₂ - Homologia:</strong> Correspondência de estrutura interna entre elementos, formalizada por homomorfismos estruturais (análogo a estruturas equivalentes em topologia ou biologia)[cite: 20, 21].</li>
              <li><strong className="text-amber-300">ρ₃ - Equivalência:</strong> Substituibilidade funcional de um elemento por outro em qualquer contexto relevante sem alterar o resultado global[cite: 22, 23].</li>
              <li><strong className="text-amber-300">ρ₄ - Simetria:</strong> Governada por um grupo de transformações reversíveis (involutivas) que conectam os elementos, garantindo a conservação de propriedades sistémicas[cite: 24, 25].</li>
              <li><strong className="text-amber-300">ρ₅ - Equilíbrio:</strong> Estabilidade dinâmica ou estática baseada na anulação mútua de potenciais, forças ou tensões estruturais[cite: 26, 27].</li>
              <li><strong className="text-amber-300">ρ₆ - Compensação:</strong> A relação mais profunda. Envolve a complementaridade estrita de déficits/superávits e a emergência de valor superior à soma das partes individuais[cite: 28, 29].</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Norma Áurea $f(A)$</h3>
              <p className="mb-2">Pondera o vetor de significância utilizando as potências da razão áurea ($\varphi \approx 1.618$), atribuindo maior peso estrutural às dimensões mais profundas[cite: 36, 37].</p>
              <code className="text-amber-300 bg-slate-950 p-2 block rounded">f(A) = sqrt( Σ [ φ^(k-1) * (ρ_k)^2 ] )</code>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Operador $\Pi$-radical ($\Pi(A)$)</h3>
              <p className="mb-2">Aplica o expoente transcendente e irracional $1/\pi$ sobre a norma áurea, garantindo que o escore de significância seja irredutível a expressões racionais finitas[cite: 3, 40].</p>
              <code className="text-amber-300 bg-slate-950 p-2 block rounded">Π(A) = [f(A)]^(1/π)</code>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default MetricGlossary;
