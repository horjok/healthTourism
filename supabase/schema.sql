-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. klinikler
CREATE TABLE IF NOT EXISTS klinikler (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isim           TEXT        NOT NULL,
  sehir          TEXT        NOT NULL,
  uzmanlik       TEXT[]      NOT NULL DEFAULT '{}',
  puan           NUMERIC(3,1) NOT NULL CHECK (puan >= 0 AND puan <= 5),
  akredite       BOOLEAN     NOT NULL DEFAULT FALSE,
  fiyat_aralik   TEXT        NOT NULL,
  fotograf_url   TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. paketler
CREATE TABLE IF NOT EXISTS paketler (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baslik         TEXT        NOT NULL,
  klinik_id      UUID        NOT NULL REFERENCES klinikler(id) ON DELETE CASCADE,
  otel_isim      TEXT        NOT NULL,
  ucus_dahil     BOOLEAN     NOT NULL DEFAULT FALSE,
  toplam_fiyat   NUMERIC     NOT NULL CHECK (toplam_fiyat >= 0),
  sure_gun       INTEGER     NOT NULL CHECK (sure_gun > 0),
  aciklama       TEXT        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. rezervasyonlar
CREATE TABLE IF NOT EXISTS rezervasyonlar (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id     UUID        NOT NULL,           -- Supabase Auth user id
  paket_id         UUID        NOT NULL REFERENCES paketler(id) ON DELETE RESTRICT,
  tarih            DATE        NOT NULL,
  durum            TEXT        NOT NULL DEFAULT 'beklemede'
                     CHECK (durum IN ('beklemede', 'onaylandi', 'iptal')),
  olusturma_tarihi TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── İndeksler ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_paketler_klinik_id       ON paketler(klinik_id);
CREATE INDEX IF NOT EXISTS idx_rezervasyonlar_kullanici  ON rezervasyonlar(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_rezervasyonlar_paket      ON rezervasyonlar(paket_id);
CREATE INDEX IF NOT EXISTS idx_klinikler_uzmanlik        ON klinikler USING GIN(uzmanlik);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE klinikler     ENABLE ROW LEVEL SECURITY;
ALTER TABLE paketler      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rezervasyonlar ENABLE ROW LEVEL SECURITY;

-- Herkes klinik ve paketleri okuyabilir
CREATE POLICY "klinikler_herkese_acik"
  ON klinikler FOR SELECT USING (TRUE);

CREATE POLICY "paketler_herkese_acik"
  ON paketler FOR SELECT USING (TRUE);

-- Rezervasyon: sadece kendi kaydını görebilir / oluşturabilir
CREATE POLICY "rezervasyon_sahip_okuyabilir"
  ON rezervasyonlar FOR SELECT
  USING (auth.uid() = kullanici_id);

CREATE POLICY "rezervasyon_sahip_olusturabilir"
  ON rezervasyonlar FOR INSERT
  WITH CHECK (auth.uid() = kullanici_id);

CREATE POLICY "rezervasyon_sahip_guncelleyebilir"
  ON rezervasyonlar FOR UPDATE
  USING (auth.uid() = kullanici_id);

-- ─── Örnek veri (isteğe bağlı) ───────────────────────────────────────────────
INSERT INTO klinikler (isim, sehir, uzmanlik, puan, akredite, fiyat_aralik, fotograf_url)
VALUES
  ('Acıbadem Hastanesi', 'İstanbul', ARRAY['diş', 'estetik', 'ortopedi'], 4.8, TRUE, '2000₺ - 15000₺', 'https://example.com/acibadem.jpg'),
  ('Memorial Sağlık Grubu', 'İstanbul', ARRAY['kalp', 'onkoloji', 'nöroloji'], 4.7, TRUE, '3000₺ - 25000₺', 'https://example.com/memorial.jpg'),
  ('Medicana', 'Ankara', ARRAY['göz', 'estetik', 'diş'], 4.5, TRUE, '1500₺ - 10000₺', 'https://example.com/medicana.jpg');
