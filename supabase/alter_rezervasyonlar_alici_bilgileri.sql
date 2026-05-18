-- ─── Alıcı (satın alma yapan) bilgileri ──────────────────────────────────────
-- Satın alma adımında girilen ad/email/telefon — PDF biletinde basılır,
-- geçmiş rezervasyonlarda da form anındaki bilgi gösterilebilsin diye saklanır.

alter table public.rezervasyonlar
  add column if not exists alici_ad      text,
  add column if not exists alici_email   text,
  add column if not exists alici_telefon text;

-- Hızlı arama (admin paneli + raporlar için faydalı)
create index if not exists ix_rezervasyonlar_alici_email
  on public.rezervasyonlar (alici_email);
