import { useState } from "react";
import SignificanceAnalyzer from "@/components/SignificanceAnalyzer";
import ComparisonAnalyzer from "@/components/ComparisonAnalyzer";
import MetricGlossary from "@/components/MetricGlossary";
import SimulationMode from "@/components/SimulationMode";
import HistoryManager from "@/components/HistoryManager";
import { Hexagon, Layers, Zap, BookOpen, Beaker, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "single", label: "Analisar", icon: Zap },
  { value: "compare", label: "Comparar", icon: Layers },
  { value: "simulate", label: "Simular", icon: Beaker },
  { value: "history", label: "Histórico", icon: History },
  { value: "glossary", label: "Método", icon: BookOpen },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent pb-16">
      <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 shadow-lg shadow-amber-950/30">
                <Hexagon className="h-7 w-7 text-amber-300" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.24em] text-amber-300">Hubstry · Deep Tech</div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">π√f(A) Lab</h1>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400 md:text-right">
              Ambiente experimental para análise, comparação e simulação do vetor hexarrelacional de significância.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="mb-6 h-auto w-full justify-start gap-1 overflow-x-auto border border-white/10 bg-slate-900/80 p-1 md:w-fit">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-2 rounded-lg px-4 py-2 text-slate-400 data-[state=active]:bg-amber-400/10 data-[state=active]:text-amber-200"
              >
                <Icon className="h-4 w-4" /> {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="single"><SignificanceAnalyzer /></TabsContent>
          <TabsContent value="compare"><ComparisonAnalyzer /></TabsContent>
          <TabsContent value="simulate"><SimulationMode /></TabsContent>
          <TabsContent value="history"><HistoryManager /></TabsContent>
          <TabsContent value="glossary"><MetricGlossary /></TabsContent>
        </Tabs>
      </main>

      <footer className="mx-auto mt-10 max-w-7xl px-4 text-xs text-slate-600 md:px-6">
        Hubstry HexaSign Lab · experimental build
      </footer>
    </div>
  );
};

export default Index;
