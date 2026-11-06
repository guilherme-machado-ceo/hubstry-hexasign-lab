const valores = [null, 0, 1];
let admissiveis = 0;

for (const rho1 of valores) {
  for (const rho2 of valores) {
    for (const rho3 of valores) {
      for (const rho4 of valores) {
        for (const rho5 of valores) {
          for (const rho6 of valores) {
            const perfil = [rho1, rho2, rho3, rho4, rho5, rho6];
            const definido = (indice) => perfil[indice] !== null;
            const todosIndefinidos = perfil.every((valor) => valor === null);
            const admissivel =
              (definido(2) || todosIndefinidos) &&
              (!definido(3) || definido(0)) &&
              (!definido(4) || definido(0) || definido(1)) &&
              (!definido(5) || definido(1));
            if (admissivel) admissiveis += 1;
          }
        }
      }
    }
  }
}

console.log(`${admissiveis} configurações admissíveis de 729.`);
