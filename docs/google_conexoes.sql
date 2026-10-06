-- Tabela das conexões com a Google Agenda (uma linha por astrólogo). Rodar UMA vez no Supabase (SQL Editor).
-- O token do Google fica CIFRADO (o servidor da Vercel cifra antes de gravar). Ninguém lê esta tabela pelo navegador:
-- RLS ligada e SEM nenhuma policy; só a chave de serviço (SUPABASE_SERVICE_ROLE_KEY, guardada na Vercel) acessa.
create table if not exists public.google_conexoes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token_cifrado text not null,
  email text,
  principal text,                                  -- agenda que recebe os agendamentos (padrão: a principal da conta)
  ignoradas jsonb not null default '[]'::jsonb,    -- agendas que o astrólogo desmarcou (NÃO bloqueiam horário)
  atualizado_em timestamptz not null default now()
);
alter table public.google_conexoes enable row level security;
revoke all on public.google_conexoes from anon, authenticated;
