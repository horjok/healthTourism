# HealthTour — Claude Code Proje Kılavuzu

## Proje Nedir?
Sağlık turizm platformu. Kullanıcılar uçak + otel + klinik paketlerini tek yerden keşfeder,
yapay zeka (Gemini) kişisel sağlık şikayetine göre paket önerir, mock ödeme ile rezervasyon tamamlanır.
Bu bir hackathon demosudur — production'a çıkmayacak.

---

## Teknik Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14, App Router, TypeScript |
| Veritabanı | Supabase (PostgreSQL) |
| Yapay Zeka | Google Gemini 1.5 Flash |
| Ödeme | Mock (sahte form, gerçek gateway yok) |
| Deploy | Vercel |
| UI | Tailwind CSS, bileşenler /components altında |

---

## Klasör Yapısı

```
/app
  /page.tsx                    — Ana sayfa
  /packages/page.tsx           — Paket listesi
  /packages/[id]/page.tsx      — Paket detay
  /booking/page.tsx            — Rezervasyon akışı
  /profile/page.tsx            — Kullanıcı profili
  /api
    /ai/chat/route.ts          — Gemini 3-agent pipeline
    /packages/route.ts         — Paket CRUD
    /booking/route.ts          — Rezervasyon oluşturma
    /recommend/route.ts        — Tavsiye algoritması

/lib
  /gemini.ts                   — Gemini client + 3 agent fonksiyonu
  /supabase.ts                 — Supabase client + tüm DB fonksiyonları
  /types.ts                    — Tüm TypeScript interface'leri
  /mock-payment.ts             — Mock ödeme sistemi (Stripe yok, Türkiye kısıtı)

/components
  /ui/                         — Genel UI bileşenleri (Button, Card, Input vb.)
  /chat/                       — AI chatbot bileşenleri
  /packages/                   — Paket kartı, liste, detay bileşenleri
```

---

## Kodlama Kuralları

### Genel
- Her zaman TypeScript kullan, `any` tipi YASAK
- Tüm tipler `/lib/types.ts` dosyasından import edilir, o dosyaya yazılır
- `console.log` sadece geliştirme aşamasında — production'da kaldır
- Yorumlar Türkçe yaz
- Değişken ve fonksiyon isimleri İngilizce yaz (camelCase)
- Hata mesajları Türkçe olsun (kullanıcıya gösterilen her şey)

### API Routes
- Her route tek bir iş yapar
- Başarı: `{ success: true, data: ... }` döndür
- Hata: `{ success: false, error: "Türkçe hata mesajı" }` döndür
- HTTP status kodlarını doğru kullan (200, 400, 404, 500)
- Her route'da try/catch olsun

Örnek route yapısı:
```typescript
export async function GET(request: Request) {
  try {
    const data = await getSomething();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json(
      { success: false, error: "Veri alınamadı, lütfen tekrar deneyin" },
      { status: 500 }
    );
  }
}
```

### Gemini Agent Pipeline
Üç agent sırayla çalışır. Birinin çıktısı diğerinin girdisidir.
Asla paralel çalıştırma — sıra önemli.

```
kullaniciInput
  → Agent 1 (saglikAnalizEt)    — hangi uzmanlık lazım?
  → Agent 2 (paketPlanla)       — klinik + otel + uçuş kombinasyonu
  → Agent 3 (guvenilirlikKontrol) — klinik skoru + uyarı
  → kullanıcıya sonuç
```

Her agent için:
- System prompt Türkçe ve net olsun
- JSON formatında cevap iste (parse edilebilsin)
- Timeout: 15 saniye — aşarsa Türkçe hata ver
- Cevap JSON değilse fallback metin döndür

### Mock Ödeme
`/lib/mock-payment.ts` dosyası sahte ödeme simüle eder.
Gerçek kart bilgisi ASLA isteme, ASLA işleme.
İşlem her zaman başarılı döner (demo ortamı).
2 saniyelik yapay gecikme ekle — gerçekçi görünsün.

### Supabase
- Client'ı her dosyada yeniden oluşturma — `/lib/supabase.ts`'den import et
- Kullanıcı auth için Supabase Auth kullan
- RLS (Row Level Security) aktif bırak

---

## Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=        — Supabase proje URL'i
NEXT_PUBLIC_SUPABASE_ANON_KEY=   — Supabase public key
GEMINI_API_KEY=                  — Google AI Studio'dan al (aistudio.google.com)
NEXT_PUBLIC_APP_NAME=HealthTour
```

Stripe YOK — Türkiye'de kullanılamıyor. Mock ödeme kullanıyoruz.

---

## UI Kuralları

- Tailwind CSS kullan, custom CSS yazma
- Renk paleti: Mavi tonları (#0f3460, #16213e) + Beyaz arka plan
- Mobil öncelikli tasarım (responsive)
- Loading state'leri her async işlemde göster
- Hata durumunda kullanıcıya Türkçe mesaj göster, teknik hata kodu gösterme
- Tüm butonlar disabled olsun yükleme sırasında

---

## Bu Bir Demo — Kısayollar Kabul

Aşağıdakiler hackathon kapsamında kasıtlı olarak basitleştirilmiştir:

- Ödeme gerçek değil — mock sistemi kullanılıyor
- Uçuş ve otel verisi gerçek API'dan gelmiyor — Supabase'deki mock data
- Email doğrulama yok — Supabase auth basit tutulacak
- Admin paneli basit — gelişmiş RBAC yok

Bunlar için özür dileme, savunmaya geçme. Demo bu şekilde çalışıyor.
