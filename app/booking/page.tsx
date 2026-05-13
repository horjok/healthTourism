'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Paket } from '@/lib/types';
import MockOdemeFormu from '@/components/ui/MockOdemeFormu';
import { getSupabaseClient } from '@/lib/supabase-client';

// ─── Adım göstergesi ───────────────────────────────────────────────────────────

type Adim = 1 | 2 | 3;

const ADIM_ETIKETLERI: Record<Adim, string> = {
  1: 'Paket Özeti',
  2: 'Kişisel Bilgiler',
  3: 'Ödeme',
};

function AdimGostergesi({ aktif }: { aktif: Adim }) {
  return (
    <div className="flex items-start justify-center mb-8">
      {([1, 2, 3] as Adim[]).map((no) => {
        const tamamlandi = no < aktif;
        const aktifMi   = no === aktif;

        return (
          <div key={no} className="flex items-start">
            {/* Adım yuvarlağı + etiket */}
            <div className="flex flex-col items-center w-24">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  tamamlandi
                    ? 'bg-[#0f3460] border-[#0f3460] text-white'
                    : aktifMi
                    ? 'bg-white border-[#0f3460] text-[#0f3460] shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {tamamlandi ? '✓' : no}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium text-center leading-tight ${
                  aktifMi ? 'text-[#0f3460]' : tamamlandi ? 'text-[#0f3460]' : 'text-gray-400'
                }`}
              >
                {ADIM_ETIKETLERI[no]}
              </span>
            </div>

            {/* Bağlantı çizgisi */}
            {no < 3 && (
              <div
                className={`w-16 sm:w-20 h-0.5 mt-4 mx-0.5 transition-colors ${
                  tamamlandi ? 'bg-[#0f3460]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Ana içerik ────────────────────────────────────────────────────────────────

function BookingInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const paketId      = searchParams.get('paket_id');

  // Sayfa durumu
  const [adim, setAdim]             = useState<Adim>(1);
  const [paket, setPaket]           = useState<Paket | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bulunamadi, setBulunamadi] = useState(false);
  const [kullaniciId, setKullaniciId] = useState<string | null>(null);

  // Form alanları
  const [adSoyad, setAdSoyad]         = useState('');
  const [adSoyadHata, setAdSoyadHata] = useState('');
  const [email, setEmail]             = useState('');
  const [emailHata, setEmailHata]     = useState('');
  const [telefon, setTelefon]         = useState('');
  const [telefonHata, setTelefonHata] = useState('');
  const [tarih, setTarih]             = useState('');
  const [tarihHata, setTarihHata]     = useState('');

  // Kullanıcı oturumu al (varsa)
  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setKullaniciId(data.user.id);
    });
  }, []);

  // Paket yükleme
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

  // ── Adım 2 doğrulama ─────────────────────────────────────────────────────────
  function adim2Dogrula(): boolean {
    let gecerli = true;

    const adTemiz = adSoyad.trim();
    if (adTemiz.length < 2) {
      setAdSoyadHata('Ad soyad en az 2 karakter olmalıdır');
      gecerli = false;
    } else {
      setAdSoyadHata('');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailHata('Geçerli bir e-posta adresi girin');
      gecerli = false;
    } else if (emailHata) {
      gecerli = false;
    }

    const rakamlar = telefon.replace(/\D/g, '');
    if (rakamlar.length < 10) {
      setTelefonHata('Geçerli bir telefon numarası girin (en az 10 rakam)');
      gecerli = false;
    } else if (rakamlar.length > 15) {
      setTelefonHata('Telefon numarası en fazla 15 rakam içerebilir');
      gecerli = false;
    } else {
      setTelefonHata('');
    }

    if (!tarih) {
      setTarihHata('Lütfen bir tarih seçin');
      gecerli = false;
    } else {
      setTarihHata('');
    }

    return gecerli;
  }

  // ── Yükleniyor ───────────────────────────────────────────────────────────────
  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
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

  // ── Sayfa ─────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Başlık bandı */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-2xl mx-auto px-6 py-6">
          <button
            onClick={() => (adim === 1 ? router.back() : setAdim((prev) => (prev - 1) as Adim))}
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            ← Geri dön
          </button>
          <h1 className="text-2xl font-extrabold text-white mt-2">Rezervasyon Yap</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Adım göstergesi */}
        <AdimGostergesi aktif={adim} />

        {/* ── ADIM 1 — Paket Özeti ─────────────────────────────────────────── */}
        {adim === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Başlık */}
            <div
              className="px-6 py-5"
              style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}
            >
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-1">
                Seçilen Paket
              </p>
              <p className="text-white text-xl font-bold">{paket.baslik}</p>
            </div>

            {/* Paket detayları */}
            <div className="divide-y divide-gray-100">
              {[
                { etiket: '🏥 Klinik',  deger: paket.klinik.isim },
                { etiket: '📍 Şehir',   deger: paket.klinik.sehir },
                { etiket: '🗓 Süre',    deger: `${paket.sure_gun} gün` },
                { etiket: '✈️ Uçuş',    deger: paket.ucus_dahil ? 'Dahil ✓' : 'Dahil değil' },
                { etiket: '🏨 Otel',    deger: paket.otel_isim },
              ].map(({ etiket, deger }) => (
                <div key={etiket} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm text-gray-500">{etiket}</span>
                  <span className="text-sm font-semibold text-gray-800">{deger}</span>
                </div>
              ))}

              {/* Toplam fiyat */}
              <div className="flex items-center justify-between px-6 py-4 bg-blue-50">
                <span className="text-sm font-bold text-gray-700">💰 Toplam Fiyat</span>
                <span className="text-2xl font-extrabold text-[#0f3460]">
                  {paket.toplam_fiyat.toLocaleString('tr-TR')}€
                </span>
              </div>
            </div>

            {/* Açıklama */}
            {paket.aciklama && (
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                  Paket Hakkında
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{paket.aciklama}</p>
              </div>
            )}

            {/* JCI rozeti */}
            {paket.klinik.akredite && (
              <div className="px-6 pb-4">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  ★ JCI Akredite Klinik
                </span>
              </div>
            )}

            {/* Devam Et butonu */}
            <div className="px-6 py-5 border-t border-gray-100">
              <button
                onClick={() => setAdim(2)}
                className="w-full py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors text-base"
              >
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 2 — Kişisel Bilgiler ────────────────────────────────────── */}
        {adim === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800">Kişisel Bilgileriniz</h2>

            {/* Ad Soyad */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Ad Soyad *
              </label>
              <input
                type="text"
                placeholder="Adınız ve soyadınız"
                value={adSoyad}
                maxLength={60}
                onChange={(e) => {
                  // Yalnızca harf (Türkçe dahil), boşluk, tire — özel karakter yasak
                  const temiz = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s\-]/g, '');
                  setAdSoyad(temiz);
                  if (temiz && temiz.trim().length < 2) setAdSoyadHata('En az 2 karakter girin');
                  else setAdSoyadHata('');
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  adSoyadHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {adSoyadHata && <p className="mt-1.5 text-xs text-red-600">{adSoyadHata}</p>}
            </div>

            {/* E-posta */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                E-posta Adresi *
              </label>
              <input
                type="email"
                inputMode="email"
                placeholder="ornek@email.com"
                value={email}
                maxLength={100}
                onChange={(e) => {
                  // Enjeksiyon karakterlerini filtrele
                  const temiz = e.target.value.replace(/[<>"';&\\`\n\r]/g, '');
                  setEmail(temiz);
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (temiz && !emailRegex.test(temiz)) setEmailHata('Geçerli bir e-posta adresi girin');
                  else setEmailHata('');
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  emailHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {emailHata && <p className="mt-1.5 text-xs text-red-600">{emailHata}</p>}
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Telefon Numarası *
              </label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+90 5XX XXX XX XX"
                value={telefon}
                onChange={(e) => {
                  // Yalnızca rakam, +, boşluk, tire ve parantez — harf yasak
                  const temiz = e.target.value.replace(/[^0-9+\s\-()]/g, '');
                  const rakamlar = temiz.replace(/\D/g, '');
                  if (rakamlar.length > 15) return; // E.164 sınırı
                  setTelefon(temiz);
                  if (temiz && rakamlar.length < 10) setTelefonHata('En az 10 rakam girin');
                  else setTelefonHata('');
                }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  telefonHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {telefonHata && <p className="mt-1.5 text-xs text-red-600">{telefonHata}</p>}
            </div>

            {/* Tarih */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Tercih Ettiğiniz Tarih *
              </label>
              <input
                type="date"
                value={tarih}
                min={(() => {
                  const d = new Date();
                  // Yerel saat dilimiyle ayın ilk günü (toISOString UTC'ye çevirince gün kayabilir)
                  const yil = d.getFullYear();
                  const ay  = String(d.getMonth() + 1).padStart(2, '0');
                  return `${yil}-${ay}-01`;
                })()}
                max={(() => {
                  const d = new Date();
                  const yil = d.getFullYear() + 3;
                  const ay  = String(d.getMonth() + 1).padStart(2, '0');
                  const gun = String(d.getDate()).padStart(2, '0');
                  return `${yil}-${ay}-${gun}`;
                })()}
                onChange={(e) => { setTarih(e.target.value); setTarihHata(''); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 bg-white transition-colors ${
                  tarihHata
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-[#0f3460]/30 focus:border-[#0f3460]'
                }`}
              />
              {tarihHata && <p className="mt-1.5 text-xs text-red-600">{tarihHata}</p>}
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdim(1)}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                ← Geri
              </button>
              <button
                type="button"
                onClick={() => { if (adim2Dogrula()) setAdim(3); }}
                className="flex-[2] py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors"
              >
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3 — Ödeme ───────────────────────────────────────────────── */}
        {adim === 3 && (
          <MockOdemeFormu
            tutar={paket.toplam_fiyat}
            onSuccess={async (islemId) => {
              // Kullanıcı giriş yapmışsa rezervasyonu Supabase'e kaydet
              if (kullaniciId && tarih) {
                try {
                  await fetch('/api/booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      paket_id: paketId,
                      kullanici_id: kullaniciId,
                      tarih,
                    }),
                  });
                } catch {
                  // Kayıt hatası kritik değil — ödeme zaten tamam
                }
              }
              router.push(`/booking/success?id=${encodeURIComponent(islemId)}`);
            }}
            onError={() => {
              // Hata durumunda 2. adıma geri dön ve bilgilendirme yap
              setAdim(2);
            }}
          />
        )}
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
