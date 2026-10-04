import SignificanceAnalyzer from "@/components/SignificanceAnalyzer";
import ComparisonAnalyzer from "@/components/ComparisonAnalyzer";
import MetricGlossary from "@/components/MetricGlossary";
import SimulationMode from "@/components/SimulationMode";
import HistoryManager from "@/components/HistoryManager";
import ThesisAccordion from "@/components/ThesisAccordion";
import { Hexagon, Layers, Zap, BookOpen, Beaker, History, ArrowRight, GitCompareArrows, FileSearch, FlaskConical, ScanSearch, Bot } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "single", label: "Analisar", icon: Zap },
  { value: "compare", label: "Comparar", icon: Layers },
  { value: "simulate", label: "Simular", icon: Beaker },
  { value: "history", label: "Histórico", icon: History },
  { value: "glossary", label: "Método", icon: BookOpen },
];

const lenses = [
  { lens: "Superfície", rho: "ρ₁", formal: "Similitude", desc: "o quanto as partes do artefato se assemelham" },
  { lens: "Estrutura", rho: "ρ₂", formal: "Homologia", desc: "correspondência de estrutura interna entre as partes" },
  { lens: "Substituição", rho: "ρ₃", formal: "Equivalência", desc: "uma parte pode substituir outra no contexto" },
  { lens: "Transformação", rho: "ρ₄", formal: "Simetria", desc: "conexão por transformações reversíveis" },
  { lens: "Equilíbrio", rho: "ρ₅", formal: "Equilíbrio", desc: "tensões internas que se anulam mutuamente" },
  { lens: "Complementaridade emergente", rho: "ρ₆", formal: "Compensação", desc: "o déficit de uma parte é suprido por outra" },
] as const;

const useCases = [
  { icon: GitCompareArrows, text: "Comparar versões de um mesmo documento ou código" },
  { icon: Bot, text: "Comparar respostas de IAs diferentes ao mesmo pedido" },
  { icon: ScanSearch, text: "Explorar textos, códigos e documentos como artefatos relacionais" },
  { icon: FlaskConical, text: "Investigar hipóteses sobre corpora e coleções" },
  { icon: FileSearch, text: "Avaliar outputs de IA com um perfil quantitativo reproduzível" },
] as const;

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent pb-16">
      <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 shadow-lg shadow-amber-950/30">
              <Hexagon className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-amber-300">Hubstry · Deep Tech</div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">π√f(A) Lab</h1>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-white/10 bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Descubra como um artefato se relaciona.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            O HexaSign observa um artefato por seis dimensões relacionais e produz um perfil
            quantitativo experimental — da superfície à complementaridade emergente.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Textos", "Código", "Documentos", "Respostas de IA"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs text-slate-300"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
              <span className="text-slate-300">ρ₁…ρ₆</span>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <span className="text-slate-300">f⃗(A)</span>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <span className="text-slate-300">f(A)</span>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <span className="font-semibold text-amber-300">Π(A)</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Por que seis? Os seis graus relacionais compõem o vetor f⃗(A); a norma áurea f(A)
              pondera as dimensões mais profundas; Π(A) comprime o perfil em um único índice
              experimental. O formalismo completo está na aba Método.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <section className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            As seis lentes relacionais
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Rótulos didáticos — o vocabulário normativo é o formal (ρ₁…ρ₆), definido na aba Método.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lenses.map(({ lens, rho, formal, desc }) => (
              <div
                key={rho}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-xs text-amber-300">
                    {rho}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{formal}</span>
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Lente · {lens}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <ThesisAccordion />
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

        <section className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            O que você pode investigar
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p className="text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-amber-400/20 bg-slate-950/60 p-5">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
            A maioria das ferramentas reduz um artefato a uma única medida. O HexaSign propõe
            observá-lo por seis dimensões relacionais organizadas em um formalismo matemático
            próprio.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Uma tecnologia proprietária em pesquisa contínua pela Hubstry.
          </p>
        </section>
      </main>

      <footer className="mx-auto mt-10 max-w-7xl px-4 text-xs text-slate-600 md:px-6">
        Hubstry HexaSign Lab · experimental build
      </footer>
    </div>
  );
};

export default Index;
