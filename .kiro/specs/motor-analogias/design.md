# Design: motor determinístico de criação de analogias

## Visão geral

O motor é uma biblioteca TypeScript sem dependências em tempo de execução, chamada aqui de núcleo. Em volta dela ficam três adaptadores finos: CLI (Command-Line Interface, interface de linha de comando), API HTTP e página web. O núcleo não acessa rede, relógio, gerador aleatório, modelos de linguagem nem APIs específicas de Node.js ou navegador. Uma etapa opcional de extração de textos fica fora do núcleo e deste MVP.

A escolha do TypeScript segue a pilha atual do repositório. O algoritmo compartilhado roda no navegador e no Node.js. A canonização de bytes também é compartilhada; somente o adaptador de SHA-256 varia por ambiente.

A semântica de ρ₆ usada no MVP é provisória e aparece na configuração como `semanticaRho6: "emergencia-v1"`. Pesos graduais de correspondência e agregação teórica não pertencem ao MVP.

## Arquitetura

```text
domínio JSON ──► validar ──► normalizar ──► canonizar ──► núcleo puro
                                                               │
                   ┌───────────────────────────────────────────┼───────────────────────────┐
             relações (ρ₁…ρ₆)                    busca gulosa/exata                 inferências
                   │                                      │
             perfil vetorial          configuração versionada de modalidades
                                                               │
                                          canonizar saída ──► SHA-256 no adaptador
```

Estrutura de pastas proposta:

```text
src/motor/
  esquema.ts          # tipos, normalização e validação do domínio
  canonico.ts         # ordenação, quantização e bytes canônicos
  correspondencia.ts  # correspondência unitária e índices
  relacoes/
    rho1-similitude.ts
    rho2-homologia.ts
    rho3-equivalencia.ts
    rho4-simetria.ts
    rho5-equilibrio.ts
    rho6-compensacao.ts
  busca/
    hipoteses.ts
    nucleos.ts
    sistematicidade.ts
    gulosa.ts
    exata.ts
    orcamento.ts
  modalidades.ts
  inferencia.ts
  operacoes.ts
  index.ts
config/modalidades.v1.json
validacao/
  criterios.v1.md       # registro original preservado
  criterios.v1.1.md     # versão vigente para H1
  casos-classicos/
  gerador-gentner.ts
  resultados/
scripts/motor-cli.ts
server/motor-api.mjs
```

A agregação teórica futura pode ocupar `src/motor/teoria.ts`, mas esse arquivo não faz parte do MVP.

## Modelo de dados

```ts
type Classe = 'comum' | 'oposicao' | 'emergencia';
type GrupoNumerico = 'escala' | 'monotono';

type DefinicaoAtributo =
  | { tipo: 'categorico' }
  | {
      tipo: 'numerico';
      unidade: string;
      grupo?: GrupoNumerico;
      potencial?: boolean;
    };

type ValorAtributo = string | number;

interface Entidade {
  id: string;
  atributos: Record<string, ValorAtributo>;
  capacidades: string[];
}

interface Predicado {
  nome: string;
  aridade: number;
  classe: Classe;
  simetrico: boolean;
  capacidadesExigidas?: string[];
}

type Referencia =
  | { tipo: 'entidade'; id: string }
  | { tipo: 'relacao'; id: string };

interface Relacao {
  id: string;
  predicado: string;
  args: Referencia[];
}

interface Dominio {
  id: string;
  esquemaAtributos: Record<string, DefinicaoAtributo>;
  entidades: Entidade[];
  predicados: Predicado[];
  relacoes: Relacao[];
}

interface CorrespondenciaPredicado {
  fonte: string;
  alvo: string;
  peso: 1;
}

type TabelaCorrespondencia = CorrespondenciaPredicado[];

type Perfil = readonly [
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
];

type PerfilBinario = readonly [
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
  0 | 1 | null,
];

interface Mapeamento {
  pares: ReadonlyArray<readonly [fonte: string, alvo: string]>;
}

interface VersoesRelacoes {
  rho1: string;
  rho2: string;
  rho3: string;
  rho4: string;
  rho5: string;
  rho6: string;
}
```

IDs são únicos dentro do próprio namespace. As referências discriminadas eliminam ambiguidade entre IDs de entidade e relação. Strings são normalizadas para NFC antes da validação de unicidade. Quando presente, `PerfilBinario` admite 3⁶ = 729 estados; os 64 estados de `{0,1}⁶` são o subconjunto sem `null`.

O esquema rejeita:

- números não finitos;
- valores incompatíveis com o esquema de atributos;
- mais de um atributo potencial;
- oposição que não seja binária e simétrica;
- emergência com aridade menor que dois, argumento relacional ou capacidades exigidas vazias;
- relações estruturalmente duplicadas;
- referências inexistentes e ciclos;
- IDs iniciados por `hip:` ou `proj:`;
- correspondência com peso diferente de 1, aridade, classe ou simetria incompatível.

O validador será próprio e sem dependência nova em tempo de execução.

## Configuração versionada

Formato previsto para `config/modalidades.v1.json`:

```json
{
  "versao": "1.0.0",
  "semanticaRho6": "emergencia-v1",
  "heuristica": {
    "exige": { "rho1": 0.5 },
    "ordem": ["rho1", "rho2", "chaveCanonica"]
  },
  "funcional": {
    "exige": { "rho3": 0.5 },
    "ordem": ["rho3", "rho2", "chaveCanonica"]
  },
  "homologica": {
    "exige": { "rho2": 0.6 },
    "ordem": ["sistematicidade", "rho1", "chaveCanonica"]
  },
  "gentner": {
    "rho1Alto": 0.6,
    "rho2Alto": 0.6
  },
  "correspondencias": {
    "pesosPermitidos": [1]
  },
  "limiaresBinarios": null,
  "tolerancias": {
    "rho4LogEscala": 0.05,
    "rho5Equilibrio": 0.05
  },
  "limites": {
    "entidadesPorDominio": 200,
    "relacoesPorDominio": 1000,
    "predicadosPorDominio": 200,
    "atributosPorEntidade": 100,
    "aridade": 16,
    "profundidadeRelacional": 100,
    "dominiosBiblioteca": 100,
    "hipotesesLocais": 250000,
    "nucleos": 50000,
    "entidadesBuscaExata": 8,
    "mapeamentosParciaisBuscaExata": 1441729
  }
}
```

Os limiares e tolerâncias são valores operacionais provisórios. A Tarefa 1 deve registrá-los antes de qualquer código de validação. `limiaresBinarios: null` omite o perfil binário; quando configurado, deve conter um limiar para cada ρ.

A configuração é validada e canonizada como parte da entrada efetiva. Seu SHA-256 é registrado separadamente.

## Avaliação das relações

Cada módulo em `relacoes/` exporta uma função pura e uma versão de definição:

```ts
interface ContextoAvaliacao {
  correspondencias: TabelaCorrespondencia;
  config: ConfiguracaoMotor;
  indicesFonte: IndicesDominio;
  indicesAlvo: IndicesDominio;
}

type AvaliadorRelacao = (
  fonte: Dominio,
  alvo: Dominio,
  mapeamento: Mapeamento,
  contexto: ContextoAvaliacao,
) => number | null;

export const VERSAO_DEFINICAO = 'rhoN-v1';
```

Toda função retorna `null` quando não existe material avaliável. `NaN`, infinito e valor fora de [0, 1] constituem erro interno.

### ρ₁

Para cada entidade da fonte com ao menos um atributo, calcula-se uma contribuição local. Se a entidade não estiver mapeada, a contribuição é zero. Se estiver mapeada, a união de atributos forma o denominador local: atributo ausente de um lado contribui zero; atributo presente nos dois lados com tipos diferentes ou, no caso numérico, unidades diferentes permanece uma única vez na união e contribui zero. O caso numérico zero-zero vale 1.

ρ₁ é a soma dessas contribuições dividida pela quantidade de entidades da fonte com ao menos um atributo. Entidades da fonte sem atributos ficam fora, mesmo se estiverem mapeadas para entidades-alvo com atributos. Se a fonte não tiver nenhuma entidade com atributos, o resultado é `null`. Esse denominador fixo penaliza cobertura incompleta do mapeamento.

A diferença numérica deve evitar overflow por uma forma escalada equivalente quando os valores forem muito grandes.

### ρ₂

As relações são processadas em ordem topológica. Uma relação tem imagem quando há no alvo uma relação de predicado correspondente cujos argumentos canônicos são as imagens dos argumentos da fonte. Relações aninhadas usam as imagens já resolvidas das sub-relações. Relação com entidade ou sub-relação sem imagem não é preservada.

Como relações estruturalmente duplicadas são inválidas, uma busca indexada pela assinatura canônica resolve a existência sem problema de multiplicidade. Fonte sem relações produz `null`.

`rho2 = 1` representa preservação relacional completa do suporte. Isomorfismo exige bijeção de todas as entidades e preservação bidirecional de todas as relações.

### ρ₃

Papéis são pares `(predicadoNormalizado, posição)`. Apenas ocorrências diretas contam. Predicados simétricos usam a posição `*`. Todas as entidades da fonte entram no denominador de ρ₃. Entidade não mapeada contribui zero; entidade mapeada contribui seu índice de Jaccard, com Jaccard vazio-vazio igual a 1. Fonte sem entidades produz `null`. O denominador fixo penaliza cobertura incompleta e torna o escore agregado direcional.

### ρ₄

Para cada atributo de escala presente em pelo menos três pares, calculam-se razões `alvo/fonte`. Se qualquer razão observada for não positiva ou não finita, o atributo inteiro é não avaliável.

Calcula-se:

```text
logR[i] = ln(valorAlvo[i] / valorFonte[i])
logA = mediana(logR)
distancia[i] = quantizar12(|logR[i] - logA|)
dentro(i) = distancia[i] <= toleranciaLogEscala
escoreEscala = quantidadeDentro / quantidadeAvaliada
```

Com quantidade par, a mediana é a média dos dois valores centrais. O escore do atributo de escala é a fração dos pares avaliados que ficam dentro da tolerância. Essa formulação é simétrica sob inversão dos domínios: inverter troca o sinal dos logaritmos sem mudar as distâncias à mediana.

Para grupo monótono, usa-se Kendall τ-b. O algoritmo conta concordâncias, discordâncias e empates de modo determinístico; denominador zero torna o atributo não avaliável. ρ₄ é a média dos atributos avaliáveis.

### ρ₅

Enumera-se cada par não ordenado de entidades da fonte uma vez. Há no máximo um atributo potencial por domínio. Dentro de cada domínio, pares numéricos usam os dois valores definidos pelo único esquema potencial e por sua unidade. O caso zero-zero satisfaz a condição exata. Pares de oposição vêm somente de predicados binários e simétricos.

Um par-fonte preservado pode aparecer no alvo por qualquer dos dois mecanismos. Cada domínio avalia seus pares pelo próprio atributo potencial e sua unidade; nome e unidade podem diferir entre fonte e alvo. Pares com membro sem imagem contam como não preservados. Fonte sem pares equilibrados produz `null`.

### ρ₆

A entidade possui capacidades pela lista explícita `capacidades`. Para cada emergência, os conjuntos dos argumentos devem ser disjuntos dois a dois e a união deve cobrir as capacidades exigidas; capacidades extras são permitidas.

A instância só é preservada quando sua imagem relacional existe e os argumentos-alvo também são complementares. A saída registra `semanticaRho6: "emergencia-v1"`. Fonte sem emergência produz `null`.

## Sistematicidade

A profundidade de uma relação básica é zero. A profundidade de uma relação que recebe relações como argumentos é `1 + maior profundidade` entre essas sub-relações. Como o domínio é acíclico, a profundidade é calculada em ordem topológica e limitada pela configuração.

O peso de uma relação é `1 + profundidade`. Para um mapeamento:

```text
sistematicidade =
  soma dos pesos das relações preservadas /
  soma dos pesos de todas as relações da fonte
```

A pontuação fica em [0, 1] e é `null` quando a fonte não contém relações. A conectividade é favorecida na construção dos núcleos: cada núcleo nasce de uma hipótese raiz e inclui recursivamente sua estrutura conectada. A sistematicidade não substitui ρ₂; na modalidade homológica, ρ₂ é o filtro e a sistematicidade é o primeiro critério de ordenação.

## Busca

### Hipóteses locais

Relações candidatas são indexadas por `(predicadoNormalizado, aridade, classe, simetria)`. Formam-se hipóteses locais para todos os pares compatíveis em qualquer nível das duas estruturas, evitando o produto cartesiano quando não há correspondência. Nas modalidades heurística e funcional, pares de entidades podem iniciar núcleos quando sua medida local é maior que zero.

As hipóteses são produzidas por iterador em ordem canônica. A implementação não materializa mais hipóteses do que o orçamento permite.

### Núcleos

Uma hipótese local estruturalmente consistente é raiz quando não aparece como par de argumentos de nenhuma outra hipótese local estruturalmente consistente. Cada hipótese raiz é percorrida iterativamente, não por recursão irrestrita. A expansão desce pelos argumentos em ordem canônica, consulta resultados memoizados para sub-relações compartilhadas e rejeita qualquer conflito de injetividade. O índice `relacoesNivelMaisAlto` pode existir para diagnóstico, mas não participa da escolha das raízes nem da formação dos núcleos.

A chave de um núcleo é a serialização canônica de seus pares de entidade e pares de relação. Núcleos repetidos são descartados.

### Fusão gulosa

Núcleos são ordenados pela tupla da modalidade e pela chave canônica. A fusão começa de cada um dos três melhores núcleos e acrescenta núcleos compatíveis. Após a fusão:

1. mapeamentos idênticos são deduplicados;
2. perfis completos são recalculados;
3. limiares são aplicados;
4. resultados são novamente ordenados pela tupla total da modalidade;
5. somente os três primeiros são devolvidos.

Essa estratégia é heurística e não afirma encontrar os três ótimos globais.

### Busca exata

A busca exata enumera funções parciais injetivas. Para `n` entidades na fonte e `m` no alvo, o espaço antes da poda é:

```text
Σ(k=0..min(n,m)) C(n,k) × C(m,k) × k!
```

Para 8×8, o total é 1.441.729. O algoritmo decide as entidades da fonte em ordem canônica e, para cada uma, percorre primeiro alvos compatíveis em ordem canônica e depois a opção não mapeada.

A poda deve ser admissível:

- uma ramificação pode ser descartada quando não consegue mais alcançar o limiar obrigatório;
- para ρ₂ e sistematicidade, o limite superior soma às relações já preservadas todas as relações ainda não decididas como se pudessem ser preservadas;
- para ρ₁, o denominador é a quantidade fixa de entidades da fonte com atributos, e o limite superior é `(soma das contribuições já decididas + entidades avaliáveis ainda não decididas) / denominador`;
- para ρ₃, o denominador é a quantidade fixa de entidades da fonte, e o limite superior é `(soma das contribuições já decididas + entidades ainda não decididas) / denominador`;
- em ambos, cada entidade ainda não decidida recebe contribuição máxima 1;
- uma ramificação só é descartada por ranking quando sua melhor tupla possível é estritamente inferior à pior tupla incumbente;
- igualdade não pode ser podada enquanto a chave canônica ainda puder alterar o desempate.

A busca mantém no máximo três incumbentes. Contadores de nós visitados, podados e avaliados entram no relatório H5. A referência exata nunca usa aproximação para eliminar uma ramificação.

## Operações e contratos

### Resultado comum

```ts
interface MetadadosResultado {
  versaoMotor: string;
  versaoConfig: string;
  resumoConfig: string;
  resumoEntrada: string;
  resumoSaida: string; // hash do resultado sem este campo
  semanticaRho6: 'emergencia-v1';
  versoesRelacoes: VersoesRelacoes;
}

interface AvaliacaoMapeamento {
  mapeamento: Mapeamento;
  perfil: Perfil;
  perfilBinario?: PerfilBinario;
  sistematicidade: number | null;
  isomorfismo: boolean;
  categoriaGentner:
    | 'semelhanca-literal'
    | 'analogia'
    | 'aparencia-superficial'
    | 'anomalia'
    | 'indeterminado';
  justificativaDiagnostico?: string;
  alertas: string[];
  inferencias: Inferencia[];
  chaveCanonica: string;
}
```

`resumoSaida` é calculado pelo adaptador depois que o núcleo devolve o payload. Para evitar autorreferência, o campo é omitido durante a canonização usada nesse hash.

### `mapear`

```ts
interface EntradaMapear {
  fonte: Dominio;
  alvo: Dominio;
  modalidade: Modalidade;
  config: ConfiguracaoMotor;
  correspondencias?: TabelaCorrespondencia;
  estrategia?: 'gulosa' | 'exata';
}

interface MelhorCandidatoRejeitado {
  mapeamento: Mapeamento;
  perfil: Perfil;
  sistematicidade: number | null;
  motivo: string;
}

interface ResultadoMapear extends MetadadosResultado {
  modalidade: Modalidade;
  mapeamentos: AvaliacaoMapeamento[];
  justificativaVazio?: string;
  melhorCandidatoRejeitado?: MelhorCandidatoRejeitado;
}
```

O melhor candidato rejeitado é selecionado pela mesma tupla de ordenação, sem aplicar o limiar.

### `inferir`

```ts
interface EntradaInferir {
  fonte: Dominio;
  alvo: Dominio;
  mapeamento: Mapeamento;
  config: ConfiguracaoMotor;
  correspondencias?: TabelaCorrespondencia;
}

interface EntidadeHipotetica {
  id: string;
  origem: { dominio: string; entidade: string };
  hipotetica: true;
}

interface Inferencia {
  relacaoFonte: string;
  predicado: string;
  argsAlvo: Referencia[];
  entidadesHipoteticas: EntidadeHipotetica[];
  suporte: Referencia[];
}

interface ResultadoInferir extends MetadadosResultado {
  mapeamento: Mapeamento;
  inferencias: Inferencia[];
}
```

Uma relação da fonte sem imagem só é projetável quando ao menos um argumento direto já tem imagem no alvo. Uma referência de entidade tem imagem quando a entidade participa do mapeamento; uma referência de relação tem imagem quando a sub-relação correspondente existe no alvo. Pertencer ao mesmo componente conectado ou compartilhar uma entidade apenas de forma indireta não basta.

A projeção preserva referências tipadas e ocorre em ordem topológica. Uma sub-relação sem imagem só é projetada recursivamente se ela própria tiver ao menos um argumento direto com imagem. Se um argumento relacional não tiver imagem nem projeção válida, a relação que o contém não é emitida. `suporte` contém exatamente os argumentos diretos que já tinham imagem, em ordem canônica.

Uma sub-relação projetada recebe antes de ser referenciada o ID determinístico `proj:<dominioFonte>:<relacaoFonte>`. IDs hipotéticos usam `hip:<dominioFonte>:<entidadeFonte>`. Em ambos os formatos, os componentes são percentualmente codificados. Os prefixos `proj:` e `hip:` são reservados e proibidos na entrada; colisões são verificadas mesmo assim.

### `buscar`

```ts
interface EntradaBuscar {
  fonte: Dominio;
  biblioteca: Dominio[];
  modalidade: Modalidade;
  config: ConfiguracaoMotor;
  k?: number;
  correspondenciasPorAlvo?: Record<string, TabelaCorrespondencia>;
}

interface AlvoEncontrado {
  alvo: string;
  resumoAlvo: string;
  melhorMapeamento: AvaliacaoMapeamento;
}

interface ResultadoBuscar extends MetadadosResultado {
  modalidade: Modalidade;
  k: number;
  alvos: AlvoEncontrado[];
  descartadosPorLimiar: number;
  descartadosPorOrcamento: number;
}
```

Cada alvo usa o primeiro resultado elegível de `mapear`. Um heap limitado a `k` retém apenas os melhores alvos. O desempate final usa ID do alvo e resumo canônico.

## Canonização e determinismo

`canonizar` produz bytes UTF-8 sem marca de ordem de bytes. As regras são:

1. normalizar todas as strings para NFC antes da validação;
2. ordenar chaves de objetos pela sequência de pontos de código Unicode;
3. serializar sem espaços insignificantes;
4. normalizar `-0` para `0` e rejeitar números não finitos;
5. quantizar escores em [0, 1] por `Math.round(x × 10¹²) / 10¹²` antes da comparação e serialização;
6. ordenar coleções-set por sua chave canônica;
7. preservar a ordem de argumentos não simétricos;
8. ordenar argumentos simétricos por referência canônica;
9. aplicar regras explícitas a entrada, configuração e saída.

O comparador Unicode percorre pontos de código com `codePointAt`; não usa comparação lexical implícita de strings. A representação textual de números fica centralizada em `canonico.ts` e é coberta por vetores dourados.

O núcleo recebe dados já validados e normalizados e devolve um payload puro. Adaptadores calculam SHA-256 sobre os bytes compartilhados:

- Node.js: `node:crypto`, somente no adaptador;
- navegador: `crypto.subtle`, somente no adaptador assíncrono.

Nenhuma ordem de iteração de `Map`, `Set` ou objeto participa de uma decisão sem ordenação explícita.

## Diagnóstico de Gentner

Com ρ₁ e ρ₂ definidos:

| ρ₁ | ρ₂ | Categoria |
|---|---|---|
| alto | alto | semelhança literal |
| baixo | alto | analogia |
| alto | baixo | aparência superficial |
| baixo | baixo | anomalia |

`alto` significa maior ou igual ao limiar específico da configuração. Se uma dimensão for `null`, o diagnóstico é `indeterminado`. Aparência superficial sempre adiciona alerta explícito.

## Orçamento e erros

Os limites são verificados antes da busca sempre que puderem ser derivados da entrada. Durante a busca, contadores determinísticos interrompem a operação antes de exceder os tetos de hipóteses e núcleos.

Erros públicos têm código, caminho e mensagem estáveis:

- `DOMINIO_INVALIDO`;
- `CORRESPONDENCIA_FORA_DO_MVP`;
- `LIMITE_ENTRADA_EXCEDIDO`;
- `ORCAMENTO_BUSCA_EXCEDIDO`;
- `MAPEAMENTO_INVALIDO`;
- `CONFIG_INVALIDA`;
- `FALHA_INTERNA`.

Na API, entrada inválida usa 400, tamanho excessivo usa 413 e falha interna usa 500. Cancelamento é distinto de erro e nunca devolve payload parcial como completo.

## Página web

A página executa a busca e a avaliação dos mapeamentos em um Web Worker. A thread principal cuida apenas de entrada, cancelamento e apresentação. As mensagens entre a página e o worker usam os mesmos contratos canônicos; resultados parciais de um worker cancelado não são apresentados como completos.

## Estratégia de testes e validação

O executor é o Vitest já previsto na pilha. Aleatoriedade é permitida somente nos testes de propriedade, com semente registrada quando o caso precisar ser reproduzido.

- Testes unitários por relação cobrem valores conhecidos e todos os casos-limite normativos.
- Testes de propriedade cobrem identidade, simetria quando aplicável, composição de homomorfismos e invariância da canonização sob permutação de coleções-set.
- Para ρ₅, um teste de propriedade altera atributos não declarados como potencial e verifica que o resultado não muda.
- As Proposições 1 e 2 da teoria têm testes próprios de conformidade teórica, sem serem tratadas como implementação do Requisito 2.4. O teste da Proposição 2 verifica, com correspondências de classe compatível, oposição preservada como oposição e emergência preservada como emergência, sem exigir complementaridade por capacidades.
- H1 usa os casos clássicos na modalidade homológica, com mapeamentos e inferências candidatas esperados, conforme `validacao/criterios.v1.1.md`. Somente em H1, o melhor candidato é escolhido pela tupla total homológica antes do filtro de ρ₂; o relatório registra separadamente seu ρ₂ e se ele passaria no filtro normal. Todas as inferências esperadas devem estar presentes; inferências extras são listadas e contadas, sem reprovar H1. Em caso de fracasso, examinam-se primeiro a codificação dos domínios e depois a busca.
- H3 é um teste de regressão do diagnóstico de Gentner, pois seu gerador determinístico usa as mesmas regras do classificador. Os 40 pares incluem casos claros e casos próximos dos limiares.
- H4 compara o SHA-256 da saída canônica em 1.000 execuções em Node.js e Chrome, ambos sobre V8, em duas máquinas ou trabalhadores independentes. O conjunto exato de entradas é fixado no pré-registro por manifesto de identificadores e resumos, ou por regra determinística e semente. H4 só é executado mediante solicitação do autor. Outros motores JavaScript ficam registrados como limitação conhecida, pois podem divergir no último dígito de `Math.log` na fronteira da tolerância de ρ₄.
- H5 usa casos de um gerador determinístico fixado no pré-registro, compara a busca gulosa com a exata e registra nós visitados e podados. A perda é `(exato - guloso) / exato`, usando o primeiro critério da tupla da modalidade nos melhores resultados depois do filtro; ausência de resultado elegível vale zero e, quando ambos forem zero, a perda é zero. O sucesso exige perda mediana zero e máxima de 5%, e a conclusão vale somente até oito entidades.

O pré-registro original em `validacao/criterios.v1.md` é preservado. A versão vigente para H1 é `validacao/criterios.v1.1.md`; ela altera somente H1 antes de qualquer execução e antes da entrega dos casos independentes. Ambos são imutáveis depois de commitados. Resultados ficam em `validacao/resultados/`, separados dos critérios. Fracassos são registrados sem alteração retroativa de limiares.

## Pós-MVP

Ficam fora do núcleo e das entregas do MVP:

- norma áurea e operador Π;
- execução de H2 com o conjunto SCAN e linha de base de modelo de linguagem;
- publicação em AWS, GCP ou outro provedor.

Cada item exige decisão ou spec própria antes da implementação.
