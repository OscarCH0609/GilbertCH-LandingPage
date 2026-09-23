# Gilbert Charpentier · Consultorio Jurídico

Landing page del abogado y notario Gilbert Charpentier (Barbacoas de Puriscal), construida según la
*Especificación técnica para la landing page* (22 de septiembre de 2026) y el kit de marca.

**Stack:** Astro 7 (HTML estático) · Tailwind CSS 4 · isla React para el formulario · Supabase (Postgres + Edge
Function) · Cloudflare Turnstile · Resend · analítica sin cookies (Plausible, opcional).

## Uso

Requiere Node.js 22 o superior.

```bash
npm install
npm run dev        # desarrollo en http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
npm run derivados  # regenera og-image, monograma del hero y apple-touch-icon desde el kit
```

Copie `.env.example` como `.env` y complete los valores. Sin `PUBLIC_CONSULTA_ENDPOINT`, el formulario simula el
envío en desarrollo y muestra un error con enlace a WhatsApp en producción.

## Estructura

```
src/
├── config/sitio.ts        Datos del consultorio (teléfonos, horario, dirección, WhatsApp…): única fuente de verdad
├── content/areas/*.md     Áreas de práctica (título, ícono, resumen, servicios, logros, orden)
├── content/faq/*.md       Preguntas frecuentes (grupo "general" → Recursos, "mep" → sección Docentes MEP)
├── components/            Secciones de la landing (.astro) y FormularioConsulta.tsx (isla React)
├── layouts/               BaseLayout (SEO, Open Graph, JSON-LD LegalService) y LegalLayout
├── pages/                 index, aviso-legal, privacidad, cookies, gracias, 404, robots.txt
├── scripts/               Analítica de conversiones, apariciones y preselección de área
└── styles/global.css      Tokens de marca (@theme de Tailwind) y estilos base
supabase/
├── migrations/0001_solicitudes_consulta.sql
└── functions/solicitar-consulta/index.ts
public/_headers            Cabeceras de seguridad para Cloudflare Pages
```

El contenido de áreas y preguntas frecuentes se edita en Markdown sin tocar componentes (RF-10).

## Puesta en producción

1. **Supabase.** Cree el proyecto, aplique la migración y despliegue la función sin verificación de JWT (la llamada
   viene del navegador sin sesión; la protección la dan Turnstile, CORS, el honeypot y la validación con zod):
   ```bash
   supabase db push
   supabase secrets set SITE_ORIGIN=https://DOMINIO TURNSTILE_SECRET=... RESEND_API_KEY=... NOTIFY_TO=... NOTIFY_FROM="Sitio web <notificaciones@DOMINIO>"
   supabase functions deploy solicitar-consulta --no-verify-jwt
   ```
2. **Turnstile.** Cree un widget para el dominio y ponga la *site key* en `PUBLIC_TURNSTILE_SITE_KEY`.
3. **Resend.** Verifique el dominio (SPF y DKIM).
4. **Cloudflare Pages.** Conecte el repositorio: comando `npm run build`, salida `dist`, y las variables de
   `.env.example` en el panel. `public/_headers` aplica HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y
   `frame-ancestors 'none'`. La Content-Security-Policy se genera por página con hashes (`security.csp` en
   `astro.config.mjs`).
5. Alta en Google Search Console (enviar `sitemap-index.xml`) y creación del Perfil de Empresa en Google.

Eventos de conversión registrados: `clic_whatsapp`, `envio_formulario`, `clic_llamar` y `clic_como_llegar`.

## Información pendiente antes de publicar

Los valores provisionales están marcados con `PENDIENTE` en el código.

- [ ] **Horario** (`src/config/sitio.ts`): se muestra L–V 5:00–9:00 p. m. y sábados 8:00 a. m.–5:00 p. m.
- [ ] **WhatsApp**: se asume 8471-3149.
- [ ] **Coordenadas GPS** (`sitio.coordenadas`): mientras sean `null`, el mapa y los enlaces de Google Maps/Waze usan
      la dirección textual y el JSON-LD omite `geo`.
- [ ] **Fotografía profesional** del abogado (4:5) en `src/assets/foto-abogado.jpg`; ver `src/components/Abogado.astro`.
- [ ] **Reglamento de evaluación del MEP**: nombre y sigla exactos (REAC o REA) en `DocentesMEP.astro`.
- [ ] **Dominio** (`SITE_URL`) y **correo profesional** (`sitio.correo`).
- [ ] **Textos** de áreas, logros y respuestas de preguntas frecuentes: son borradores y debe aprobarlos el abogado,
      en especial las preguntas del MEP y los logros (Código de Deberes Jurídicos, Morales y Éticos).
- [ ] **Páginas legales** (aviso legal, privacidad, cookies): borradores para revisión del abogado. Si cambia la
      política de privacidad, actualice `sitio.versionPrivacidad`.
- [ ] **Enlace de verificación de colegiatura** (`sitio.verificarColegiatura`): apunta al sitio del Colegio; conviene
      enlazar directamente a la consulta de agremiados.
- [ ] **Redes sociales** (`sitio.redes`) y **logo en SVG**.
- [ ] Lista única de áreas para tarjeta, redes y web (el hero del kit dice "Administrativo · Laboral · Constitucional ·
      Notarial · Registral").
