'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminKullanici, Klinik, KullaniciRolu } from '@/lib/types';

const ROL_LABEL: Record<string, string> = {
  user: 'Kullanıcı',
  clinic_manager: 'Klinik Yöneticisi',
  super_admin: 'Admin',
};

const ROL_RENK: Record<string, string> = {
  user: 'bg-gray-100 text-gray-600',
  clinic_manager: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-violet-100 text-violet-700',
};

type YeniKullanici = { email: string; sifre: string; rol: KullaniciRolu; klinik_id: string };

const BOŞ_FORM: YeniKullanici = { email: '', sifre: '', rol: 'user', klinik_id: '' };

export default function AdminKullanicilar() {
  const [kullanicilar, setKullanicilar] = useState<AdminKullanici[]>([]);
  const [klinikler, setKlinikler] = useState<Pick<Klinik, 'id' | 'isim'>[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [siliniyor, setSiliniyor] = useState<string | null>(null);
  const [guncelleniyor, setGuncelleniyor] = useState<string | null>(null);
  const [modalAcik, setModalAcik] = useState(false);
  const [form, setForm] = useState<YeniKullanici>(BOŞ_FORM);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    try {
      const [kRes, klRes] = await Promise.all([
        fetch('/api/admin/kullanicilar'),
        fetch('/api/klinikler?limit=100'),
      ]);
      const [kJson, klJson] = await Promise.all([kRes.json(), klRes.json()]);
      if (kJson.success) setKullanicilar(kJson.data);
      if (klJson.success) setKlinikler(klJson.data.map((k: Klinik) => ({ id: k.id, isim: k.isim })));
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { yukle(); }, [yukle]);

  async function rolGuncelle(id: string, rol: KullaniciRolu, klinik_id: string | null) {
    setGuncelleniyor(id);
    try {
      await fetch('/api/admin/kullanicilar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, rol, klinik_id }),
      });
      setKullanicilar((prev) => prev.map((u) => u.id === id ? { ...u, rol, klinik_id } : u));
    } finally {
      setGuncelleniyor(null);
    }
  }

  async function sil(id: string, email: string) {
    if (!confirm(`${email} silinsin mi? Bu işlem geri alınamaz.`)) return;
    setSiliniyor(id);
    try {
      const res = await fetch(`/api/admin/kullanicilar?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) setKullanicilar((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setSiliniyor(null);
    }
  }

  async function kullaniciEkle() {
    if (!form.email || !form.sifre) { setHata('Email ve şifre zorunlu'); return; }
    setKaydediliyor(true);
    setHata(null);
    try {
      const res = await fetch('/api/admin/kullanicilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, klinik_id: form.klinik_id || null }),
      });
      const json = await res.json();
      if (!json.success) { setHata(json.detay ?? json.error); return; }
      setModalAcik(false);
      setForm(BOŞ_FORM);
      yukle();
    } finally {
      setKaydediliyor(false);
    }
  }

  const gorunen = kullanicilar.filter((u) =>
    u.email.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Kullanıcılar
          <span className="ml-2 text-base font-normal text-gray-400">({kullanicilar.length})</span>
        </h1>
        <button
          onClick={() => { setModalAcik(true); setHata(null); setForm(BOŞ_FORM); }}
          className="px-4 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-xl hover:bg-[#16213e] transition-colors"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      {/* Arama */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Email ile ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
        />
      </div>

      {/* Aktif Klinik ID'leri */}
      <details className="mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <summary className="px-5 py-3 text-sm font-semibold text-gray-700 cursor-pointer select-none">
          Aktif Klinik ID&apos;leri ({klinikler.length})
        </summary>
        <div className="px-5 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {klinikler.map((k) => (
            <div key={k.id} className="flex items-center gap-3 text-xs">
              <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-lg break-all">{k.id}</span>
              <span className="text-gray-500 truncate">{k.isim}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Email', 'Kayıt Tarihi', 'Rol', 'Klinik', 'İşlem'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {yukleniyor ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Yükleniyor...</td></tr>
            ) : gorunen.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Kullanıcı bulunamadı</td></tr>
            ) : gorunen.map((u) => {
              const islem = guncelleniyor === u.id || siliniyor === u.id;
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  {/* Email */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.email}</p>
                    <p className="text-xs text-gray-400 font-mono">{u.id.slice(0, 8)}...</p>
                  </td>

                  {/* Tarih */}
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <select
                      disabled={islem}
                      value={u.rol ?? 'user'}
                      onChange={(e) => rolGuncelle(u.id, e.target.value as KullaniciRolu, u.klinik_id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 disabled:opacity-50 ${ROL_RENK[u.rol ?? 'user']}`}
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="clinic_manager">Klinik Yöneticisi</option>
                      <option value="super_admin">Admin</option>
                    </select>
                  </td>

                  {/* Klinik */}
                  <td className="px-4 py-3">
                    {u.rol === 'clinic_manager' ? (
                      <select
                        disabled={islem}
                        value={u.klinik_id ?? ''}
                        onChange={(e) => rolGuncelle(u.id, 'clinic_manager', e.target.value || null)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 disabled:opacity-50 max-w-[180px]"
                      >
                        <option value="">— Klinik Seç —</option>
                        {klinikler.map((k) => (
                          <option key={k.id} value={k.id}>{k.isim}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Sil */}
                  <td className="px-4 py-3">
                    <button
                      disabled={islem}
                      onClick={() => sil(u.id, u.email)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-40 transition-colors"
                    >
                      {siliniyor === u.id ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Yeni Kullanıcı Modal */}
      {modalAcik && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Yeni Kullanıcı Ekle</h2>
              <button onClick={() => setModalAcik(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Şifre</label>
                <input
                  type="password"
                  value={form.sifre}
                  onChange={(e) => setForm((f) => ({ ...f, sifre: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as KullaniciRolu, klinik_id: '' }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="clinic_manager">Klinik Yöneticisi</option>
                  <option value="super_admin">Admin</option>
                </select>
              </div>
              {form.rol === 'clinic_manager' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Klinik</label>
                  <select
                    value={form.klinik_id}
                    onChange={(e) => setForm((f) => ({ ...f, klinik_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                  >
                    <option value="">— Klinik Seç —</option>
                    {klinikler.map((k) => (
                      <option key={k.id} value={k.id}>{k.isim}</option>
                    ))}
                  </select>
                </div>
              )}
              {hata && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{hata}</p>}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModalAcik(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                disabled={kaydediliyor}
                onClick={kullaniciEkle}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-[#0f3460] text-white rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60"
              >
                {kaydediliyor ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
