// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

// Dominio definitivo pendiente de confirmar (ver README).
const SITIO = env.SITE_URL || "https://gilbertcharpentier.com";

export default defineConfig({
  site: SITIO,
  trailingSlash: "never",
  build: { format: "file" },
  // React solo se usa en el servidor para renderizar los íconos de Lucide.
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  image: { layout: "constrained" },
  // Shiki usa estilos en línea incompatibles con la CSP; el sitio no muestra código.
  markdown: { syntaxHighlight: false },
  security: {
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://plausible.io",
        "frame-src https://www.google.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://plausible.io"],
      },
    },
  },
});
