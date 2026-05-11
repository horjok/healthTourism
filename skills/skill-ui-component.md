# Skill: UI Bileşeni Yaz

## Ne Zaman Kullanılır?
Yeni bir React bileşeni oluştururken — kart, form, liste, modal vb.

## Prompt Şablonu

```
CLAUDE.md dosyasını oku.

Şu bileşeni yaz: /components/[KLASOR]/[BilesenAdi].tsx

Bileşen ne yapıyor: [AÇIKLA]

Props:
- [prop1]: [tip] — [açıklama]
- [prop2]: [tip] — [açıklama]
- onSuccess?: () => void — başarı callback'i (opsiyonel)

Görsel:
- Tailwind CSS kullan
- Renk paleti: mavi tonları (#0f3460 primary, #16213e secondary)
- Mobil öncelikli (responsive)
- [Ek görsel detay]

Davranış:
- Loading state: [ne gösterilsin]
- Hata state: [ne gösterilsin]
- Başarı state: [ne gösterilsin]

Veri kaynağı: [API route veya prop olarak mı geliyor?]
```

## Sık Kullanılan Bileşenler

### Paket Kartı
```
CLAUDE.md dosyasını oku.

/components/packages/PaketKarti.tsx bileşenini yaz.

Props:
- paket: Paket (lib/types.ts'den)
- onClick: (id: string) => void

Görsel:
- Kart tasarımı, gölge efekti
- Üstte klinik fotoğrafı (fotograf_url'den)
- Alt kısımda: klinik adı, şehir, fiyat, süre
- Uçuş dahilse küçük rozet göster
- Akredite klinikte kalkan rozet göster
- Hover'da hafif büyüme animasyonu (transition-transform)

Veri: props olarak geliyor, API çağrısı yapma.
```

### Chatbot Ekranı
```
CLAUDE.md dosyasını oku.

/components/chat/ChatEkrani.tsx bileşenini yaz.

Davranış:
- Kullanıcı metin yazar, Enter veya butona basar
- /api/ai/chat endpoint'ine POST isteği atar
- Yükleme sırasında "Analiz ediliyor..." göster (pulsing nokta animasyonu)
- Cevap gelince mesaj listesine ekle
- Scroll otomatik en alta gitsin

Mesaj formatı:
- Kullanıcı mesajı: sağa hizalı, mavi arkaplan
- AI cevabı: sola hizalı, gri arkaplan

Hata durumunda: "Şu an yanıt verilemiyor, lütfen tekrar deneyin" kırmızı banner.
```

### Mock Ödeme Formu
```
CLAUDE.md dosyasını oku.

/components/ui/MockOdemeFormu.tsx bileşenini yaz.

Önemli: Bu gerçek bir ödeme formu değil. Kart bilgisi işlenmez.
Sadece görsel bir form — tüm işlemler mock.

Görsel alanlar (bunlar sadece gösteriş için, doğrulama yapma):
- Kart üzerindeki isim (text input)
- Kart numarası (1234 5678 9012 3456 formatı, sadece format)
- Son kullanma tarihi (MM/YY)
- CVV (3 hane, şifreli göster)

Davranış:
- "Ödemeyi Tamamla" butonuna basınca:
  1. Butonu disabled yap, "İşleniyor..." göster
  2. 2 saniye bekle (setTimeout)
  3. lib/mock-payment.ts'deki processMockPayment() çağır
  4. Başarı ekranına geç: "Ödemeniz alındı!" yeşil ekran
  5. onSuccess() callback'i çağır

Uyarı yazısı alta ekle:
"Bu demo ortamıdır. Gerçek ödeme işlemi yapılmamaktadır."
```
