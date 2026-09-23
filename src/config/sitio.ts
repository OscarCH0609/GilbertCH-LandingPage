// Datos del consultorio. Es la única fuente de verdad para el sitio, el JSON-LD y los enlaces.
// Los valores marcados como PENDIENTE deben confirmarse antes de publicar (ver README).

const WHATSAPP_NUMERO = "50684713149"; // PENDIENTE: confirmar que 8471-3149 es el número con WhatsApp.

const whatsapp = (mensaje: string) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

// PENDIENTE: coordenadas GPS exactas de la oficina. Mientras sean null, los enlaces
// de navegación y el mapa usan la dirección textual.
const COORDENADAS: { lat: number; lng: number } | null = null;
const CONSULTA_MAPA = "Barbacoas, Puriscal, San José, Costa Rica";

export const sitio = {
  nombre: "Gilbert Charpentier",
  nombreCompleto: "Gilbert Charpentier, Consultorio Jurídico",
  profesion: "Abogado y notario",
  carne: "28218",
  titulo: "Gilbert Charpentier | Abogado y notario en Puriscal",
  descripcion:
    "Abogado y notario en Barbacoas de Puriscal. Derecho laboral, defensa de docentes del MEP, contencioso administrativo, familia y servicios notariales.",

  telefonos: [
    { visible: "2416-4435", href: "tel:+50624164435", e164: "+506 2416-4435", tipo: "Oficina" },
    { visible: "8471-3149", href: "tel:+50684713149", e164: "+506 8471-3149", tipo: "Celular" },
  ],
  // PENDIENTE: reemplazar por el correo profesional con dominio propio cuando exista.
  correo: "gcharpentieracuna@gmail.com",

  direccion: {
    linea: "Barbacoas de Puriscal",
    senas: "500 metros noroeste del templo católico, sobre la carretera principal a Turrubares.",
    calle: "500 m noroeste del templo católico, sobre carretera principal a Turrubares",
    localidad: "Barbacoas, Puriscal",
    provincia: "San José",
    pais: "CR",
  },
  coordenadas: COORDENADAS,

  // PENDIENTE: horario por confirmar. Se usa la interpretación más probable del texto recibido.
  horario: [
    { dias: "Lunes a viernes", horas: "5:00 p. m. – 9:00 p. m.", schemaDias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], abre: "17:00", cierra: "21:00" },
    { dias: "Sábados", horas: "8:00 a. m. – 5:00 p. m.", schemaDias: ["Saturday"], abre: "08:00", cierra: "17:00" },
  ],
  horarioResumido: "L–V 5–9 p. m. · Sáb. 8 a. m.–5 p. m.",
  notaHorario: "De preferencia, coordine su cita previa de forma presencial o virtual.",

  whatsapp: {
    general: whatsapp("Hola, deseo solicitar una consulta legal."),
    mep: whatsapp("Hola, soy docente del MEP y deseo una consulta sobre un proceso administrativo."),
  },

  mapas: {
    google: COORDENADAS
      ? `https://www.google.com/maps/dir/?api=1&destination=${COORDENADAS.lat},${COORDENADAS.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONSULTA_MAPA)}`,
    waze: COORDENADAS
      ? `https://waze.com/ul?ll=${COORDENADAS.lat},${COORDENADAS.lng}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(CONSULTA_MAPA)}&navigate=yes`,
    embed: COORDENADAS
      ? `https://www.google.com/maps?q=${COORDENADAS.lat},${COORDENADAS.lng}&z=16&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(CONSULTA_MAPA)}&z=14&output=embed`,
  },

  // Consulta pública de personas agremiadas del Colegio de Abogados y Abogadas.
  verificarColegiatura: "https://www.abogados.or.cr/",

  // PENDIENTE: enlaces a redes sociales. Se muestran en el pie solo si tienen URL.
  redes: [] as { nombre: string; url: string }[],

  areasServidas: ["Puriscal", "Turrubares", "Mora", "San José", "Costa Rica"],

  // Versión de la política de privacidad que acepta la persona en el formulario.
  versionPrivacidad: "2026-09-v1",
} as const;

export const navegacion = [
  { id: "inicio", texto: "Inicio" },
  { id: "abogado", texto: "El abogado" },
  { id: "areas", texto: "Áreas" },
  { id: "docentes-mep", texto: "Docentes MEP" },
  { id: "notariado", texto: "Notariado" },
  { id: "recursos", texto: "Recursos" },
  { id: "contacto", texto: "Contacto" },
] as const;

// Opciones del campo "Área de consulta" del formulario.
export const areasFormulario = [
  "Laboral",
  "Docentes y personal MEP",
  "Contencioso administrativo",
  "Constitucional",
  "Familia",
  "Penal",
  "Civil",
  "Servicios notariales",
  "No estoy seguro",
] as const;
