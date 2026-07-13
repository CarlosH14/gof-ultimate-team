-- ============================================================
-- Esquema del Quiz de patrones de diseño (proyecto Supabase "GOF Ultimate Team").
-- Reproducible: ejecutar este archivo recrea tablas, RLS, funciones y datos semilla.
-- Aplicado vía migraciones: quiz_schema, quiz_rpc_functions, quiz_seed_questions.
--
-- Diseño de seguridad: las tablas tienen RLS ACTIVADA y SIN políticas, de modo
-- que el rol anónimo no puede leerlas ni escribirlas directamente. Todo el acceso
-- va por funciones RPC SECURITY DEFINER que ocultan la respuesta correcta hasta
-- que el visitante responde (corrección del lado servidor).
-- ============================================================

-- ---------- Tablas ----------

create type quiz_question_type as enum ('caso', 'vf', 'definicion');

create table public.quiz_questions (
  id            uuid primary key default gen_random_uuid(),
  type          quiz_question_type not null,
  prompt        text not null,
  options       jsonb not null,              -- array de strings (opciones a mostrar)
  correct_index smallint not null,           -- índice 0-based de la opción correcta (oculto al cliente)
  explanation   text not null,               -- se revela tras responder
  category      text,
  created_at    timestamptz not null default now(),
  constraint options_es_array check (jsonb_typeof(options) = 'array'),
  constraint correct_index_valido check (correct_index >= 0)
);

create table public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  score       smallint not null check (score >= 0),
  total       smallint not null check (total > 0),
  created_at  timestamptz not null default now(),
  constraint score_no_supera_total check (score <= total)
);

alter table public.quiz_questions enable row level security;   -- sin políticas: acceso solo por RPC
alter table public.quiz_attempts  enable row level security;

-- ---------- Funciones RPC (SECURITY DEFINER) ----------

-- Devuelve n preguntas al azar SIN la respuesta correcta ni la explicación.
create or replace function public.get_quiz(n integer default 10)
returns table (id uuid, type quiz_question_type, prompt text, options jsonb, category text)
language sql security definer set search_path = public, pg_temp as $$
  select q.id, q.type, q.prompt, q.options, q.category
  from public.quiz_questions q
  order by random()
  limit greatest(1, least(coalesce(n, 10), 50));
$$;

-- Corrige una respuesta del lado servidor.
create or replace function public.grade_answer(q_id uuid, choice integer)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare q public.quiz_questions%rowtype;
begin
  select * into q from public.quiz_questions where id = q_id;
  if not found then
    return jsonb_build_object('error', 'pregunta_no_encontrada');
  end if;
  return jsonb_build_object(
    'correct',       (choice is not null and choice = q.correct_index),
    'correct_index', q.correct_index,
    'explanation',   q.explanation
  );
end;
$$;

-- Registra un intento anónimo y devuelve percentil y media global.
create or replace function public.record_attempt(p_score integer, p_total integer)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_total_attempts integer; v_peores integer; v_avg numeric; v_percentile integer;
begin
  if p_total is null or p_total <= 0 or p_score is null or p_score < 0 or p_score > p_total then
    return jsonb_build_object('error', 'datos_invalidos');
  end if;
  insert into public.quiz_attempts (score, total) values (p_score, p_total);
  select count(*) into v_total_attempts from public.quiz_attempts;
  select count(*) into v_peores from public.quiz_attempts
    where (score::numeric / total) < (p_score::numeric / p_total);
  select avg(score::numeric / total) into v_avg from public.quiz_attempts;
  v_percentile := case when v_total_attempts > 0
    then round(100.0 * v_peores / v_total_attempts)::integer else 0 end;
  return jsonb_build_object(
    'percentile', v_percentile, 'total_attempts', v_total_attempts,
    'avg_ratio', round(coalesce(v_avg, 0), 3)
  );
end;
$$;

grant execute on function public.get_quiz(integer)                to anon, authenticated;
grant execute on function public.grade_answer(uuid, integer)      to anon, authenticated;
grant execute on function public.record_attempt(integer, integer) to anon, authenticated;

-- ---------- Datos semilla ----------
-- 21 preguntas (7 por tipo). Ver migración quiz_seed_questions para el contenido completo.
-- (Omitido aquí por brevedad; se carga con esa migración en el proyecto.)
