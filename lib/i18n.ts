// lib/i18n.ts
// Türkçe / İngilizce dil desteği

export type Dil = 'tr' | 'en';

export const ÇEVIRILER = {
  // ── Genel ──────────────────────────────────────────────────────────────────
  'site.isim': { tr: 'HealthTour', en: 'HealthTour' },
  'site.slogan': { tr: 'Sağlık ile Tatilin Buluştuğu Yer', en: 'Where Health Meets Travel' },
  'site.aciklama': { tr: 'Uçak + Otel + Klinik — Hepsi Tek Pakette', en: 'Flight + Hotel + Clinic — All in One Package' },

  // ── Navigasyon ─────────────────────────────────────────────────────────────
  'nav.anasayfa': { tr: 'Ana Sayfa', en: 'Home' },
  'nav.paketler': { tr: 'Paketler', en: 'Packages' },
  'nav.klinikler': { tr: 'Klinikler', en: 'Clinics' },
  'nav.rezervasyon': { tr: 'Rezervasyon', en: 'Book Now' },
  'nav.profil': { tr: 'Profilim', en: 'My Profile' },
  'nav.giris': { tr: 'Giriş Yap', en: 'Sign In' },
  'nav.cikis': { tr: 'Çıkış Yap', en: 'Sign Out' },

  // ── Ana Sayfa ──────────────────────────────────────────────────────────────
  'home.hero.baslik': { tr: 'Sağlık ile Tatilin\nBuluştuğu Yer', en: 'Where Health\nMeets Travel' },
  'home.hero.alt': { tr: 'Uçak + Otel + Klinik — Hepsi Tek Pakette', en: 'Flight + Hotel + Clinic — All in One Package' },
  'home.hero.alt2': { tr: 'Saç ekimi · Diş · Estetik · Göz tedavisi', en: 'Hair transplant · Dental · Aesthetic · Eye treatment' },
  'home.hero.btn1': { tr: 'Paketleri Keşfet', en: 'Explore Packages' },
  'home.hero.btn2': { tr: '✨ AI ile Paket Bul', en: '✨ Find with AI' },
  'home.stats.klinik': { tr: 'Akredite Klinik', en: 'Accredited Clinics' },
  'home.stats.ulke': { tr: 'Ülkeden Hasta', en: 'Countries' },
  'home.stats.memnuniyet': { tr: 'Memnuniyet', en: 'Satisfaction' },
  'home.stats.doktor': { tr: 'Uzman Doktor', en: 'Expert Doctors' },
  'home.kategoriler.baslik': { tr: 'Hangi Tedaviyi Arıyorsunuz?', en: 'What Treatment Are You Looking For?' },
  'home.kategoriler.alt': { tr: 'İhtiyacınıza göre uzman klinik ve paketleri keşfedin', en: 'Find expert clinics and packages tailored to your needs' },
  'home.paketler.baslik': { tr: 'Öne Çıkan Paketler', en: 'Featured Packages' },
  'home.paketler.alt': { tr: 'En çok tercih edilen sağlık turizmi paketleri', en: 'Most popular health tourism packages' },
  'home.paketler.tumunu': { tr: 'Tüm Paketleri Gör →', en: 'View All Packages →' },
  'home.neden.baslik': { tr: 'Neden HealthTour?', en: 'Why HealthTour?' },
  'home.neden.alt': { tr: 'Güvenilir, hızlı ve kişiselleştirilmiş sağlık turizmi', en: 'Reliable, fast and personalized health tourism' },
  'home.neden.jci.baslik': { tr: 'JCI Akredite Klinikler', en: 'JCI Accredited Clinics' },
  'home.neden.jci.acik': { tr: 'Uluslararası akreditasyona sahip, denetlenmiş klinikler', en: 'Internationally accredited and audited clinics' },
  'home.neden.paket.baslik': { tr: 'Uçak + Otel + Sağlık Tek Pakette', en: 'Flight + Hotel + Health in One Package' },
  'home.neden.paket.acik': { tr: 'Seyahatin tüm detaylarını tek rezervasyonla hallediyor', en: 'Handle all travel details in one booking' },
  'home.neden.ai.baslik': { tr: 'AI Destekli Kişisel Öneri', en: 'AI-Powered Personal Recommendation' },
  'home.neden.ai.acik': { tr: 'Sağlık şikayetini anlat, yapay zekamız en uygun paketi bulsun', en: 'Describe your health concern, our AI finds the best package' },
  'home.cta.baslik': { tr: 'Hemen Başlayın', en: 'Get Started Now' },
  'home.cta.alt': { tr: 'AI asistanımız şikayetinizi analiz edip size özel paket önersin', en: 'Our AI assistant analyzes your concern and suggests a personalized package' },
  'home.cta.btn': { tr: '✨ AI ile Paket Bul — Ücretsiz', en: '✨ Find Package with AI — Free' },

  // ── Paketler ───────────────────────────────────────────────────────────────
  'paket.detay': { tr: 'Detayı Gör', en: 'View Details' },
  'paket.rezervasyon': { tr: 'Rezervasyon Yap', en: 'Book Now' },
  'paket.ucus_dahil': { tr: '✈ Uçuş dahil', en: '✈ Flight included' },
  'paket.gun': { tr: 'gün', en: 'days' },
  'paket.yukleniyor': { tr: 'Paketler yükleniyor...', en: 'Loading packages...' },
  'paket.hata': { tr: 'Paketler yüklenemedi', en: 'Could not load packages' },
  'paket.yenile': { tr: 'Lütfen sayfayı yenileyin', en: 'Please refresh the page' },
  'paket.bulunamadi': { tr: 'Paket bulunamadı', en: 'Package not found' },
  'paket.toplam': { tr: 'Toplam fiyat', en: 'Total price' },

  // ── Rezervasyon ────────────────────────────────────────────────────────────
  'booking.baslik': { tr: 'Rezervasyon Yap', en: 'Make a Reservation' },
  'booking.geri': { tr: '← Geri dön', en: '← Go back' },
  'booking.adim1': { tr: 'Paket Özeti', en: 'Package Summary' },
  'booking.adim2': { tr: 'Kişisel Bilgiler', en: 'Personal Info' },
  'booking.adim3': { tr: 'Özel Yardım', en: 'Special Assistance' },
  'booking.adim4': { tr: 'Ödeme', en: 'Payment' },
  'booking.devam': { tr: 'Devam Et →', en: 'Continue →' },
  'booking.geri.btn': { tr: '← Geri', en: '← Back' },
  'booking.secilen': { tr: 'Seçilen Paket', en: 'Selected Package' },
  'booking.klinik': { tr: '🏥 Klinik', en: '🏥 Clinic' },
  'booking.sehir': { tr: '📍 Şehir', en: '📍 City' },
  'booking.sure': { tr: '🗓 Süre', en: '🗓 Duration' },
  'booking.ucus': { tr: '✈️ Uçuş', en: '✈️ Flight' },
  'booking.ucus.dahil': { tr: 'Dahil ✓', en: 'Included ✓' },
  'booking.ucus.yok': { tr: 'Dahil değil', en: 'Not included' },
  'booking.otel': { tr: '🏨 Otel', en: '🏨 Hotel' },
  'booking.fiyat': { tr: '💰 Toplam Fiyat', en: '💰 Total Price' },
  'booking.hakkinda': { tr: 'Paket Hakkında', en: 'About This Package' },
  'booking.jci': { tr: '★ JCI Akredite Klinik', en: '★ JCI Accredited Clinic' },
  'booking.kisisel.baslik': { tr: 'Kişisel Bilgileriniz', en: 'Your Personal Information' },
  'booking.adsoyad': { tr: 'Ad Soyad', en: 'Full Name' },
  'booking.adsoyad.ph': { tr: 'Adınız ve soyadınız', en: 'Your full name' },
  'booking.email': { tr: 'E-posta Adresi', en: 'Email Address' },
  'booking.telefon': { tr: 'Telefon Numarası', en: 'Phone Number' },
  'booking.tarih': { tr: 'Tercih Ettiğiniz Tarih', en: 'Preferred Date' },
  'booking.hata.adsoyad': { tr: 'Ad soyad en az 2 karakter olmalıdır', en: 'Full name must be at least 2 characters' },
  'booking.hata.email': { tr: 'Geçerli bir e-posta adresi girin', en: 'Enter a valid email address' },
  'booking.hata.telefon': { tr: 'Geçerli bir telefon numarası girin', en: 'Enter a valid phone number' },
  'booking.hata.tarih': { tr: 'Lütfen bir tarih seçin', en: 'Please select a date' },

  // ── Özel Yardım ────────────────────────────────────────────────────────────
  'assist.baslik': { tr: 'Özel Yardım ve Erişilebilirlik', en: 'Special Assistance & Accessibility' },
  'assist.alt': { tr: 'Yolcularınızın özel ihtiyaçları varsa lütfen belirtin', en: 'Please indicate any special needs your passengers may have' },
  'assist.gizli': { tr: '🔒 Bu bilgiler yalnızca hizmet kalitesini artırmak için kullanılır ve gizli tutulur.', en: '🔒 This information is used only to improve service quality and is kept confidential.' },
  'assist.soru': { tr: 'Özel yardım gerektiren yolcu var mı?', en: 'Are there any passengers requiring special assistance?' },
  'assist.evet': { tr: 'Evet', en: 'Yes' },
  'assist.hayir': { tr: 'Hayır', en: 'No' },
  'assist.fiziksel': { tr: 'Fiziksel / Hareketlilik', en: 'Physical / Mobility' },
  'assist.zihinsel': { tr: 'Zihinsel / Psikolojik', en: 'Mental / Psychological' },
  'assist.tibbi': { tr: 'Tıbbi Gereksinimler', en: 'Medical Requirements' },
  'assist.tekerlekli': { tr: 'Tekerlekli Sandalye Kullanıcısı', en: 'Wheelchair User' },
  'assist.tekerlekli.acik': { tr: 'Havalimanı ve transferde destek gerekiyor', en: 'Assistance needed at airport and transfers' },
  'assist.sandalye.getir': { tr: 'Kendi sandalyemi getiriyorum', en: 'I am bringing my own wheelchair' },
  'assist.sandalye.kirala': { tr: 'Sandalye kiralıyorum', en: 'I need to rent a wheelchair' },
  'assist.yurume': { tr: 'Yürüme Güçlüğü', en: 'Mobility Difficulty' },
  'assist.yurume.acik': { tr: 'Uzun mesafe asistan desteği', en: 'Long-distance assistant support needed' },
  'assist.gorme': { tr: 'Görme Engeli', en: 'Visual Impairment' },
  'assist.gorme.acik': { tr: 'Sesli yönlendirme, rehber köpek desteği', en: 'Audio guidance, guide dog support' },
  'assist.rehber': { tr: 'Rehber köpek ile seyahat ediyorum', en: 'I am traveling with a guide dog' },
  'assist.isitme': { tr: 'İşitme Engeli', en: 'Hearing Impairment' },
  'assist.isitme.acik': { tr: 'Yazılı iletişim tercih edilir', en: 'Written communication preferred' },
  'assist.cihaz': { tr: 'Koltuk Değneği / Yardımcı Cihaz', en: 'Crutches / Assistive Device' },
  'assist.cihaz.acik': { tr: 'Bagaj için ek yardım gerekebilir', en: 'Additional baggage assistance may be needed' },
  'assist.anksiyete': { tr: 'Anksiyete / Panik Bozukluğu', en: 'Anxiety / Panic Disorder' },
  'assist.anksiyete.acik': { tr: 'Sessiz alan ve kısa mola ihtiyacı', en: 'Need for quiet space and short breaks' },
  'assist.otizm': { tr: 'Otizm Spektrum Bozukluğu', en: 'Autism Spectrum Disorder' },
  'assist.otizm.acik': { tr: 'Sensory-friendly ortam tercih edilir', en: 'Sensory-friendly environment preferred' },
  'assist.ptsd': { tr: 'PTSD / Travma Sonrası Stres', en: 'PTSD / Post-Traumatic Stress' },
  'assist.ptsd.acik': { tr: 'Özel hassasiyet gerektiren durumlar', en: 'Situations requiring special sensitivity' },
  'assist.demans': { tr: 'Demans / Alzheimer', en: 'Dementia / Alzheimer\'s' },
  'assist.demans.acik': { tr: 'Refakatçi eşliğinde seyahat', en: 'Traveling with a companion' },
  'assist.oksijen': { tr: 'Oksijen Cihazı Kullanıyor', en: 'Oxygen Device User' },
  'assist.oksijen.acik': { tr: 'Transfer aracında oksijen gereksinimi', en: 'Oxygen needed in transfer vehicle' },
  'assist.diyabet': { tr: 'Diyabet / İnsülin Kullanıcısı', en: 'Diabetes / Insulin User' },
  'assist.diyabet.acik': { tr: 'İlaç saklama ve mola gereksinimleri', en: 'Medication storage and break requirements' },
  'assist.hamile': { tr: 'Hamilelik (28+ Hafta)', en: 'Pregnancy (28+ Weeks)' },
  'assist.hamile.acik': { tr: 'Konforlu transfer, özel oturma', en: 'Comfortable transfer, special seating' },
  'assist.hamile.hafta': { tr: 'Kaçıncı hafta?', en: 'Which week?' },
  'assist.ameliyat': { tr: 'Ameliyat Sonrası İyileşme', en: 'Post-Surgery Recovery' },
  'assist.ameliyat.acik': { tr: 'Yatay pozisyon gerekebilir', en: 'Horizontal position may be required' },
  'assist.diger': { tr: 'Diğer Tıbbi Durum', en: 'Other Medical Condition' },
  'assist.diger.acik': { tr: 'Aşağıya açıklayın', en: 'Please describe below' },
  'assist.diger.ph': { tr: 'Tıbbi durumunuzu kısaca açıklayın...', en: 'Briefly describe your medical condition...' },
  'assist.eknot': { tr: 'Ek Bilgi veya Özel İstek', en: 'Additional Information or Special Request' },
  'assist.eknot.ph': { tr: 'Örn: Tekerlekli sandalye dar alanda zorlanıyor, lütfen geniş araç gönderin.', en: 'E.g.: Wheelchair struggles in narrow spaces, please send a wider vehicle.' },
  'assist.acil.baslik': { tr: '🚨 Acil Durum İletişim Kişisi', en: '🚨 Emergency Contact Person' },
  'assist.acil.ad': { tr: 'Ad Soyad', en: 'Full Name' },
  'assist.acil.telefon': { tr: 'Telefon numarası', en: 'Phone number' },
  'assist.acil.iliski': { tr: 'İlişki seçin', en: 'Select relationship' },
  'assist.acil.es': { tr: 'Eş', en: 'Spouse' },
  'assist.acil.anne': { tr: 'Anne / Baba', en: 'Parent' },
  'assist.acil.kardes': { tr: 'Kardeş', en: 'Sibling' },
  'assist.acil.arkadas': { tr: 'Arkadaş', en: 'Friend' },
  'assist.acil.diger': { tr: 'Diğer', en: 'Other' },
  'assist.odeme': { tr: 'Ödemeye Geç →', en: 'Proceed to Payment →' },

  // ── Transfer ───────────────────────────────────────────────────────────────
  'transfer.baslik': { tr: 'Transfer Seçeneği', en: 'Transfer Option' },
  'transfer.alt': { tr: 'Havalimanından otelinize ve kliniğinize transfer', en: 'Transfer from airport to your hotel and clinic' },
  'transfer.normal.baslik': { tr: 'Standart Transfer', en: 'Standard Transfer' },
  'transfer.normal.acik': { tr: 'Konforlu minibüs veya sedan araç', en: 'Comfortable minibus or sedan vehicle' },
  'transfer.normal.f1': { tr: '✓ Havalimanı karşılama', en: '✓ Airport pickup' },
  'transfer.normal.f2': { tr: '✓ Otel transferi', en: '✓ Hotel transfer' },
  'transfer.normal.f3': { tr: '✓ Klinik transferi', en: '✓ Clinic transfer' },
  'transfer.normal.fiyat': { tr: '$30 / kişi', en: '$30 / person' },
  'transfer.vip.baslik': { tr: 'VIP Transfer', en: 'VIP Transfer' },
  'transfer.vip.acik': { tr: 'Lüks Mercedes, özel şoför', en: 'Luxury Mercedes, private driver' },
  'transfer.vip.f1': { tr: '✓ Özel karşılama tabelası', en: '✓ Private welcome sign' },
  'transfer.vip.f2': { tr: '✓ İkram servisi', en: '✓ Refreshment service' },
  'transfer.vip.f3': { tr: '✓ 7/24 şoför', en: '✓ 24/7 driver' },
  'transfer.vip.f4': { tr: '✓ Havalimanı fast-track', en: '✓ Airport fast-track' },
  'transfer.vip.f5': { tr: '✓ Çocuk koltuğu (isteğe bağlı)', en: '✓ Child seat (optional)' },
  'transfer.vip.fiyat': { tr: '$80 / araç', en: '$80 / vehicle' },
  'transfer.vip.oneri': { tr: 'ÖNERİLEN', en: 'RECOMMENDED' },
  'transfer.rota': { tr: '✈️ Havalimanı → 🏨 Otel → 🏥 Klinik → 🏨 Otel → ✈️ Havalimanı', en: '✈️ Airport → 🏨 Hotel → 🏥 Clinic → 🏨 Hotel → ✈️ Airport' },

  // ── Profil ─────────────────────────────────────────────────────────────────
  'profil.baslik': { tr: 'Profilim', en: 'My Profile' },
  'profil.rezervasyonlar': { tr: 'Rezervasyonlarım', en: 'My Reservations' },
  'profil.bos': { tr: 'Henüz rezervasyonunuz yok', en: 'No reservations yet' },
  'profil.durum.beklemede': { tr: 'Beklemede', en: 'Pending' },
  'profil.durum.onaylandi': { tr: 'Onaylandı', en: 'Confirmed' },
  'profil.durum.iptal': { tr: 'İptal Edildi', en: 'Cancelled' },

  // ── Footer ─────────────────────────────────────────────────────────────────
  'footer.telif': { tr: '© 2025 HealthTour — Sağlık turizmi demo platformu', en: '© 2025 HealthTour — Health tourism demo platform' },
} as const;

export type ÇeviriAnahtari = keyof typeof ÇEVIRILER;

// ─── Hook ─────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useDilContext } from '@/lib/DilContext';

export function useDil() {
  const { dil, setDil } = useDilContext();

  const t = useCallback((anahtar: ÇeviriAnahtari): string => {
    return ÇEVIRILER[anahtar][dil];
  }, [dil]);

  return { dil, setDil, t };
}