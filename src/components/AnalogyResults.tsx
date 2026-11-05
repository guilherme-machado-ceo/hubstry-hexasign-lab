import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  type AnalogyAnalysis,
  type RelationKey,
  type RelationResult,
  MODALITY_LABEL,
  booleanProfile,
  goldenNorm,
} from "@/lib/engine";

const RHO: Record<RelationKey, string> = { rho1: "ρ₁", rho2: "ρ₂", rho3: "ρ₃", rho4: "ρ₄", rho5: "ρ₅", rho6: "ρ₆" };

const Decision = ({ value, status }: { value: boolean | null; status: RelationResult["status"] }) => {
  if (status === "aberta") return <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">aberta</span>;
  if (value === null) return <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">não estimável</span>;
  return value ? (
    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] text-emerald-300">aceita</span>
  ) : (
    <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[11px] text-rose-300">não aceita</span>
  );
};

const score = (s: number | null) => (s === null ? "—" : s.toFixed(3));

const formatValue = (v: unknown): string => {
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "sim" : "não";
  if (v === null || v === undefined) return "—";
  return String(v);
};

const RelationCard = ({ r, scopeLabel }: { r: RelationResult; scopeLabel: string }) => (
  <AccordionItem value={`${scopeLabel}-${r.key}`} className="rounded-lg border border-slate-800 bg-slate-950/60 px-4">
    <AccordionTrigger className="py-3 text-left hover:no-underline">
      <span className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-mono text-amber-300">{RHO[r.key]}</span>
        <span className="font-semibold text-slate-100">{r.name}</span>
        <span className="text-xs text-slate-500">· {scopeLabel}</span>
        <Decision value={r.accepted} status={r.status} />
      </span>
    </AccordionTrigger>
    <AccordionContent className="space-y-3 pb-4 text-xs leading-relaxed text-slate-300">
      <p>{r.summary}</p>
      {Object.keys(r.details).length > 0 && (
        <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(10rem,auto)_1fr]">
          {Object.entries(r.details).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-slate-500">{k}</dt>
              <dd className="break-words font-mono text-slate-300">{formatValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-slate-500">
        <strong className="text-slate-400">Propriedades:</strong> {r.properties}{" "}
        <strong className="text-slate-400">Grau de evidência:</strong> {r.grade}.
      </p>
    </AccordionContent>
  </AccordionItem>
);

export const AnalogyResults = ({ result }: { result: AnalogyAnalysis }) => {
  const twoEvents = result.events.length === 2;
  const bool = booleanProfile(result.profile);
  const theory = goldenNorm(result.profile.map((p) => (p.scores.length === 1 ? p.scores[0] : null)));
  const hesseLabel = (keys: RelationKey[]) => (keys.length ? keys.map((k) => RHO[k]).join(", ") : "nenhuma");

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-amber-400/20 bg-slate-950/60 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Perfil das seis relações</h3>
        <p className="mt-1 text-xs text-slate-400">
          Analogia {MODALITY_LABEL[result.modality].toLowerCase()} · fonte: {result.source} · motor {result.engineVersion}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 pr-3 font-medium">Relação</th>
                <th className="pb-2 pr-3 font-medium">{twoEvents ? "Escore A / B ou par" : "Escore A"}</th>
                <th className="pb-2 pr-3 font-medium">Decisão</th>
              </tr>
            </thead>
            <tbody>
              {result.profile.map((p) => (
                <tr key={p.key} className="border-t border-slate-800">
                  <td className="py-2 pr-3">
                    <span className="font-mono text-amber-300">{RHO[p.key]}</span>{" "}
                    <span className="text-slate-200">{p.name}</span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-slate-300">
                    {p.status === "aberta" ? "—" : p.scores.length ? p.scores.map(score).join(" / ") : "requer dois eventos"}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {p.status === "aberta" || !p.accepted.length ? (
                        <Decision value={null} status={p.status === "aberta" ? "aberta" : "nao-estimavel"} />
                      ) : (
                        p.accepted.map((a, i) => <Decision key={i} value={a} status={a === null ? "nao-estimavel" : "medida"} />)
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Classificação de Hesse</div>
            <p className="mt-1 text-xs text-slate-300">Positivas: {hesseLabel(result.hesse.positiva)}</p>
            <p className="text-xs text-slate-300">Negativas: {hesseLabel(result.hesse.negativa)}</p>
            <p className="text-xs text-slate-300">Neutras: {hesseLabel(result.hesse.neutra)}</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Perfil no reticulado B₆</div>
            <p className="mt-1 font-mono text-sm text-slate-200">({bool.map((b) => (b === null ? "·" : b)).join(", ")})</p>
            <p className="mt-1 text-[11px] text-slate-500">Um dos 64 perfis, sem cadeia de implicação; "·" = relação não medida.</p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Leitura teórica f(A) e Π(A)</div>
            <p className="mt-1 text-xs text-slate-300">
              {theory === null
                ? "Não calculada: exige as seis relações com escore definido, e ρ₅ e ρ₆ estão abertas."
                : `f(A) = ${theory.toFixed(4)}`}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Os pesos em potências da razão áurea são escolha teórica do autor, não resultado de medição.
            </p>
          </div>
        </div>
      </div>

      {result.events.map((e, i) => (
        <div key={i} className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-100">
            {e.label}: correspondência com a estrutura ideal
          </h4>
          {e.search.status === "ok" && e.search.best && (
            <p className="text-xs text-slate-400">
              Componentes por frequência: {e.search.components.map((c) => c.f.toFixed(2)).join(", ")} Hz · ordens do melhor ajuste:{" "}
              {e.search.best.orders.join(", ")}
            </p>
          )}
          <Accordion type="multiple" className="space-y-2">
            {e.relations.map((r) => (
              <RelationCard key={r.key} r={r} scopeLabel={e.label} />
            ))}
          </Accordion>
        </div>
      ))}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-100">{twoEvents ? "Relações entre os eventos e relações abertas" : "Relações abertas"}</h4>
        <Accordion type="multiple" className="space-y-2">
          {result.pair.map((r) => (
            <RelationCard key={r.key} r={r} scopeLabel={r.status === "aberta" ? "aberta" : "par A–B"} />
          ))}
        </Accordion>
      </div>

      <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-xs leading-relaxed text-slate-400">
        <strong className="text-slate-200">Limites desta versão:</strong> os modelos nulos são gerados em nível de componentes, e não a
        partir do sinal; a covariância entre componentes é tratada como diagonal; não há estimador independente da fundamental. Os
        resultados servem para exploração e para preparar fichas da Matriz de Correspondências Analógicas, não como medição validada.
      </p>
    </section>
  );
};

export default AnalogyResults;
