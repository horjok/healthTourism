'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { Paket } from '@/lib/types';

// ─── Sabitler ───────────────────────────────────────────────────────────────

type SiraKey = 'baslik' | 'toplam_fiyat' | 'sure_gun';
type SiraYon = 'asc' | 'desc';

const BOŞ_FORM = {
  baslik: '', otel_isim: '', otel_dahil: false, ucus_dahil: false,
  toplam_fiyat: '', sure_gun: '', aciklama: '',
};

type FormHata = Partial<Record<keyof typeof BOŞ_FORM, string>>;

// Zod benzeri şema doğrulama — harici bağımlılık olmadan
function validasyonYap(form: typeof BOŞ_FORM): FormHata {
  const h: FormHata = {};

  if (!form.baslik.trim())
    h.baslik = 'Paket adı zorunludur.';
  else if (form.baslik.trim().length < 3)
    h.baslik = 'En az 3 karakter olmalıdır.';
  else if (form.baslik.trim().length > 100)
    h.baslik = 'En fazla 100 karakter olabilir.';

  if (!form.toplam_fiyat)
    h.toplam_fiyat = 'Fiyat zorunludur.';
  else if (isNaN(Number(form.toplam_fiyat)) || Number(form.toplam_fiyat) <= 0)
    h.toplam_fiyat = 'Geçerli ve pozitif bir fiyat girin.';
  else if (Number(form.toplam_fiyat) > 100_000)
    h.toplam_fiyat = 'Fiyat 100.000 €\'dan fazla olamaz.';

  if (!form.sure_gun)
    h.sure_gun = 'Süre zorunludur.';
  else if (!Number.isInteger(Number(form.sure_gun)) || Number(form.sure_gun) < 1)
    h.sure_gun = 'En az 1 tam gün olmalıdır.';
  else if (Number(form.sure_gun) > 365)
    h.sure_gun = '365 günden fazla olamaz.';

  if (form.otel_isim && form.otel_isim.length > 100)
    h.otel_isim = 'En fazla 100 karakter olabilir.';

  if (form.aciklama && form.aciklama.length > 500)
    h.aciklama = 'En fazla 500 karakter olabilir.';

  return h;
}

// ─── Yardımcı ───────────────────────────────────────────────────────────────

function SiraOk({ aktif, yon }: { aktif: boolean; yon: SiraYon }) {
  if (!aktif) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="ml-1">{yon === 'asc' ? '↑' : '↓'}</span>;
}

function HataYazisi({ mesaj }: { mesaj?: string }) {
  if (!mesaj) return null;
  return <p className="text-red-500 text-xs mt-1">{mesaj}</p>;
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

export default function ClinicPaketler() {
  const router = useRouter();
  const [klinikId, setKlinikId]       = useState<string | null>(null);
  const [paketler, setPaketler]       = useState<Paket[]>([]);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [form, setForm]               = useState(BOŞ_FORM);
  const [hatalar, setHatalar]         = useState<FormHata>({});
  const [formAcik, setFormAcik]       = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [genelHata, setGenelHata]     = useState('');

  // Sıralama
  const [siraKey, setSiraKey] = useState<SiraKey>('toplam_fiyat');
  const [siraYon, setSiraYon] = useState<SiraYon>('asc');

  // Filtre
  const [filUcus, setFilUcus]   = useState<'' | 'true' | 'false'>('');
  const [filOtel, setFilOtel]   = useState<'' | 'true' | 'false'>('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return; }
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('klinik_id')
        .eq('kullanici_id', user.id)
        .single();
      if (!roleRow?.klinik_id) { setYukleniyor(false); return; }
      setKlinikId(roleRow.klinik_id);
      yukle(roleRow.klinik_id);
    });
  }, [router]);

  async function yukle(kid: string) {
    const res  = await fetch(`/api/clinic/paketler?klinik_id=${kid}`);
    const json = await res.json();
    if (json.success) setPaketler(json.data);
    setYukleniyor(false);
  }

  // Sıralı + filtreli liste
  const goruntulenen = useMemo(() => {
    return paketler
      .filter((p) => filUcus === '' || String(p.ucus_dahil) === filUcus)
      .filter((p) => filOtel === '' || String(p.otel_dahil) === filOtel)
      .sort((a, b) => {
        const aVal = a[siraKey];
        const bVal = b[siraKey];
        const cmp  = typeof aVal === 'string'
          ? aVal.localeCompare(String(bVal), 'tr')
          : (aVal as number) - (bVal as number);
        return siraYon === 'asc' ? cmp : -cmp;
      });
  }, [paketler, filUcus, filOtel, siraKey, siraYon]);

  function sirala(key: SiraKey) {
    if (siraKey === key) setSiraYon((y) => (y === 'asc' ? 'desc' : 'asc'));
    else { setSiraKey(key); setSiraYon('asc'); }
  }

  function duzenle(p: Paket) {
    setForm({
      baslik: p.baslik, otel_isim: p.otel_isim ?? '',
      otel_dahil: p.otel_dahil, ucus_dahil: p.ucus_dahil,
      toplam_fiyat: String(p.toplam_fiyat), sure_gun: String(p.sure_gun),
      aciklama: p.aciklama ?? '',
    });
    setHatalar({}); setGenelHata('');
    setDuzenlenenId(p.id);
    setFormAcik(true);
  }

  function formSifirla() {
    setForm(BOŞ_FORM);
    setHatalar({});
    setGenelHata('');
    setDuzenlenenId(null);
    setFormAcik(false);
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    const h = validasyonYap(form);
    if (Object.keys(h).length > 0) { setHatalar(h); return; }

    setKaydediliyor(true); setGenelHata('');

    const payload = {
      ...form,
      baslik:       form.baslik.trim(),
      otel_isim:    form.otel_isim.trim(),
      aciklama:     form.aciklama.trim(),
      toplam_fiyat: Number(form.toplam_fiyat),
      sure_gun:     Number(form.sure_gun),
      klinik_id:    klinikId,
    };

    const url    = duzenlenenId ? `/api/clinic/paketler/${duzenlenenId}` : '/api/clinic/paketler';
    const method = duzenlenenId ? 'PATCH' : 'POST';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.success) {
      if (duzenlenenId) {
        setPaketler((prev) => prev.map((p) => p.id === duzenlenenId ? json.data : p));
      } else {
        setPaketler((prev) => [...prev, json.data]);
      }
      formSifirla();
    } else {
      setGenelHata(json.error ?? 'Kaydedilemedi, lütfen tekrar deneyin.');
    }
    setKaydediliyor(false);
  }

  async function sil(id: string) {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz?')) return;
    const res  = await fetch(`/api/clinic/paketler/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) setPaketler((prev) => prev.filter((p) => p.id !== id));
  }

  if (yukleniyor) return <p className="text-gray-500 text-sm">Yükleniyor...</p>;

  if (!klinikId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-sm">Bu hesaba bağlı bir klinik bulunamadı.</p>
        <p className="text-gray-400 text-xs mt-1">Yöneticinizle iletişime geçin.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Paketlerim
          <span className="ml-2 text-base font-normal text-gray-400">({paketler.length})</span>
        </h1>
        <button
          onClick={() => { formSifirla(); setFormAcik(true); }}
          className="px-4 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + Yeni Paket
        </button>
      </div>

      {/* Form */}
      {formAcik && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="font-bold text-gray-900 mb-5 text-lg">
            {duzenlenenId ? 'Paketi Düzenle' : 'Yeni Paket Ekle'}
          </p>
          <form onSubmit={kaydet} noValidate>
            <div className="grid grid-cols-2 gap-4">

              {/* Paket Adı */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Paket Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.baslik}
                  onChange={(e) => { setForm({ ...form, baslik: e.target.value }); setHatalar({ ...hatalar, baslik: undefined }); }}
                  placeholder="ör. 5 Günlük Saç Ekimi Paketi"
                  maxLength={100}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${hatalar.baslik ? 'border-red-400' : 'border-gray-200'}`}
                />
                <HataYazisi mesaj={hatalar.baslik} />
              </div>

              {/* Fiyat */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Toplam Fiyat (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100000}
                  step={0.01}
                  value={form.toplam_fiyat}
                  onChange={(e) => { setForm({ ...form, toplam_fiyat: e.target.value }); setHatalar({ ...hatalar, toplam_fiyat: undefined }); }}
                  placeholder="ör. 2500"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${hatalar.toplam_fiyat ? 'border-red-400' : 'border-gray-200'}`}
                />
                <HataYazisi mesaj={hatalar.toplam_fiyat} />
              </div>

              {/* Süre */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Süre (Gün) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.sure_gun}
                  onChange={(e) => { setForm({ ...form, sure_gun: e.target.value }); setHatalar({ ...hatalar, sure_gun: undefined }); }}
                  placeholder="ör. 7"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${hatalar.sure_gun ? 'border-red-400' : 'border-gray-200'}`}
                />
                <HataYazisi mesaj={hatalar.sure_gun} />
              </div>

              {/* Otel Adı */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Otel Adı</label>
                <input
                  type="text"
                  value={form.otel_isim}
                  onChange={(e) => { setForm({ ...form, otel_isim: e.target.value }); setHatalar({ ...hatalar, otel_isim: undefined }); }}
                  placeholder="ör. İstanbul Marriott"
                  maxLength={100}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${hatalar.otel_isim ? 'border-red-400' : 'border-gray-200'}`}
                />
                <HataYazisi mesaj={hatalar.otel_isim} />
              </div>

              {/* Checkboxlar */}
              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.otel_dahil}
                    onChange={(e) => setForm({ ...form, otel_dahil: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  🏨 Otel Dahil
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.ucus_dahil}
                    onChange={(e) => setForm({ ...form, ucus_dahil: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  ✈ Uçuş Dahil
                </label>
              </div>

              {/* Açıklama */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Açıklama
                  <span className="font-normal text-gray-400 ml-2">
                    ({form.aciklama.length}/500)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={form.aciklama}
                  onChange={(e) => { setForm({ ...form, aciklama: e.target.value }); setHatalar({ ...hatalar, aciklama: undefined }); }}
                  placeholder="Paket içeriğini detaylı açıklayın..."
                  maxLength={500}
                  className={`w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 ${hatalar.aciklama ? 'border-red-400' : 'border-gray-200'}`}
                />
                <HataYazisi mesaj={hatalar.aciklama} />
              </div>

              {/* Genel hata */}
              {genelHata && (
                <div className="col-span-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{genelHata}</p>
                </div>
              )}

              {/* Butonlar */}
              <div className="col-span-2 flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={kaydediliyor}
                  className="flex-1 py-2.5 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] disabled:opacity-50 transition-colors"
                >
                  {kaydediliyor ? 'Kaydediliyor...' : (duzenlenenId ? 'Güncelle' : 'Kaydet')}
                </button>
                <button
                  type="button"
                  onClick={formSifirla}
                  disabled={kaydediliyor}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filtre çubuğu */}
      {paketler.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-gray-500">Filtrele:</span>
          {(
            [
              { label: 'Uçuş',   val: filUcus, setVal: setFilUcus },
              { label: 'Otel',   val: filOtel, setVal: setFilOtel },
            ] as const
          ).map(({ label, val, setVal }) => (
            <div key={label} className="flex gap-1">
              {(['', 'true', 'false'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVal(v)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    val === v
                      ? 'bg-[#0f3460] text-white border-[#0f3460]'
                      : 'text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {v === '' ? `${label}: Tümü` : v === 'true' ? `${label}: Var` : `${label}: Yok`}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tablo */}
      {paketler.length === 0 && !formAcik ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">Henüz paket eklemediniz.</p>
          <button
            onClick={() => setFormAcik(true)}
            className="mt-3 text-[#0f3460] text-sm font-semibold hover:underline"
          >
            İlk paketi ekle
          </button>
        </div>
      ) : goruntulenen.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {(
                  [
                    { key: 'baslik' as SiraKey,        label: 'Paket Adı'   },
                    { key: 'toplam_fiyat' as SiraKey,  label: 'Fiyat (€)'   },
                    { key: 'sure_gun' as SiraKey,      label: 'Süre'         },
                    { key: null,                        label: 'Dahil'        },
                    { key: null,                        label: 'İşlem'        },
                  ] as { key: SiraKey | null; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={key ? () => sirala(key) : undefined}
                    className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none ${
                      key ? 'cursor-pointer hover:text-gray-800' : ''
                    }`}
                  >
                    {label}
                    {key && <SiraOk aktif={siraKey === key} yon={siraYon} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {goruntulenen.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{p.baslik}</p>
                    {p.aciklama && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-[240px]">{p.aciklama}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0f3460] tabular-nums">
                    €{p.toplam_fiyat.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sure_gun} gün</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.otel_dahil  && <span className="text-xs bg-blue-50  text-blue-600  px-2 py-0.5 rounded-full">🏨 Otel</span>}
                      {p.ucus_dahil  && <span className="text-xs bg-sky-50   text-sky-600   px-2 py-0.5 rounded-full">✈ Uçuş</span>}
                      {!p.otel_dahil && !p.ucus_dahil && <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => duzenle(p)}
                        className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => sil(p.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
