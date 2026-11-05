# Design: motor determinístico de criação de analogias

## Visão geral

O motor é uma biblioteca TypeScript sem dependências em tempo de execução, chamada aqui de núcleo. Em volta dela ficam três camadas finas: uma CLI (Command-Line Interface, interface de linha de comando), uma API HTTP e uma página web. O núcleo não acessa rede, relógio nem gerador aleatório, o que garante o determinismo exigido no Requisito 7. Uma etapa opcional de extração, que transforma textos em domínios, fica fora do núcleo e fora deste MVP (Minimum Viable Product, produto mínimo viável).

A escolha do TypeScript segue a pilha atual do repositório. O mesmo código roda no navegador, no Node.js e numa função sem servidor da AWS (Amazon Web Services), onde o deploy está previsto.

## Arquitetura

```
domínio JSON ──► validar ──► canonizar ──► núcleo ──► resultado JSON
                                            │
                    ┌───────────────────────┼────────────────────────┐
                 relações (ρ₁…ρ₆)     busca (gulosa / exata)     inferências
                                            │
                              modalidades (config versionada)
```

Estrutura de pastas proposta:

```
src/motor/
  esquema.ts          # tipos e validação do domínio (Requisito 1)
  canonico.ts         # ordenação, arredondamento e resumo SHA-256 (Requisito 7)
  correspondencia.ts  # correspondência de predicados e papéis
  relacoes/
    rho1-similitude.ts
    rho2-homologia.ts
    rho3-equivalencia.ts
    rho4-simetria.ts
    rho5-equilibrio.ts
    rho6-compensacao.ts
  busca/
    hipoteses.ts      # hipóteses locais
    nucleos.ts        # núcleos estruturalmente consistentes
    gulosa.ts         # fusão gulosa com desempate canônico
    exata.ts          # ramificação e poda (até 8 entidades)
  modalidades.ts      # perfis exigidos, objetivos e diagnóstico de Gentner
  inferencia.ts       # inferências candidatas e entidades hipotéticas
  operacoes.ts        # mapear, inferir, buscar
  teoria.ts           # norma áurea e Π, exibição opcional (Requisito 8)
  index.ts
config/modalidades.v1.json
validacao/
  criterios.v1.md     # pré-registro de H1 a H5
  casos-classicos/    # domínios JSON e mapeamento esperado (H1)
  gerador-gentner.ts  # 40 pares controlados (H3)
scripts/motor-cli.ts
server/motor-api.mjs  # rotas HTTP
```

## Componentes e interfaces

### Modelo de dados

```ts
type Classe = 'comum' | 'oposicao' | 'emergencia';

interface Predicado {
  nome: string;
  aridade: number;
  classe: Classe;
  simetrico?: boolean;
  capacidadesExigidas?: string[];   // obrigatório se classe = 'emergencia'
}

type Atributo =
  | { tipo: 'categorico'; valor: string }
  | { tipo: 'numerico'; valor: number; unidade: string;
      grupo?: 'escala' | 'monotono'; potencial?: boolean };

interface Entidade { id: string; atributos: Record<string, Atributo> }

interface Relacao { id: string; predicado: string; args: string[] }  // ids de entidades ou de relações

interface Dominio {
  id: string;
  entidades: Entidade[];
  predicados: Predicado[];
  relacoes: Relacao[];
  tolerancias?: { simetria?: number; equilibrio?: number };
}

interface TabelaCorrespondencia { fonte: string; alvo: string; peso: number }[]

type Perfil = [number | null, number | null, number | null,
               number | null, number | null, number | null];

interface Mapeamento { pares: [string, string][] }   // ordenados por id da fonte

interface ResultadoMapear {
  versaoMotor: string; versaoConfig: string; resumoEntrada: string;
  modalidade: 'heuristica' | 'funcional' | 'homologica';
  mapeamentos: {
    mapeamento: Mapeamento;
    perfil: Perfil;
    perfilBinario: (0 | 1 | null)[];
    isomorfismo: boolean;
    categoriaGentner: 'semelhanca-literal' | 'analogia' | 'aparencia-superficial' | 'anomalia';
    alertas: string[];
    inferencias: Inferencia[];
  }[];
  justificativaVazio?: string;
}

interface Inferencia {
  relacaoFonte: string;
  predicado: string;
  argsAlvo: string[];                 // ids do alvo ou de entidades hipotéticas
  hipoteticas: string[];              // ids gerados: 'hip:' + id da entidade da fonte
  suporte: string[];                  // ids das relações da fonte mapeadas que a sustentam
}
```

### Relações

Cada arquivo em `relacoes/` exporta uma função pura com a mesma assinatura:

```ts
(fonte: Dominio, alvo: Dominio, m: Mapeamento, ctx: Contexto) => number | null
```

O `Contexto` traz a tabela de correspondência e índices pré-calculados, como papéis e relações por predicado. As fórmulas seguem as Definições 4 a 9 do documento de teoria v2. Cada função exporta também uma constante `VERSAO_DEFINICAO`.

### Busca

1. **Hipóteses locais:** pares de relações com predicados correspondentes e mesma aridade. Nas modalidades heurística e funcional, somam-se pares de entidades com ρ₁ ou ρ₃ local acima de zero.
2. **Núcleos:** para cada par de relações de nível mais alto, descida recursiva pelos argumentos, rejeitando o núcleo se violar a injetividade.
3. **Pontuação:** o objetivo da modalidade. Na homológica, cada relação pesa 1 + profundidade, o que favorece estruturas de ordem superior (sistematicidade).
4. **Fusão gulosa:** núcleos ordenados por (pontuação decrescente, chave canônica crescente). Para obter até três mapeamentos, a fusão recomeça a partir de cada um dos três melhores núcleos, e os resultados repetidos são descartados.
5. **Busca exata:** ramificação e poda sobre injeções de entidades, habilitada só com até oito entidades em cada domínio. É usada nos testes (H5) e opcionalmente pelo usuário.

### Canonização e determinismo

A função `canonizar` ordena entidades, predicados e relações por identificador, ordena as chaves dos objetos e serializa sem espaços. O resumo é o SHA-256 dessa serialização. No Node.js, usa-se `node:crypto`. No navegador, usa-se `crypto.subtle`, que é assíncrono. Por isso, o resumo é calculado fora do núcleo, na camada de interface, e a busca permanece síncrona e pura. Toda comparação de pontuação passa por `arredondar(x) = Math.round(x * 1e12) / 1e12`.

### Configuração das modalidades

```json
{
  "versao": "1.0.0",
  "heuristica": { "exige": { "rho1": 0.5 }, "maximiza": "rho1", "desempate": "rho2" },
  "funcional":  { "exige": { "rho3": 0.5 }, "maximiza": "rho3", "desempate": "rho2" },
  "homologica": { "exige": { "rho2": 0.6 }, "maximiza": "sistematicidade", "desempate": "rho1" },
  "gentner": { "alto": 0.6 },
  "pesosTeoricos": "phi"
}
```

Os limiares acima são valores provisórios. Eles dependem da decisão do autor e da calibração nos testes de validação.

## Tratamento de erros

- Validação de esquema: erro com caminho do campo e regra violada (Requisito 1).
- Domínio vazio ou com menos de duas entidades: erro antes da busca.
- Limites excedidos: erro antes da busca (Requisito 9.4).
- Relação sem material: `null`, nunca exceção (Requisito 2.2).
- Na API: 400 para entrada inválida, 413 para entrada grande demais, 500 só para falha interna, sempre com corpo JSON.

## Estratégia de testes

O executor de testes é o Vitest, já presente no ecossistema do repositório. Os testes se dividem em quatro grupos.

- **Testes unitários por relação**, com domínios mínimos de valor conhecido, inclusive os casos indefinidos.
- **Testes de propriedade**, com a biblioteca fast-check, que gera entradas aleatórias para verificar leis gerais. Exemplos: a identidade tem ρ₂ = 1; a versão binária de ρ₃ é simétrica; embaralhar a entrada não muda a saída canônica; a composição de dois homomorfismos exatos é um homomorfismo. A aleatoriedade fica restrita aos testes; o núcleo continua sem ela.
- **Testes das proposições da v2:** isomorfismo implica ρ₃ binário igual a 1 (Proposição 1); ρ₂ = 1 implica preservação das oposições predicativas e das emergências (Proposição 2).
- **Validação pré-registrada:** H1 (casos clássicos), H3 (gerador de Gentner), H4 (1.000 execuções embaralhadas) e H5 (gulosa contra exata), com relatório em `validacao/resultados/`. O teste H2, com o conjunto SCAN, exige codificar domínios a partir das analogias do conjunto e fica como tarefa separada, depois de conferidos o conteúdo e a licença.
