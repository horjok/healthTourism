-- ─── RBAC Schema — Supabase SQL Editor'de bir kez çalıştır ──────────────────

-- Rol enum
CREATE TYPE kullanici_rolu AS ENUM ('super_admin', 'clinic_manager', 'user');

-- Kullanıcı rolleri (her user için 1 satır)
CREATE TABLE IF NOT EXISTS user_roles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  rol              kullanici_rolu NOT NULL DEFAULT 'user',
  klinik_id        UUID REFERENCES klinikler(id) ON DELETE SET NULL,
  olusturma_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- Klinik başvuruları
CREATE TABLE IF NOT EXISTS clinic_applications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  klinik_isim       TEXT NOT NULL,
  iletisim_email    TEXT NOT NULL,
  uzmanlik          TEXT[] NOT NULL,
  sehir             TEXT NOT NULL,
  aciklama          TEXT,
  durum             TEXT NOT NULL DEFAULT 'pending'
                      CHECK (durum IN ('pending', 'approved', 'rejected')),
  klinik_id         UUID REFERENCES klinikler(id) ON DELETE SET NULL,
  admin_notu        TEXT,
  olusturma_tarihi  TIMESTAMPTZ DEFAULT NOW(),
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- Destek biletleri
CREATE TABLE IF NOT EXISTS tickets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kullanici_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  konu              TEXT NOT NULL,
  mesaj             TEXT NOT NULL,
  durum             TEXT NOT NULL DEFAULT 'acik'
                      CHECK (durum IN ('acik', 'islemde', 'kapali')),
  admin_yaniti      TEXT,
  olusturma_tarihi  TIMESTAMPTZ DEFAULT NOW(),
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE kullanici_id = auth.uid() AND rol = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION get_kullanici_klinik_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER AS $$
  SELECT klinik_id FROM user_roles WHERE kullanici_id = auth.uid();
$$;

-- ─── RLS: user_roles ──────────────────────────────────────────────────────────

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select"
  ON user_roles FOR SELECT
  USING (kullanici_id = auth.uid() OR is_super_admin());

CREATE POLICY "user_roles_admin_all"
  ON user_roles FOR ALL
  USING (is_super_admin());

-- ─── RLS: clinic_applications ─────────────────────────────────────────────────

ALTER TABLE clinic_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select"
  ON clinic_applications FOR SELECT
  USING (kullanici_id = auth.uid() OR is_super_admin());

CREATE POLICY "applications_insert"
  ON clinic_applications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "applications_update"
  ON clinic_applications FOR UPDATE
  USING (is_super_admin());

-- ─── RLS: tickets ─────────────────────────────────────────────────────────────

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select"
  ON tickets FOR SELECT
  USING (kullanici_id = auth.uid() OR is_super_admin());

CREATE POLICY "tickets_insert"
  ON tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tickets_update"
  ON tickets FOR UPDATE
  USING (is_super_admin());

-- ─── RLS: paketler — clinic_manager kendi kliniğinin paketlerini yönetir ──────

CREATE POLICY "paketler_clinic_manager"
  ON paketler FOR ALL
  USING (klinik_id = get_kullanici_klinik_id() OR is_super_admin());

-- ─── RLS: klinikler — clinic_manager kendi kliniğini güncelleyebilir ──────────

CREATE POLICY "klinikler_clinic_manager_update"
  ON klinikler FOR UPDATE
  USING (id = get_kullanici_klinik_id() OR is_super_admin());

-- ─── İndeksler ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_roles_kullanici    ON user_roles(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_applications_kullanici  ON clinic_applications(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_applications_durum      ON clinic_applications(durum);
CREATE INDEX IF NOT EXISTS idx_tickets_kullanici       ON tickets(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_tickets_durum           ON tickets(durum);
