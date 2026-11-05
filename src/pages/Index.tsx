import AnalogyWorkbench from "@/components/AnalogyWorkbench";
import MethodPanel from "@/components/MethodPanel";
import ThesisAccordion from "@/components/ThesisAccordion";
import { BookOpen, Hexagon, Workflow } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "workbench", label: "Analogia", icon: Workflow },
  { value: "method", label: "Método", icon: BookOpen },
];

const relations = [
  { rho: "ρ₁", name: "Similitude", desc: "proximidade de atributos: cada componente perto da posição ideal da sua ordem", status: "medida" },
  { rho: "ρ₂", name: "Homologia", desc: "preservação de estrutura: homomorfismo entre o observado e o ideal, testado contra nulos", status: "medida" },
  { rho: "ρ₃", name: "Equivalência", desc: "substituibilidade: mesma assinatura em contextos fixados", status: "medida" },
  { rho: "ρ₄", name: "Simetria", desc: "transformação de grupo: um evento é cópia do outro por mudança de escala", status: "medida" },
  { rho: "ρ₅", name: "Equilíbrio", desc: "anulação de potenciais; definição operacional ainda aberta", status: "aberta" },
  { rho: "ρ₆", name: "Compensação", desc: "complementaridade com emergência; definição operacional ainda aberta", status: "aberta" },
] as const;

const Index = () => (
  <div className="min-h-screen bg-transparent pb-16">
    <header className="border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 shadow-lg shadow-amber-950/30">
            <Hexagon className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.24em] text-amber-300">Hubstry · Deep Tech</div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">HexaSign Lab</h1>
          </div>
        </div>
      </div>
    </header>

    <section className="border-b border-white/10 bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
          O que uma analogia realmente preserva?
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
          O HexaSign testa analogias heurísticas, funcionais e homológicas entre estruturas relacionais com
          grandezas físicas, pelas seis relações de significância da Álgebra Hexarrelacional. Primeiro domínio:
          a série harmônica.
        </p>
      </div>
    </section>

    <main className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
      <section className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {relations.map(({ rho, name, desc, status }) => (
            <div key={rho} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-xs text-amber-300">{rho}</span>
                <span className="text-sm font-semibold text-slate-100">{name}</span>
                <span className={`ml-auto text-[11px] ${status === "medida" ? "text-emerald-300" : "text-slate-500"}`}>{status}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ThesisAccordion />

      <Tabs defaultValue="workbench" className="w-full">
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
        <TabsContent value="workbench"><AnalogyWorkbench /></TabsContent>
        <TabsContent value="method"><MethodPanel /></TabsContent>
      </Tabs>
    </main>

    <footer className="mx-auto mt-10 max-w-7xl px-4 text-xs text-slate-600 md:px-6">
      Hubstry HexaSign Lab · instrumento experimental de analogias estruturais
    </footer>
  </div>
);

export default Index;
