import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseForRoute, getClinicStats, getRezervasyonlarByKlinik } from '@/lib/supabase';

const DURUM_RENK: Record<string, string> = {
  beklemede:  'bg-amber-100 text-amber-700',
  onaylandi:  'bg-blue-100 text-blue-700',
  tamamlandi: 'bg-green-100 text-green-700',
  iptal:      'bg-red-100 text-red-700',
};

const DURUM_LABEL: Record<string, string> = {
  beklemede:  'Beklemede',
  onaylandi:  'Onaylandı',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
};

function MetrikKart({
  baslik,
  deger,
  alt,
  renk,
}: {
  baslik: string;
  deger: string;
  alt?: string;
  renk: 'mavi' | 'yesil' | 'turuncu' | 'mor';
}) {
  const renkler = {
    mavi:    { bg: 'bg-blue-50',   metin: 'text-blue-700',   alt: 'text-blue-400'   },
    yesil:   { bg: 'bg-emerald-50', metin: 'text-emerald-700', alt: 'text-emerald-400' },
    turuncu: { bg: 'bg-amber-50',  metin: 'text-amber-700',  alt: 'text-amber-400'  },
    mor:     { bg: 'bg-violet-50', metin: 'text-violet-700', alt: 'text-violet-400' },
  }[renk];

  return (
    <div className={`${renkler.bg} rounded-2xl p-6 flex flex-col gap-1`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${renkler.alt}`}>{baslik}</p>
      <p className={`text-3xl font-extrabold tabular-nums ${renkler.metin}`}>{deger}</p>
      {alt && <p className={`text-xs ${renkler.alt}`}>{alt}</p>}
    </div>
  );
}

export default async function ClinicDashboard() {
  const cookieStore = cookies();
  const sb = createSupabaseForRoute(cookieStore);

  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/auth');

  const { data: roleRow } = await sb
    .from('user_roles')
    .select('klinik_id')
    .eq('kullanici_id', user.id)
    .single();

  if (!roleRow?.klinik_id) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Klinik Paneli</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-amber-700 font-semibold">Başvurunuz henüz onaylanmadı.</p>
          <p className="text-amber-600 text-sm mt-1">Admin onayından sonra dashboard verileriniz burada görünecek.</p>
        </div>
      </div>
    );
  }

  const klinik_id = roleRow.klinik_id as string;

  const [stats, rezervasyonlar, { data: klinik }] = await Promise.all([
    getClinicStats(klinik_id, sb),
    getRezervasyonlarByKlinik(klinik_id),
    sb.from('klinikler').select('isim, sehir').eq('id', klinik_id).single(),
  ]);

  const sonBes = rezervasyonlar.slice(0, 5);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">
          {klinik?.isim ?? 'Klinik Paneli'}
        </h1>
        {klinik?.sehir && (
          <p className="text-sm text-gray-500 mt-0.5">{klinik.sehir}</p>
        )}
      </div>

      {/* 4 Metrik Kart */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetrikKart
          baslik="Toplam Gelir"
          deger={`€${stats.toplamGelir.toLocaleString('tr-TR')}`}
          alt="Tamamlanan rezervasyonlar"
          renk="yesil"
        />
        <MetrikKart
          baslik="Aktif Rezervasyon"
          deger={String(stats.aktifRezervasyonSayisi)}
          alt="Bekleyen + onaylı"
          renk="mavi"
        />
        <MetrikKart
          baslik="Ortalama Puan"
          deger={stats.ortPuan > 0 ? `${stats.ortPuan.toFixed(1)} / 5` : '—'}
          alt={stats.yorumSayisi > 0 ? `${stats.yorumSayisi} yorum` : 'Henüz yorum yok'}
          renk="turuncu"
        />
        <MetrikKart
          baslik="Toplam Yorum"
          deger={String(stats.yorumSayisi)}
          alt="Hasta değerlendirmeleri"
          renk="mor"
        />
      </div>

      {/* Son Rezervasyonlar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-bold text-gray-900">Son Rezervasyonlar</p>
          <a href="/clinic/rezervasyonlar" className="text-xs text-[#0f3460] font-semibold hover:underline">
            Tümünü Gör →
          </a>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Paket', 'Takip Kodu', 'Tarih', 'Durum'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sonBes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">Henüz rezervasyon yok</td>
              </tr>
            ) : sonBes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{r.paket?.baslik ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.takip_kodu ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.tarih}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DURUM_RENK[r.durum] ?? ''}`}>
                    {DURUM_LABEL[r.durum] ?? r.durum}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
