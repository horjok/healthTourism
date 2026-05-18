# Skill: Gemini Agent Prompt Yaz / Düzenle

## Ne Zaman Kullanılır?
- Agent'lardan mantıksız cevap geliyorsa
- Yeni bir agent eklemek istiyorsan
- Mevcut prompt'u geliştirmek istiyorsan

## Pipeline Hatırlatıcı

```
kullaniciInput
  → saglikAnalizEt()     → saglikAnalizi (JSON)
  → paketPlanla()        → paketOnerisi (JSON)
  → guvenilirlikKontrol() → finalCevap (JSON)
```

## Prompt Şablonu — Tek Agent Güncelle

```
CLAUDE.md dosyasını oku.

lib/gemini.ts içindeki [AGENT_ADI] fonksiyonunun system prompt'unu güncelle.

Mevcut sorun: [NEDEN KÖTÜ ÇALIŞIYOR]

Yeni prompt şu kuralları karşılamalı:
1. Türkçe cevap ver
2. Sadece JSON döndür — başka hiçbir şey yazma
3. JSON formatı şu şekilde olsun:
   {
     "[alan1]": "[tip ve açıklama]",
     "[alan2]": "[tip ve açıklama]"
   }
4. [Ek kural]
5. [Ek kural]

Eğer kullanıcı girdisi sağlık dışı bir konudaysa JSON içinde
{ "hata": "Sağlık konusu dışında soru algılandı" } döndür.
```

## Üç Agent'ın Beklenen JSON Formatları

### Agent 1 — saglikAnalizEt()
Girdi: Kullanıcının serbest metin şikayeti
```json
{
  "uzmanlik": "ortopedi",
  "aciliyet": "rutin",
  "semptomlar": ["diz ağrısı", "şişlik"],
  "oneri_sure": "3-5 gün",
  "ek_notlar": "MRI sonucu gerekebilir"
}
```

### Agent 2 — paketPlanla()
Girdi: Agent 1 çıktısı + kullanıcı bütçe/tarih tercihleri
```json
{
  "onerilen_klinikler": ["klinik_id_1", "klinik_id_2"],
  "onerilen_sehir": "Antalya",
  "tahmini_maliyet": 2500,
  "paket_suresi": 5,
  "ucus_dahil": true,
  "gerekce": "Ortopedi konusunda güçlü klinikler Antalya'da yoğunlaşıyor"
}
```

### Agent 3 — guvenilirlikKontrol()
Girdi: Agent 2 çıktısı + klinik veritabanı puanları
```json
{
  "guvenlir_mi": true,
  "puan": 4.6,
  "akredite": true,
  "uyarilar": [],
  "tavsiye": "Bu klinik JCI akreditasyonuna sahip, güvenle tercih edebilirsiniz"
}
```

## Tüm Pipeline'ı Yeniden Yaz

```
CLAUDE.md dosyasını oku.

lib/gemini.ts dosyasını baştan yaz. Şu kurallar geçerli:

1. Gemini 1.5 Flash kullan
2. Üç ayrı async fonksiyon yaz:
   - saglikAnalizEt(kullaniciInput: string): Promise<SaglikAnalizi>
   - paketPlanla(analiz: SaglikAnalizi, butce: number, tarih: string): Promise<PaketOnerisi>
   - guvenilirlikKontrol(oneri: PaketOnerisi, klinikPuanlari: Record<string,number>): Promise<GuvenilirlikSonucu>

3. Her fonksiyon:
   - System prompt Türkçe
   - Sadece JSON döndürmesini iste
   - Cevabı JSON.parse() ile parse et
   - Parse başarısız olursa hata fırlat
   - 15 saniyelik timeout ekle

4. Ana fonksiyon:
   async function ajanPipelineCalıstır(
     kullaniciInput: string,
     butce: number,
     tarih: string,
     klinikPuanlari: Record<string, number>
   ): Promise<PipelineSonucu>

   Bu fonksiyon üç ajanı sırayla çalıştırır ve
   { analiz, oneri, guvenilirlik } döndürür.

5. Tüm tipler lib/types.ts'e ekle:
   SaglikAnalizi, PaketOnerisi, GuvenilirlikSonucu, PipelineSonucu
```
