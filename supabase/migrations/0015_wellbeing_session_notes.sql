-- Regain — notes libres en fin de séance bien-être, à analyser plus tard par l'agent IA

alter table public.wellbeing_sessions_completed add column if not exists note text;
