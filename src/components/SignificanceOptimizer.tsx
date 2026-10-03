import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { calculateGoldenNorm, calculatePiSqrtScore, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';

export const SignificanceOptimizer: React.FC = () => {
  // Estado inicial simulado
  const [metrics, setMetrics] = useState<HexaMetrics>({
    similitude: 0.5, homology: 0.5, equivalence: 0.5,
    symmetry: 0.5, equilibrium: 0.5, compensation: 0.5,
    goldenNorm: 0, piSqrtScore: 0
  });

  // Atualiza a matemática oficial sempre que um slider é movido
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

  const handleSliderChange = (dimension: keyof HexaMetrics, value: number[]) => {
    setMetrics(prev => ({ ...prev, [dimension]: value[0] }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <Card className="lg:col-span-6 bg-slate-950/40 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-mono text-amber-400 tracking-wider">
            SIMULADOR HEXARRELACIONAL
          </CardTitle>
          <CardDescription className="text-slate-400">
            Altere os vetores relacionais manualmente e observe o motor matemático recalcular a Norma Áurea e o Π-radical em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {[
            { key: 'similitude', label: 'Similitude (ρ₁)' },
            { key: 'homology', label: 'Homologia (ρ₂)' },
            { key: 'equivalence', label: 'Equivalência (ρ₃)' },
            { key: 'symmetry', label: 'Simetria (ρ₄)' },
            { key: 'equilibrium', label: 'Equilíbrio (ρ₅)' },
            { key: 'compensation', label: 'Compensação (ρ₆)' }
          ].map((dim) => (
            <div key={dim.key} className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>{dim.label}</span>
                <span className="text-amber-500">{(metrics[dim.key as keyof HexaMetrics] as number * 100).toFixed(0)}%</span>
              </div>
              <Slider
                value={[metrics[dim.key as keyof HexaMetrics] as number]}
                max={1}
                step={0.01}
                onValueChange={(val) => handleSliderChange(dim.key as keyof HexaMetrics, val)}
                className="w-full"
              />
            </div>
          ))}

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
