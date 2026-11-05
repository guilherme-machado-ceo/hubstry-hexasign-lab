import { useState } from "react";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Component, generateHarmonicEvent, LIMITS } from "@/lib/engine";

export interface EventDraft {
  label: string;
  components: Component[];
}

interface Props {
  title: string;
  value: EventDraft;
  onChange: (next: EventDraft) => void;
  defaultScale?: number;
  defaultSeed?: number;
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(",", ".")));

export const EventEditor = ({ title, value, onChange, defaultScale = 1, defaultSeed = 1 }: Props) => {
  const [gen, setGen] = useState({
    f0: "16",
    orders: "1, 2, 3, 4, 5, 6",
    relSigma: "0.1",
    inharmonicity: "0",
    scale: String(defaultScale),
    seed: String(defaultSeed),
  });
  const [genError, setGenError] = useState<string | null>(null);

  const setComponent = (i: number, key: keyof Component, raw: string) => {
    const components = value.components.map((c, j) => (j === i ? { ...c, [key]: num(raw) } : c));
    onChange({ ...value, components });
  };

  const generate = () => {
    const orders = gen.orders.split(/[,;\s]+/).filter(Boolean).map(Number);
    const spec = {
      f0: num(gen.f0),
      orders,
      relSigma: num(gen.relSigma) / 100,
      inharmonicity: num(gen.inharmonicity) / 100,
      scale: num(gen.scale),
      seed: Math.floor(num(gen.seed)),
    };
    const bad =
      !(spec.f0 > 0) || !(spec.relSigma > 0) || !(spec.inharmonicity >= 0) || !(spec.scale > 0) ||
      !Number.isFinite(spec.seed) || orders.length < 2 || orders.length > LIMITS.maxComponents ||
      orders.some((n) => !Number.isInteger(n) || n < 1) || new Set(orders).size !== orders.length;
    if (bad) {
      setGenError(`Confira os campos: f0, σ e escala positivos; de 2 a ${LIMITS.maxComponents} ordens inteiras e distintas.`);
      return;
    }
    setGenError(null);
    onChange({ ...value, components: generateHarmonicEvent(spec) });
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
        <Input
          aria-label={`Nome do ${title}`}
          value={value.label}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          className="h-8 w-48 border-slate-700 bg-slate-900 text-xs"
        />
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2 font-medium">Frequência (Hz)</th>
              <th className="pb-2 font-medium">Incerteza σ (Hz)</th>
              <th className="pb-2 font-medium">Amplitude</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {value.components.map((c, i) => (
              <tr key={i}>
                {(["f", "sigmaF", "amp"] as const).map((key) => (
                  <td key={key} className="pb-1 pr-2">
                    <Input
                      inputMode="decimal"
                      aria-label={`${key} do componente ${i + 1}`}
                      value={Number.isFinite(c[key]) ? String(c[key]) : ""}
                      onChange={(e) => setComponent(i, key, e.target.value)}
                      className="h-8 min-w-[5rem] border-slate-700 bg-slate-900 font-mono text-xs"
                    />
                  </td>
                ))}
                <td className="pb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remover componente ${i + 1}`}
                    onClick={() => onChange({ ...value, components: value.components.filter((_, j) => j !== i) })}
                    className="h-8 w-8 text-slate-500 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={value.components.length >= LIMITS.maxComponents}
        onClick={() => onChange({ ...value, components: [...value.components, { f: NaN, sigmaF: NaN, amp: 1 }] })}
        className="mt-2 border-slate-700 bg-transparent text-xs"
      >
        <Plus className="mr-1 h-3 w-3" /> Componente
      </Button>

      <details className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-300">Gerar sinal sintético</summary>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {([
            ["f0", "Fundamental f₀ (Hz)"],
            ["orders", "Ordens presentes"],
            ["relSigma", "Incerteza σ (% de f)"],
            ["inharmonicity", "Inarmonicidade máx. (%)"],
            ["scale", "Fator de escala"],
            ["seed", "Semente"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-[11px] text-slate-400">{label}</Label>
              <Input
                value={gen[key]}
                onChange={(e) => setGen({ ...gen, [key]: e.target.value })}
                className="h-8 border-slate-700 bg-slate-900 font-mono text-xs"
              />
            </div>
          ))}
        </div>
        {genError && <p className="mt-2 text-xs text-red-300">{genError}</p>}
        <Button size="sm" onClick={generate} className="mt-3 text-xs">
          <Wand2 className="mr-1 h-3 w-3" /> Gerar
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Cada componente é n·f₀·escala, com desvio uniforme até a inarmonicidade e ruído gaussiano de desvio σ.
          A mesma semente gera sempre os mesmos valores.
        </p>
      </details>
    </div>
  );
};

export default EventEditor;
