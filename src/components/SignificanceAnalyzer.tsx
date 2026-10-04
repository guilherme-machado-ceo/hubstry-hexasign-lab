import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { analyzeSignificance, HexaMetrics } from '@/lib/hexa-engine';
import { requestMaaSObservation, ObservationRejectedError } from '@/lib/ai/client';
import type { AIObservationResult } from '@/lib/ai/types';
import HexaRadar from './HexaRadar';
import { CheckCircle2, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

const HISTORY_KEY = 'hexa-history';

export const SignificanceAnalyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [metrics, setMetrics] = useState<HexaMetrics | null>(null);
  const [aiResult, setAiResult] = useState<AIObservationResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiRejection, setAiRejection] = useState<string[] | null>(null);

  const handleAnalyze = () => {
    const text = inputText.trim();
    if (!text) return;

    const computedMetrics = analyzeSignificance(text);
    setMetrics(computedMetrics);
    setAiResult(null);
    setAiError(null);

    const current = (() => {
      try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
      catch { return []; }
    })();

    const next = [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      score: computedMetrics.piSqrtScore,
      date: new Date().toLocaleString('pt-BR'),
    }, ...current].slice(0, 100);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const handleAIObservation = async () => {
    if (!metrics || !inputText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiRejection(null);
    try {
      const result = await requestMaaSObservation({ text: inputText.trim(), metrics });
      setAiResult(result);
      if (result.validation.status === 'INVALID') {
        setAiError('A resposta do modelo não passou pela validação de evidência e foi retida.');
      }
    } catch (error) {
      if (error instanceof ObservationRejectedError) {
        setAiRejection(error.codes);
      } else {
        setAiError(error instanceof Error ? error.message : 'Falha na observação MaaS');
      }
    } finally {
      setAiLoading(false);
    }
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
            Comece pela questão: como as partes deste artefato se relacionam? O motor HexaSign estima, por meio de proxies determinísticos, os seis graus relacionais. A IA é apenas uma camada de observação e não pode alterar o resultado determinístico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            <li><span className="font-mono text-amber-300/80">1</span> Artefato</li>
            <li aria-hidden>→</li>
            <li><span className="font-mono text-amber-300/80">2</span> Seis dimensões</li>
            <li aria-hidden>→</li>
            <li><span className="font-mono text-amber-300/80">3</span> Perfil Π(A)</li>
            <li aria-hidden>→</li>
            <li><span className="font-mono text-amber-300/80">4</span> Formalismo (aba Método)</li>
            <li aria-hidden>→</li>
            <li><span className="font-mono text-amber-300/80">5</span> Observação da IA</li>
          </ol>
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleAnalyze} disabled={!inputText.trim()} className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                <Sparkles className="mr-2 h-4 w-4" /> Executar análise
              </Button>
              <Button onClick={handleAIObservation} disabled={!metrics || aiLoading} variant="outline" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Observação IA
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-300">Camada de observação:</span> a matemática calcula; a IA apenas observa e interpreta os números já calculados — o engine determinístico continua sendo a autoridade matemática. O que o proxy não mede permanece explicitamente não determinado.
          </div>
          {aiError && <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-3 text-xs text-red-300">{aiError}</div>}
          {aiRejection && (
            <div className="rounded-lg border border-amber-400/40 bg-amber-950/20 p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-200">
                A observação da IA foi recusada por exceder os limites metodológicos do laboratório.
              </p>
              <p className="text-xs leading-relaxed text-amber-100/80">
                Os resultados determinísticos acima permanecem válidos. O HexaSign não permite que
                uma estimativa proxy seja apresentada como demonstração de uma relação formal.
              </p>
              <details className="text-[11px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-400">Detalhe técnico</summary>
                <ul className="mt-1 list-inside list-disc font-mono">
                  {aiRejection.map((code) => <li key={code}>{code}</li>)}
                </ul>
              </details>
            </div>
          )}
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
                ['ρ₁', 'Similitude', 'Superfície', metrics.similitude],
                ['ρ₂', 'Homologia', 'Estrutura', metrics.homology],
                ['ρ₃', 'Equivalência', 'Substituição', metrics.equivalence],
                ['ρ₄', 'Simetria', 'Transformação', metrics.symmetry],
                ['ρ₅', 'Equilíbrio', 'Equilíbrio', metrics.equilibrium],
                ['ρ₆', 'Compensação', 'Complementaridade emergente', metrics.compensation],
              ] as const).map(([rho, label, lens, value]) => (
                <div key={rho} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="font-mono text-xs text-amber-300">{rho}</div>
                  <div className="mt-1 text-xs text-slate-400">{label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-600">Lente · {lens}</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-100">{(value * 100).toFixed(1)}%</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {aiResult?.validation.status === 'VALID' && (
          <Card className="border-emerald-900/60 bg-slate-950/70">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-emerald-200">
                <ShieldCheck className="h-4 w-4" /> Observação validada pelo schema · {aiResult.provider}
              </CardTitle>
              <CardDescription className="text-slate-500">{aiResult.model}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-slate-300">{aiResult.summary}</p>
              <div className="space-y-3">
                {aiResult.observations.map((observation, index) => (
                  <div key={`${observation.claim}-${index}`} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                    <p className="text-sm text-slate-200">{observation.claim}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {observation.evidence.map((evidence, evidenceIndex) => (
                        <Badge key={evidenceIndex} variant="outline" className="border-emerald-400/20 text-emerald-300">
                          {evidence.field}: {typeof evidence.value === 'number' ? evidence.value.toFixed(3) : String(evidence.value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {aiResult.unknowns.length > 0 && (
                <div className="border-t border-slate-800 pt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Não determinado:</span> {aiResult.unknowns.join(' · ')}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SignificanceAnalyzer;
