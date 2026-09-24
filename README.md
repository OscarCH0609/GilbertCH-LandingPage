# Gilbert Charpentier · Consultorio Jurídico

Landing page del abogado y notario Gilbert Charpentier (Barbacoas de Puriscal), construida según la
*Especificación técnica para la landing page* (22 de septiembre de 2026) y el kit de marca.

**Stack:** Astro 7 (HTML estático) · Tailwind CSS 4 · analítica sin cookies (Plausible, opcional).

El sitio no tiene formulario: las citas se agendan únicamente por teléfono (oficina y celular).

## Uso

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev        # desarrollo en http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
npm run derivados  # regenera og-image, monograma del hero y apple-touch-icon desde el kit
```

Copie `.env.example` como `.env` y complete los valores.

## Estructura

```
src/
├── config/sitio.ts        Datos del consultorio (teléfonos, horario, dirección, WhatsApp…): única fuente de verdad
├── content/areas/*.md     Áreas de práctica (título, ícono, resumen, servicios, logros, orden)
├── content/faq/*.md       Preguntas frecuentes (se muestran en la sección Recursos)
├── components/            Secciones de la landing (.astro)
├── layouts/               BaseLayout (SEO, Open Graph, JSON-LD LegalService) y LegalLayout
├── pages/                 index, aviso-legal, privacidad, cookies, 404, robots.txt
├── scripts/               Analítica de conversiones y apariciones
└── styles/global.css      Tokens de marca (@theme de Tailwind) y estilos base
public/_headers            Cabeceras de seguridad para Cloudflare Pages
```

El contenido de áreas y preguntas frecuentes se edita en Markdown sin tocar componentes (RF-10).

## Puesta en producción

1. **Cloudflare Pages.** Conecte el repositorio: comando `npm run build`, salida `dist`, y las variables de
   `.env.example` en el panel. `public/_headers` aplica HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y
   `frame-ancestors 'none'`. La Content-Security-Policy se genera por página con hashes (`security.csp` en
   `astro.config.mjs`).
2. Alta en Google Search Console (enviar `sitemap-index.xml`) y creación del Perfil de Empresa en Google.

Eventos de conversión registrados: `clic_whatsapp`, `clic_llamar` y `clic_como_llegar`.

## Información pendiente antes de publicar

Los valores provisionales están marcados con `PENDIENTE` en el código.

- [ ] **WhatsApp**: se asume 8471-3149.
- [ ] **Fotografía profesional** del abogado (4:5) en `src/assets/foto-abogado.jpg`; ver `src/components/Abogado.astro`.
- [ ] **Reglamento de evaluación del MEP**: nombre y sigla exactos (REAC o REA) en `DocentesMEP.astro`.
- [ ] **Dominio** (`SITE_URL`) y **correo profesional** (`sitio.correo`).
- [ ] **Textos** de áreas, logros y respuestas de preguntas frecuentes: son borradores y debe aprobarlos el abogado,
      en especial los logros (Código de Deberes Jurídicos, Morales y Éticos).
- [ ] **Páginas legales** (aviso legal, privacidad, cookies): borradores para revisión del abogado. Si cambia la
      política de privacidad, actualice `sitio.versionPrivacidad`.
- [ ] **Enlace de verificación de colegiatura** (`sitio.verificarColegiatura`): apunta al sitio del Colegio; conviene
      enlazar directamente a la consulta de agremiados.
- [ ] **Redes sociales** (`sitio.redes`) y **logo en SVG**.
- [ ] Lista única de áreas para tarjeta, redes y web (el hero del kit dice "Administrativo · Laboral · Constitucional ·
      Notarial · Registral").
