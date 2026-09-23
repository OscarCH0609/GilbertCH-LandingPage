// supabase/functions/solicitar-consulta/index.ts  (Deno)
// Secretos requeridos: SITE_ORIGIN, TURNSTILE_SECRET, RESEND_API_KEY, NOTIFY_TO y NOTIFY_FROM.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const ORIGEN = Deno.env.get("SITE_ORIGIN")!; // p. ej. https://gilbertcharpentier.com

const cors = {
  "Access-Control-Allow-Origin": ORIGEN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  Vary: "Origin",
};

const AREAS = [
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

const Esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().regex(/^[0-9+\s-]{8,20}$/),
  correo: z.string().trim().email().max(254).optional().or(z.literal("")),
  area: z.enum(AREAS),
  modalidad: z.enum(["presencial", "virtual", "sin_preferencia"]),
  descripcion: z.string().trim().min(10).max(1000),
  consentimiento: z.literal(true),
  consentimiento_version: z.string().max(20),
  website: z.string().max(0), // honeypot: debe venir vacío
  turnstileToken: z.string().min(1),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405, headers: cors });
  if (req.headers.get("origin") !== ORIGEN) return new Response("Origen no permitido", { status: 403, headers: cors });

  const parsed = Esquema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400, headers: cors });

  const { turnstileToken, website: _honeypot, ...datos } = parsed.data;

  // 1. Verificar Cloudflare Turnstile
  const form = new FormData();
  form.append("secret", Deno.env.get("TURNSTILE_SECRET")!);
  form.append("response", turnstileToken);
  const ip = req.headers.get("cf-connecting-ip");
  if (ip) form.append("remoteip", ip);
  const ts = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  }).then((r) => r.json());
  if (!ts.success) return Response.json({ ok: false }, { status: 403, headers: cors });

  // 2. Guardar la solicitud
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await supabase
    .from("solicitudes_consulta")
    .insert({ ...datos, correo: datos.correo || null });
  if (error) {
    console.error("Error al guardar la solicitud:", error.message);
    return Response.json({ ok: false }, { status: 500, headers: cors });
  }

  // 3. Notificar al abogado (sin incluir la descripción completa en el correo).
  // Un fallo aquí no invalida la solicitud: ya quedó guardada.
  try {
    const envio = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + Deno.env.get("RESEND_API_KEY"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("NOTIFY_FROM") ?? "Sitio web <notificaciones@gilbertcharpentier.com>",
        to: [Deno.env.get("NOTIFY_TO")],
        subject: "Nueva solicitud de consulta: " + datos.area,
        text:
          "Nombre: " + datos.nombre +
          "\nTeléfono: " + datos.telefono +
          "\nModalidad: " + datos.modalidad +
          "\nRevise el detalle en el panel de Supabase.",
      }),
    });
    if (!envio.ok) console.error("Resend respondió", envio.status);
  } catch (e) {
    console.error("No se pudo enviar la notificación:", e);
  }

  return Response.json({ ok: true }, { headers: cors });
});
