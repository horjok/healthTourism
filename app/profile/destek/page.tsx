'use client';

import { useEffect, useState } from 'react';
import type { Ticket } from '@/lib/types';

const DURUM_STILLER: Record<Ticket['durum'], { etiket: string; stil: string }> = {
  acik:     { etiket: 'Açık',     stil: 'bg-blue-100 text-blue-700'   },
  islemde:  { etiket: 'İşlemde',  stil: 'bg-amber-100 text-amber-700' },
  kapali:   { etiket: 'Kapalı',   stil: 'bg-gray-100 text-gray-500'   },
};

function DurumBadge({ durum }: { durum: Ticket['durum'] }) {
  const { etiket, stil } = DURUM_STILLER[durum] ?? { etiket: durum, stil: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${stil}`}>
      {etiket}
    </span>
  );
}

function TicketKart({ ticket }: { ticket: Ticket }) {
  const [acik, setAcik] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <button
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setAcik((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{ticket.konu}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(ticket.olusturma_tarihi).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <DurumBadge durum={ticket.durum} />
          <span className="text-gray-400 text-xs">{acik ? '▲' : '▼'}</span>
        </div>
      </button>

      {acik && (
        <div className="border-t border-gray-50 px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1">Mesajınız</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.mesaj}</p>
          </div>

          {ticket.admin_yaniti && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#0f3460] mb-1">Destek Ekibi Yanıtı</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.admin_yaniti}</p>
            </div>
          )}

          {!ticket.admin_yaniti && ticket.durum === 'acik' && (
            <p className="text-xs text-gray-400 italic">Talebiniz inceleniyor, en kısa sürede yanıt verilecektir.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DestekPage() {
  const [biletler, setBiletler]     = useState<Ticket[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata]             = useState('');
  const [filDurum, setFilDurum]     = useState<'' | Ticket['durum']>('');

  useEffect(() => {
    fetch('/api/user/tickets')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setBiletler(j.data);
        else setHata(j.error ?? 'Biletler yüklenemedi.');
      })
      .catch(() => setHata('Bağlantı hatası. Lütfen sayfayı yenileyin.'))
      .finally(() => setYukleniyor(false));
  }, []);

  const goster = filDurum
    ? biletler.filter((b) => b.durum === filDurum)
    : biletler;

  const acikSayisi = biletler.filter((b) => b.durum === 'acik').length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Destek Taleplerim</h1>
          {acikSayisi > 0 && (
            <p className="text-sm text-blue-600 mt-0.5">{acikSayisi} açık talep</p>
          )}
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['', 'acik', 'islemde', 'kapali'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilDurum(d)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filDurum === d
                ? 'bg-[#0f3460] text-white border-[#0f3460]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {d === '' ? 'Tümü' : DURUM_STILLER[d].etiket}
            {d === '' && <span className="ml-1.5 text-xs opacity-70">({biletler.length})</span>}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {yukleniyor && (
        <div className="text-center text-gray-400 text-sm py-16">Yükleniyor...</div>
      )}

      {!yukleniyor && hata && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm border border-red-100">
          {hata}
        </div>
      )}

      {!yukleniyor && !hata && goster.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-gray-500 font-medium">
            {filDurum ? 'Bu durumda talep bulunamadı.' : 'Henüz destek talebiniz yok.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Sağ alttaki butondan yeni talep oluşturabilirsiniz.
          </p>
        </div>
      )}

      {!yukleniyor && !hata && goster.length > 0 && (
        <div className="space-y-3">
          {goster.map((b) => (
            <TicketKart key={b.id} ticket={b} />
          ))}
        </div>
      )}
    </main>
  );
}
