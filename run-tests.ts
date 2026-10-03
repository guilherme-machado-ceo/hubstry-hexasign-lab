import { analyzeSignificance } from './src/lib/hexa-engine';

const testCases = [
  { 
    name: "Cenário 1: Texto Vazio / Nulo", 
    text: "" 
  },
  { 
    name: "Cenário 2: Frase Literária Simples", 
    text: "O gato sentou-se no tapete e observou a chuva cair suavemente pela janela da sala." 
  },
  { 
    name: "Cenário 3: Texto Técnico-Lógico (Alta Homologia e Compensação)", 
    text: "Portanto, o algoritmo processa a matriz distribuindo a carga de forma estruturada. A compensação e a emergência do sistema garantem estabilidade e equivalência funcional sob o operador transcendente." 
  },
  { 
    name: "Cenário 4: Texto de Estresse / Baixa Densidade", 
    text: "erro erro erro erro erro erro" 
  }
];

console.log("==========================================================");
console.log(" BATERIA DE TESTES EMPÍRICOS: ÁLGEBRA HEXARRELACIONAL");
console.log("==========================================================");

testCases.forEach((tc, idx) => {
  console.log(`\n[${idx + 1}] ${tc.name}`);
  console.log(`Input: "${tc.text}"`);
  
  const m = analyzeSignificance(tc.text);
  
  console.log("Vetor Relacional [ρ₁..ρ₆]:", [
    m.similitude.toFixed(2),
    m.homology.toFixed(2),
    m.equivalence.toFixed(2),
    m.symmetry.toFixed(2),
    m.equilibrium.toFixed(2),
    m.compensation.toFixed(2)
  ]);
  console.log(`Norma Áurea f(A):        ${m.goldenNorm.toFixed(4)}`);
  console.log(`Π-radical Π(A):          ${m.piSqrtScore.toFixed(4)}`);
});
console.log("\n==========================================================");
