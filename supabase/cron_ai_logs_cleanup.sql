-- ─────────────────────────────────────────────────────────────────────────────
-- AI USAGE LOGS — OTONOM TEMİZLİK
-- ai_usage_logs tablosu rate-limit penceresi 1 saat olsa bile 24 saatten eski
-- satırları gece 03:00'te (UTC) otomatik siler. Tablo şişmesini engeller.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Aynı isimle bir job varsa önce kaldır (idempotent re-run için)
SELECT cron.unschedule('ai-usage-logs-cleanup')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'ai-usage-logs-cleanup');

-- Günlük 03:00 UTC — DELETE 24h öncesi
SELECT cron.schedule(
  'ai-usage-logs-cleanup',
  '0 3 * * *',
  $$DELETE FROM public.ai_usage_logs WHERE created_at < NOW() - INTERVAL '24 hours'$$
);

-- Doğrulama: tüm aktif job'ları listele
-- SELECT jobname, schedule, command, active FROM cron.job;
