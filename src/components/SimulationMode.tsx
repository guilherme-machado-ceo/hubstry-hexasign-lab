import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Beaker, RotateCcw, Info, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { calculateGoldenNorm, calculatePiSqrtScore } from '@/lib/hexa-engine';

type RelationKey = 'similitude' | 'homology' | 'equivalence' | 'symmetry' | 'equilibrium' | 'compensation';
type Metrics = Record<RelationKey, number>;

const DEFAULTS: Metrics = {
  similitude: 0.5,
  homology: 0.5,
  equivalence: 0.5,
  symmetry: 0.5,
  equilibrium: 0.5,
  compensation: 0.5,
};

const LABELS: Record<RelationKey, { short: string; name: string; desc: string }> = {
  similitude: { short: 'ρ₁', name: 'Similitude', desc: 'Semelhança observável entre elementos.' },
  homology: { short: 'ρ₂', name: 'Homologia', desc: 'Correspondência estrutural entre elementos.' },
  equivalence: { short: 'ρ₃', name: 'Equivalência', desc: 'Intercambialidade funcional em contexto.' },
  symmetry: { short: 'ρ₄', name: 'Simetria', desc: 'Transformação reversível que preserva propriedades.' },
  equilibrium: { short: 'ρ₅', name: 'Equilíbrio', desc: 'Estabilidade entre forças, tensões ou potenciais.' },
  compensation: { short: 'ρ₆', name: 'Compensação', desc: 'Complementaridade produtiva e valor emergente.' },
};

const SimulationMode = () => {
  const [metrics, setMetrics] = useState<Metrics>(DEFAULTS);

  const vector = useMemo(() => Object.values(metrics), [metrics]);
  const goldenNorm = useMemo(() => calculateGoldenNorm(vector), [vector]);
  const score = useMemo(() => calculatePiSqrtScore(goldenNorm), [goldenNorm]);

  const activeEntries = useMemo(
    () => (Object.entries(metrics) as [RelationKey, number][]).sort((a, b) => b[1] - a[1]),
    [metrics],
  );
  const strongest = activeEntries[0];
  const weakest = activeEntries[activeEntries.length - 1];
  const average = vector.reduce((sum, value) => sum + value, 0) / vector.length;

  const updateMetric = (key: RelationKey, values: number[]) => {
    const next = values[0] ?? 0;
    setMetrics((current) => ({ ...current, [key]: next }));
  };

  const reset = () => setMetrics(DEFAULTS);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Beaker className="h-3.5 w-3.5" /> Sandbox determinístico
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Simulação do vetor de significância</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            Altere uma relação por vez e veja imediatamente o efeito na norma áurea <span className="font-mono text-amber-300">f(A)</span> e no operador <span className="font-mono text-amber-300">Π(A)</span>.
          </p>
        </div>
        <Button variant="outline" onClick={reset} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
          <RotateCcw className="mr-2 h-4 w-4" /> Restaurar padrão
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-slate-800 bg-slate-950/80 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-base text-slate-100">Seis relações</CardTitle>
            <CardDescription className="text-slate-400">
              Escala contínua de 0 a 1. Os pesos são aplicados segundo a norma áurea definida no framework.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(Object.keys(metrics) as RelationKey[]).map((key) => {
              const value = metrics[key];
              return (
                <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-amber-400/40 bg-amber-400/5 font-mono text-amber-300">
                          {LABELS[key].short}
                        </Badge>
                        <span className="font-medium text-slate-100">{LABELS[key].name}</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{LABELS[key].desc}</p>
                    </div>
                    <span className="min-w-12 text-right font-mono text-sm font-semibold text-amber-300">{value.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[value]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(values) => updateMetric(key, values)}
                    className="mt-4"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-600">
                    <span>0</span><span>0.5</span><span>1</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-amber-400/20 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_45%),linear-gradient(180deg,#111827,#020617)] shadow-2xl">
            <CardHeader className="border-b border-white/10">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Resultado vivo</div>
              <CardTitle className="mt-2 font-mono text-5xl tracking-tight text-white">{score.toFixed(5)}</CardTitle>
              <CardDescription className="text-slate-400">
                <span className="font-mono text-slate-300">Π(A) = [f(A)]^(1/π)</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">Norma áurea</div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-slate-100">{goldenNorm.toFixed(4)}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-slate-500">Média aritmética das seis dimensões</div>
                  <div className="mt-1 font-mono text-2xl font-semibold text-slate-100">{average.toFixed(3)}</div>
                  <div className="mt-1 text-[10px] leading-snug text-slate-600">Indicador auxiliar da interface; não integra o formalismo π√f(A).</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-300"><ArrowUpRight className="h-4 w-4" /> Maior contribuição</div>
                  <div className="mt-2 font-medium text-slate-100">{LABELS[strongest[0]].short} · {LABELS[strongest[0]].name}</div>
                  <div className="mt-1 font-mono text-sm text-emerald-200">{strongest[1].toFixed(2)}</div>
                </div>
                <div className="rounded-xl border border-sky-400/15 bg-sky-400/5 p-4">
                  <div className="flex items-center gap-2 text-xs text-sky-300"><ArrowDownRight className="h-4 w-4" /> Menor contribuição</div>
                  <div className="mt-2 font-medium text-slate-100">{LABELS[weakest[0]].short} · {LABELS[weakest[0]].name}</div>
                  <div className="mt-1 font-mono text-sm text-sky-200">{weakest[1].toFixed(2)}</div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Info className="h-4 w-4 text-amber-300" /> Diagnóstico de sensibilidade
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  O resultado agora depende diretamente dos seis controles. Isso torna a aba útil para experimentar a relação entre um vetor relacional, a norma ponderada por φ e o operador Π.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimulationMode;
