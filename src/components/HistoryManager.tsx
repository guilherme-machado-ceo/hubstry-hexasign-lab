"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, History, Copy, Check, Download } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface HistoryItem {
  id: string;
  text: string;
  score: number;
  date: string;
}

const STORAGE_KEY = 'hexa-history';

const HistoryManager = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    showSuccess('Histórico limpo com sucesso.');
  };

  const copyToClipboard = async (item: HistoryItem) => {
    const report = [
      'π√f(A) Report',
      `Score Π(A): ${item.score.toFixed(5)}`,
      `Data: ${item.date}`,
      `Artefato: ${item.text}`,
    ].join('\n');

    await navigator.clipboard.writeText(report);
    setCopiedId(item.id);
    showSuccess('Relatório copiado.');
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hexa-history.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-20 text-center">
        <History className="mx-auto mb-4 h-10 w-10 text-slate-600" />
        <p className="font-medium text-slate-300">Nenhum experimento salvo.</p>
        <p className="mt-1 text-sm text-slate-500">As análises executadas aparecem aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            <History className="h-4 w-4" /> Histórico local
          </div>
          <p className="mt-1 text-sm text-slate-500">{history.length} experimento(s) neste navegador.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportHistory} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
          <Button variant="outline" onClick={clearHistory} className="border-rose-500/30 bg-rose-500/5 text-rose-300 hover:bg-rose-500/10">
            <Trash2 className="mr-2 h-4 w-4" /> Limpar
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {history.map((item) => (
          <Card key={item.id} className="border-slate-800 bg-slate-950/70">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xl font-semibold text-amber-300">{item.score.toFixed(5)}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{item.date}</span>
                </div>
                <p className="mt-2 truncate text-sm text-slate-300">{item.text}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(item)} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryManager;
