# HealthTour — Frontend Geliştirici Özeti

**Hackathon | 9 Günlük Sprint | 2 Kişilik Ekip**  
**Rol: Frontend Geliştirici (Kişi B)**

---

## Projeye Katkılarım

### 1. Mock Veri Hazırlama
Projenin tüm sabit verilerini ben oluşturdum. Bu veriler hem Gemini AI'ın çalışması hem de tüm sayfaların içeriği için temel oluşturuyor.

**`/data/clinics.json`** — 10 klinik kaydı
- İstanbul ve Antalya'daki gerçek klinik isimleri ve özellikleri
- JCI akreditasyon bilgileri, rating, uzmanlık alanları, Unsplash görselleri

**`/data/hotels.json`** — 10 otel kaydı
- Vikingen Infinity, Maxx Royal, Paloma Grida, Eftalya Ocean, Rixos Premium (Antalya)
- Çırağan Palace, Four Seasons, Mandarin Oriental, Hilton Bosphorus (İstanbul)
- 3–5 yıldız, gecelik fiyatlar, olanaklar listesi

**`/data/packages.json`** — 12 hazır paket
- Demo senaryosu paketi dahil (diz ağrısı, 3000€, Antalya)
- Klinik + otel + uçuş + transfer fiyat dökümü

**`/data/flights.json`** — 30 uçuş rotası
- İngiltere (LHR, LGW, LTN, MAN, BHX, EDI, BRS, LPL, NCL, BFS)
- Amerika (JFK, LAX, ORD, MIA, IAH, IAD, BOS)
- Tayland (BKK, HKT), Güney Kore (ICN, PUS)
- EasyJet, Turkish Airlines, British Airways, Emirates, KLM, Lufthansa, Air France, Pegasus

---

### 2. Tasarım Sistemi

**Renk paleti:**
- Primary: `#0A2342` (koyu lacivert)
- Secondary: `#0f3460` (orta lacivert)
- Accent/CTA: `#F77F00` turuncu → butonlarda
- Background: `#f8fafc`

**Tipografi:** Geist Sans (Next.js varsayılanı)

**Component stili:** rounded-2xl / rounded-3xl kartlar, shadow-sm/lg, hover animasyonları (scale + shadow)

---

### 3. Geliştirilen Sayfalar

#### Ana Sayfa (`/`)
- Hero section: gradient arka plan + Unsplash görsel overlay, istatistik sayaçları (500+ Klinik, 50+ Ülke, %98 Memnuniyet, 200+ Doktor)
- 4 kategori kartı: Saç Ekimi, Diş Sağlığı, Estetik Cerrahi, Göz Tedavisi (renkli gradient)
- Öne çıkan 3 paket — API'den canlı çekilen veriler
- Görsel bant (3 Unsplash fotoğrafı — estetik, diş, göz)
- "Neden HealthTour?" bölümü (görsel + ikon kartlar)
- Güven bant (JCI, Gizlilik, 7/24 Destek, Güvenli Ödeme)
- CTA Banner
- Footer

#### Sağlık Sayfası (`/health`)
- Şikayet yazma alanı (textarea + AI'ya yönlendirme)
- 4 kategori seçimi (Saç Ekimi, Diş, Estetik, Göz)
- Operasyon seçim grid'i (kategori bazında)
- Klinik seçimi (yıldız filtresi, doktor detay açılır panel)
- Tarih seçimi
- Sepete Ekle butonu

#### Otel Sayfası (`/hotels`)
- Şehir tabları (Antalya, İstanbul, İzmir)
- Yıldız filtresi (4★, 5★)
- 16 otel kartı — görsel, yıldız, olanaklar, gece sayısı seçici
- Fiyat hesaplama (gece × fiyat = toplam)
- Sepete Ekle butonu

#### Uçuş Sayfası (`/flights`)
- Varış noktası filtresi (İstanbul, Antalya, İzmir)
- Havayolu filtresi
- Fiyat slider (max $1000)
- Direkt uçuş checkbox
- Sıralama (En Ucuz / En Hızlı)
- 30 uçuş — rota göstergesi, süre, direkt/aktarmalı badge
- Sepete Ekle butonu (yeşile dönme animasyonu)

#### Transfer Sayfası (`/transfer`)
- Normal Transfer ($30/kişi) vs VIP Transfer ($80/araç)
- VIP: Mercedes, özel şoför, fast-track, ikram
- "ÖNERİLEN" rozeti
- Rota göstergesi (Havalimanı → Otel → Klinik → Otel → Havalimanı)
- Sepete Ekle → otomatik /cart yönlendirme

#### Tur Sayfası (`/tours`)
- Şehir tabları (Antalya, İstanbul, İzmir)
- Kategori filtreleri (Kültür, Deniz, Macera, Spa, Gastronomi, Doğa, Eğlence, Alışveriş)
- 25 aktivite kartı — Unsplash görseli, süre, fiyat
- Miktar seçici (kişi sayısı)
- Sepete Ekle butonu

#### Sepet Sayfası (`/cart`)
- Yolcu sayısı seçimi (Yetişkin + Çocuk)
- Ürün listesi (uçuş, otel, klinik, transfer, tur)
- Fiyat dökümü (ara toplam + %8 vergi = toplam)
- Sepeti temizle
- "Rezervasyonu Tamamla" → /booking

#### Rezervasyon Sayfası (`/booking`)
- 3 adımlı akış: Sipariş Özeti → Kişisel Bilgiler & Özel Yardım → Ödeme
- Sepetteki tüm ürünleri göster
- Yolcu bilgileri formu (validasyonlu)
- **Special Assistance bölümü:**
  - Fiziksel: Tekerlekli Sandalye, Yürüme Güçlüğü, Görme Engeli, İşitme Engeli, Koltuk Değneği
  - Zihinsel: Anksiyete, Otizm, PTSD, Demans
  - Tıbbi: Oksijen Cihazı, Diyabet, Hamilelik (hafta input), Ameliyat Sonrası, Diğer
  - Acil iletişim kişisi (seçim yapıldığında görünür)
- Mock ödeme formu entegrasyonu

---

### 4. Global Sistem Bileşenleri

#### Dil Sistemi (TR/EN)
- `lib/DilContext.tsx` — React Context ile global dil state
- `lib/i18n.ts` — çeviri anahtarları
- localStorage ile dil tercihi kaydediliyor
- Navbar'da TR/EN toggle butonu
- Tüm sayfalarda `useDilContext()` hook'u kullanımı

#### Sepet Sistemi (Zustand)
- `lib/cartStore.ts` — Zustand store
- `CartItem` tipleri: flight, package, transfer, tour
- `Passengers` state (yetişkin + çocuk)
- localStorage persist
- Navbar'da sepet ikonu + badge (ürün sayısı)
- `addItem()`, `removeItem()`, `clearCart()`, `totalPrice()`, `totalItems()` fonksiyonları

#### Navbar (`components/ui/Navbar.tsx`)
- Sticky top
- Logo, navigasyon linkleri, sepet ikonu, TR/EN butonu, Giriş Yap
- Aktif sayfa highlight
- Mobil hamburger menü
- 7 sayfa linki: Sağlık, Paketler, Oteller, Uçuşlar, Transfer, Turlar, AI Öneri

---

### 5. Teknik Kararlar

| Karar | Neden |
|-------|-------|
| Zustand ile sepet | React Context'ten daha performanslı, localStorage persist kolay |
| Hardcoded JSON verisi | Dış API gerekmez, demo için hızlı ve güvenilir |
| Unsplash URL görselleri | Ücretsiz, yüksek kalite, CDN üzerinden hızlı yükleme |
| Tailwind CSS | Hızlı geliştirme, tutarlı stil |
| `useDilContext` | Context ile dil değişimi tüm sayfayı eş zamanlı günceller |

---

### 6. Demo Senaryosu

**Kullanıcı:** 45 yaşında, diz ağrısı, 3000€ bütçe, Haziran

1. Ana sayfada "Ortopedi" kategorisine tıkla
2. `/health` → şikayet yaz → operasyon seç → klinik seç → sepete ekle
3. `/hotels` → Antalya → 4 gece seç → sepete ekle
4. `/flights` → LHR → AYT → sepete ekle
5. `/transfer` → VIP seç → sepete ekle
6. `/tours` → Tekne Turu ekle
7. `/cart` → özet gör → Rezervasyonu Tamamla
8. `/booking` → bilgileri doldur → special assistance → ödeme

**Paralel:** `/packages?chat=true` → chatbot'a "Dizim ağrıyor, 3000€ bütçem var" yaz → Gemini 3-agent pipeline çalışır → öneri gelir

---

### 7. Kullanılan Teknolojiler

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (sepet state yönetimi)
- **React Context** (dil yönetimi)
- **Unsplash** (görseller)

---

*Toplam sayfa: 8 | Toplam component: 15+ | Veri kaydı: 90+*
