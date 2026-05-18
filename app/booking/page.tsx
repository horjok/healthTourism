'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDilContext } from '@/lib/DilContext';
import { useDoviz } from '@/lib/DovizContext';
import { useCartStore } from '@/lib/cartStore';
import MockOdemeFormu from '@/components/ui/MockOdemeFormu';

type Adim = 1 | 2 | 3;

type AssistanceData = {
  gerekli: boolean;
  fiziksel: string[];
  zihinsel: string[];
  tibbi: string[];
  hamileyse_hafta: string;
  diger_aciklama: string;
  ek_not: string;
  acil_ad: string;
  acil_telefon: string;
  acil_iliski: string;
  transfer: 'normal' | 'vip' | '';
};

const TYPE_ICONS: Record<string, string> = {
  flight: '✈️', package: '🏥', transfer: '🚗',
  tour: '🎯', hotel: '🏨', health: '🩺',
};

function BookingInner() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const router = useRouter();
  const { formatla } = useDoviz();
  const { items, passengers, totalPrice, clearCart } = useCartStore();

  const bugunIso = new Date().toISOString().split('T')[0];
  const maxTarihIso = (() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().split('T')[0];
  })();

  const [adim, setAdim] = useState<Adim>(1);
  const [adSoyad, setAdSoyad] = useState('');
  const [adSoyadHata, setAdSoyadHata] = useState('');
  const [email, setEmail] = useState('');
  const [emailHata, setEmailHata] = useState('');
  const [telefon, setTelefon] = useState('');
  const [telefonHata, setTelefonHata] = useState('');
  const [tarih, setTarih] = useState('');
  const [tarihHata, setTarihHata] = useState('');

  const [assistanceData, setAssistanceData] = useState<AssistanceData>({
    gerekli: false, fiziksel: [], zihinsel: [], tibbi: [],
    hamileyse_hafta: '', diger_aciklama: '', ek_not: '',
    acil_ad: '', acil_telefon: '', acil_iliski: '', transfer: '',
  });

  const tax = Math.round(totalPrice() * 0.08);
  const grand = totalPrice() + tax;

  const ADIM_ETIKETLERI: Record<Adim, string> = {
    1: tr ? 'Sipariş Özeti' : 'Order Summary',
    2: tr ? 'Kişisel & Özel Yardım' : 'Personal & Assistance',
    3: tr ? 'Ödeme' : 'Payment',
  };

  function toggleAssistance(alan: 'fiziksel' | 'zihinsel' | 'tibbi', deger: string) {
    const mevcut = assistanceData[alan];
    const yeni = mevcut.includes(deger) ? mevcut.filter(x => x !== deger) : [...mevcut, deger];
    setAssistanceData({ ...assistanceData, [alan]: yeni });
  }

  function adim2Dogrula(): boolean {
    let ok = true;
    if (adSoyad.trim().length < 2) { setAdSoyadHata(tr ? 'En az 2 karakter' : 'At least 2 characters'); ok = false; } else setAdSoyadHata('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailHata(tr ? 'Geçerli e-posta girin' : 'Enter valid email'); ok = false; } else setEmailHata('');
    if (telefon.replace(/\D/g, '').length < 10) { setTelefonHata(tr ? 'En az 10 rakam' : 'At least 10 digits'); ok = false; } else setTelefonHata('');
    if (!tarih) { setTarihHata(tr ? 'Tarih seçin' : 'Select date'); ok = false; } else setTarihHata('');
    return ok;
  }

  // Boş sepet
  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: '#FDFBF7' }}>
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="font-serif text-3xl mb-2" style={{ color: '#0D1E25' }}>{tr ? 'Sepetiniz boş' : 'Your cart is empty'}</h1>
        <p className="text-sm mb-8" style={{ color: '#8aa0ad' }}>{tr ? 'Önce bir paket veya hizmet ekleyin' : 'Please add a package or service first'}</p>
        <Link href="/packages" className="px-8 py-3 font-bold rounded-2xl text-white transition-all hover:scale-105"
          style={{ background: '#FF4757', boxShadow: '0 0 20px rgba(255,71,87,0.3)' }}>
          {tr ? 'Paketlere Git →' : 'Browse Packages →'}
        </Link>
      </main>
    );
  }

  const inputStyle = {
    width: '100%', border: '1px solid #e8e0d0', borderRadius: '12px',
    padding: '12px 16px', fontSize: '14px', background: 'white',
    color: '#0D1E25', outline: 'none',
  };

  const inputHataStyle = { ...inputStyle, border: '1px solid rgba(255,71,87,0.5)' };

  return (
    <main className="min-h-screen" style={{ background: '#FDFBF7' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0D1E25, #060f13)' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button onClick={() => adim === 1 ? router.back() : setAdim(prev => (prev - 1) as Adim)}
            className="text-sm transition-colors mb-2" style={{ color: '#00D2D3' }}>
            ← {tr ? 'Geri dön' : 'Go back'}
          </button>
          <h1 className="font-serif text-3xl font-bold text-white">
            {tr ? 'Rezervasyon Yap' : 'Make a Reservation'}
          </h1>
        </div>
      </div>

      {/* ADIM GÖSTERGESİ */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-2">
        <div className="flex items-start justify-center mb-8">
          {([1, 2, 3] as Adim[]).map(no => {
            const tamamlandi = no < adim;
            const aktifMi = no === adim;
            return (
              <div key={no} className="flex items-start">
                <div className="flex flex-col items-center w-28">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all"
                    style={{
                      background: tamamlandi ? '#0D1E25' : aktifMi ? 'white' : 'transparent',
                      borderColor: tamamlandi || aktifMi ? '#00D2D3' : '#e8e0d0',
                      color: tamamlandi ? '#00D2D3' : aktifMi ? '#0D1E25' : '#8aa0ad',
                      boxShadow: aktifMi ? '0 0 12px rgba(0,210,211,0.3)' : 'none',
                    }}>
                    {tamamlandi ? '✓' : no}
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-center leading-tight"
                    style={{ color: aktifMi || tamamlandi ? '#0D1E25' : '#8aa0ad' }}>
                    {ADIM_ETIKETLERI[no]}
                  </span>
                </div>
                {no < 3 && (
                  <div className="w-16 h-0.5 mt-4 mx-0.5 transition-colors"
                    style={{ background: tamamlandi ? '#00D2D3' : '#e8e0d0' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-12 space-y-4">

        {/* ── ADIM 1 — SİPARİŞ ÖZETİ ── */}
        {adim === 1 && (
          <div className="space-y-4">

            {/* Yolcu bilgisi */}
            <div className="rounded-xl p-4 text-sm font-medium"
              style={{ background: 'rgba(0,210,211,0.06)', border: '1px solid rgba(0,210,211,0.2)', color: '#00D2D3' }}>
              👥 {passengers.adult} {tr ? 'yetişkin' : 'adult'}
              {passengers.child > 0 && `, ${passengers.child} ${tr ? 'çocuk' : 'child'}`}
            </div>

            {/* Ürün listesi */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #e8e0d0' }}>
                <h2 className="font-serif text-xl" style={{ color: '#0D1E25' }}>
                  {tr ? 'Seçilen Hizmetler' : 'Selected Services'}
                </h2>
              </div>
              <div>
                {items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4"
                    style={{ borderBottom: idx < items.length - 1 ? '1px solid #F7F1E3' : 'none' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: 'rgba(0,210,211,0.08)', border: '1px solid rgba(0,210,211,0.15)' }}>
                      {TYPE_ICONS[item.type] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: '#0D1E25' }}>{item.name}</div>
                      <div className="text-xs truncate" style={{ color: '#8aa0ad' }}>{item.detail}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-serif font-bold" style={{ color: '#FF4757' }}>{formatla(item.lineTotal)}</div>
                      <div className="text-xs" style={{ color: '#8aa0ad' }}>×{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 space-y-2" style={{ background: '#F7F1E3', borderTop: '1px solid #e8e0d0' }}>
                <div className="flex justify-between text-sm" style={{ color: '#3d5562' }}>
                  <span>{tr ? 'Ara toplam' : 'Subtotal'}</span>
                  <span>{formatla(totalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: '#3d5562' }}>
                  <span>{tr ? 'Vergi (%8)' : 'Tax (8%)'}</span>
                  <span>{formatla(tax)}</span>
                </div>
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #e8e0d0' }}>
                  <span className="font-bold" style={{ color: '#0D1E25' }}>{tr ? 'Toplam' : 'Total'}</span>
                  <span className="font-serif text-2xl font-bold" style={{ color: '#FF4757' }}>{formatla(grand)}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setAdim(2)}
              className="w-full py-4 font-bold rounded-2xl text-white transition-all hover:scale-[1.01]"
              style={{ background: '#FF4757', boxShadow: '0 0 20px rgba(255,71,87,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
              {tr ? 'Devam Et →' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── ADIM 2 — KİŞİSEL BİLGİLER & ÖZEL YARDIM ── */}
        {adim === 2 && (
          <div className="space-y-5">

            {/* Kişisel bilgiler */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
              <h2 className="font-serif text-xl" style={{ color: '#0D1E25' }}>
                {tr ? 'Kişisel Bilgileriniz' : 'Your Personal Information'}
              </h2>

              {[
                { label: tr ? 'Ad Soyad *' : 'Full Name *', value: adSoyad, hata: adSoyadHata,
                  onChange: (v: string) => { const t = v.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s\-]/g, ''); setAdSoyad(t); if (t.trim().length < 2) setAdSoyadHata(tr ? 'En az 2 karakter' : 'Min 2 chars'); else setAdSoyadHata(''); },
                  type: 'text', placeholder: tr ? 'Adınız ve soyadınız' : 'Your full name', maxLength: 60 },
                { label: tr ? 'E-posta *' : 'Email *', value: email, hata: emailHata,
                  onChange: (v: string) => { const t = v.replace(/[<>"';&\\`\n\r]/g, ''); setEmail(t); if (t && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) setEmailHata(tr ? 'Geçerli e-posta' : 'Valid email'); else setEmailHata(''); },
                  type: 'email', placeholder: 'ornek@email.com', maxLength: 100 },
                { label: tr ? 'Telefon *' : 'Phone *', value: telefon, hata: telefonHata,
                  onChange: (v: string) => { const t = v.replace(/[^0-9+\s\-()]/g, ''); if (t.replace(/\D/g, '').length > 15) return; setTelefon(t); if (t && t.replace(/\D/g, '').length < 10) setTelefonHata(tr ? 'En az 10 rakam' : 'Min 10 digits'); else setTelefonHata(''); },
                  type: 'tel', placeholder: '+90 5XX XXX XX XX', maxLength: 20 },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
                    {f.label}
                  </label>
                  <input type={f.type} value={f.value} maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    onChange={e => f.onChange(e.target.value)}
                    style={f.hata ? inputHataStyle : inputStyle}
                    onFocus={e => !f.hata && (e.target.style.borderColor = '#00D2D3')}
                    onBlur={e => !f.hata && (e.target.style.borderColor = '#e8e0d0')} />
                  {f.hata && <p className="mt-1 text-xs" style={{ color: '#FF4757' }}>{f.hata}</p>}
                </div>
              ))}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
                  {tr ? 'Tercih Tarihi *' : 'Preferred Date *'}
                </label>
                <input type="date" value={tarih} min={bugunIso} max={maxTarihIso}
                  onChange={e => { setTarih(e.target.value); setTarihHata(''); }}
                  style={tarihHata ? inputHataStyle : inputStyle}
                  onFocus={e => !tarihHata && (e.target.style.borderColor = '#00D2D3')}
                  onBlur={e => !tarihHata && (e.target.style.borderColor = '#e8e0d0')} />
                {tarihHata && <p className="mt-1 text-xs" style={{ color: '#FF4757' }}>{tarihHata}</p>}
              </div>
            </div>

            {/* Özel yardım */}
            <div className="rounded-2xl p-6 space-y-5" style={{ background: '#FDFBF7', border: '1px solid #e8e0d0' }}>
              <div>
                <h2 className="font-serif text-xl mb-1" style={{ color: '#0D1E25' }}>
                  {tr ? 'Özel Yardım & Erişilebilirlik' : 'Special Assistance & Accessibility'}
                </h2>
                <p className="text-sm" style={{ color: '#8aa0ad' }}>
                  {tr ? 'Yolcularınızın özel ihtiyaçları varsa belirtin' : 'Indicate any special needs your passengers may have'}
                </p>
              </div>

              <div className="rounded-xl p-3 text-xs font-medium"
                style={{ background: 'rgba(0,210,211,0.06)', border: '1px solid rgba(0,210,211,0.15)', color: '#00D2D3' }}>
                🔒 {tr ? 'Bu bilgiler gizli tutulur' : 'This information is kept confidential'}
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold" style={{ color: '#3d5562' }}>
                  {tr ? 'Özel yardım gerektiren yolcu var mı?' : 'Any passengers requiring special assistance?'}
                </span>
                <div className="flex gap-2">
                  {[true, false].map(val => (
                    <button key={String(val)}
                      onClick={() => setAssistanceData({ ...assistanceData, gerekli: val, ...(val ? {} : { fiziksel: [], zihinsel: [], tibbi: [] }) })}
                      className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: assistanceData.gerekli === val ? '#0D1E25' : 'transparent',
                        color: assistanceData.gerekli === val ? '#00D2D3' : '#3d5562',
                        border: assistanceData.gerekli === val ? '1px solid #0D1E25' : '1px solid #e8e0d0',
                      }}>
                      {val ? (tr ? 'Evet' : 'Yes') : (tr ? 'Hayır' : 'No')}
                    </button>
                  ))}
                </div>
              </div>

              {assistanceData.gerekli && (
                <div className="space-y-5">

                  {/* FİZİKSEL */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full" style={{ background: '#00D2D3' }} />
                      <h3 className="text-sm font-bold" style={{ color: '#0D1E25' }}>{tr ? 'Fiziksel / Hareketlilik' : 'Physical / Mobility'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'tekerlekli', tr: 'Tekerlekli Sandalye', en: 'Wheelchair' },
                        { val: 'yurume', tr: 'Yürüme Güçlüğü', en: 'Mobility Difficulty' },
                        { val: 'gorme', tr: 'Görme Engeli', en: 'Visual Impairment' },
                        { val: 'isitme', tr: 'İşitme Engeli', en: 'Hearing Impairment' },
                        { val: 'cihaz', tr: 'Koltuk Değneği / Cihaz', en: 'Crutches / Device' },
                      ].map(item => (
                        <label key={item.val} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: assistanceData.fiziksel.includes(item.val) ? 'rgba(0,210,211,0.06)' : '#F7F1E3',
                            border: assistanceData.fiziksel.includes(item.val) ? '1px solid rgba(0,210,211,0.3)' : '1px solid #e8e0d0',
                          }}>
                          <input type="checkbox" checked={assistanceData.fiziksel.includes(item.val)}
                            onChange={() => toggleAssistance('fiziksel', item.val)}
                            style={{ accentColor: '#00D2D3' }} />
                          <span className="text-sm font-medium" style={{ color: '#0D1E25' }}>{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ZİHİNSEL */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full" style={{ background: '#FF4757' }} />
                      <h3 className="text-sm font-bold" style={{ color: '#0D1E25' }}>{tr ? 'Zihinsel / Psikolojik' : 'Mental / Psychological'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'anksiyete', tr: 'Anksiyete / Panik', en: 'Anxiety / Panic' },
                        { val: 'otizm', tr: 'Otizm Spektrum', en: 'Autism Spectrum' },
                        { val: 'ptsd', tr: 'PTSD', en: 'PTSD' },
                        { val: 'demans', tr: 'Demans / Alzheimer', en: "Dementia / Alzheimer's" },
                      ].map(item => (
                        <label key={item.val} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: assistanceData.zihinsel.includes(item.val) ? 'rgba(255,71,87,0.05)' : '#F7F1E3',
                            border: assistanceData.zihinsel.includes(item.val) ? '1px solid rgba(255,71,87,0.25)' : '1px solid #e8e0d0',
                          }}>
                          <input type="checkbox" checked={assistanceData.zihinsel.includes(item.val)}
                            onChange={() => toggleAssistance('zihinsel', item.val)}
                            style={{ accentColor: '#FF4757' }} />
                          <span className="text-sm font-medium" style={{ color: '#0D1E25' }}>{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TIBBİ */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full" style={{ background: '#0D1E25' }} />
                      <h3 className="text-sm font-bold" style={{ color: '#0D1E25' }}>{tr ? 'Tıbbi Gereksinimler' : 'Medical Requirements'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'oksijen', tr: 'Oksijen Cihazı', en: 'Oxygen Device' },
                        { val: 'diyabet', tr: 'Diyabet / İnsülin', en: 'Diabetes / Insulin' },
                        { val: 'hamile', tr: 'Hamilelik (28+ Hafta)', en: 'Pregnancy (28+ Weeks)' },
                        { val: 'ameliyat', tr: 'Ameliyat Sonrası', en: 'Post-Surgery' },
                        { val: 'diger', tr: 'Diğer', en: 'Other' },
                      ].map(item => (
                        <label key={item.val} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: assistanceData.tibbi.includes(item.val) ? 'rgba(13,30,37,0.05)' : '#F7F1E3',
                            border: assistanceData.tibbi.includes(item.val) ? '1px solid rgba(13,30,37,0.2)' : '1px solid #e8e0d0',
                          }}>
                          <input type="checkbox" checked={assistanceData.tibbi.includes(item.val)}
                            onChange={() => toggleAssistance('tibbi', item.val)}
                            style={{ accentColor: '#0D1E25' }} />
                          <span className="text-sm font-medium" style={{ color: '#0D1E25' }}>{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>

                    {assistanceData.tibbi.includes('hamile') && (
                      <div className="ml-4 mt-2">
                        <input type="number" min="28" max="42"
                          placeholder={tr ? 'Kaçıncı hafta?' : 'Which week?'}
                          value={assistanceData.hamileyse_hafta}
                          onChange={e => setAssistanceData({ ...assistanceData, hamileyse_hafta: e.target.value })}
                          className="w-32 rounded-lg px-3 py-1.5 text-sm outline-none"
                          style={{ border: '1px solid #e8e0d0', background: 'white', color: '#0D1E25' }} />
                      </div>
                    )}

                    {assistanceData.tibbi.includes('diger') && (
                      <div className="ml-4 mt-2">
                        <textarea placeholder={tr ? 'Açıklayın...' : 'Please describe...'}
                          value={assistanceData.diger_aciklama}
                          onChange={e => setAssistanceData({ ...assistanceData, diger_aciklama: e.target.value })}
                          rows={3} maxLength={500} className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none"
                          style={{ border: '1px solid #e8e0d0', background: 'white', color: '#0D1E25' }} />
                      </div>
                    )}
                  </div>

                  {/* Ek not */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8aa0ad' }}>
                      {tr ? 'Ek Bilgi' : 'Additional Notes'}
                    </label>
                    <textarea value={assistanceData.ek_not}
                      onChange={e => setAssistanceData({ ...assistanceData, ek_not: e.target.value })}
                      placeholder={tr ? 'Özel istek veya not...' : 'Special request or note...'}
                      rows={3} maxLength={500} className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                      style={{ border: '1px solid #e8e0d0', background: 'white', color: '#0D1E25' }} />
                  </div>

                  {/* Acil iletişim */}
                  {(assistanceData.fiziksel.length > 0 || assistanceData.zihinsel.length > 0 || assistanceData.tibbi.length > 0) && (
                    <div className="rounded-2xl p-5"
                      style={{ background: 'rgba(255,71,87,0.04)', border: '1px solid rgba(255,71,87,0.15)' }}>
                      <h3 className="text-sm font-bold mb-4" style={{ color: '#0D1E25' }}>
                        🚨 {tr ? 'Acil Durum İletişim Kişisi' : 'Emergency Contact'}
                      </h3>
                      <div className="space-y-3">
                        <input type="text" placeholder={tr ? 'Ad Soyad' : 'Full Name'}
                          value={assistanceData.acil_ad} maxLength={60}
                          onChange={e => setAssistanceData({ ...assistanceData, acil_ad: e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s\-]/g, '') })}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = '#FF4757')}
                          onBlur={e => (e.target.style.borderColor = '#e8e0d0')} />
                        <input type="tel" placeholder={tr ? 'Telefon' : 'Phone'}
                          value={assistanceData.acil_telefon} inputMode="numeric"
                          onChange={e => setAssistanceData({ ...assistanceData, acil_telefon: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = '#FF4757')}
                          onBlur={e => (e.target.style.borderColor = '#e8e0d0')} />
                        <select value={assistanceData.acil_iliski}
                          onChange={e => setAssistanceData({ ...assistanceData, acil_iliski: e.target.value })}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option value="">{tr ? 'İlişki seçin' : 'Select relationship'}</option>
                          <option>{tr ? 'Eş' : 'Spouse'}</option>
                          <option>{tr ? 'Anne / Baba' : 'Parent'}</option>
                          <option>{tr ? 'Kardeş' : 'Sibling'}</option>
                          <option>{tr ? 'Arkadaş' : 'Friend'}</option>
                          <option>{tr ? 'Diğer' : 'Other'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAdim(1)}
                className="flex-1 py-3.5 font-semibold rounded-xl transition-colors"
                style={{ border: '1px solid #e8e0d0', color: '#3d5562', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F7F1E3')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                ← {tr ? 'Geri' : 'Back'}
              </button>
              <button onClick={() => { if (adim2Dogrula()) setAdim(3); }}
                className="flex-[2] py-3.5 font-bold rounded-xl text-white transition-all hover:scale-[1.01]"
                style={{ background: '#FF4757', boxShadow: '0 0 16px rgba(255,71,87,0.3)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e63950')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FF4757')}>
                {tr ? 'Ödemeye Geç →' : 'Proceed to Payment →'}
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3 — ÖDEME ── */}
        {adim === 3 && (
          <MockOdemeFormu
            tutar={grand}
            tarih={tarih}
            items={items}
            erisilebilirlik={assistanceData.gerekli ? assistanceData : null}
            onSuccess={(islemId) => {
              clearCart();
              router.push(`/booking/success?id=${encodeURIComponent(islemId)}`);
            }}
            onError={() => setAdim(2)}
          />
        )}
      </div>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen" style={{ background: '#FDFBF7' }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#00D2D3', borderTopColor: 'transparent' }} />
      </div>
    }>
      <BookingInner />
    </Suspense>
  );
}