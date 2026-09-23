// Comunica a la isla del formulario qué área debe quedar seleccionada (RF-05).
// El valor también se guarda en window por si la isla aún no se ha hidratado.

export const EVENTO_PRESELECCION = "preseleccionar-area";

declare global {
  interface Window {
    __areaPreseleccionada?: string;
  }
}

export function preseleccionarArea(area: string) {
  window.__areaPreseleccionada = area;
  window.dispatchEvent(new CustomEvent(EVENTO_PRESELECCION, { detail: area }));

  const consulta = document.getElementById("consulta");
  if (!consulta) return;
  const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  consulta.scrollIntoView({ behavior: reducir ? "auto" : "smooth" });
  history.replaceState(null, "", "#consulta");
  // El campo existe aunque la isla no se haya hidratado (se renderiza en el servidor).
  consulta.querySelector<HTMLInputElement>("input[name=nombre]")?.focus({ preventScroll: true });
}
