import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateGoldenNorm, calculatePiSqrtScore, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';

export const SignificanceOptimizer: React.FC = () => {
  const [metrics, setMetrics] = useState<HexaMetrics>({
    similitude: 0.6, homology: 0.6, equivalence: 0.6,
    symmetry: 0.6, equilibrium: 0.6, compensation: 0.6,
    goldenNorm: 0, piSqrtScore: 0
  });

  useEffect(() => {
    const vector = [
      metrics.similitude, metrics.homology, metrics.equivalence,
      metrics.symmetry, metrics.equilibrium, metrics.compensation
    ];
    const newGoldenNorm = calculateGoldenNorm(vector);
    const newPiScore = calculatePiSqrtScore(newGoldenNorm);
    
    setMetrics(prev => ({
      ...prev,
      goldenNorm: newGoldenNorm,
      piSqrtScore: newPiScore
    }));
  }, [metrics.similitude, metrics.homology, metrics.equivalence, metrics.symmetry, metrics.equilibrium, metrics.compensation]);

  const handleChange = (dimension: keyof HexaMetrics, value: number) => {
    setMetrics(prev => ({ ...prev, [dimension]: value }));
  };

  const dimensions = [
    { key: 'similitude' as keyof HexaMetrics, label: 'Similitude (ρ₁)' },
    { key: 'homology' as keyof HexaMetrics, label: 'Homologia (ρ₂)' },
    { key: 'equivalence' as keyof HexaMetrics, label: 'Equivalência (ρ₃)' },
    { key: 'symmetry' as keyof HexaMetrics, label: 'Simetria (ρ₄)' },
    { key: 'equilibrium' as keyof HexaMetrics, label: 'Equilíbrio (ρ₅)' },
    { key: 'compensation' as keyof HexaMetrics, label: 'Compensação (ρ₆)' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-6 bg-slate-950/40 border-slate-800 backdrop-blur-xl shadow-2xl text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl font-mono text-amber-400 tracking-wider">
            SIMULADOR HEXARRELACIONAL
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ajuste os vetores relacionais (ρ₁ a ρ₆) para observar o comportamento determinístico da Norma Áurea e do Π-radical[cite: 37, 40].
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-mono">
          {dimensions.map((dim) => {
            const val = metrics[dim.key] as number;
            return (
              <div key={dim.key} className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{dim.label}</span>
                  <span className="text-amber-500 font-bold">{(val * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={val}
                  onChange={(e) => handleChange(dim.key, parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-900 cursor-pointer h-2 rounded-lg"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="lg:col-span-6 flex items-center">
        <div className="w-full">
          <HexaRadar metrics={metrics} />
        </div>
      </div>
    </div>
  );
};

export default SignificanceOptimizer;
