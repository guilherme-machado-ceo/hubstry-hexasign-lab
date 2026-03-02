"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, History, ExternalLink, Copy, Check } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

interface HistoryItem {
  id: string;
  text: string;
  score: number;
  date: string;
}

const HistoryManager = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hexa-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('hexa-history');
    setHistory([]);
    showSuccess("Histórico limpo com sucesso.");
  };

  const copyToClipboard = (item: HistoryItem) => {
    const report = `π√f(A) Report\nScore: ${item.score.toFixed(4)}\nData: ${item.date}\nArtefato: ${item.text}`;
    navigator.clipboard.writeText(report);
    setCopiedId(item.id);
    showSuccess("Relatório copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-400 font-medium">Nenhum experimento salvo ainda.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-violet-600" />
          Log de Experimentos
        </h3>
        <Button variant="destructive" size="sm" onClick={clearHistory} className="rounded-full">
          <Trash2 className="w-4 h-4 mr-2" /> Limpar Tudo
        </Button>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <Card key={item.id} className="group hover:border-violet-200 transition-all">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-black text-violet-600">{item.score.toFixed(4)}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                </div>
                <p className="text-sm text-slate-600 truncate italic">"{item.text}"</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(item)}>
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryManager;