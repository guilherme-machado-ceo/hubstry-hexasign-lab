import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpen, ExternalLink } from "lucide-react";

const ZENODO_URL = "https://doi.org/10.5281/zenodo.18776401";

export const ThesisAccordion = () => {
  return (
    <Accordion type="single" collapsible className="mb-6 w-full">
      <AccordionItem
        value="tese"
        className="rounded-xl border border-amber-400/20 bg-slate-950/60 px-5 backdrop-blur-xl"
      >
        <AccordionTrigger className="text-left hover:no-underline">
          <span className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 shrink-0 text-amber-300" />
            <span>
              <span className="block text-base font-semibold text-slate-100">
                A tese por trás do HexaSign
              </span>
              <span className="block text-xs font-normal text-slate-400">
                O que este laboratório investiga, em linguagem simples — com link para o paper completo
              </span>
            </span>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-5 text-sm leading-relaxed text-slate-300">
          <p>
            Todo texto, código ou ideia é uma teia de relações. Nós tendemos a perguntar{" "}
            <em>quanto</em> algo significa — esta pesquisa pergunta <strong>como</strong> algo
            significa.
          </p>
          <p>
            A teoria π√f(A), publicada em acesso aberto, propõe que a significância de um
            artefato pode ser <strong>investigada por meio de suas relações</strong>. São seis
            relações fundamentais: o quanto os elementos de um artefato se{" "}
            <strong>assemelham</strong> (similitude), se{" "}
            <strong>correspondem em estrutura</strong> (homologia), podem{" "}
            <strong>se substituir</strong> em um contexto (equivalência), se{" "}
            <strong>espelham</strong> (simetria), se <strong>equilibram</strong> (equilíbrio) e
            se <strong>completam</strong> gerando valor novo (compensação).
          </p>
          <p>
            Essas seis medidas são combinadas por uma fórmula inspirada na razão áurea — que dá
            mais peso às relações mais profundas — e comprimidas em um único número, o Π(A),
            usando a raiz de ordem π.
          </p>
          <p>
            Neste laboratório, <strong>o motor matemático é determinístico</strong>: o mesmo
            texto sempre gera os mesmos números. A inteligência artificial apenas{" "}
            <strong>lê e explica</strong> esses números — ela não pode criá-los nem alterá-los.
          </p>
          <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-slate-400">
            <strong className="text-slate-200">Transparência:</strong> nesta versão experimental,
            as seis relações são estimadas por uma aproximação determinística simplificada. A
            implementação da camada relacional completa descrita no paper permanece como linha
            de desenvolvimento da pesquisa.
          </p>
          <a
            href={ZENODO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 font-medium text-amber-200 transition-colors hover:bg-amber-400/20"
          >
            <ExternalLink className="h-4 w-4" />
            Ler o paper completo no Zenodo
          </a>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ThesisAccordion;
