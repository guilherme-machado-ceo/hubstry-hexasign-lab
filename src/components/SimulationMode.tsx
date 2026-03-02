"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { calculatePiSqrtScore, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';
import { Beaker, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SimulationMode = () => {
  const [metrics, setMetrics] = useState<HexaMetrics>({
    contextualDensity: 0.5,
    semanticResonance: 0.5,
    logicalCohesion: 0.5,
    intentionalAlignment: 0.5,
    informationalEntropy: 0.5,
    pragmaticUtility: 0.5,
  });

  const score = calculatePiSqrtScore(metrics);

  const updateMetric = (key: keyof HexaMetrics, value: number[]) => {
    setMetrics(prev => ({ ...prev, [key]: value[0] }));
  };

  const reset = () => {
    setMetrics({
      contextualDensity: 0.5,
      semanticResonance: 0.5,
      logicalCohesion: 0.5,
      intentionalAlignment: 0.5,
      informationalEntropy: 0.5,
      pragmaticUtility: 0.5,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto p-4">
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Beaker className="w-5 h-5 text-violet-600" />
              Ajuste de Variáveis
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500">
              <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs font-semibold uppercase text-slate-500">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <span className="text-xs font-mono font-bold text-violet-600">{(value * 100).toFixed(0)}%</span>
                </div>
                <Slider 
                  value={[value]} 
                  max={1} 
                  step={0.01} 
                  onValueChange={(val) => updateMetric(key as keyof HexaMetrics, val)}
                  className="py-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/10">
            <p className="text-violet-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Resultado da Simulação</p>
            <h2 className="text-6xl font-black tracking-tighter">{score.toFixed(5)}</h2>
            <p className="text-white/40 text-xs mt-2 font-mono">π * sqrt(Σ metrics² / 6)</p>
          </div>
          <CardContent className="p-6">
            <div className="bg-white/5 rounded-2xl p-4">
              <HexaRadar metrics={metrics} />
            </div>
            <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <p className="text-sm text-violet-200 leading-relaxed italic">
                "Nesta configuração, o artefato teórico atinge um estado de {score > 2.8 ? 'Saturação de Realidade' : 'Equilíbrio Estável'}. 
                A predominância de {Object.entries(metrics).sort((a,b) => b[1]-a[1])[0][0]} sugere um viés {metrics.pragmaticUtility > 0.7 ? 'operacional' : 'conceitual'}."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimulationMode;