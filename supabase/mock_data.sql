-- ─────────────────────────────────────────────────────────────────────────────
-- Mock Veri — Supabase SQL Editor'a yapıştır ve çalıştır
-- ─────────────────────────────────────────────────────────────────────────────

-- UUID'leri sabit tanımlıyoruz ki paketler kliniklere referans verebilsin
DO $$
DECLARE
  -- Klinik ID'leri
  k1 UUID := 'a1000000-0000-0000-0000-000000000001';
  k2 UUID := 'a1000000-0000-0000-0000-000000000002';
  k3 UUID := 'a1000000-0000-0000-0000-000000000003';
  k4 UUID := 'a1000000-0000-0000-0000-000000000004';
  k5 UUID := 'a1000000-0000-0000-0000-000000000005';
  k6 UUID := 'a1000000-0000-0000-0000-000000000006';
  k7 UUID := 'a1000000-0000-0000-0000-000000000007';
  k8 UUID := 'a1000000-0000-0000-0000-000000000008';
BEGIN

-- ─── KLİNİKLER ───────────────────────────────────────────────────────────────

INSERT INTO klinikler (id, isim, sehir, uzmanlik, puan, akredite, fiyat_aralik, fotograf_url) VALUES

-- İSTANBUL
(k1,
 'Vera Estetik & Diş Kliniği',
 'İstanbul',
 ARRAY['estetik cerrahi', 'diş'],
 4.8, TRUE,
 '1500€ - 5000€',
 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'),

(k2,
 'MedPoint Kardiyoloji ve Ortopedi Merkezi',
 'İstanbul',
 ARRAY['kardiyoloji', 'ortopedi'],
 4.5, TRUE,
 '2000€ - 4500€',
 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800'),

(k3,
 'Boğaziçi Göz Hastanesi',
 'İstanbul',
 ARRAY['göz', 'estetik cerrahi'],
 4.2, FALSE,
 '800€ - 2500€',
 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'),

-- ANTALYA
(k4,
 'Sunmed Diş ve Ağız Sağlığı Kliniği',
 'Antalya',
 ARRAY['diş', 'estetik cerrahi'],
 4.9, TRUE,
 '900€ - 3000€',
 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800'),

(k5,
 'Akdeniz Ortopedi & Spor Kliniği',
 'Antalya',
 ARRAY['ortopedi'],
 3.9, FALSE,
 '1200€ - 3500€',
 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800'),

(k6,
 'Riviera Göz Merkezi',
 'Antalya',
 ARRAY['göz'],
 4.6, TRUE,
 '850€ - 2200€',
 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=800'),

-- İZMİR
(k7,
 'Ege Diş Kliniği',
 'İzmir',
 ARRAY['diş'],
 3.2, FALSE,
 '700€ - 2000€',
 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800'),

(k8,
 'İzmir Estetik & Kardiyoloji Hastanesi',
 'İzmir',
 ARRAY['estetik cerrahi', 'kardiyoloji'],
 4.3, TRUE,
 '1800€ - 5000€',
 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800');


-- ─── PAKETLER ─────────────────────────────────────────────────────────────────

INSERT INTO paketler (id, baslik, klinik_id, otel_isim, ucus_dahil, toplam_fiyat, sure_gun, aciklama) VALUES

-- Vera Estetik (k1) — 2 paket
('b2000000-0000-0000-0000-000000000001',
 'Hollywood Gülüşü Paketi',
 k1,
 'DoubleTree by Hilton İstanbul',
 TRUE, 2800,  7,
 'Porselen kaplama, diş beyazlatma ve gülüş tasarımını kapsayan tam paket. 7 gece konaklama, transfer hizmetleri ve kontrol muayeneleri dahildir.'),

('b2000000-0000-0000-0000-000000000002',
 'Rinoplasti & Yüz Estetiği Paketi',
 k1,
 'The Marmara Taksim',
 TRUE, 4200,  10,
 'Rinoplasti (burun estetiği) ameliyatı, 3 gece hastane konaklaması ve 7 gece otel dahil. Ameliyat öncesi-sonrası konsültasyon, ilaç ve pansuman hizmetleri pakete dahildir.'),

-- MedPoint Kardiyoloji (k2) — 2 paket
('b2000000-0000-0000-0000-000000000003',
 'Kapsamlı Kardiyoloji Check-Up Paketi',
 k2,
 'Radisson Blu Hotel İstanbul',
 FALSE, 2200,  5,
 'Efor testi, ekokardiyografi, holter monitörizasyonu ve uzman kardiyolog konsültasyonu içerir. Raporlar Türkçe ve İngilizce olarak teslim edilir.'),

('b2000000-0000-0000-0000-000000000004',
 'Diz & Kalça Protezi Rehabilitasyon Paketi',
 k2,
 'Marriott İstanbul Şişli',
 TRUE, 4500,  14,
 'Diz veya kalça protezi ameliyatı, 5 gece hastane yatışı ve 9 gece rehabilitasyon oteli konaklamasını kapsar. Fizyoterapi seansları ve transfer hizmetleri pakete dahildir.'),

-- Boğaziçi Göz (k3) — 1 paket
('b2000000-0000-0000-0000-000000000005',
 'Lazer Göz Ameliyatı (LASIK) Paketi',
 k3,
 'Hampton Inn İstanbul',
 FALSE, 1100,  4,
 'Her iki göz için LASIK ameliyatı, ameliyat öncesi detaylı muayene ve ameliyat sonrası 2 kontrol viziti dahildir. Geceleri şehir manzaralı 4 yıldızlı otel konaklaması.'),

-- Sunmed Diş (k4) — 2 paket
('b2000000-0000-0000-0000-000000000006',
 'Tam Ağız Restorasyonu Paketi',
 k4,
 'Rixos Premium Belek',
 TRUE, 3000,  10,
 'Zirkonyum kaplama, implant ve diş eti estetiğini kapsayan tam ağız yenileme paketi. 5 yıldızlı resort otel konaklaması, havalimanı transferi ve sonsuz içki dahildir.'),

('b2000000-0000-0000-0000-000000000007',
 'Diş İmplantı & Beyazlatma Paketi',
 k4,
 'Titanic Deluxe Belek',
 FALSE, 1400,  5,
 'Tek implant uygulaması, profesyonel diş beyazlatma ve genel diş temizliği. 5 gece ultra her şey dahil otel konaklaması ve klinik transferleri pakete dahildir.'),

-- Akdeniz Ortopedi (k5) — 1 paket
('b2000000-0000-0000-0000-000000000008',
 'Spor Sakatlıkları Tedavi Paketi',
 k5,
 'Sheraton Antalya Hotel',
 FALSE, 1800,  7,
 'Artroskopik diz veya omuz ameliyatı, 2 gece hastane ve 5 gece otel konaklaması içerir. Ameliyat sonrası fizik tedavi ve yüzme havuzu rehabilitasyonu pakete dahildir.'),

-- Riviera Göz (k6) — 2 paket
('b2000000-0000-0000-0000-000000000009',
 'SMILE Lazer & Tatil Paketi',
 k6,
 'Kempinski Hotel The Dome',
 TRUE, 2100,  6,
 'ReLEx SMILE lazer tedavisi, her iki göz dahil. 6 gece lüks tatil oteli konaklaması ve Antalya havalimanı transferleri ile birlikte rahat bir iyileşme süreci sunulmaktadır.'),

('b2000000-0000-0000-0000-000000000010',
 'Katarakt Ameliyatı Paketi',
 k6,
 'Delphin BE Grand Resort',
 FALSE, 950,  4,
 'Tek veya çift göz katarakt ameliyatı, premium göz içi lens dahil. Ameliyat öncesi ve sonrası kontroller, otel transferleri ve 4 gece konaklama pakete dahildir.'),

-- Ege Diş (k7) — 1 paket
('b2000000-0000-0000-0000-000000000011',
 'Ekonomik Diş Bakım Paketi',
 k7,
 'Hilton İzmir',
 FALSE, 800,  3,
 'Kapsamlı diş muayenesi, röntgen, temizlik ve gerekli dolgu işlemleri dahil. 3 gece şehir merkezinde otel konaklaması ve klinik transfer hizmetleri pakete dahildir.'),

-- İzmir Estetik (k8) — 1 paket
('b2000000-0000-0000-0000-000000000012',
 'Meme Estetiği & Ege Tatili Paketi',
 k8,
 'Marriott İzmir',
 TRUE, 3600,  9,
 'Meme estetiği (büyütme veya redüksiyon) ameliyatı, 2 gece özel hastane ve 7 gece 5 yıldızlı otel konaklaması içerir. Tüm transferler, konsültasyonlar ve kontrollar pakete dahildir.');

END $$;
