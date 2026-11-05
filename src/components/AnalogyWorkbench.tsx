import { useState } from "react";
import { Download, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventEditor, { type EventDraft } from "@/components/EventEditor";
import AnalogyResults from "@/components/AnalogyResults";
import {
  type AnalogyAnalysis,
  type AnalogyModality,
  type Params,
  DEFAULT_PARAMS,
  MODALITY_LABEL,
  analyzeAnalogy,
  generateHarmonicEvent,
  validateComponents,
} from "@/lib/engine";

const initialEvent = (label: string, scale: number, seed: number): EventDraft => ({
  label,
  components: generateHarmonicEvent({ f0: 16, orders: [1, 2, 3, 4, 5, 6], relSigma: 0.001, inharmonicity: 0, scale, seed }),
});

const PARAM_FIELDS: { key: keyof Params; label: string; hint: string }[] = [
  { key: "maxOrder", label: "Ordem máxima N", hint: "Maior ordem da estrutura ideal 𝓘_N." },
  { key: "deltaT", label: "Margem Δ_T", hint: "Define o conjunto H* de atribuições admissíveis." },
  { key: "z", label: "Limiar z (ρ₁)", hint: "Desvio normalizado máximo de um componente similar." },
  { key: "alpha", label: "Nível α (ρ₂)", hint: "Significância contra os modelos nulos." },
  { key: "nullB", label: "Nulos B por família", hint: "Quantidade de conjuntos nulos de cada família." },
  { key: "nullJitter", label: "Desvio do nulo inarmônico", hint: "Fração máxima de desafinação (0,05 = 5%)." },
  { key: "seed", label: "Semente dos nulos", hint: "Mesma semente, mesmos nulos." },
  { key: "marginR", label: "Margem m_r (ρ₄)", hint: "Dispersão residual máxima, em log-frequência." },
  { key: "marginT", label: "Margem m_t (ρ₄)", hint: "Inclinação máxima dos resíduos por ordem." },
];

export const AnalogyWorkbench = () => {
  const [modality, setModality] = useState<AnalogyModality>("homologica");
  const [eventA, setEventA] = useState<EventDraft>(() => initialEvent("Sintético A", 1, 1));
  const [eventB, setEventB] = useState<EventDraft>(() => initialEvent("Sintético B", 1.25, 2));
  const [useB, setUseB] = useState(true);
  const [params, setParams] = useState<Record<keyof Params, string>>(
    () => Object.fromEntries(Object.entries(DEFAULT_PARAMS).map(([k, v]) => [k, String(v)])) as Record<keyof Params, string>,
  );
  const [result, setResult] = useState<AnalogyAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    const parsed = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, Number(String(v).replace(",", "."))]),
    ) as unknown as Params;
    const badParam = Object.entries(parsed).find(([, v]) => !Number.isFinite(v) || v < 0);
    if (badParam || parsed.maxOrder < 2 || parsed.nullB < 1 || parsed.alpha <= 0 || parsed.alpha >= 1) {
      setError("Confira os parâmetros: todos numéricos e não negativos, N ≥ 2, B ≥ 1 e 0 < α < 1.");
      return;
    }
    parsed.maxOrder = Math.floor(parsed.maxOrder);
    parsed.nullB = Math.min(999, Math.floor(parsed.nullB));
    parsed.seed = Math.floor(parsed.seed);
    const events = useB ? [eventA, eventB] : [eventA];
    for (const e of events) {
      const msg = validateComponents(e.components);
      if (msg) {
        setError(`${e.label}: ${msg}`);
        return;
      }
    }
    setError(null);
    setRunning(true);
    // Cede um quadro para o indicador aparecer antes do cálculo síncrono.
    setTimeout(() => {
      try {
        setResult(analyzeAnalogy(events, parsed, modality));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha no cálculo.");
      } finally {
        setRunning(false);
      }
    }, 30);
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hexasign-analogia-${result.createdAt.replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h3 className="text-sm font-semibold text-slate-100">1. Declare a analogia</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Fonte: série harmônica ideal 𝓘_N, em que a relação entre as ordens m e n é a razão m/n.
          Alvo: um ou dois eventos medidos. A modalidade é declarada por você e não é deduzida do
          perfil: nenhuma modalidade fica presa a relações específicas.
        </p>
        <div className="mt-3 max-w-xs space-y-1">
          <Label className="text-xs text-slate-400">Modalidade da analogia</Label>
          <Select value={modality} onValueChange={(v) => setModality(v as AnalogyModality)}>
            <SelectTrigger className="border-slate-700 bg-slate-900 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MODALITY_LABEL) as AnalogyModality[]).map((m) => (
                <SelectItem key={m} value={m}>{MODALITY_LABEL[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-100">2. Informe os componentes espectrais</h3>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <Switch checked={useB} onCheckedChange={setUseB} aria-label="Usar o evento B" />
            Comparar com um segundo evento (ρ₃ e ρ₄)
          </label>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <EventEditor title="Evento A" value={eventA} onChange={setEventA} defaultScale={1} defaultSeed={1} />
          {useB && <EventEditor title="Evento B" value={eventB} onChange={setEventB} defaultScale={1.25} defaultSeed={2} />}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-slate-100">3. Parâmetros (fixe antes de medir)</summary>
          <p className="mt-2 text-xs text-slate-500">
            Os valores padrão são exemplos para exploração, não calibrações. Em pesquisa, fixe-os com sinais
            sintéticos antes de qualquer dado real.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PARAM_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs text-slate-300">{label}</Label>
                <Input
                  inputMode="decimal"
                  value={params[key]}
                  onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                  className="h-8 border-slate-700 bg-slate-900 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500">{hint}</p>
              </div>
            ))}
          </div>
        </details>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={running}>
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Calcular o perfil
        </Button>
        {result && (
          <Button variant="outline" onClick={exportJson} className="border-slate-700 bg-transparent">
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>

      {result && <AnalogyResults result={result} />}
    </div>
  );
};

export default AnalogyWorkbench;
