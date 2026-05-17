'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useChatContext } from '@/components/ui/ChatProvider';

function PaketKarti({ paket, dil }: { paket: Paket; dil: 'tr' | 'en' }) {
  const { formatla } = useDoviz();
  return (
    <Link href={`/packages/${paket.id}`}>
      <div className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full border border-gray-100">
        <div className="relative h-52 bg-gradient-to-br from-[#0f3460] to-[#1a5276] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl opacity-10">🏥</div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {paket.klinik.sehir}
            </span>
            {paket.klinik.akredite && (
              <span className="bg-green-400 text-white text-xs font-bold px-3 py-1.5 rounded-full">JCI ✓</span>
            )}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0f3460] transition-colors">{paket.baslik}</h3>
          <p className="text-sm text-gray-400 mb-4">{paket.klinik.isim}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {paket.klinik.uzmanlik.slice(0, 3).map((u) => (
              <span key={u} className="bg-blue-50 text-[#0f3460] text-xs font-medium px-3 py-1 rounded-full border border-blue-100">{u}</span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{dil === 'tr' ? 'Toplam fiyat' : 'Total price'}</p>
              <span className="text-2xl font-extrabold text-[#0f3460]">{formatla(paket.toplam_fiyat)}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">{paket.sure_gun} {dil === 'tr' ? 'gün' : 'days'}</p>
              {paket.ucus_dahil && (
                <span className="text-xs text-blue-500 font-medium">✈ {dil === 'tr' ? 'Uçuş dahil' : 'Flight included'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { dil } = useDilContext();
  const { setChatAcik } = useChatContext();
  const [paketler, setPaketler] = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((json: { success: boolean; data: Paket[] }) => {
        if (json.success) setPaketler(json.data.slice(0, 3));
        else setHata(true);
      })
      .catch(() => setHata(true))
      .finally(() => setYukleniyor(false));
  }, []);

  const tr = dil === 'tr';

  const KATEGORILER = [
    { ikon: '💆', isim: tr ? 'Saç Ekimi' : 'Hair Transplant', aciklama: tr ? 'FUE, DHI, Safir teknikler' : 'FUE, DHI, Sapphire techniques', slug: 'saç ekimi', renk: 'from-purple-500 to-purple-700' },
    { ikon: '🦷', isim: tr ? 'Diş Sağlığı' : 'Dental Health', aciklama: tr ? 'İmplant, Hollywood Smile' : 'Implant, Hollywood Smile', slug: 'diş', renk: 'from-blue-500 to-blue-700' },
    { ikon: '✨', isim: tr ? 'Estetik Cerrahi' : 'Aesthetic Surgery', aciklama: tr ? 'Rinoplasti, Liposuction' : 'Rhinoplasty, Liposuction', slug: 'estetik cerrahi', renk: 'from-pink-500 to-pink-700' },
    { ikon: '👁️', isim: tr ? 'Göz Tedavisi' : 'Eye Treatment', aciklama: tr ? 'LASIK, Katarakt' : 'LASIK, Cataract', slug: 'göz', renk: 'from-teal-500 to-teal-700' },
  ];

  const ISTATISTIKLER = [
    { sayi: '500+', etiket: tr ? 'Akredite Klinik' : 'Accredited Clinics' },
    { sayi: '50+', etiket: tr ? 'Ülkeden Hasta' : 'Countries' },
    { sayi: '%98', etiket: tr ? 'Memnuniyet' : 'Satisfaction' },
    { sayi: '200+', etiket: tr ? 'Uzman Doktor' : 'Expert Doctors' },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-36 md:py-48 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f3460 50%, #1a5276 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        {/* Görsel — Antalya sahil */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <span className="relative inline-flex items-center gap-2 bg-white/10 backdrop-blur text-blue-200 text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-full mb-8 border border-white/10">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          {tr ? 'Dünya Standartlarında Sağlık Turizmi' : 'World-Class Health Tourism'}
        </span>

        <h1 className="relative text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl">
          {tr ? (
            <>Sağlık ile Tatilin<br /><span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent">Buluştuğu Yer</span></>
          ) : (
            <>Where Health<br /><span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent">Meets Travel</span></>
          )}
        </h1>

        <p className="relative text-xl text-blue-100/80 mb-3 max-w-xl leading-relaxed">
          {tr ? 'Uçak + Otel + Klinik — Hepsi Tek Pakette' : 'Flight + Hotel + Clinic — All in One Package'}
        </p>
        <p className="relative text-sm text-blue-200/50 mb-12 tracking-wide">
          {tr ? 'Saç ekimi · Diş · Estetik · Göz tedavisi' : 'Hair transplant · Dental · Aesthetic · Eye treatment'}
        </p>

        <div className="relative flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/packages"
            className="px-10 py-4 bg-white text-[#0f3460] font-bold rounded-2xl hover:bg-blue-50 transition-all text-base shadow-2xl hover:scale-105">
            {tr ? 'Paketleri Keşfet →' : 'Explore Packages →'}
          </Link>
          <button
            onClick={() => setChatAcik(true)}
            className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all text-base shadow-xl hover:scale-105">
            ✨ {tr ? 'AI ile Paket Bul' : 'Find with AI'}
          </button>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-3xl">
          {ISTATISTIKLER.map((s) => (
            <div key={s.etiket} className="text-center">
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{s.sayi}</div>
              <div className="text-xs text-blue-200/60 font-medium uppercase tracking-wider">{s.etiket}</div>
            </div>
          ))}
        </div>
      </section>

      {/* KATEGORİLER */}
      <section className="max-w-6xl mx-auto px-6 -mt-10 pb-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {KATEGORILER.map((k) => (
            <Link key={k.slug} href={`/packages?uzmanlik=${k.slug}`}>
              <div className={`group relative bg-gradient-to-br ${k.renk} rounded-3xl p-6 text-white cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                <div className="text-4xl mb-3">{k.ikon}</div>
                <div className="text-base font-bold mb-1">{k.isim}</div>
                <div className="text-xs text-white/70">{k.aciklama}</div>
                <div className="absolute -bottom-4 -right-4 text-6xl opacity-10">{k.ikon}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ÖNE ÇIKAN PAKETLER */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-2">
              {tr ? 'Öne Çıkanlar' : 'Featured'}
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900">
              {tr ? 'Popüler Paketler' : 'Popular Packages'}
            </h2>
          </div>
          <Link href="/packages" className="hidden md:block text-sm font-semibold text-[#0f3460] hover:underline">
            {tr ? 'Tümünü gör →' : 'View all →'}
          </Link>
        </div>

        {yukleniyor && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">{tr ? 'Yükleniyor...' : 'Loading...'}</p>
            </div>
          </div>
        )}

        {!yukleniyor && hata && (
          <div className="text-center py-16 bg-white rounded-3xl border border-red-100">
            <p className="text-red-500 font-semibold">{tr ? 'Paketler yüklenemedi' : 'Could not load packages'}</p>
            <p className="text-gray-400 text-sm mt-2">{tr ? 'Lütfen sayfayı yenileyin' : 'Please refresh the page'}</p>
          </div>
        )}

        {!yukleniyor && !hata && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {paketler.map((paket) => <PaketKarti key={paket.id} paket={paket} dil={dil} />)}
            </div>
            <div className="text-center mt-12 md:hidden">
              <Link href="/packages"
                className="inline-block px-10 py-4 bg-[#0f3460] text-white font-bold rounded-2xl hover:bg-[#0a1628] transition-all shadow-lg">
                {tr ? 'Tüm Paketleri Gör →' : 'View All Packages →'}
              </Link>
            </div>
          </>
        )}
      </section>

      {/* GÖRSELLER — Destinasyon bandı */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4 rounded-3xl overflow-hidden">
          <div className="relative h-48 overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600" alt="Estetik" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white text-sm font-bold">{tr ? 'Estetik Cerrahi' : 'Aesthetic Surgery'}</span>
          </div>
          <div className="relative h-48 overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600" alt="Diş" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white text-sm font-bold">{tr ? 'Diş Sağlığı' : 'Dental Health'}</span>
          </div>
          <div className="relative h-48 overflow-hidden rounded-2xl">
            <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600" alt="Göz" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 text-white text-sm font-bold">{tr ? 'Göz Tedavisi' : 'Eye Treatment'}</span>
          </div>
        </div>
      </section>

      {/* NEDEN HEALTHTOUR */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-3">
              {tr ? 'Neden Biz?' : 'Why Us?'}
            </p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              {tr ? 'Neden HealthTour?' : 'Why HealthTour?'}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {tr ? 'Güvenilir, hızlı ve kişiselleştirilmiş sağlık turizmi deneyimi' : 'Reliable, fast and personalized health tourism experience'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                ikon: '🏥',
                gorsel: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
                renk: 'bg-blue-50 border-blue-100', ikonBg: 'bg-blue-100',
                baslik: tr ? 'JCI Akredite Klinikler' : 'JCI Accredited Clinics',
                aciklama: tr ? 'Uluslararası Joint Commission akreditasyonuna sahip, güvenilir klinikler.' : 'Internationally accredited and audited clinics.'
              },
              {
                ikon: '✈️',
                gorsel: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
                renk: 'bg-purple-50 border-purple-100', ikonBg: 'bg-purple-100',
                baslik: tr ? 'Uçak + Otel + Sağlık' : 'Flight + Hotel + Health',
                aciklama: tr ? 'Seyahatin tüm detaylarını tek rezervasyonla hallediyor.' : 'Handle all travel details in one booking.'
              },
              {
                ikon: '🤖',
                gorsel: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
                renk: 'bg-teal-50 border-teal-100', ikonBg: 'bg-teal-100',
                baslik: tr ? 'AI Destekli Öneri' : 'AI-Powered Recommendation',
                aciklama: tr ? 'Şikayetini anlat, yapay zekamız en uygun paketi bulsun.' : 'Describe your concern, our AI finds the best package.'
              },
            ].map((o) => (
              <div key={o.baslik} className={`${o.renk} border rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                <div className="h-36 overflow-hidden">
                  <img src={o.gorsel} alt={o.baslik} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className={`${o.ikonBg} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4`}>{o.ikon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{o.baslik}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{o.aciklama}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÜŞTERİ GERİBİLDİRİMLERİ — sağdan sola kayan marquee */}
      <section className="py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%)' }}>
        <div className="max-w-6xl mx-auto px-6 mb-10 text-center">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-3">
            {tr ? 'Müşteri Yorumları' : 'Customer Reviews'}
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {tr ? 'Onlar Ne Diyor?' : 'What Do They Say?'}
          </h2>
        </div>

        <div className="relative">
          <div className="flex animate-marquee gap-6 w-max">
            {[
              { isim: 'James W.', ulke: '🇬🇧 İngiltere', puan: 5, yorum_tr: 'FUE saç ekimi için İstanbul\'a geldim. Klinik muhteşemdi, sonuçtan çok memnunum. HealthTour süreci baştan sona yönetti.', yorum_en: 'Came to Istanbul for FUE hair transplant. The clinic was excellent and I\'m very happy with the results. HealthTour managed the whole process.' },
              { isim: 'Sophie L.', ulke: '🇩🇪 Almanya', puan: 5, yorum_tr: 'Hollywood Smile işlemim için Türkiye\'yi seçtim. Almanya\'daki fiyatların çok altında, aynı kalite. Kesinlikle tavsiye ederim!', yorum_en: 'Chose Turkey for my Hollywood Smile procedure. Far less than German prices, same quality. Highly recommend!' },
              { isim: 'Ahmed K.', ulke: '🇸🇦 Suudi Arabistan', puan: 5, yorum_tr: 'LASIK ameliyatı için geldiğimde her şey organize edilmişti. Otel, transfer, klinik — hepsi mükemmeldi. Teşekkürler!', yorum_en: 'When I came for LASIK surgery everything was organized. Hotel, transfer, clinic — all was perfect. Thank you!' },
              { isim: 'Emma T.', ulke: '🇳🇱 Hollanda', puan: 4, yorum_tr: 'Rinoplasti için Türkiye\'yi tercih ettim. Doktorlar çok profesyoneldi ve iyileşme süreci hızlıydı. Paket fiyatı gerçekten uygundu.', yorum_en: 'Chose Turkey for rhinoplasty. Doctors were very professional and recovery was fast. Package price was really affordable.' },
              { isim: 'Carlos M.', ulke: '🇪🇸 İspanya', puan: 5, yorum_tr: 'Diş implantı için geldim, Almanya\'da ödeyeceğimin üçte birine yaptırdım. Kalitenin farkı yok. Üstelik İstanbul\'u da gezdim!', yorum_en: 'Got dental implants for a third of the Spanish price. Same quality. Plus I got to visit Istanbul!' },
              { isim: 'Maria V.', ulke: '🇮🇹 İtalya', puan: 5, yorum_tr: 'Estetik cerrahi için en iyi tercihi yaptım. Her şey çok iyi planlanmıştı, hiçbir sorun yaşamadım. Muhteşem bir deneyimdi!', yorum_en: 'Made the best choice for my aesthetic surgery. Everything was well-planned, no issues at all. Magnificent experience!' },
              { isim: 'David H.', ulke: '🇺🇸 ABD', puan: 4, yorum_tr: 'Ortopedi tedavisi için İstanbul\'a geldim. Amerika\'daki maliyetle karşılaştırılmaz. HealthTour\'un desteği sayesinde çok rahat bir süreçti.', yorum_en: 'Came to Istanbul for orthopedic treatment. Incomparable to US costs. HealthTour\'s support made the whole process very comfortable.' },
              { isim: 'Fatima A.', ulke: '🇦🇪 BAE', puan: 5, yorum_tr: 'Onkoloji tedavisi için Türkiye\'ye geldim. Doktorlar dünya standartlarında, klinik son teknolojiye sahip. HealthTour\'a güvenim tamdır.', yorum_en: 'Came to Turkey for oncology treatment. World-class doctors, state-of-the-art clinic. I fully trust HealthTour.' },
            ].concat([
              { isim: 'James W.', ulke: '🇬🇧 İngiltere', puan: 5, yorum_tr: 'FUE saç ekimi için İstanbul\'a geldim. Klinik muhteşemdi, sonuçtan çok memnunum. HealthTour süreci baştan sona yönetti.', yorum_en: 'Came to Istanbul for FUE hair transplant. The clinic was excellent and I\'m very happy with the results. HealthTour managed the whole process.' },
              { isim: 'Sophie L.', ulke: '🇩🇪 Almanya', puan: 5, yorum_tr: 'Hollywood Smile işlemim için Türkiye\'yi seçtim. Almanya\'daki fiyatların çok altında, aynı kalite. Kesinlikle tavsiye ederim!', yorum_en: 'Chose Turkey for my Hollywood Smile procedure. Far less than German prices, same quality. Highly recommend!' },
              { isim: 'Ahmed K.', ulke: '🇸🇦 Suudi Arabistan', puan: 5, yorum_tr: 'LASIK ameliyatı için geldiğimde her şey organize edilmişti. Otel, transfer, klinik — hepsi mükemmeldi. Teşekkürler!', yorum_en: 'When I came for LASIK surgery everything was organized. Hotel, transfer, clinic — all was perfect. Thank you!' },
              { isim: 'Emma T.', ulke: '🇳🇱 Hollanda', puan: 4, yorum_tr: 'Rinoplasti için Türkiye\'yi tercih ettim. Doktorlar çok profesyoneldi ve iyileşme süreci hızlıydı. Paket fiyatı gerçekten uygundu.', yorum_en: 'Chose Turkey for rhinoplasty. Doctors were very professional and recovery was fast. Package price was really affordable.' },
              { isim: 'Carlos M.', ulke: '🇪🇸 İspanya', puan: 5, yorum_tr: 'Diş implantı için geldim, Almanya\'da ödeyeceğimin üçte birine yaptırdım. Kalitenin farkı yok. Üstelik İstanbul\'u da gezdim!', yorum_en: 'Got dental implants for a third of the Spanish price. Same quality. Plus I got to visit Istanbul!' },
              { isim: 'Maria V.', ulke: '🇮🇹 İtalya', puan: 5, yorum_tr: 'Estetik cerrahi için en iyi tercihi yaptım. Her şey çok iyi planlanmıştı, hiçbir sorun yaşamadım. Muhteşem bir deneyimdi!', yorum_en: 'Made the best choice for my aesthetic surgery. Everything was well-planned, no issues at all. Magnificent experience!' },
              { isim: 'David H.', ulke: '🇺🇸 ABD', puan: 4, yorum_tr: 'Ortopedi tedavisi için İstanbul\'a geldim. Amerika\'daki maliyetle karşılaştırılmaz. HealthTour\'un desteği sayesinde çok rahat bir süreçti.', yorum_en: 'Came to Istanbul for orthopedic treatment. Incomparable to US costs. HealthTour\'s support made the whole process very comfortable.' },
              { isim: 'Fatima A.', ulke: '🇦🇪 BAE', puan: 5, yorum_tr: 'Onkoloji tedavisi için Türkiye\'ye geldim. Doktorlar dünya standartlarında, klinik son teknolojiye sahip. HealthTour\'a güvenim tamdır.', yorum_en: 'Came to Turkey for oncology treatment. World-class doctors, state-of-the-art clinic. I fully trust HealthTour.' },
            ]).map((y, i) => (
              <div key={i} className="w-80 shrink-0 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span key={s} className={s < y.puan ? 'text-amber-400' : 'text-gray-200'}>★</span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                  &quot;{tr ? y.yorum_tr : y.yorum_en}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f3460] to-blue-400 flex items-center justify-center text-white font-bold text-sm">
                    {y.isim.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{y.isim}</div>
                    <div className="text-xs text-gray-400">{y.ulke}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GÜVEN BANDI */}
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { ikon: '🏆', baslik: tr ? 'JCI Sertifikası' : 'JCI Certificate', aciklama: tr ? 'Uluslararası akreditasyon' : 'International accreditation' },
              { ikon: '🔒', baslik: tr ? 'Gizlilik Garantisi' : 'Privacy Guarantee', aciklama: tr ? 'Verileriniz korunur' : 'Your data is protected' },
              { ikon: '📞', baslik: tr ? '7/24 Destek' : '24/7 Support', aciklama: tr ? 'Her an yanınızdayız' : 'Always here for you' },
              { ikon: '💳', baslik: tr ? 'Güvenli Ödeme' : 'Secure Payment', aciklama: tr ? 'SSL korumalı işlem' : 'SSL protected transaction' },
            ].map((g) => (
              <div key={g.baslik} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{g.ikon}</div>
                <div className="text-sm font-bold text-gray-800">{g.baslik}</div>
                <div className="text-xs text-gray-500">{g.aciklama}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1a5276 50%, #0f3460 100%)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f3460cc, #1a5276cc)' }} />
          <div className="relative text-center py-16 px-8">
            <p className="text-blue-200/70 text-sm font-semibold uppercase tracking-wider mb-4">
              {tr ? 'AI Destekli Sistem' : 'AI-Powered System'}
            </p>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              {tr ? 'Hemen Başlayın' : 'Get Started Now'}
            </h2>
            <p className="text-blue-100/80 mb-10 text-lg max-w-md mx-auto">
              {tr ? 'AI asistanımız şikayetinizi analiz edip size özel paket önersin' : 'Our AI assistant analyzes your concern and suggests a personalized package'}
            </p>
            <button
              onClick={() => setChatAcik(true)}
              className="px-12 py-5 bg-white text-[#0f3460] font-extrabold rounded-2xl hover:bg-blue-50 transition-all text-lg shadow-xl hover:scale-105">
              ✨ {tr ? 'AI ile Paket Bul — Ücretsiz' : 'Find Package with AI — Free'}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a1628] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xl font-extrabold">Health<span className="text-blue-400">Tour</span></span>
              <p className="text-gray-400 text-sm mt-1">{tr ? 'Sağlık turizmi demo platformu' : 'Health tourism demo platform'}</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/packages" className="hover:text-white transition-colors">{tr ? 'Paketler' : 'Packages'}</Link>
              <button onClick={() => setChatAcik(true)} className="hover:text-white transition-colors">{tr ? 'AI Öneri' : 'AI Suggestion'}</button>
              <Link href="/auth" className="hover:text-white transition-colors">{tr ? 'Giriş Yap' : 'Sign In'}</Link>
            </div>
            <p className="text-gray-500 text-sm">© 2025 HealthTour</p>
          </div>
        </div>
      </footer>
    </main>
  );
}