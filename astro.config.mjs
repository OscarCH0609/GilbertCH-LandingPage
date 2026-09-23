// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

// Dominio definitivo pendiente de confirmar (ver README).
const SITIO = env.SITE_URL || "https://gilbertcharpentier.com";

// Orígenes externos permitidos por la Content-Security-Policy.
const SUPABASE = env.PUBLIC_SUPABASE_ORIGIN || "https://*.supabase.co";

export default defineConfig({
  site: SITIO,
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [
    react(),
    sitemap({ filter: (pagina) => !pagina.includes("/gracias") }),
  ],
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
        `connect-src 'self' ${SUPABASE} https://challenges.cloudflare.com https://plausible.io`,
        "frame-src https://www.google.com https://challenges.cloudflare.com",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "https://challenges.cloudflare.com", "https://plausible.io"],
      },
    },
  },
});
