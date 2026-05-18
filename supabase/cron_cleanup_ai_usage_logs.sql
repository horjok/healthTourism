-- ─── Otonom Log Temizliği — pg_cron ──────────────────────────────────────────
-- ai_usage_logs rate-limit ledger'ı 24h pencerede sorgulanır; eski satırlar atıl.

-- 1) Extension'ı etkinleştir (Supabase'de Database → Extensions üzerinden de yapılabilir)
create extension if not exists pg_cron with schema extensions;

-- 2) Aynı isimle var olan job'u temizle (idempotent migration)
select cron.unschedule('cleanup_ai_usage_logs')
where exists (select 1 from cron.job where jobname = 'cleanup_ai_usage_logs');

-- 3) Her gün 03:00 UTC'de eski log satırlarını sil
select cron.schedule(
  'cleanup_ai_usage_logs',
  '0 3 * * *',
  $$ delete from public.ai_usage_logs where created_at < now() - interval '24 hours'; $$
);

-- Doğrulama: select * from cron.job where jobname = 'cleanup_ai_usage_logs';
-- Geçmiş çalıştırmalar: select * from cron.job_run_details order by start_time desc limit 10;
