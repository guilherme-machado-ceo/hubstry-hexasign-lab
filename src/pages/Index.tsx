import SignificanceAnalyzer from "@/components/SignificanceAnalyzer";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Hexagon } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-8 mb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 rounded-2xl mb-4">
            <Hexagon className="w-8 h-8 text-violet-600 animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            π√f(A) <span className="text-violet-600">Lab</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Framework de Álgebra Hexarrelacional de Significância. 
            Transformando teoria matemática em métricas de inteligência linguística.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        <SignificanceAnalyzer />
      </main>

      <footer className="mt-20">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;