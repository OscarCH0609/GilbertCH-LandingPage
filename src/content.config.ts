import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { areasFormulario } from "./config/sitio";

// Íconos de Lucide disponibles para las áreas (ver src/components/Icono.astro).
const iconos = ["briefcase", "scale", "landmark", "users", "shield", "file-text", "stamp", "graduation-cap"] as const;

const areas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/areas" }),
  schema: z.object({
    titulo: z.string(),
    icono: z.enum(iconos),
    resumen: z.string().max(220),
    servicios: z.array(z.string()).default([]),
    logros: z.array(z.string()).default([]),
    orden: z.number(),
    // Valor que se preselecciona en el formulario al pulsar "Consultar sobre este tema".
    areaFormulario: z.enum(areasFormulario),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/faq" }),
  schema: z.object({
    pregunta: z.string(),
    // "general" se muestra en Recursos; "mep" dentro de la sección Docentes MEP.
    grupo: z.enum(["general", "mep"]),
    orden: z.number(),
  }),
});

export const collections = { areas, faq };
