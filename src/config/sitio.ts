// Datos del consultorio. Es la única fuente de verdad para el sitio, el JSON-LD y los enlaces.
// Los valores marcados como PENDIENTE deben confirmarse antes de publicar (ver README).

const WHATSAPP_NUMERO = "50684713149"; // PENDIENTE: confirmar que 8471-3149 es el número con WhatsApp.

const whatsapp = (mensaje: string) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;

// Ficha de Google Maps de la oficina ("Lic. Gilbert Charpentier"). Todos los enlaces a la
// dirección apuntan aquí; las coordenadas son las de esa misma ficha.
const ENLACE_MAPS = "https://maps.app.goo.gl/qMyiLJB3o2U2fPRe9";
const COORDENADAS = { lat: 9.862276, lng: -84.352937 };

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

  horario: [
    { dias: "Lunes a miércoles", horas: "5:00 p. m. – 9:00 p. m.", schemaDias: ["Monday", "Tuesday", "Wednesday"], abre: "17:00", cierra: "21:00" },
    { dias: "Jueves y viernes", horas: "1:00 p. m. – 9:00 p. m.", schemaDias: ["Thursday", "Friday"], abre: "13:00", cierra: "21:00" },
    { dias: "Sábados", horas: "8:00 a. m. – 5:00 p. m.", schemaDias: ["Saturday"], abre: "08:00", cierra: "17:00" },
  ],
  horarioResumido: "L–Mi 5–9 p. m. · J–V 1–9 p. m. · Sáb. 8 a. m.–5 p. m.",
  notaHorario: "Las citas se coordinan únicamente por teléfono, llamando a la oficina o al celular.",

  whatsapp: {
    general: whatsapp("Hola, deseo solicitar una consulta legal."),
    mep: whatsapp("Hola, soy docente del MEP y deseo una consulta sobre un proceso administrativo."),
  },

  mapas: {
    google: ENLACE_MAPS,
    waze: `https://waze.com/ul?ll=${COORDENADAS.lat},${COORDENADAS.lng}&navigate=yes`,
    embed: `https://www.google.com/maps?q=${COORDENADAS.lat},${COORDENADAS.lng}&z=16&output=embed`,
  },

  // Consulta pública de personas agremiadas del Colegio de Abogados y Abogadas.
  verificarColegiatura: "https://www.abogados.or.cr/",

  // PENDIENTE: enlaces a redes sociales. Se muestran en el pie solo si tienen URL.
  redes: [] as { nombre: string; url: string }[],

  areasServidas: ["Puriscal", "Turrubares", "Mora", "San José", "Costa Rica"],

  // Versión vigente de la política de privacidad.
  versionPrivacidad: "2026-09-v2",
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
