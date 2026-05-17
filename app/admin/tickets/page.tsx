'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Ticket } from '@/lib/types';

const DURUM_RENK: Record<string, string> = {
  acik:    'bg-red-100 text-red-700',
  islemde: 'bg-amber-100 text-amber-700',
  kapali:  'bg-gray-100 text-gray-500',
};

const DURUM_TR: Record<string, string> = {
  acik: 'Açık', islemde: 'İşlemde', kapali: 'Kapalı',
};

export default function AdminTickets() {
  const [biletler, setBiletler]     = useState<Ticket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [acikId, setAcikId]         = useState<string | null>(null);
  const [yanit, setYanit]           = useState('');
  const [islemde, setIslemde]       = useState<string | null>(null);
  const [filDurum, setFilDurum]     = useState('');
  const [silOnay, setSilOnay]       = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/tickets')
      .then((r) => r.json())
      .then((j) => { if (j.success) setBiletler(j.data); })
      .finally(() => setYukleniyor(false));
  }, []);

  const goster = useMemo(
    () => filDurum ? biletler.filter((b) => b.durum === filDurum) : biletler,
    [biletler, filDurum]
  );

  async function yanıtla(id: string, durum: Ticket['durum']) {
    setIslemde(id);
    const res = await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, durum, admin_yaniti: yanit || undefined }),
    });
    const json = await res.json();
    if (json.success) {
      setBiletler((prev) => prev.map((b) => b.id === id ? json.data : b));
      setAcikId(null); setYanit('');
    }
    setIslemde(null);
  }

  async function arsivle(id: string) {
    setIslemde(id);
    const res = await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, durum: 'kapali' }),
    });
    const json = await res.json();
    if (json.success) {
      setBiletler((prev) => prev.map((b) => b.id === id ? json.data : b));
    }
    setIslemde(null);
  }

  async function sil(id: string) {
    setIslemde(id);
    const res = await fetch('/api/admin/tickets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) {
      setBiletler((prev) => prev.filter((b) => b.id !== id));
    }
    setSilOnay(null);
    setIslemde(null);
  }

  if (yukleniyor) return <p className="text-gray-500 text-sm">Yükleniyor...</p>;

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          Destek Biletleri
          <span className="ml-2 text-base font-normal text-gray-400">({goster.length}/{biletler.length})</span>
        </h1>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['', 'acik', 'islemde', 'kapali'] as const).map((d) => {
          const count = d ? biletler.filter((b) => b.durum === d).length : biletler.length;
          return (
            <button
              key={d}
              onClick={() => setFilDurum(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filDurum === d
                  ? 'bg-[#0f3460] text-white border-[#0f3460]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {d ? DURUM_TR[d] : 'Tümü'}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {goster.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">Bu filtreye uygun bilet bulunamadı.</p>
        )}

        {goster.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Kart başlığı */}
            <div className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">{b.konu}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DURUM_RENK[b.durum]}`}>
                    {DURUM_TR[b.durum]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{b.mesaj}</p>
                {b.admin_yaniti && (
                  <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2">
                    <p className="text-xs font-semibold text-blue-600 mb-0.5">Admin Yanıtı</p>
                    <p className="text-sm text-blue-700">{b.admin_yaniti}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(b.olusturma_tarihi).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex flex-col gap-1.5 shrink-0 items-end">
                {b.durum !== 'kapali' && (
                  <button
                    onClick={() => { setAcikId(acikId === b.id ? null : b.id); setYanit(''); }}
                    className="text-xs text-[#0f3460] font-semibold hover:underline"
                  >
                    {acikId === b.id ? 'Kapat' : 'Yanıtla'}
                  </button>
                )}
                {b.durum !== 'kapali' && (
                  <button
                    onClick={() => arsivle(b.id)}
                    disabled={islemde === b.id}
                    className="text-xs text-gray-500 font-semibold hover:underline disabled:opacity-50"
                  >
                    Arşivle
                  </button>
                )}
                {silOnay === b.id ? (
                  <div className="flex gap-1.5 items-center">
                    <span className="text-xs text-red-500 font-medium">Emin misiniz?</span>
                    <button
                      onClick={() => sil(b.id)}
                      disabled={islemde === b.id}
                      className="text-xs text-red-600 font-bold hover:underline disabled:opacity-50"
                    >
                      {islemde === b.id ? '...' : 'Evet'}
                    </button>
                    <button
                      onClick={() => setSilOnay(null)}
                      className="text-xs text-gray-400 font-semibold hover:underline"
                    >
                      Hayır
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSilOnay(b.id)}
                    className="text-xs text-red-500 font-semibold hover:underline"
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>

            {/* Yanıt paneli */}
            {acikId === b.id && (
              <div className="border-t border-gray-100 px-5 pb-4 pt-3 space-y-3">
                <textarea
                  rows={3}
                  value={yanit}
                  onChange={(e) => setYanit(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => yanıtla(b.id, 'islemde')}
                    disabled={islemde === b.id || !yanit.trim()}
                    className="flex-1 py-2 bg-[#0f3460] text-white text-sm font-semibold rounded-lg hover:bg-[#16213e] disabled:opacity-50 transition-colors"
                  >
                    {islemde === b.id ? '...' : 'Yanıtla & İşlemde'}
                  </button>
                  <button
                    onClick={() => yanıtla(b.id, 'kapali')}
                    disabled={islemde === b.id}
                    className="flex-1 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {islemde === b.id ? '...' : 'Yanıtla & Kapat'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
