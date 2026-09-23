import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { areasFormulario } from "../config/sitio";
import { EVENTO_PRESELECCION } from "../scripts/preseleccion";
import { registrarEvento } from "../scripts/analitica";

interface Props {
  endpoint?: string;
  turnstileSiteKey?: string;
  versionPrivacidad: string;
  whatsapp: string;
}

type Campo = "nombre" | "telefono" | "correo" | "area" | "modalidad" | "descripcion" | "consentimiento" | "turnstile";
type Errores = Partial<Record<Campo, string>>;

const MAX_DESCRIPCION = 1000;
const MODALIDADES = [
  { valor: "presencial", texto: "Presencial" },
  { valor: "virtual", texto: "Virtual" },
  { valor: "sin_preferencia", texto: "Sin preferencia" },
] as const;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opciones: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

/** Teléfono costarricense de 8 dígitos, con o sin +506, espacios o guiones. */
function telefonoValido(valor: string) {
  if (!/^[0-9+\s-]{8,20}$/.test(valor)) return false;
  const digitos = valor.replace(/\D/g, "");
  const local = digitos.startsWith("506") && digitos.length === 11 ? digitos.slice(3) : digitos;
  return /^[2-8]\d{7}$/.test(local);
}

function validar(datos: FormData, requiereTurnstile: boolean): Errores {
  const errores: Errores = {};
  const nombre = String(datos.get("nombre") ?? "").trim();
  const telefono = String(datos.get("telefono") ?? "").trim();
  const correo = String(datos.get("correo") ?? "").trim();
  const descripcion = String(datos.get("descripcion") ?? "").trim();

  if (nombre.length < 2) errores.nombre = "Escriba su nombre completo.";
  else if (nombre.length > 120) errores.nombre = "El nombre no puede superar 120 caracteres.";

  if (!telefono) errores.telefono = "Indique un teléfono o WhatsApp para contactarle.";
  else if (!telefonoValido(telefono)) errores.telefono = "Use un número costarricense de 8 dígitos, por ejemplo 8888-8888.";

  if (correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) errores.correo = "Revise el formato del correo electrónico.";

  if (!datos.get("area")) errores.area = "Seleccione el área de su consulta.";
  if (!datos.get("modalidad")) errores.modalidad = "Elija una modalidad.";

  if (descripcion.length < 10) errores.descripcion = "Describa brevemente su situación (al menos 10 caracteres).";
  else if (descripcion.length > MAX_DESCRIPCION) errores.descripcion = `Máximo ${MAX_DESCRIPCION} caracteres.`;

  if (!datos.get("consentimiento")) errores.consentimiento = "Debe aceptar la Política de privacidad para enviar la solicitud.";
  if (requiereTurnstile && !datos.get("cf-turnstile-response"))
    errores.turnstile = "Espere a que termine la verificación de seguridad.";

  return errores;
}

export default function FormularioConsulta({ endpoint, turnstileSiteKey, versionPrivacidad, whatsapp }: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<"inactivo" | "enviando" | "error">("inactivo");
  const [anuncio, setAnuncio] = useState("");

  // Área preseleccionada desde "Consultar sobre este tema" o ?area= en la URL.
  useEffect(() => {
    const desdeUrl = new URLSearchParams(location.search).get("area");
    const inicial = window.__areaPreseleccionada ?? desdeUrl;
    if (inicial && (areasFormulario as readonly string[]).includes(inicial)) setArea(inicial);

    const alPreseleccionar = (e: Event) => {
      const valor = (e as CustomEvent<string>).detail;
      if ((areasFormulario as readonly string[]).includes(valor)) {
        setArea(valor);
        setAnuncio(`Área seleccionada: ${valor}.`);
      }
    };
    window.addEventListener(EVENTO_PRESELECCION, alPreseleccionar);
    return () => window.removeEventListener(EVENTO_PRESELECCION, alPreseleccionar);
  }, []);

  // Turnstile se carga solo cuando el formulario entra en pantalla.
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;
    const contenedor = turnstileRef.current;
    const montar = () =>
      window.turnstile?.render(contenedor, {
        sitekey: turnstileSiteKey,
        language: "es",
        theme: "dark",
        "response-field-name": "cf-turnstile-response",
      });
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        if (window.turnstile) return void montar();
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.onload = montar;
        document.head.appendChild(script);
      },
      { rootMargin: "200px" },
    );
    observador.observe(contenedor);
    return () => observador.disconnect();
  }, [turnstileSiteKey]);

  async function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = new FormData(form);
    const nuevos = validar(datos, Boolean(turnstileSiteKey));
    setErrores(nuevos);

    const campos = Object.keys(nuevos) as Campo[];
    if (campos.length) {
      setAnuncio(`El formulario tiene ${campos.length} ${campos.length === 1 ? "error" : "errores"}. Revise los campos marcados.`);
      form.querySelector<HTMLElement>(`[name="${campos[0] === "turnstile" ? "consentimiento" : campos[0]}"]`)?.focus();
      return;
    }

    const cuerpo = {
      nombre: String(datos.get("nombre")).trim(),
      telefono: String(datos.get("telefono")).trim(),
      correo: String(datos.get("correo") ?? "").trim(),
      area: String(datos.get("area")),
      modalidad: String(datos.get("modalidad")),
      descripcion: String(datos.get("descripcion")).trim(),
      consentimiento: true,
      consentimiento_version: versionPrivacidad,
      website: String(datos.get("website") ?? ""),
      turnstileToken: String(datos.get("cf-turnstile-response") ?? ""),
    };

    setEstado("enviando");
    setAnuncio("Enviando su solicitud…");

    try {
      if (!endpoint) {
        if (import.meta.env.DEV) {
          console.warn("[FormularioConsulta] PUBLIC_CONSULTA_ENDPOINT no está configurado; se simula el envío en desarrollo.", cuerpo);
        } else {
          throw new Error("Formulario sin endpoint configurado");
        }
      } else {
        const respuesta = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      }
      registrarEvento("envio_formulario", { area: cuerpo.area });
      window.location.assign("/gracias");
    } catch (error) {
      console.error(error);
      setEstado("error");
      setAnuncio("No pudimos enviar su solicitud. Intente de nuevo o escríbanos por WhatsApp.");
      if (turnstileSiteKey) window.turnstile?.reset();
    }
  }

  const idCampo = (campo: Campo) => `${id}-${campo}`;
  const propsError = (campo: Campo) =>
    errores[campo]
      ? { "aria-invalid": true as const, "aria-describedby": `${idCampo(campo)}-error` }
      : {};
  const mensajeError = (campo: Campo) =>
    errores[campo] ? (
      <p id={`${idCampo(campo)}-error`} className="error-campo">
        {errores[campo]}
      </p>
    ) : null;

  const etiqueta = "mb-2 block text-sm font-medium text-text";
  const requerido = <span className="text-gold" aria-hidden="true"> *</span>;

  return (
    <form ref={formRef} onSubmit={alEnviar} noValidate className="grid gap-6" aria-describedby={`${id}-nota`}>
      <p id={`${id}-nota`} className="text-sm text-text-subtle">
        Los campos marcados con <span className="text-gold">*</span> son obligatorios.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={idCampo("nombre")} className={etiqueta}>
            Nombre completo{requerido}
          </label>
          <input
            id={idCampo("nombre")}
            name="nombre"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            className="campo"
            {...propsError("nombre")}
          />
          {mensajeError("nombre")}
        </div>

        <div>
          <label htmlFor={idCampo("telefono")} className={etiqueta}>
            Teléfono o WhatsApp{requerido}
          </label>
          <input
            id={idCampo("telefono")}
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            className="campo"
            {...propsError("telefono")}
          />
          {mensajeError("telefono")}
        </div>

        <div>
          <label htmlFor={idCampo("correo")} className={etiqueta}>
            Correo electrónico <span className="font-normal text-text-subtle">(opcional)</span>
          </label>
          <input
            id={idCampo("correo")}
            name="correo"
            type="email"
            autoComplete="email"
            maxLength={254}
            className="campo"
            {...propsError("correo")}
          />
          {mensajeError("correo")}
        </div>

        <div>
          <label htmlFor={idCampo("area")} className={etiqueta}>
            Área de consulta{requerido}
          </label>
          <div className="relative">
            <select
              id={idCampo("area")}
              name="area"
              required
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="campo appearance-none pr-10"
              {...propsError("area")}
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              {areasFormulario.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            <ChevronDown
              size={20}
              strokeWidth={1.5}
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold"
            />
          </div>
          {mensajeError("area")}
        </div>
      </div>

      <fieldset {...(errores.modalidad ? { "aria-describedby": `${idCampo("modalidad")}-error` } : {})}>
        <legend className={etiqueta}>Modalidad preferida{requerido}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {MODALIDADES.map((m) => (
            <label
              key={m.valor}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-border bg-surface-2 px-4 text-text transition-colors hover:border-gold-dark has-[:checked]:border-gold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold"
            >
              <input type="radio" name="modalidad" value={m.valor} required className="size-4 accent-[#C8983F]" />
              {m.texto}
            </label>
          ))}
        </div>
        {mensajeError("modalidad")}
      </fieldset>

      <div>
        <label htmlFor={idCampo("descripcion")} className={etiqueta}>
          Descripción breve{requerido}
        </label>
        <p id={`${idCampo("descripcion")}-ayuda`} className="mb-2 text-sm text-text-subtle">
          Describa su situación en pocas líneas. No incluya documentos ni datos sensibles; los revisaremos en la consulta.
        </p>
        <textarea
          id={idCampo("descripcion")}
          name="descripcion"
          rows={5}
          required
          maxLength={MAX_DESCRIPCION}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="campo resize-y"
          aria-invalid={errores.descripcion ? true : undefined}
          aria-describedby={[
            `${idCampo("descripcion")}-ayuda`,
            `${idCampo("descripcion")}-contador`,
            errores.descripcion ? `${idCampo("descripcion")}-error` : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <div className="flex items-start justify-between gap-4">
          {mensajeError("descripcion") ?? <span />}
          <p
            id={`${idCampo("descripcion")}-contador`}
            className={`mt-1.5 shrink-0 text-xs tabular-nums ${descripcion.length > MAX_DESCRIPCION * 0.9 ? "text-gold" : "text-text-subtle"}`}
          >
            {descripcion.length} / {MAX_DESCRIPCION}
          </p>
        </div>
      </div>

      {/* Campo trampa (honeypot): oculto para personas, debe llegar vacío. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>No complete este campo</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem]">
          <input
            type="checkbox"
            name="consentimiento"
            value="true"
            required
            className="mt-1 size-5 shrink-0 accent-[#C8983F]"
            {...propsError("consentimiento")}
          />
          <span>
            He leído y acepto la{" "}
            <a href="/privacidad" target="_blank" className="enlace">
              Política de privacidad
            </a>{" "}
            y autorizo el uso de mis datos para responder esta solicitud.
          </span>
        </label>
        {mensajeError("consentimiento")}
      </div>

      {turnstileSiteKey && (
        <div>
          <div ref={turnstileRef} className="min-h-[65px]" />
          {mensajeError("turnstile")}
        </div>
      )}

      {estado === "error" && (
        <div role="alert" className="rounded border border-[#e5484d]/50 bg-[#e5484d]/10 p-4 text-sm text-text">
          No pudimos enviar su solicitud. Intente de nuevo en unos minutos o{" "}
          <a href={whatsapp} target="_blank" rel="noopener" className="enlace" data-evento="clic_whatsapp" data-origen="formulario-error">
            escríbanos por WhatsApp
          </a>
          .
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="boton boton-primario disabled:cursor-wait disabled:opacity-70" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar solicitud"}
        </button>
        <p className="text-xs text-text-subtle">
          Consulte también el <a href="/aviso-legal" className="enlace">Aviso legal</a> y la{" "}
          <a href="/cookies" className="enlace">Política de cookies</a>.
        </p>
      </div>

      <p className="sr-only" aria-live="polite" role="status">
        {anuncio}
      </p>
    </form>
  );
}
