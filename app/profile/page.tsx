'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Rezervasyon } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase-client';

// ─── Durum badge'i ─────────────────────────────────────────────────────────────

const DURUM_STILLER: Record<string, { etiket: string; stil: string }> = {
  beklemede: { etiket: 'Beklemede', stil: 'bg-amber-100 text-amber-700' },
  onaylandi: { etiket: 'Onaylandı', stil: 'bg-green-100 text-green-700' },
  iptal:     { etiket: 'İptal',     stil: 'bg-red-100 text-red-600'     },
};

function DurumBadge({ durum }: { durum: string }) {
  const { etiket, stil } = DURUM_STILLER[durum] ?? { etiket: durum, stil: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${stil}`}>
      {etiket}
    </span>
  );
}

type Sekme = 'rezervasyonlar' | 'profil';

// ─── Profil sayfası ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router   = useRouter();

  const [kullanici, setKullanici]           = useState<User | null>(null);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor]         = useState(true);
  const [rezYukleniyor, setRezYukleniyor]   = useState(false);
  const [hata, setHata]                     = useState('');
  const [sekme, setSekme]                   = useState<Sekme>('rezervasyonlar');

  // İptal işlemi durumları: id → 'yukleniyor' | 'hata'
  const [iptalDurum, setIptalDurum] = useState<Record<string, string>>({});

  // Profil düzenleme alanları
  const [goruntulenenAd, setGoruntulenenAd] = useState('');
  const [adKaydediliyor, setAdKaydediliyor] = useState(false);
  const [adMesaj, setAdMesaj]               = useState<{ tur: 'basari' | 'hata'; metin: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/auth');
        return;
      }
      setKullanici(data.user);
      setGoruntulenenAd(data.user.user_metadata?.display_name ?? '');
      setYukleniyor(false);

      // Rezervasyonları getir
      setRezYukleniyor(true);
      try {
        const res  = await fetch(`/api/booking?kullanici_id=${data.user.id}`);
        const json = await res.json() as { success: boolean; data?: Rezervasyon[]; error?: string };
        if (json.success && json.data) setRezervasyonlar(json.data);
        else setHata('Rezervasyonlar yüklenemedi.');
      } catch {
        setHata('Sunucuya bağlanılamadı.');
      } finally {
        setRezYukleniyor(false);
      }
    });
  }, [router]);

  // ── İptal isteği — kullanıcı oturumu olan client ile direkt Supabase ─────────
  async function iptalEt(rezId: string) {
    if (!kullanici) return;
    setIptalDurum((prev) => ({ ...prev, [rezId]: 'yukleniyor' }));
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('rezervasyonlar')
        .update({ durum: 'iptal' })
        .eq('id', rezId)
        .eq('kullanici_id', kullanici.id)   // RLS için kullanıcı kontrolü
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        // Listedeki rezervasyonu güncelle
        setRezervasyonlar((prev) =>
          prev.map((r) => (r.id === rezId ? { ...r, durum: 'iptal' } : r))
        );
        setIptalDurum((prev) => { const s = { ...prev }; delete s[rezId]; return s; });
      } else {
        setIptalDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
      }
    } catch {
      setIptalDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
    }
  }

  // ── Profil kaydet ─────────────────────────────────────────────────────────────
  async function profilKaydet(e: React.FormEvent) {
    e.preventDefault();
    setAdKaydediliyor(true);
    setAdMesaj(null);
    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: goruntulenenAd.trim() },
      });
      if (error) throw error;
      setAdMesaj({ tur: 'basari', metin: 'Profiliniz güncellendi.' });
    } catch {
      setAdMesaj({ tur: 'hata', metin: 'Güncelleme başarısız oldu.' });
    } finally {
      setAdKaydediliyor(false);
    }
  }

  // ── Yükleniyor ────────────────────────────────────────────────────────────────
  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kullanici) return null;

  const emailKisa      = kullanici.email ?? 'Kullanıcı';
  const goruntulenenIsim = kullanici.user_metadata?.display_name || emailKisa.split('@')[0];

  // ── Sayfa ─────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Başlık bandı */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">
                {goruntulenenIsim[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-0.5">
                Hoş geldiniz
              </p>
              <p className="text-white text-lg font-bold">{goruntulenenIsim}</p>
              <p className="text-blue-300 text-xs">{emailKisa}</p>
            </div>
          </div>
        </div>

        {/* Sekme başlıkları */}
        <div className="max-w-4xl mx-auto px-6 flex gap-1">
          {([
            { key: 'rezervasyonlar', label: '📋 Rezervasyonlarım' },
            { key: 'profil',         label: '✏️ Profilimi Düzenle' },
          ] as { key: Sekme; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSekme(key)}
              className={`px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors ${
                sekme === key
                  ? 'bg-gray-50 text-[#0f3460]'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── SEKME 1: Rezervasyonlarım ──────────────────────────────────────── */}
        {sekme === 'rezervasyonlar' && (
          <>
            {rezYukleniyor && (
              <div className="flex items-center gap-3 py-12 justify-center">
                <div className="w-7 h-7 border-2 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Rezervasyonlar yükleniyor...</p>
              </div>
            )}

            {hata && !rezYukleniyor && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">
                {hata}
              </div>
            )}

            {!rezYukleniyor && !hata && rezervasyonlar.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-gray-700 font-semibold mb-1">Henüz rezervasyonunuz yok</p>
                <p className="text-gray-500 text-sm mb-6">
                  Sağlık turizmi paketlerimizi keşfetmeye başlayın.
                </p>
                <Link
                  href="/packages"
                  className="inline-block px-6 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors text-sm"
                >
                  Paketlere Göz At
                </Link>
              </div>
            )}

            {!rezYukleniyor && rezervasyonlar.length > 0 && (
              <div className="space-y-4">
                {rezervasyonlar.map((rez) => {
                  const iptalEdildi = rez.durum === 'iptal';
                  const iptalYukleniyor = iptalDurum[rez.id] === 'yukleniyor';
                  const iptalHata = iptalDurum[rez.id] === 'hata';

                  return (
                    <div
                      key={rez.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      {/* Klinik + Paket başlık */}
                      <div className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-gray-800 truncate">
                            {rez.paket?.klinik?.isim ?? '—'}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-0.5">
                            {rez.paket?.baslik ?? '—'}
                          </p>
                        </div>
                        <DurumBadge durum={rez.durum} />
                      </div>

                      {/* Detay satırları */}
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        <div className="flex items-center justify-between px-5 py-2.5">
                          <span className="text-xs text-gray-500">📍 Şehir</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {rez.paket?.klinik?.sehir ?? '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-5 py-2.5">
                          <span className="text-xs text-gray-500">📅 Tarih</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {rez.tarih
                              ? new Date(rez.tarih).toLocaleDateString('tr-TR', { dateStyle: 'long' })
                              : '—'}
                          </span>
                        </div>
                        {rez.paket?.toplam_fiyat !== undefined && (
                          <div className="flex items-center justify-between px-5 py-2.5">
                            <span className="text-xs text-gray-500">💰 Tutar</span>
                            <span className="text-xs font-bold text-[#0f3460]">
                              {rez.paket.toplam_fiyat.toLocaleString('tr-TR')}€
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50">
                          <span className="text-xs text-gray-500">🔖 İşlem No</span>
                          <span className="text-xs font-mono text-gray-600 break-all text-right max-w-[60%]">
                            {rez.id}
                          </span>
                        </div>
                      </div>

                      {/* İptal butonu (sadece beklemede/onaylı rezervasyonlar için) */}
                      {!iptalEdildi && (
                        <div className="px-5 py-4 border-t border-gray-100">
                          {iptalHata && (
                            <p className="text-xs text-red-500 mb-2">
                              İptal işlemi başarısız oldu. Tekrar deneyin.
                            </p>
                          )}
                          <button
                            onClick={() => iptalEt(rez.id)}
                            disabled={iptalYukleniyor}
                            className="w-full py-2.5 border border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {iptalYukleniyor ? (
                              <>
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                <span>İptal ediliyor...</span>
                              </>
                            ) : (
                              '✕ Rezervasyonu İptal Et'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!rezYukleniyor && (
              <div className="mt-8 text-center">
                <Link
                  href="/packages"
                  className="inline-block px-6 py-3 border border-[#0f3460] text-[#0f3460] font-semibold rounded-xl hover:bg-[#0f3460] hover:text-white transition-colors text-sm"
                >
                  + Yeni Rezervasyon Yap
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── SEKME 2: Profilimi Düzenle ─────────────────────────────────────── */}
        {sekme === 'profil' && (
          <div className="max-w-lg">
            <form onSubmit={profilKaydet} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">Profil Bilgileri</h2>

              {/* Başarı / Hata mesajı */}
              {adMesaj && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  adMesaj.tur === 'basari'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {adMesaj.metin}
                </div>
              )}

              {/* E-posta (salt okunur) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={emailKisa}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez.</p>
              </div>

              {/* Görüntülenen ad */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Görüntülenen Ad
                </label>
                <input
                  type="text"
                  placeholder="Adınız soyadınız"
                  value={goruntulenenAd}
                  maxLength={60}
                  onChange={(e) => {
                    setGoruntulenenAd(e.target.value.replace(/[<>"';&\\`]/g, ''));
                    setAdMesaj(null);
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white"
                />
              </div>

              {/* Kaydet butonu */}
              <button
                type="submit"
                disabled={adKaydediliyor}
                className="w-full py-3 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adKaydediliyor ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  'Değişiklikleri Kaydet'
                )}
              </button>
            </form>

            {/* Hesap bilgileri */}
            <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hesap Bilgileri</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Üyelik Tarihi</span>
                <span className="text-xs font-semibold text-gray-700">
                  {kullanici.created_at
                    ? new Date(kullanici.created_at).toLocaleDateString('tr-TR', { dateStyle: 'medium' })
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Toplam Rezervasyon</span>
                <span className="text-xs font-semibold text-gray-700">{rezervasyonlar.length} adet</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
