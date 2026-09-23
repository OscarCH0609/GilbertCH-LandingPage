// Transición suave de aparición para elementos con la clase .aparecer.
// El CSS solo los oculta si el usuario no pidió reducir movimiento.

export function iniciarApariciones() {
  const elementos = document.querySelectorAll<HTMLElement>(".aparecer");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  elementos.forEach((el) => observador.observe(el));
}
