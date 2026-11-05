const RELATIONS = [
  {
    rho: "ρ₁",
    name: "Similitude",
    formal: "d(φ(x), φ(y)) < ε (Definição 3.1)",
    operational:
      "Cada componente é comparado à posição ideal da sua ordem, h_k·g, com a escala g estimada sem o próprio componente. O desvio normalizado u_k precisa ficar a até z desvios-padrão. A aprovação exige o critério em todas as atribuições de H*.",
    status: "Especificada",
  },
  {
    rho: "ρ₂",
    name: "Homologia",
    formal: "Homomorfismo entre estruturas, com o isomorfismo como caso máximo (Definição 3.2)",
    operational:
      "Busca exaustiva das atribuições de ordens injetivas, mínimas e que preservam a ordem das frequências. O melhor ajuste é comparado com duas famílias de conjuntos nulos, inarmônica e aleatória. A homologia só é aceita se o maior dos dois valores-p empíricos ficar abaixo de α.",
    status: "Especificada, condicionada ao modelo nulo",
  },
  {
    rho: "ρ₃",
    name: "Equivalência",
    formal: "Substituibilidade em todo contexto, ∀C: C[x] ≃ C[y] (Definição 3.3)",
    operational:
      "Dois eventos são equivalentes quando têm a mesma assinatura num conjunto finito de contextos fixados antes da medição. Nesta versão, os contextos são provisórios.",
    status: "Especificada na forma",
  },
  {
    rho: "ρ₄",
    name: "Simetria",
    formal: "Pertinência à mesma órbita sob um grupo de transformações (Definição 3.4)",
    operational:
      "Grupo das mudanças de escala de frequência, f ↦ a·f, que no domínio logarítmico é uma translação. Sobre as ordens comuns, ajusta-se d_k = ln a + β·(k − k̄). A simetria é aceita por teste de equivalência: τ abaixo de m_r e o intervalo de β dentro de ±m_t.",
    status: "Especificada",
  },
  {
    rho: "ρ₅",
    name: "Equilíbrio",
    formal: "Φ(x) + Φ(y) = 0 (Definição 3.5)",
    operational:
      "Aberta. Falta uma função Φ definida independentemente de qualquer ajuste: o resíduo de mínimos quadrados soma zero por construção e geraria um equilíbrio artificial.",
    status: "Aberta",
  },
  {
    rho: "ρ₆",
    name: "Compensação",
    formal: "Δ(x) = −Δ(y) e Ω(x ⊕ y) > Ω(x) + Ω(y) (Definição 3.6)",
    operational: "Aberta. Faltam as funções Δ e Ω e o significado da composição ⊕ para componentes espectrais.",
    status: "Aberta",
  },
];

export const MethodPanel = () => (
  <div className="space-y-6 text-sm leading-relaxed text-slate-300">
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <h3 className="text-base font-semibold text-slate-100">O que o HexaSign mede</h3>
      <p className="mt-2">
        O HexaSign instrumentaliza analogias entre estruturas relacionais. Uma analogia liga uma fonte, um sistema
        conhecido, a um alvo, o sistema investigado. As seis relações de significância descrevem o que se preserva
        nessa passagem. Nesta versão, a fonte é a série harmônica ideal e o alvo são componentes espectrais medidos.
      </p>
      <p className="mt-2">
        Três modalidades de analogia orientam o uso. A analogia heurística usa um sistema conhecido para orientar a
        exploração de outro, com o menor compromisso ontológico. A analogia funcional liga elementos que desempenham
        papéis equivalentes nos seus contextos. A analogia homológica afirma correspondência de estrutura entre sistemas
        distintos. Aqui, homologia não tem o sentido da biologia evolutiva, em que designa semelhança por descendência
        comum.
      </p>
    </section>

    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <h3 className="text-base font-semibold text-slate-100">Escolhas epistemológicas</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Falsificacionismo: cada relação tem critério de refutação próprio, fixado antes da medição.</li>
        <li>Modelo nulo obrigatório para qualquer afirmação de encaixe numa estrutura.</li>
        <li>Graus de evidência explícitos: estabelecido, demonstrado em simulação, conjecturado, argumentado ou especulado.</li>
        <li>
          Classificação de Mary Hesse: relações aceitas são analogias positivas, rejeitadas são negativas, e as não
          medidas são neutras.
        </li>
        <li>
          Correspondência estrutural avaliada pela preservação de relações, e não só de atributos, como propõe Dedre
          Gentner.
        </li>
        <li>
          As seis relações são reportadas separadamente, sem pressupor independência. A ordem ρ₁ … ρ₆ é conceitual,
          de exigência crescente, e não uma cadeia de implicação lógica.
        </li>
      </ul>
    </section>

    <section className="space-y-3">
      <h3 className="text-base font-semibold text-slate-100">As seis relações</h3>
      {RELATIONS.map((r) => (
        <div key={r.rho} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-0.5 font-mono text-xs text-amber-300">{r.rho}</span>
            <span className="font-semibold text-slate-100">{r.name}</span>
            <span className="text-xs text-slate-500">· {r.status}</span>
          </div>
          <p className="mt-2 font-mono text-xs text-slate-400">{r.formal}</p>
          <p className="mt-2 text-xs">{r.operational}</p>
        </div>
      ))}
    </section>

    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <h3 className="text-base font-semibold text-slate-100">Norma áurea e operador Π</h3>
      <p className="mt-2 font-mono text-xs text-slate-400">
        f(A) = √( Σ φ^(k−1) · ρ_k² ),&nbsp;&nbsp; Π(A) = [f(A)]^(1/π)
      </p>
      <p className="mt-2 text-xs">
        O manuscrito agrega o vetor das seis relações numa norma ponderada por potências da razão áurea φ e a comprime
        pelo operador Π. Esses pesos são uma escolha teórica, que pressupunha a hierarquia como implicação. O HexaSign
        apresenta o vetor sem agregação e só calcula essa leitura, rotulada como teórica, quando as seis relações têm
        escore definido.
      </p>
    </section>

    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
      <h3 className="text-base font-semibold text-slate-100">Fontes</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
        <li>
          G. G. Machado, "π√f(A): Uma Álgebra Hexarrelacional de Significância para Algoritmos" (2026), Definições 3.1 a
          3.6:{" "}
          <a className="text-amber-300 underline" href="https://doi.org/10.5281/zenodo.18776401" target="_blank" rel="noopener noreferrer">
            doi.org/10.5281/zenodo.18776401
          </a>
          .
        </li>
        <li>G. G. Machado, Teoria da Inflexão Cognitiva Analógica (TICA), v0.1 (2026), Seções 7.1 a 7.4: modalidades de analogia.</li>
        <li>
          Perfil operacional HMAL (Hubstry Marine Acoustic Layer, camada acústica marinha da Hubstry) das seis relações, v0.1.4,
          e ficha MCA-001 da Matriz de Correspondências Analógicas.
        </li>
        <li>M. Hesse, Models and Analogies in Science (1966); D. Gentner, Structure-mapping (1983).</li>
      </ul>
    </section>
  </div>
);

export default MethodPanel;
