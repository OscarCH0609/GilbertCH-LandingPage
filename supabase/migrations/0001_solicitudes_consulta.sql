-- supabase/migrations/0001_solicitudes_consulta.sql
create table public.solicitudes_consulta (
  id                     uuid primary key default gen_random_uuid(),
  creado_en              timestamptz not null default now(),
  nombre                 text not null check (char_length(nombre) between 2 and 120),
  telefono               text not null check (char_length(telefono) between 8 and 20),
  correo                 text check (correo is null
                           or correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  area                   text not null,
  modalidad              text not null
                           check (modalidad in ('presencial','virtual','sin_preferencia')),
  descripcion            text not null check (char_length(descripcion) <= 1000),
  consentimiento         boolean not null check (consentimiento = true),
  consentimiento_version text not null,          -- versión de la política aceptada
  estado                 text not null default 'nueva'
                           check (estado in ('nueva','contactada','agendada','descartada'))
);

create index solicitudes_consulta_creado_en_idx
  on public.solicitudes_consulta (creado_en desc);

-- RLS activo y SIN políticas para anon/authenticated:
-- nadie puede leer ni escribir desde el navegador.
-- Solo la Edge Function (service role) inserta registros.
alter table public.solicitudes_consulta enable row level security;
