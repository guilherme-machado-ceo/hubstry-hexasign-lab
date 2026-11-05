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
  criterios.v1.md
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

IDs são únicos dentro do próprio namespace. As referências discriminadas eliminam ambiguidade entre IDs de entidade e relação. Strings são normalizadas para NFC antes da validação de unicidade.

O esquema rejeita:

- números não finitos;
- valores incompatíveis com o esquema de atributos;
- mais de um atributo potencial;
- oposição que não seja binária e simétrica;
- emergência com aridade menor que dois, argumento relacional ou capacidades exigidas vazias;
- relações estruturalmente duplicadas;
- referências inexistentes e ciclos;
- IDs iniciados por `hip:`;
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

A união de atributos forma o denominador local. Atributo ausente de um lado contribui zero. Tipos diferentes ou unidades numéricas diferentes não são atributos comuns. O caso numérico zero-zero vale 1. Pares sem atributo algum são omitidos da média; se todos forem omitidos, o resultado é `null`.

A diferença numérica deve evitar overflow por uma forma escalada equivalente quando os valores forem muito grandes.

### ρ₂

As relações são processadas em ordem topológica. Uma relação tem imagem quando há no alvo uma relação de predicado correspondente cujos argumentos canônicos são as imagens dos argumentos da fonte. Relações aninhadas usam as imagens já resolvidas das sub-relações. Relação com entidade ou sub-relação sem imagem não é preservada.

Como relações estruturalmente duplicadas são inválidas, uma busca indexada pela assinatura canônica resolve a existência sem problema de multiplicidade. Fonte sem relações produz `null`.

`rho2 = 1` representa preservação relacional completa do suporte. Isomorfismo exige bijeção de todas as entidades e preservação bidirecional de todas as relações.

### ρ₃

Papéis são pares `(predicadoNormalizado, posição)`. Apenas ocorrências diretas contam. Predicados simétricos usam a posição `*`. Jaccard vazio-vazio vale 1. O mapeamento vazio produz `null`.

### ρ₄

Para cada atributo de escala presente em pelo menos três pares, calculam-se razões `alvo/fonte`. Se qualquer razão observada for não positiva ou não finita, o atributo inteiro é não avaliável.

Calcula-se:

```text
logR[i] = ln(valorAlvo[i] / valorFonte[i])
logA = mediana(logR)
distancia[i] = quantizar12(|logR[i] - logA|)
dentro(i) = distancia[i] <= toleranciaLogEscala
```

Com quantidade par, a mediana é a média dos dois valores centrais. Essa formulação é simétrica sob inversão dos domínios: inverter troca o sinal dos logaritmos sem mudar as distâncias à mediana.

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

A pontuação fica em [0, 1] e é `null` quando a fonte não contém relações. A conectividade é favorecida na construção dos núcleos: cada núcleo nasce de uma relação de nível mais alto e inclui recursivamente sua estrutura conectada. A sistematicidade não substitui ρ₂; na modalidade homológica, ρ₂ é o filtro e a sistematicidade é o primeiro critério de ordenação.

## Busca

### Hipóteses locais

Relações candidatas são indexadas por `(predicadoNormalizado, aridade, classe, simetria)`, evitando o produto cartesiano quando não há correspondência. Nas modalidades heurística e funcional, pares de entidades podem iniciar núcleos quando sua medida local é maior que zero.

As hipóteses são produzidas por iterador em ordem canônica. A implementação não materializa mais hipóteses do que o orçamento permite.

### Núcleos

Cada par de relações de nível mais alto é percorrido iterativamente, não por recursão irrestrita. A expansão segue argumentos em ordem canônica, consulta resultados memoizados para sub-relações compartilhadas e rejeita qualquer conflito de injetividade.

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
- para ρ₁ e ρ₃, contribuições ainda não decididas recebem limite superior 1;
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
  suporte: string[];
}

interface ResultadoInferir extends MetadadosResultado {
  mapeamento: Mapeamento;
  inferencias: Inferencia[];
}
```

Relações formam um grafo não dirigido para fins de suporte. Duas relações são adjacentes quando uma referencia a outra ou quando suas expansões contêm a mesma entidade. Uma relação sem imagem é projetável se estiver no componente de alguma relação preservada.

A projeção ocorre em ordem topológica. Uma sub-relação projetada recebe um ID determinístico antes de ser referenciada. IDs hipotéticos usam componentes percentualmente codificados no formato `hip:<dominioFonte>:<entidadeFonte>`; o prefixo é reservado e proibido na entrada. Colisões são verificadas mesmo assim.

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

## Estratégia de testes e validação

O executor é o Vitest já previsto na pilha. Aleatoriedade é permitida somente nos testes de propriedade, com semente registrada quando o caso precisar ser reproduzido.

- Testes unitários por relação cobrem valores conhecidos e todos os casos-limite normativos.
- Testes de propriedade cobrem identidade, simetria quando aplicável, composição de homomorfismos e invariância da canonização sob permutação de coleções-set.
- As Proposições 1 e 2 da teoria têm testes próprios de conformidade teórica, sem serem tratadas como implementação do Requisito 2.4.
- H1 usa casos clássicos.
- H3 usa 40 pares determinísticos.
- H4 compara o SHA-256 da saída canônica em 1.000 execuções, Node.js e navegador, em duas máquinas ou trabalhadores independentes. H4 só é executado mediante solicitação do autor.
- H5 compara a busca gulosa com a exata, registra nós visitados e podados e exige perda mediana zero e máxima de 5%.

O pré-registro em `validacao/criterios.v1.md` é imutável depois de commitado. Resultados ficam em `validacao/resultados/`, separados dos critérios. Fracassos são registrados sem alteração retroativa de limiares.

## Pós-MVP

Ficam fora do núcleo e das entregas do MVP:

- norma áurea e operador Π;
- execução de H2 com o conjunto SCAN e linha de base de modelo de linguagem;
- publicação em AWS, GCP ou outro provedor.

Cada item exige decisão ou spec própria antes da implementação.
