# Skill: Hata Ayıkla

## Ne Zaman Kullanılır?
Bir şey çalışmıyorsa, hata alıyorsan, Claude Code yanlış kod ürettiyse.

## Prompt Şablonu — Genel Hata

```
CLAUDE.md dosyasını oku.

Şu hata var:
[HATA MESAJINI BURAYA YAPISTIR]

Hatanın olduğu dosya: [DOSYA YOLU]
Ne yapmaya çalışıyordum: [AÇIKLA]

1. Hatanın sebebini Türkçe açıkla
2. Düzeltilmiş kodu yaz
3. Bu hatanın tekrar oluşmaması için ne yapmalıyım?
```

## Prompt Şablonu — Gemini Kötü Cevap Veriyor

```
CLAUDE.md dosyasını oku.

lib/gemini.ts içindeki [FONKSIYON_ADI] fonksiyonu beklenmedik cevap döndürüyor.

Beklenen JSON formatı:
[BEKLENEN FORMAT]

Gelen cevap:
[GELEN CEVAP]

Sorun ne olabilir? System prompt'u gözden geçir ve düzelt.
Ayrıca JSON parse başarısız olunca fallback mekanizması ekle.
```

## Prompt Şablonu — Supabase Hatası

```
CLAUDE.md dosyasını oku.

Supabase'den şu hata geliyor:
[HATA MESAJI]

lib/supabase.ts içindeki [FONKSIYON_ADI] fonksiyonunda sorun var.

Hatayı düzelt. Düzeltirken:
- Tip güvenliğini koru
- Hata mesajını Türkçe yap
- Eğer RLS sorunu ise bunu belirt, SQL'i de ver
```

## Sık Karşılaşılan Hatalar

| Hata | Muhtemel Sebep | Çözüm |
|------|----------------|-------|
| `GEMINI_API_KEY undefined` | .env.local eksik | .env.local kontrol et, `next dev` yeniden başlat |
| `Supabase: JWTExpired` | Token süresi dolmuş | Supabase client'ı yeniden başlat |
| `JSON.parse error` | Gemini JSON dışı cevap verdi | skill-gemini-agent.md'deki fallback ekle |
| `Cannot find module` | Import yolu yanlış | `@/lib/types` formatını kullan |
| `hydration error` | Server/client uyuşmazlığı | `use client` direktifi ekle |
