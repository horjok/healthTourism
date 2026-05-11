# Skill: Yeni API Route Yaz

## Ne Zaman Kullanılır?
Yeni bir `/api/...` endpoint'i oluşturmak istediğinde bu şablonu kullan.

## Prompt Şablonu

```
CLAUDE.md dosyasını oku ve kurallara uy.

Şu API route'u yaz: /app/api/[ROUTE_ADI]/route.ts

Görev: [ROUTE'UN NE YAPACAĞINI AÇIKLA]

Destekleyeceği HTTP metodları:
- GET: [ne döndürsün]
- POST: [ne kabul etsin, ne döndürsün]

Girdi doğrulama:
- [Zorunlu alan 1]: [tip ve kural]
- [Zorunlu alan 2]: [tip ve kural]

İş mantığı:
1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

Hata durumları:
- [Durum 1]: [Türkçe mesaj]
- [Durum 2]: [Türkçe mesaj]

Başarı cevabı formatı:
{ success: true, data: { ... } }

Hata cevabı formatı:
{ success: false, error: "Türkçe açıklama" }

lib/supabase.ts ve lib/types.ts'den gerekli importları yap.
```

## Örnek Dolu Hali

```
CLAUDE.md dosyasını oku ve kurallara uy.

Şu API route'u yaz: /app/api/packages/route.ts

Görev: Paketleri listele ve tek paket getir.

Destekleyeceği HTTP metodları:
- GET: Tüm paketleri döndür, opsiyonel query param ile filtrele
- (POST bu route'da yok)

Girdi doğrulama (query params):
- uzmanlik: string, opsiyonel ("ortopedi", "dis", "goz" vb.)
- max_fiyat: number, opsiyonel
- id: string, opsiyonel — varsa sadece o paketi döndür

İş mantığı:
1. Query parametrelerini oku
2. id varsa tek paket getir, yoksa filtreli liste getir
3. Supabase'den veri çek (lib/supabase.ts fonksiyonlarını kullan)
4. Sonucu döndür

Hata durumları:
- Paket bulunamadı: "Bu paket mevcut değil"
- Veritabanı hatası: "Paketler yüklenemedi, lütfen tekrar deneyin"

lib/supabase.ts ve lib/types.ts'den gerekli importları yap.
```
