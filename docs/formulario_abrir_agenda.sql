-- "Depois do envio, abrir a minha agenda em seguida" (Configurações → Captação). Rodar UMA vez no Supabase (SQL Editor),
-- ANTES de publicar a versão do site que usa isso (sem a coluna, salvar a Captação dá erro).
alter table public.configuracoes add column if not exists formulario_abrir_agenda boolean not null default false;

-- O formulário público (sem login) pergunta só isso; nenhuma outra configuração sai daqui.
create or replace function public.formulario_abre_agenda(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select formulario_abrir_agenda from public.configuracoes where user_id = p_user), false);
$$;
grant execute on function public.formulario_abre_agenda(uuid) to anon, authenticated;
