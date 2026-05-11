'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';

// ─── Başarı ekranı ─────────────────────────────────────────────────────────────

interface BasariEkraniProps {
  paket: Paket;
  islemId: string;
  adSoyad: string;
  email: string;
  tarih: string;
}

function BasariEkrani({ paket, islemId, adSoyad, email, tarih }: BasariEkraniProps) {
  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      {/* Onay ikonu */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">✓</span>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
        Rezervasyon Onaylandı!
      </h1>
      <p className="text-gray-500 mb-8">
        Rezervasyon detaylarınız aşağıda. İletişim için e-posta adresinize de gönderdik.
      </p>

      {/* Rezervasyon kartı */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm text-left overflow-hidden mb-6">
        {/* Üst bant */}
        <div
          className="px-6 py-4"
          style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
        >
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
            Rezervasyon No
          </p>
          <p className="text-white font-mono text-sm">{islemId}</p>
        </div>

        {/* Detaylar */}
        <div className="divide-y divide-gray-100">
          {[
            { etiket: '📦 Paket',    deger: paket.baslik },
            { etiket: '🏥 Klinik',   deger: paket.klinik.isim },
            { etiket: '📍 Şehir',    deger: paket.klinik.sehir },
            { etiket: '🗓 Süre',     deger: `${paket.sure_gun} gün` },
            { etiket: '👤 Misafir',  deger: adSoyad },
            { etiket: '📧 E-posta',  deger: email },
            { etiket: '📅 Tarih',    deger: new Date(tarih).toLocaleDateString('tr-TR', { dateStyle: 'long' }) },
          ].map(({ etiket, deger }) => (
            <div key={etiket} className="flex items-center justify-between px-6 py-3">
              <span className="text-sm text-gray-500">{etiket}</span>
              <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{deger}</span>
            </div>
          ))}

          {/* Fiyat */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">💰 Ödenen Tutar</span>
            <span className="text-xl font-extrabold text-[#0f3460]">
              {paket.toplam_fiyat.toLocaleString('tr-TR')}€
            </span>
          </div>
        </div>
      </div>

      {/* Alt bilgi */}
      <p className="text-xs text-gray-400 mb-8">
        Bu bir demo rezervasyondur. Gerçek ödeme alınmamıştır.
      </p>

      <Link
        href="/packages"
        className="inline-block px-6 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
      >
        ← Diğer Paketlere Bak
      </Link>
    </div>
  );
}

// ─── Rezervasyon formu ─────────────────────────────────────────────────────────

function BookingInner() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const paketId       = searchParams.get('paket_id');

  const [paket, setPaket]               = useState<Paket | null>(null);
  const [yukleniyor, setYukleniyor]     = useState(true);
  const [bulunamadi, setBulunamadi]     = useState(false);
  const [gonderiyor, setGonderiyor]     = useState(false);
  const [hata, setHata]                 = useState('');

  // Başarı state'i
  const [basarili, setBasarili]         = useState(false);
  const [islemId, setIslemId]           = useState('');

  // Form alanları
  const [adSoyad, setAdSoyad]           = useState('');
  const [adSoyadHata, setAdSoyadHata]   = useState('');
  const [email, setEmail]               = useState('');
  const [emailHata, setEmailHata]       = useState('');
  const [telefon, setTelefon]           = useState('');
  const [telefonHata, setTelefonHata]   = useState('');
  const [tarih, setTarih]               = useState('');

  // Paket ID yoksa pakete yönlendir
  useEffect(() => {
    if (!paketId) { router.replace('/packages'); return; }

    fetch(`/api/packages?id=${paketId}`)
      .then((r) => r.json())
      .then((json: { success: boolean; data: Paket }) => {
        if (json.success && json.data) setPaket(json.data);
        else setBulunamadi(true);
      })
      .catch(() => setBulunamadi(true))
      .finally(() => setYukleniyor(false));
  }, [paketId, router]);

  // ── Form gönder ──────────────────────────────────────────────────────────────
  async function rezervasyonOlustur(e: React.FormEvent) {
    e.preventDefault();
    if (!paket) return;

    // Ad Soyad: yalnızca harf (Türkçe dahil), boşluk, tire
    const adTemiz = adSoyad.trim();
    if (adTemiz.length < 2) {
      setAdSoyadHata('Ad soyad en az 2 karakter olmalıdır');
      return;
    }

    // E-posta: tehlikeli karakter kontrolü
    if (emailHata) return;

    // Telefon: rakam sayısı 10-15 arası olmalı
    const rakamlar = telefon.replace(/\D/g, '');
    if (rakamlar.length < 10) {
      setTelefonHata('Geçerli bir telefon numarası girin (en az 10 rakam)');
      return;
    }
    if (rakamlar.length > 15) {
      setTelefonHata('Telefon numarası en fazla 15 rakam içerebilir');
      return;
    }

    setHata('');
    setGonderiyor(true);

    // Demo: misafir kullanıcı ID'si olarak rastgele UUID
    const guestId = crypto.randomUUID();

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paket_id:     paket.id,
          kullanici_id: guestId,
          tarih,
        }),
      });
      const json = await res.json() as { success: boolean; data?: { odeme: { islem_id: string } }; error?: string };

      if (json.success && json.data) {
        setIslemId(json.data.odeme.islem_id);
        setBasarili(true);
      } else {
        setHata(json.error ?? 'Rezervasyon oluşturulamadı, lütfen tekrar deneyin');
      }
    } catch {
      setHata('Sunucuya bağlanılamadı, lütfen tekrar deneyin');
    } finally {
      setGonderiyor(false);
    }
  }

  // ── Yükleniyor ───────────────────────────────────────────────────────────────
  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Paket yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ── Bulunamadı ───────────────────────────────────────────────────────────────
  if (bulunamadi || !paket) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Paket bulunamadı</h1>
        <p className="text-gray-500 mb-6">Bu paket artık mevcut değil veya kaldırılmış olabilir.</p>
        <Link
          href="/packages"
          className="px-6 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
        >
          ← Tüm Paketlere Dön
        </Link>
      </main>
    );
  }

  // ── Başarı ekranı ─────────────────────────────────────────────────────────────
  if (basarili) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BasariEkrani
          paket={paket}
          islemId={islemId}
          adSoyad={adSoyad}
          email={email}
          tarih={tarih}
        />
      </main>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Başlık bandı */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            ← Geri dön
          </button>
          <h1 className="text-2xl font-extrabold text-white mt-2">Rezervasyon Yap</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sol: Form ───────────────────────────────────────────────────── */}
          <form onSubmit={rezervasyonOlustur} className="flex-1 space-y-5">

            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Ad Soyad *
              </label>
              <input
                required
                type="text"
                placeholder="Adınız ve soyadınız"
                value={adSoyad}
                maxLength={60}
                onChange={(e) => {
                  // Yalnızca harf (Türkçe dahil), boşluk ve tire — özel karaktere izin yok
                  const temiz = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s\-]/g, '');
                  setAdSoyad(temiz);
                  if (temiz && temiz.trim().length < 2) {
                    setAdSoyadHata('En az 2 karakter girin');
                  } else {
                    setAdSoyadHata('');
                  }
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  adSoyadHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {adSoyadHata && (
                <p className="mt-1.5 text-xs text-red-600">{adSoyadHata}</p>
              )}
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                E-posta Adresi *
              </label>
              <input
                required
                type="email"
                inputMode="email"
                placeholder="ornek@email.com"
                value={email}
                maxLength={100}
                onChange={(e) => {
                  // Enjeksiyon riskli karakterleri filtrele: < > " ' ; & \ newline
                  const temiz = e.target.value.replace(/[<>"';&\\`\n\r]/g, '');
                  setEmail(temiz);
                  // Geçerli e-posta formatı kontrolü
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (temiz && !emailRegex.test(temiz)) {
                    setEmailHata('Geçerli bir e-posta adresi girin');
                  } else {
                    setEmailHata('');
                  }
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  emailHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {emailHata && (
                <p className="mt-1.5 text-xs text-red-600">{emailHata}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Telefon Numarası *
              </label>
              <input
                required
                type="tel"
                inputMode="tel"
                placeholder="+90 5XX XXX XX XX"
                value={telefon}
                onChange={(e) => {
                  // Yalnızca rakam, +, boşluk, tire ve paranteze izin ver
                  const temiz = e.target.value.replace(/[^0-9+\s\-()]/g, '');
                  const rakamlar = temiz.replace(/\D/g, '');
                  // Maksimum 15 rakam (uluslararası E.164 standardı)
                  if (rakamlar.length > 15) return;
                  setTelefon(temiz);
                  if (temiz && rakamlar.length < 10) {
                    setTelefonHata('En az 10 rakam girin');
                  } else {
                    setTelefonHata('');
                  }
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  telefonHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {telefonHata && (
                <p className="mt-1.5 text-xs text-red-600">{telefonHata}</p>
              )}
            </div>

            {/* Tarih */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Tercih Ettiğiniz Tarih *
              </label>
              <input
                required
                type="date"
                value={tarih}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTarih(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white"
              />
            </div>

            {/* Ödeme notu */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700 font-semibold mb-1">💳 Demo Ödeme Sistemi</p>
              <p className="text-xs text-blue-600">
                Bu bir hackathon demosudur. Gerçek kart bilgisi gerekmez. Ödeme otomatik olarak onaylanır.
              </p>
            </div>

            {/* Hata mesajı */}
            {hata && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{hata}</p>
              </div>
            )}

            {/* Gönder butonu */}
            <button
              type="submit"
              disabled={gonderiyor}
              className="w-full py-4 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {gonderiyor ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ödeme işleniyor...</span>
                </>
              ) : (
                <>
                  <span>Rezervasyonu Onayla</span>
                  <span className="text-blue-200 font-normal">
                    {paket.toplam_fiyat.toLocaleString('tr-TR')}€
                  </span>
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-600">
              Ücretsiz iptal · Kredi kartı gerekmez · 7/24 destek
            </p>
          </form>

          {/* ── Sağ: Paket özeti ─────────────────────────────────────────────── */}
          <div className="lg:w-72 shrink-0 w-full lg:sticky lg:top-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Fiyat başlığı */}
              <div
                className="px-5 py-4 text-center"
                style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
              >
                <p className="text-blue-200 text-xs mb-0.5">Toplam Tutar</p>
                <p className="text-3xl font-extrabold text-white">
                  {paket.toplam_fiyat.toLocaleString('tr-TR')}€
                </p>
                <p className="text-blue-300 text-xs mt-0.5">kişi başı · tüm dahil</p>
              </div>

              {/* Paket detayları */}
              <div className="divide-y divide-gray-100 px-5">
                <div className="py-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-0.5">Klinik</p>
                  <p className="text-sm font-semibold text-gray-800">{paket.klinik.isim}</p>
                  <p className="text-xs text-gray-500">📍 {paket.klinik.sehir}</p>
                </div>
                <div className="py-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-0.5">Paket</p>
                  <p className="text-sm font-semibold text-gray-800">{paket.baslik}</p>
                </div>
                <div className="py-3 flex gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-0.5">Süre</p>
                    <p className="text-sm font-semibold">{paket.sure_gun} gün</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-0.5">Uçuş</p>
                    <p className="text-sm font-semibold">{paket.ucus_dahil ? 'Dahil ✈' : 'Dahil değil'}</p>
                  </div>
                </div>
                {paket.klinik.akredite && (
                  <div className="py-3">
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      ★ JCI Akredite Klinik
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

// ─── Sayfa (Suspense sarmalayıcı) ─────────────────────────────────────────────

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingInner />
    </Suspense>
  );
}
