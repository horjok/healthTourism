'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Rezervasyon, Ticket } from '@/lib/types';
import { getSupabaseClient } from '@/lib/supabase-client';
import DownloadTicketButton, { type BiletItem } from '@/components/ui/DownloadTicketButton';

const DURUM_STILLER: Record<string, { etiket: string; stil: string }> = {
  beklemede:  { etiket: 'Beklemede',  stil: 'bg-amber-100 text-amber-700'   },
  onaylandi:  { etiket: 'Onaylandı',  stil: 'bg-blue-100 text-blue-700'     },
  tamamlandi: { etiket: 'Tamamlandı', stil: 'bg-green-100 text-green-700'   },
  iptal:      { etiket: 'İptal',      stil: 'bg-red-100 text-red-600'       },
};

const ITEM_TIPI_IKON: Record<string, string> = {
  package: '🏥', flight: '✈️', transfer: '🚗', tour: '🎯', hotel: '🏨', health: '⚕️',
};

const ITEM_TIPI_ETIKET: Record<string, string> = {
  package: 'Paket', flight: 'Uçuş', transfer: 'Transfer', tour: 'Tur', hotel: 'Otel', health: 'Sağlık',
};

function DurumBadge({ durum }: { durum: string }) {
  const { etiket, stil } = DURUM_STILLER[durum] ?? { etiket: durum, stil: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${stil}`}>
      {etiket}
    </span>
  );
}

// ─── Yorum Modalı ─────────────────────────────────────────────────────────────

interface YorumModalProps {
  klinikId: string;
  klinikIsim: string;
  onKapat: () => void;
  onBasari: () => void;
}

function YorumModali({ klinikId, klinikIsim, onKapat, onBasari }: YorumModalProps) {
  const [puan, setPuan] = useState(0);
  const [metin, setMetin] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState('');

  async function gonder() {
    if (puan === 0) { setHata('Lütfen bir puan seçin.'); return; }
    setGonderiyor(true);
    setHata('');
    try {
      const res = await fetch('/api/clinic/yorumlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ klinik_id: klinikId, puan, yorum_metni: metin }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error);
      onBasari();
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Yorum gönderilemedi.');
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Yorum Yaz</h2>
            <p className="text-xs text-gray-500 mt-0.5">{klinikIsim}</p>
          </div>
          <button onClick={onKapat} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600">{hata}</div>
        )}

        {/* Yıldız puanı */}
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Puanınız</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((y) => (
              <button
                key={y}
                onClick={() => setPuan(y)}
                className={`text-2xl transition-transform hover:scale-110 ${y <= puan ? 'text-amber-400' : 'text-gray-200'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Metin */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Yorumunuz (isteğe bağlı)
          </label>
          <textarea
            value={metin}
            onChange={(e) => setMetin(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Deneyiminizi paylaşın..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onKapat} className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
            İptal
          </button>
          <button
            onClick={gonder}
            disabled={gonderiyor}
            className="flex-[2] py-2.5 bg-[#0f3460] text-white text-sm font-bold rounded-xl hover:bg-[#16213e] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {gonderiyor ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Gönderiliyor...</span></>
            ) : 'Yorumu Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}

type Sekme = 'rezervasyonlar' | 'destek' | 'profil';

const TICKET_DURUM: Record<Ticket['durum'], { etiket: string; stil: string }> = {
  acik:     { etiket: 'Açık',     stil: 'bg-gray-100 text-gray-600'     },
  islemde:  { etiket: 'İşlemde',  stil: 'bg-amber-100 text-amber-700'   },
  kapali:   { etiket: 'Kapatıldı', stil: 'bg-green-100 text-green-700'  },
};

// ─── Profil sayfası ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const [kullanici, setKullanici]           = useState<User | null>(null);
  const [rezervasyonlar, setRezervasyonlar] = useState<Rezervasyon[]>([]);
  const [yukleniyor, setYukleniyor]         = useState(true);
  const [rezYukleniyor, setRezYukleniyor]   = useState(false);
  const [hata, setHata]                     = useState('');
  const [sekme, setSekme]                   = useState<Sekme>('rezervasyonlar');

  const [iptalDurum, setIptalDurum] = useState<Record<string, string>>({});
  const [silDurum, setSilDurum]     = useState<Record<string, string>>({});

  // Yorum modalı
  const [yorumModal, setYorumModal] = useState<{ rezId: string; klinikId: string; klinikIsim: string } | null>(null);
  const [yorumGonderildi, setYorumGonderildi] = useState<Set<string>>(new Set());

  // Destek talepleri
  const [tickets, setTickets]               = useState<Ticket[]>([]);
  const [ticketYukleniyor, setTicketYukleniyor] = useState(false);
  const [yeniKonu, setYeniKonu]             = useState('');
  const [yeniMesaj, setYeniMesaj]           = useState('');
  const [ticketGonderiyor, setTicketGonderiyor] = useState(false);
  const [ticketHata, setTicketHata]         = useState('');
  const [ticketBasari, setTicketBasari]     = useState(false);

  // Profil düzenleme
  const [goruntulenenAd, setGoruntulenenAd] = useState('');
  const [adKaydediliyor, setAdKaydediliyor] = useState(false);
  const [adMesaj, setAdMesaj]               = useState<{ tur: 'basari' | 'hata'; metin: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/auth'); return; }
      setKullanici(data.user);
      setGoruntulenenAd(data.user.user_metadata?.display_name ?? '');
      setYukleniyor(false);

      setRezYukleniyor(true);
      setTicketYukleniyor(true);
      try {
        const [rezRes, ticketRes] = await Promise.all([
          fetch('/api/booking'),
          fetch('/api/user/tickets'),
        ]);
        const [rezJson, ticketJson] = await Promise.all([
          rezRes.json() as Promise<{ success: boolean; data?: Rezervasyon[]; error?: string }>,
          ticketRes.json() as Promise<{ success: boolean; data?: Ticket[] }>,
        ]);
        if (rezJson.success && rezJson.data) setRezervasyonlar(rezJson.data);
        else setHata('Rezervasyonlar yüklenemedi.');
        if (ticketJson.success && ticketJson.data) setTickets(ticketJson.data);
      } catch {
        setHata('Sunucuya bağlanılamadı.');
      } finally {
        setRezYukleniyor(false);
        setTicketYukleniyor(false);
      }
    });
  }, [router]);

  async function silRezervasyonu(rezId: string) {
    setSilDurum((prev) => ({ ...prev, [rezId]: 'yukleniyor' }));
    try {
      const res = await fetch('/api/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rezId }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error);
      setRezervasyonlar((prev) => prev.filter((r) => r.id !== rezId));
      setSilDurum((prev) => { const s = { ...prev }; delete s[rezId]; return s; });
    } catch {
      setSilDurum((prev) => ({ ...prev, [rezId]: 'hata' }));
    }
  }

  async function iptalEt(rezId: string) {
    if (!kullanici) return;
    setIptalDurum((prev) => ({ ...prev, [rezId]: 'yukleniyor' }));
    const supabase = getSupabaseClient();
    try {
      const { data, error } = await supabase
        .from('rezervasyonlar')
        .update({ durum: 'iptal' })
        .eq('id', rezId)
        .eq('kullanici_id', kullanici.id)
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
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

  async function ticketGonder(e: React.FormEvent) {
    e.preventDefault();
    setTicketGonderiyor(true);
    setTicketHata('');
    setTicketBasari(false);
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu: yeniKonu.trim(), mesaj: yeniMesaj.trim() }),
      });
      const json = await res.json() as { success: boolean; data?: Ticket; error?: string };
      if (!json.success) throw new Error(json.error ?? 'Talep gönderilemedi.');
      if (json.data) setTickets((prev) => [json.data!, ...prev]);
      setYeniKonu('');
      setYeniMesaj('');
      setTicketBasari(true);
    } catch (err) {
      setTicketHata(err instanceof Error ? err.message : 'Talep gönderilemedi.');
    } finally {
      setTicketGonderiyor(false);
    }
  }

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

  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kullanici) return null;

  const emailKisa        = kullanici.email ?? 'Kullanıcı';
  const goruntulenenIsim = kullanici.user_metadata?.display_name || emailKisa.split('@')[0];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Yorum Modalı */}
      {yorumModal && (
        <YorumModali
          klinikId={yorumModal.klinikId}
          klinikIsim={yorumModal.klinikIsim}
          onKapat={() => setYorumModal(null)}
          onBasari={() => {
            setYorumGonderildi((prev) => new Set(prev).add(yorumModal.rezId));
            setYorumModal(null);
          }}
        />
      )}

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
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide mb-0.5">Hoş geldiniz</p>
              <p className="text-white text-lg font-bold">{goruntulenenIsim}</p>
              <p className="text-blue-300 text-xs">{emailKisa}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 flex gap-1">
          {([
            { key: 'rezervasyonlar', label: '📋 Rezervasyonlarım' },
            { key: 'destek',         label: '🎧 Destek Taleplerim' },
            { key: 'profil',         label: '✏️ Profilimi Düzenle' },
          ] as { key: Sekme; label: string }[]).map(({ key, label }) => {
            const islemdeVar = key === 'destek' && tickets.some((t) => t.durum === 'islemde');
            return (
              <button
                key={key}
                onClick={() => setSekme(key)}
                className={`relative px-5 py-3 text-sm font-semibold rounded-t-xl transition-colors ${
                  sekme === key ? 'bg-gray-50 text-[#0f3460]' : 'text-blue-200 hover:text-white'
                }`}
              >
                {label}
                {islemdeVar && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ── SEKME 1: Rezervasyonlarım ─────────────────────────────────────── */}
        {sekme === 'rezervasyonlar' && (
          <>
            {rezYukleniyor && (
              <div className="flex items-center gap-3 py-12 justify-center">
                <div className="w-7 h-7 border-2 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Rezervasyonlar yükleniyor...</p>
              </div>
            )}

            {hata && !rezYukleniyor && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">{hata}</div>
            )}

            {!rezYukleniyor && !hata && rezervasyonlar.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-gray-700 font-semibold mb-1">Henüz rezervasyonunuz yok</p>
                <p className="text-gray-500 text-sm mb-6">Sağlık turizmi paketlerimizi keşfetmeye başlayın.</p>
                <Link href="/packages" className="inline-block px-6 py-3 bg-[#0f3460] text-white font-semibold rounded-xl hover:bg-[#16213e] transition-colors text-sm">
                  Paketlere Göz At
                </Link>
              </div>
            )}

            {!rezYukleniyor && rezervasyonlar.length > 0 && (
              <div className="space-y-6">
                {(() => {
                  // grup_kodu'na göre grupla (yoksa kendi id'sini grup say — eski tekli rezervasyonlar)
                  const gruplar = new Map<string, Rezervasyon[]>();
                  for (const r of rezervasyonlar) {
                    const k = r.grup_kodu ?? `solo-${r.id}`;
                    if (!gruplar.has(k)) gruplar.set(k, []);
                    gruplar.get(k)!.push(r);
                  }
                  // Her grubu en yeni oluşturma tarihine göre sırala
                  const sirali = Array.from(gruplar.entries()).sort((a, b) => {
                    const ta = new Date(a[1][0].olusturma_tarihi ?? 0).getTime();
                    const tb = new Date(b[1][0].olusturma_tarihi ?? 0).getTime();
                    return tb - ta;
                  });

                  return sirali.map(([grupKodu, satirlar]) => {
                    const grupToplam = satirlar.reduce((s, r) => s + (r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0), 0);
                    const grupTarih  = satirlar[0]?.tarih;
                    const tumuIptal  = satirlar.every(r => r.durum === 'iptal');
                    const gercekGrup = !grupKodu.startsWith('solo-');
                    const aktifSatirlar = satirlar.filter(r => r.durum !== 'iptal');
                    const pnr = gercekGrup ? grupKodu : (satirlar[0].takip_kodu ?? satirlar[0].id.slice(0, 8).toUpperCase());
                    const biletItems: BiletItem[] = aktifSatirlar.map(r => ({
                      isim: r.item_isim ?? r.paket?.baslik ?? r.paket?.klinik?.isim ?? '—',
                      detay: r.item_detay ?? r.paket?.klinik?.sehir ?? null,
                      tip: r.item_tipi ?? 'package',
                      fiyat: r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0,
                    }));
                    const biletToplam = aktifSatirlar.reduce((s, r) => s + (r.item_fiyat ?? r.paket?.toplam_fiyat ?? 0), 0);

                    return (
                      <div key={grupKodu} className="bg-white border-2 border-[#0f3460]/10 rounded-2xl shadow-sm overflow-hidden">

                        {/* Grup başlığı — ana rezervasyon numarası */}
                        <div className="px-5 py-4 bg-gradient-to-r from-[#0f3460] to-[#16213e] text-white flex items-center justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <p className="text-xs text-blue-200 font-semibold uppercase tracking-wide">
                              {gercekGrup ? 'Sipariş No' : 'Rezervasyon No'}
                            </p>
                            <p className="text-base font-mono font-bold text-white break-all">
                              {gercekGrup ? grupKodu : (satirlar[0].takip_kodu ?? satirlar[0].id.slice(0, 8).toUpperCase())}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-200">
                              {satirlar.length} {satirlar.length === 1 ? 'öğe' : 'öğe'}
                              {grupTarih && ` · ${new Date(grupTarih).toLocaleDateString('tr-TR')}`}
                            </p>
                            <p className="text-lg font-extrabold text-white">{grupToplam.toLocaleString('tr-TR')}€</p>
                          </div>
                        </div>

                        {/* Alt satırlar — her item bağımsız iptal edilebilir */}
                        <div className="divide-y divide-gray-100">
                          {satirlar.map((rez, idx) => {
                            const iptalEdildi     = rez.durum === 'iptal';
                            const tamamlandi      = rez.durum === 'tamamlandi';
                            const iptalYukleniyor = iptalDurum[rez.id] === 'yukleniyor';
                            const iptalHata       = iptalDurum[rez.id] === 'hata';
                            const yorumYapildi    = yorumGonderildi.has(rez.id);
                            const klinikId        = rez.paket?.klinik?.id;
                            const klinikIsim      = rez.paket?.klinik?.isim;
                            const itemTipi        = rez.item_tipi ?? 'package';
                            const erisilebilirlik = rez.erisilebilirlik;
                            const altNo           = `${idx + 1}/${satirlar.length}`;

                            return (
                              <div key={rez.id} className={`p-5 ${iptalEdildi ? 'opacity-60' : ''}`}>

                                {/* Üst satır — ikon, isim, alt numara, durum */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="min-w-0 flex items-center gap-2.5">
                                    <span className="text-xl shrink-0">{ITEM_TIPI_IKON[itemTipi] ?? '📦'}</span>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                          {altNo}
                                        </span>
                                        <span className="text-[10px] font-semibold text-[#0f3460] bg-[#0f3460]/10 px-1.5 py-0.5 rounded uppercase">
                                          {ITEM_TIPI_ETIKET[itemTipi] ?? itemTipi}
                                        </span>
                                      </div>
                                      <p className="text-sm font-bold text-gray-800 truncate mt-1">
                                        {rez.item_isim ?? rez.paket?.baslik ?? rez.paket?.klinik?.isim ?? '—'}
                                      </p>
                                      {rez.item_detay && (
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rez.item_detay}</p>
                                      )}
                                    </div>
                                  </div>
                                  <DurumBadge durum={rez.durum} />
                                </div>

                                {/* Detay grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3 pl-9">
                                  {rez.paket?.klinik?.sehir && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">📍</span>
                                      <span className="text-gray-700 font-medium">{rez.paket.klinik.sehir}</span>
                                    </div>
                                  )}
                                  {(rez.item_fiyat ?? rez.paket?.toplam_fiyat) !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-gray-400">💰</span>
                                      <span className="text-[#0f3460] font-bold">
                                        {(rez.item_fiyat ?? rez.paket?.toplam_fiyat ?? 0).toLocaleString('tr-TR')}€
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-gray-400">🔖</span>
                                    <span className="text-gray-700 font-mono text-[11px]">
                                      {rez.takip_kodu ?? rez.id.slice(0, 8).toUpperCase()}
                                    </span>
                                  </div>
                                </div>

                                {/* Erişilebilirlik notu (sadece ilk satırda göster — grup boyunca aynı) */}
                                {idx === 0 && erisilebilirlik?.gerekli && (
                                  <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg mb-3">
                                    <p className="text-xs font-semibold text-blue-700 mb-1">♿ Erişilebilirlik Notu</p>
                                    <div className="flex flex-wrap gap-1">
                                      {[...erisilebilirlik.fiziksel, ...erisilebilirlik.zihinsel, ...erisilebilirlik.tibbi].map((tag) => (
                                        <span key={tag} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    {erisilebilirlik.acil_ad && (
                                      <p className="text-[11px] text-blue-600 mt-1">
                                        Acil: {erisilebilirlik.acil_ad} · {erisilebilirlik.acil_telefon}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Aksiyon butonları — her satır bağımsız */}
                                <div className="flex flex-col gap-2">
                                  {tamamlandi && itemTipi === 'package' && klinikId && klinikIsim && (
                                    yorumYapildi ? (
                                      <p className="text-xs text-green-600 font-semibold">✓ Yorumunuz alındı</p>
                                    ) : (
                                      <button
                                        onClick={() => setYorumModal({ rezId: rez.id, klinikId, klinikIsim })}
                                        className="py-2 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors"
                                      >
                                        ★ Yorum Yap
                                      </button>
                                    )
                                  )}

                                  {!iptalEdildi && !tamamlandi && (
                                    <>
                                      {iptalHata && (
                                        <p className="text-xs text-red-500">İptal başarısız. Tekrar deneyin.</p>
                                      )}
                                      <button
                                        onClick={() => iptalEt(rez.id)}
                                        disabled={iptalYukleniyor}
                                        className="py-2 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                      >
                                        {iptalYukleniyor ? (
                                          <><div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /><span>İptal ediliyor...</span></>
                                        ) : `✕ Bu Öğeyi İptal Et (${altNo})`}
                                      </button>
                                    </>
                                  )}

                                  {iptalEdildi && (() => {
                                    const silYukleniyor = silDurum[rez.id] === 'yukleniyor';
                                    const silHata = silDurum[rez.id] === 'hata';
                                    return (
                                      <>
                                        {silHata && (
                                          <p className="text-xs text-red-500">Silinemedi. Tekrar deneyin.</p>
                                        )}
                                        <button
                                          onClick={() => silRezervasyonu(rez.id)}
                                          disabled={silYukleniyor}
                                          className="py-2 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                          {silYukleniyor ? (
                                            <><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /><span>Siliniyor...</span></>
                                          ) : '🗑 Kaydı Sil'}
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* PDF Bilet — sadece aktif öğe varsa */}
                        {biletItems.length > 0 && (() => {
                          // Öncelik: rezervasyon kaydındaki alıcı bilgisi (satın alma anındaki form)
                          // Fallback: oturum kullanıcısı (eski rezervasyonlar için)
                          const ilk = satirlar[0];
                          const biletAd    = ilk.alici_ad    ?? goruntulenenIsim;
                          const biletEmail = ilk.alici_email ?? emailKisa;
                          const biletTel   = ilk.alici_telefon ?? undefined;
                          return (
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-xs text-gray-500">
                                PNR/QR kodlu bilet — kliniğe girişte ibraz edin
                              </p>
                              <DownloadTicketButton
                                kompakt
                                grupKodu={pnr}
                                items={biletItems}
                                tarih={grupTarih ? new Date(grupTarih).toLocaleDateString('tr-TR') : undefined}
                                yolcuAd={biletAd}
                                yolcuEmail={biletEmail}
                                yolcuTel={biletTel}
                                toplam={biletToplam}
                              />
                            </div>
                          );
                        })()}

                        {tumuIptal && (
                          <div className="px-5 py-2 bg-red-50 border-t border-red-100 text-center">
                            <p className="text-xs text-red-600 font-semibold">Bu siparişteki tüm öğeler iptal edildi</p>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {!rezYukleniyor && (
              <div className="mt-8 text-center">
                <Link href="/packages" className="inline-block px-6 py-3 border border-[#0f3460] text-[#0f3460] font-semibold rounded-xl hover:bg-[#0f3460] hover:text-white transition-colors text-sm">
                  + Yeni Rezervasyon Yap
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── SEKME 2: Destek Taleplerim ────────────────────────────────────── */}
        {sekme === 'destek' && (
          <div className="space-y-6">

            {/* Yeni talep formu */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Yeni Destek Talebi Oluştur</h2>
              <form onSubmit={ticketGonder} className="space-y-4">
                {ticketBasari && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
                    Talebiniz alındı. Ekibimiz en kısa sürede dönüş yapacaktır.
                  </div>
                )}
                {ticketHata && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{ticketHata}</div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Konu</label>
                  <input
                    type="text"
                    value={yeniKonu}
                    onChange={(e) => { setYeniKonu(e.target.value); setTicketBasari(false); }}
                    maxLength={120}
                    placeholder="Talebinizin konusunu kısaca yazın"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Mesaj</label>
                  <textarea
                    value={yeniMesaj}
                    onChange={(e) => { setYeniMesaj(e.target.value); setTicketBasari(false); }}
                    maxLength={2000}
                    rows={4}
                    placeholder="Sorununuzu veya talebinizi detaylıca açıklayın..."
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{yeniMesaj.length}/2000</p>
                </div>
                <button
                  type="submit"
                  disabled={ticketGonderiyor}
                  className="w-full py-3 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {ticketGonderiyor ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Gönderiliyor...</span></>
                  ) : 'Talebi Gönder'}
                </button>
              </form>
            </div>

            {/* Mevcut talepler */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Geçmiş Taleplerim</h3>

              {ticketYukleniyor && (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="w-6 h-6 border-2 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm">Talepler yükleniyor...</p>
                </div>
              )}

              {!ticketYukleniyor && tickets.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                  <p className="text-3xl mb-3">🎧</p>
                  <p className="text-gray-500 text-sm">Henüz destek talebiniz bulunmuyor.</p>
                </div>
              )}

              {!ticketYukleniyor && tickets.length > 0 && (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const { etiket, stil } = TICKET_DURUM[ticket.durum];
                    const isIslemde = ticket.durum === 'islemde';
                    return (
                      <div
                        key={ticket.id}
                        className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${
                          isIslemde ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
                        }`}
                      >
                        {/* İşlemde bildirimi */}
                        {isIslemde && (
                          <div className="px-5 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                            <span className="flex h-2 w-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                            </span>
                            <p className="text-xs font-semibold text-amber-700">Destek ekibi talebinizi inceliyor</p>
                          </div>
                        )}

                        <div className="px-5 py-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-bold text-gray-800 leading-snug">{ticket.konu}</p>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${stil}`}>{etiket}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{ticket.mesaj}</p>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {new Date(ticket.olusturma_tarihi).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}
                          </p>

                          {/* Admin yanıtı */}
                          {ticket.admin_yaniti && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-blue-700 mb-1">Destek Ekibi Yanıtı</p>
                              <p className="text-xs text-blue-600 leading-relaxed">{ticket.admin_yaniti}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEKME 3: Profilimi Düzenle ─────────────────────────────────────── */}
        {sekme === 'profil' && (
          <div className="max-w-lg">
            <form onSubmit={profilKaydet} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">Profil Bilgileri</h2>

              {adMesaj && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  adMesaj.tur === 'basari'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {adMesaj.metin}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">E-posta Adresi</label>
                <input type="email" value={emailKisa} disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Görüntülenen Ad</label>
                <input type="text" placeholder="Adınız soyadınız" value={goruntulenenAd} maxLength={60}
                  onChange={(e) => { setGoruntulenenAd(e.target.value.replace(/[<>"';&\\`]/g, '')); setAdMesaj(null); }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white" />
              </div>

              <button type="submit" disabled={adKaydediliyor}
                className="w-full py-3 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {adKaydediliyor ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Kaydediliyor...</span></>
                ) : 'Değişiklikleri Kaydet'}
              </button>
            </form>

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
