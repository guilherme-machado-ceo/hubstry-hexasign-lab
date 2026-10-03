import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeSignificance, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';

export const SignificanceAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [metrics, setMetrics] = useState<HexaMetrics | null>(null);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const computedMetrics = analyzeSignificance(inputText);
    setMetrics(computedMetrics);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto p-4">
      <Card className="lg:col-span-6 bg-slate-950/40 border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-xl font-mono tracking-wider text-amber-400">
            LABORATÓRIO DE SIGNIFICÂNCIA f(A)
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Insira um texto técnico, código ou artefato para avaliação nas 6 dimensões relacionais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <Textarea
            placeholder="Cole aqui o texto ou algoritmo para análise semiótica..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] bg-slate-900/80 border-slate-700 text-slate-100 font-mono text-sm resize-none focus:ring-amber-500"
          />
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-mono text-slate-500">
              {inputText.trim().split(/\s+/).filter(Boolean).length} palavras detetadas
            </span>
            <Button
              onClick={handleAnalyze}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold px-6 transition-all"
            >
              Executar Análise
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-6">
        <HexaRadar metrics={metrics} />
      </div>

      {metrics && (
        <Card className="lg:col-span-12 bg-slate-950/40 border-slate-800 text-slate-100 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-amber-400 uppercase tracking-widest">
              Relatório de Diagnóstico Relacional
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4 font-mono text-center">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Similitude (ρ1)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.similitude * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Homologia (ρ2)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.homology * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Equivalência (ρ3)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.equivalence * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Simetria (ρ4)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.symmetry * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Equilíbrio (ρ5)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.equilibrium * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Compensação (ρ6)</div>
              <div className="text-lg font-bold text-amber-300">{(metrics.compensation * 100).toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignificanceAnalyzer;
