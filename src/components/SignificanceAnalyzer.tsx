import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { analyzeSignificance, HexaMetrics } from '@/lib/hexa-engine';
import HexaRadar from './HexaRadar';
import { CheckCircle2, Sparkles } from 'lucide-react';

const HISTORY_KEY = 'hexa-history';

export const SignificanceAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [metrics, setMetrics] = useState<HexaMetrics | null>(null);

  const handleAnalyze = () => {
    const text = inputText.trim();
    if (!text) return;

    const computedMetrics = analyzeSignificance(text);
    setMetrics(computedMetrics);

    const current = (() => {
      try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
      } catch {
        return [];
      }
    })();

    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        score: computedMetrics.piSqrtScore,
        date: new Date().toLocaleString('pt-BR'),
      },
      ...current,
    ].slice(0, 100);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_0.95fr]">
      <Card className="border-slate-800 bg-slate-950/75 shadow-2xl">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline" className="border-amber-400/30 bg-amber-400/5 font-mono text-amber-300">f(A)</Badge>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Análise determinística</span>
          </div>
          <CardTitle className="text-2xl text-white">Analise um artefato</CardTitle>
          <CardDescription className="max-w-xl text-slate-400">
            Texto técnico, código ou descrição de um artefato. O motor atual produz uma heurística determinística sobre as seis relações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            aria-label="Artefato para análise"
            placeholder="Cole aqui o texto, código ou saída de um modelo..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            className="min-h-[300px] resize-y border-slate-700 bg-slate-900/80 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-amber-400"
          />
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-mono text-slate-500">
              {inputText.trim().split(/\s+/).filter(Boolean).length} palavras · {inputText.length} caracteres
            </span>
            <Button onClick={handleAnalyze} disabled={!inputText.trim()} className="bg-amber-400 text-slate-950 hover:bg-amber-300">
              <Sparkles className="mr-2 h-4 w-4" /> Executar análise
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <HexaRadar metrics={metrics} />
        {metrics && (
          <Card className="border-slate-800 bg-slate-950/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Relatório relacional
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                ['ρ₁', 'Similitude', metrics.similitude],
                ['ρ₂', 'Homologia', metrics.homology],
                ['ρ₃', 'Equivalência', metrics.equivalence],
                ['ρ₄', 'Simetria', metrics.symmetry],
                ['ρ₅', 'Equilíbrio', metrics.equilibrium],
                ['ρ₆', 'Compensação', metrics.compensation],
              ] as const).map(([rho, label, value]) => (
                <div key={rho} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="font-mono text-xs text-amber-300">{rho}</div>
                  <div className="mt-1 text-xs text-slate-500">{label}</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{(value * 100).toFixed(1)}%</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SignificanceAnalyzer;
