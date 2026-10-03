import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const MetricGlossary: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-6 text-slate-200">
      <Card className="bg-slate-950/40 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-mono text-amber-400">FUNDAMENTAÇÃO TEÓRICA: ÁLGEBRA HEXARRELACIONAL</CardTitle>
          <CardDescription className="text-slate-400">
            Glossário de IP (Propriedade Intelectual) - Hubstry Deep Tech
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-mono text-sm">
          
          <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-amber-500 mb-2">As 6 Dimensões Relacionais (ρ₁ a ρ₆)</h3>
            <ul className="space-y-3 text-slate-300">
              <li><strong className="text-amber-300">ρ₁ - Similitude:</strong> Nível de vocabulário único. Avalia a riqueza semântica base, evitando repetições vazias.</li>
              <li><strong className="text-amber-300">ρ₂ - Homologia:</strong> Conectividade lógica. Mede a presença de estruturas dedutivas (ex: "portanto", "se... então").</li>
              <li><strong className="text-amber-300">ρ₃ - Equivalência:</strong> Densidade informacional. Relação entre o tamanho do artefato e a carga semântica real que ele carrega.</li>
              <li><strong className="text-amber-300">ρ₄ - Simetria:</strong> Balanceamento estrutural. Ritmo de pontuação e divisão de blocos lógicos ou parágrafos.</li>
              <li><strong className="text-amber-300">ρ₅ - Equilíbrio:</strong> Estabilidade de formato. Verifica se a extensão do texto/código está otimizada para a compreensão humana/máquina.</li>
              <li><strong className="text-amber-300">ρ₆ - Compensação:</strong> Profundidade sistémica. Acionada pela presença de terminologia complexa, arquitetural ou de domínio específico.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Norma Áurea f(A)</h3>
              <p className="mb-2">O motor pondera cada dimensão utilizando as potências da razão áurea (φ ≈ 1.618). Dimensões mais profundas (como Compensação) têm peso estrutural maior que as superficiais (Similitude).</p>
              <code className="text-amber-300 bg-slate-950 p-2 block rounded">f(A) = Σ [ (ρ_k)² × φ^(k-1) ]</code>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-amber-500 mb-2">Operador Π-radical Π(A)</h3>
              <p className="mb-2">O selo de auditoria transcendente. Comprime a Norma Áurea por um expoente irracional (1/π), garantindo que a complexidade da significância seja matematicamente irredutível.</p>
              <code className="text-amber-300 bg-slate-950 p-2 block rounded">Π(A) = [f(A)] ^ (1/π)</code>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default MetricGlossary;
