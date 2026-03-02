import { useState } from "react";
import SignificanceAnalyzer from "@/components/SignificanceAnalyzer";
import ComparisonAnalyzer from "@/components/ComparisonAnalyzer";
import MetricGlossary from "@/components/MetricGlossary";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Hexagon, Layers, Zap, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-8 mb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-2xl mb-4">
            <Hexagon className="w-8 h-8 text-violet-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            π√f(A) <span className="text-violet-600">Lab</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Framework de Álgebra Hexarrelacional de Significância. 
            Mapeando a densidade de significado em artefatos linguísticos.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <Tabs defaultValue="single" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-slate-200/50 p-1">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Zap className="w-4 h-4" /> Análise Única
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> Comparação (A/B)
              </TabsTrigger>
              <TabsTrigger value="glossary" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Glossário
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="single">
            <SignificanceAnalyzer />
          </TabsContent>
          
          <TabsContent value="compare">
            <ComparisonAnalyzer />
          </TabsContent>

          <TabsContent value="glossary">
            <MetricGlossary />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-20">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;