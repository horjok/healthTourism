-- ─────────────────────────────────────────────────────────────────────────────
-- Mock Veri — Supabase SQL Editor'a yapıştır ve çalıştır
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  k1  UUID := 'a1000000-0000-0000-0000-000000000001';
  k2  UUID := 'a1000000-0000-0000-0000-000000000002';
  k3  UUID := 'a1000000-0000-0000-0000-000000000003';
  k4  UUID := 'a1000000-0000-0000-0000-000000000004';
  k5  UUID := 'a1000000-0000-0000-0000-000000000005';
  k6  UUID := 'a1000000-0000-0000-0000-000000000006';
  k7  UUID := 'a1000000-0000-0000-0000-000000000007';
  k8  UUID := 'a1000000-0000-0000-0000-000000000008';
  -- Yeni klinikler
  k9  UUID := 'a1000000-0000-0000-0000-000000000009';
  k10 UUID := 'a1000000-0000-0000-0000-000000000010';
  k11 UUID := 'a1000000-0000-0000-0000-000000000011';
BEGIN

-- ─── KLİNİKLER ───────────────────────────────────────────────────────────────

INSERT INTO klinikler (id, isim, sehir, uzmanlik, puan, akredite, fiyat_aralik, fotograf_url)
VALUES
  (k1,  'Vera Estetik & Diş Kliniği',                  'İstanbul', ARRAY['estetik cerrahi', 'diş'],            4.8, TRUE,  '1500€ - 5000€',  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'),
  (k2,  'MedPoint Kardiyoloji ve Ortopedi Merkezi',     'İstanbul', ARRAY['kardiyoloji', 'ortopedi'],            4.5, TRUE,  '2000€ - 4500€',  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800'),
  (k3,  'Boğaziçi Göz Hastanesi',                      'İstanbul', ARRAY['göz', 'estetik cerrahi'],             4.2, FALSE, '800€ - 2500€',   'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'),
  (k4,  'Sunmed Diş ve Ağız Sağlığı Kliniği',          'Antalya',  ARRAY['diş', 'estetik cerrahi'],             4.9, TRUE,  '900€ - 3000€',   'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800'),
  (k5,  'Akdeniz Ortopedi & Spor Kliniği',              'Antalya',  ARRAY['ortopedi'],                           3.9, FALSE, '1200€ - 3500€',  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800'),
  (k6,  'Riviera Göz Merkezi',                          'Antalya',  ARRAY['göz'],                                4.6, TRUE,  '850€ - 2200€',   'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800'),
  (k7,  'Ege Diş Kliniği',                              'İzmir',    ARRAY['diş'],                                3.2, FALSE, '700€ - 2000€',   'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800'),
  (k8,  'İzmir Estetik & Kardiyoloji Hastanesi',        'İzmir',    ARRAY['estetik cerrahi', 'kardiyoloji'],     4.3, TRUE,  '1800€ - 5000€',  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'),
  -- Yeni klinikler
  (k9,  'İstanbul Nöroloji & Psikiyatri Merkezi',       'İstanbul', ARRAY['nöroloji', 'psikiyatri'],             4.7, TRUE,  '1200€ - 4000€',  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
  (k10, 'Antalya Derm & Saç Ekimi Kliniği',             'Antalya',  ARRAY['dermatoloji', 'saç ekimi'],           4.4, FALSE, '600€ - 3500€',   'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800'),
  (k11, 'Ege Onkoloji & Kanser Tedavi Merkezi',         'İzmir',    ARRAY['onkoloji'],                           4.9, TRUE,  '3000€ - 12000€', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800')
ON CONFLICT (id) DO NOTHING;


-- ─── PAKETLER ─────────────────────────────────────────────────────────────────
-- Kolon sırası: id, baslik, klinik_id, otel_isim, otel_dahil, ucus_dahil, toplam_fiyat, sure_gun, aciklama

INSERT INTO paketler (id, baslik, klinik_id, otel_isim, otel_dahil, ucus_dahil, toplam_fiyat, sure_gun, aciklama)
VALUES
  -- Vera Estetik (k1)
  ('b2000000-0000-0000-0000-000000000001', 'Hollywood Gülüşü Paketi',                k1,  'DoubleTree by Hilton İstanbul', TRUE,  TRUE,  2800,  7,  'Porselen kaplama, diş beyazlatma ve gülüş tasarımını kapsayan tam paket. 7 gece konaklama, transfer ve kontrol muayeneleri dahildir.'),
  ('b2000000-0000-0000-0000-000000000002', 'Rinoplasti & Yüz Estetiği Paketi',       k1,  'The Marmara Taksim',            TRUE,  TRUE,  4200,  10, 'Rinoplasti ameliyatı, 3 gece hastane ve 7 gece otel dahil. Ameliyat öncesi-sonrası konsültasyon, ilaç ve pansuman hizmetleri pakete dahildir.'),

  -- MedPoint Kardiyoloji (k2)
  ('b2000000-0000-0000-0000-000000000003', 'Kapsamlı Kardiyoloji Check-Up Paketi',   k2,  '',                              FALSE, FALSE, 2200,  3,  'Efor testi, ekokardiyografi, holter monitörizasyonu ve uzman kardiyolog konsültasyonu. Raporlar Türkçe ve İngilizce olarak teslim edilir.'),
  ('b2000000-0000-0000-0000-000000000004', 'Diz & Kalça Protezi Rehabilitasyon Paketi', k2, 'Marriott İstanbul Şişli',    TRUE,  TRUE,  4500,  14, 'Diz veya kalça protezi ameliyatı, 5 gece hastane yatışı ve 9 gece rehabilitasyon oteli konaklaması. Fizyoterapi ve transferler dahildir.'),

  -- Boğaziçi Göz (k3)
  ('b2000000-0000-0000-0000-000000000005', 'Lazer Göz Ameliyatı (LASIK) Paketi',    k3,  '',                              FALSE, FALSE, 1100,  2,  'Her iki göz için LASIK ameliyatı, ameliyat öncesi muayene ve 2 kontrol viziti dahildir. Otel konaklaması pakete dahil değildir.'),

  -- Sunmed Diş (k4)
  ('b2000000-0000-0000-0000-000000000006', 'Tam Ağız Restorasyonu Paketi',           k4,  'Rixos Premium Belek',           TRUE,  TRUE,  3000,  10, 'Zirkonyum kaplama, implant ve diş eti estetiği. 5 yıldızlı resort otel, havalimanı transferi ve sonsuz içki dahildir.'),
  ('b2000000-0000-0000-0000-000000000007', 'Diş İmplantı & Beyazlatma Paketi',       k4,  'Titanic Deluxe Belek',          TRUE,  FALSE, 1400,  5,  'Tek implant uygulaması, diş beyazlatma ve genel temizlik. 5 gece ultra her şey dahil otel ve klinik transferleri pakete dahildir.'),

  -- Akdeniz Ortopedi (k5)
  ('b2000000-0000-0000-0000-000000000008', 'Spor Sakatlıkları Tedavi Paketi',        k5,  '',                              FALSE, FALSE, 1800,  4,  'Artroskopik diz veya omuz ameliyatı, 2 gece hastane yatışı. Ameliyat sonrası fizik tedavi seansları pakete dahildir.'),

  -- Riviera Göz (k6)
  ('b2000000-0000-0000-0000-000000000009', 'SMILE Lazer & Tatil Paketi',             k6,  'Kempinski Hotel The Dome',      TRUE,  TRUE,  2100,  6,  'ReLEx SMILE lazer tedavisi (her iki göz). 6 gece lüks tatil oteli ve Antalya havalimanı transferleri dahildir.'),
  ('b2000000-0000-0000-0000-000000000010', 'Katarakt Ameliyatı Paketi',              k6,  '',                              FALSE, FALSE, 950,   3,  'Tek veya çift göz katarakt ameliyatı, premium göz içi lens dahil. Ameliyat öncesi ve sonrası kontroller pakete dahildir.'),

  -- Ege Diş (k7)
  ('b2000000-0000-0000-0000-000000000011', 'Ekonomik Diş Bakım Paketi',              k7,  '',                              FALSE, FALSE, 800,   2,  'Kapsamlı muayene, röntgen, temizlik ve dolgu işlemleri. Transfer hizmetleri dahildir; otel konaklaması pakete dahil değildir.'),

  -- İzmir Estetik (k8)
  ('b2000000-0000-0000-0000-000000000012', 'Meme Estetiği & Ege Tatili Paketi',      k8,  'Marriott İzmir',                TRUE,  TRUE,  3600,  9,  'Meme estetiği ameliyatı, 2 gece özel hastane ve 7 gece 5 yıldızlı otel. Tüm transferler ve kontroller dahildir.'),

  -- İstanbul Nöroloji (k9) — YENİ
  ('b2000000-0000-0000-0000-000000000013', 'Kapsamlı Nöroloji Tanı Paketi',          k9,  'Wyndham Grand İstanbul',        TRUE,  FALSE, 1900,  4,  'EEG, EMG, beyin MRI ve uzman nörolog konsültasyonu. 4 gece 5 yıldızlı otel konaklaması ve tüm transferler dahildir.'),
  ('b2000000-0000-0000-0000-000000000014', 'Psikiyatri & Zihinsel Sağlık Destek Paketi', k9, '',                           FALSE, FALSE, 1200,  5,  'Psikiyatrist değerlendirmesi, terapi seansları ve tedavi planı oluşturma. Ayaktan tedavi paketi; otel ve uçuş dahil değildir.'),

  -- Antalya Derm & Saç (k10) — YENİ
  ('b2000000-0000-0000-0000-000000000015', 'FUE Saç Ekimi & Tatil Paketi',           k10, 'Maxx Royal Belek',              TRUE,  TRUE,  2500,  7,  'FUE yöntemiyle saç ekimi (3000 greft), PRP tedavisi. 7 gece 5 yıldızlı otel, transfer ve tedavi sonrası bakım kiti dahildir.'),
  ('b2000000-0000-0000-0000-000000000016', 'Dermatoloji & Lazer Cilt Bakım Paketi',  k10, '',                              FALSE, FALSE, 750,   3,  'Cilt analizi, lazer epilasyon (3 bölge), kimyasal peeling ve C vitamini mezoterapi. Otel ve uçuş pakete dahil değildir.'),

  -- Ege Onkoloji (k11) — YENİ
  ('b2000000-0000-0000-0000-000000000017', 'Onkoloji Erken Tanı & Tarama Paketi',    k11, 'Hilton İzmir',                  TRUE,  TRUE,  4200,  6,  'PET-CT, tümör belirteçleri paneli, onkolog konsültasyonu ve ikinci görüş. 6 gece 5 yıldızlı otel ve tüm transferler dahildir.'),
  ('b2000000-0000-0000-0000-000000000018', 'Kanser Tedavi Destek Paketi',            k11, 'Marriott İzmir',                TRUE,  TRUE,  9500,  21, 'Kemoterapi veya hedefe yönelik tedavi protokolü, 3 haftalık yönetilen süreç. Uzman onkolog ekibi, 5 yıldızlı otel ve transferler dahildir.')

ON CONFLICT (id) DO NOTHING;

END $$;
