// Eventos de conversión con analítica sin cookies (Plausible).
// Cualquier elemento con data-evento="nombre" registra ese evento al pulsarlo.

export type EventoConversion = "clic_whatsapp" | "clic_llamar" | "clic_como_llegar";

declare global {
  interface Window {
    plausible?: (evento: string, opciones?: { props?: Record<string, string> }) => void;
  }
}

export function registrarEvento(evento: EventoConversion, props?: Record<string, string>) {
  window.plausible?.(evento, props ? { props } : undefined);
}

export function iniciarAnalitica() {
  document.addEventListener("click", (e) => {
    const objetivo = (e.target as Element | null)?.closest<HTMLElement>("[data-evento]");
    if (!objetivo) return;
    const evento = objetivo.dataset.evento as EventoConversion;
    const origen = objetivo.dataset.origen;
    registrarEvento(evento, origen ? { origen } : undefined);
  });
}
