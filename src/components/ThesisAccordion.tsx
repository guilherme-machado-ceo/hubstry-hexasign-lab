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
            Uma analogia diz que algo de um sistema conhecido vale também para outro. A pergunta desta pesquisa é{" "}
            <strong>o que exatamente se preserva</strong> nessa passagem, e com que grau de evidência.
          </p>
          <p>
            A teoria π√f(A), publicada em acesso aberto, propõe seis relações de significância para responder a
            isso: dois sistemas podem se <strong>assemelhar</strong> (similitude), <strong>corresponder em
            estrutura</strong> (homologia), <strong>substituir-se</strong> em contextos fixados (equivalência),{" "}
            <strong>transformar-se um no outro</strong> (simetria), <strong>equilibrar-se</strong> (equilíbrio) ou{" "}
            <strong>completar-se</strong> gerando algo novo (compensação).
          </p>
          <p>
            O HexaSign transforma essas relações em testes. Cada uma tem definição operacional, tolerância, modelo
            nulo e critério de refutação. O primeiro domínio é a série harmônica: o laboratório verifica o quanto
            componentes espectrais medidos preservam a estrutura de razões entre ordens harmônicas.
          </p>
          <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-slate-400">
            <strong className="text-slate-200">Transparência:</strong> o motor é determinístico, e a mesma entrada com
            a mesma semente gera sempre o mesmo resultado. Quatro relações estão operacionalizadas; equilíbrio e
            compensação continuam abertas e aparecem como tal, sem número inventado.
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
