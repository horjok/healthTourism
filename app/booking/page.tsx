'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDilContext } from '@/lib/DilContext';
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

function BookingInner() {
  const { dil } = useDilContext();
  const tr = dil === 'tr';
  const router = useRouter();
  const { items, passengers, totalPrice, clearCart } = useCartStore();

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
    gerekli: false,
    fiziksel: [],
    zihinsel: [],
    tibbi: [],
    hamileyse_hafta: '',
    diger_aciklama: '',
    ek_not: '',
    acil_ad: '',
    acil_telefon: '',
    acil_iliski: '',
    transfer: '',
  });

  const tax = Math.round(totalPrice() * 0.08);
  const grand = totalPrice() + tax;

  const ADIM_ETIKETLERI: Record<Adim, string> = {
    1: tr ? 'Sipariş Özeti' : 'Order Summary',
    2: tr ? 'Kişisel Bilgiler & Özel Yardım' : 'Personal Info & Assistance',
    3: tr ? 'Ödeme' : 'Payment',
  };

  const TYPE_ICONS: Record<string, string> = {
    flight: '✈️', package: '🏥', transfer: '🚗', tour: '🎯',
  };

  function toggleAssistance(alan: 'fiziksel' | 'zihinsel' | 'tibbi', deger: string) {
    const mevcut = assistanceData[alan];
    const yeni = mevcut.includes(deger)
      ? mevcut.filter(x => x !== deger)
      : [...mevcut, deger];
    setAssistanceData({ ...assistanceData, [alan]: yeni });
  }

  function adim2Dogrula(): boolean {
    let gecerli = true;
    if (adSoyad.trim().length < 2) { setAdSoyadHata(tr ? 'En az 2 karakter' : 'At least 2 characters'); gecerli = false; } else setAdSoyadHata('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailHata(tr ? 'Geçerli e-posta girin' : 'Enter valid email'); gecerli = false; } else setEmailHata('');
    if (telefon.replace(/\D/g, '').length < 10) { setTelefonHata(tr ? 'En az 10 rakam' : 'At least 10 digits'); gecerli = false; } else setTelefonHata('');
    if (!tarih) { setTarihHata(tr ? 'Tarih seçin' : 'Select date'); gecerli = false; } else setTarihHata('');
    return gecerli;
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{tr ? 'Sepetiniz boş' : 'Your cart is empty'}</h1>
        <p className="text-gray-400 mb-8">{tr ? 'Önce bir paket veya hizmet ekleyin' : 'Please add a package or service first'}</p>
        <Link href="/packages" className="px-8 py-3 bg-[#0f3460] text-white font-bold rounded-2xl hover:bg-[#0a1628] transition-all">
          {tr ? 'Paketlere Git →' : 'Browse Packages →'}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0f3460, #16213e)' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <button onClick={() => adim === 1 ? router.back() : setAdim(prev => (prev - 1) as Adim)}
            className="text-blue-200 hover:text-white text-sm transition-colors mb-2">
            ← {tr ? 'Geri dön' : 'Go back'}
          </button>
          <h1 className="text-2xl font-extrabold text-white">
            {tr ? 'Rezervasyon Yap' : 'Make a Reservation'}
          </h1>
        </div>
      </div>

      {/* ADIM GÖSTERGESİ */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-start justify-center mb-8">
          {([1, 2, 3] as Adim[]).map(no => {
            const tamamlandi = no < adim;
            const aktifMi = no === adim;
            return (
              <div key={no} className="flex items-start">
                <div className="flex flex-col items-center w-28">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    tamamlandi ? 'bg-[#0f3460] border-[#0f3460] text-white'
                    : aktifMi ? 'bg-white border-[#0f3460] text-[#0f3460] shadow-md'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {tamamlandi ? '✓' : no}
                  </div>
                  <span className={`mt-1.5 text-xs font-medium text-center leading-tight ${
                    aktifMi ? 'text-[#0f3460]' : tamamlandi ? 'text-[#0f3460]' : 'text-gray-400'
                  }`}>
                    {ADIM_ETIKETLERI[no]}
                  </span>
                </div>
                {no < 3 && (
                  <div className={`w-16 h-0.5 mt-4 mx-0.5 transition-colors ${tamamlandi ? 'bg-[#0f3460]' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-12">

        {/* ── ADIM 1 — SİPARİŞ ÖZETİ ── */}
        {adim === 1 && (
          <div className="space-y-4">
            {/* Yolcu bilgisi */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 font-medium">
              👥 {passengers.adult} {tr ? 'yetişkin' : 'adult'}
              {passengers.child > 0 && `, ${passengers.child} ${tr ? 'çocuk' : 'child'}`}
            </div>

            {/* Ürünler */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{tr ? 'Seçilen Hizmetler' : 'Selected Services'}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
                      {TYPE_ICONS[item.type] || '📦'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-400">{item.detail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#0f3460]">${item.lineTotal}</div>
                      <div className="text-xs text-gray-400">×{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{tr ? 'Ara toplam' : 'Subtotal'}</span>
                  <span>${totalPrice()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{tr ? 'Vergi (%8)' : 'Tax (8%)'}</span>
                  <span>${tax}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-[#0f3460] pt-2 border-t border-gray-200">
                  <span>{tr ? 'Toplam' : 'Total'}</span>
                  <span>${grand}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setAdim(2)}
              className="w-full py-4 bg-[#0f3460] text-white font-bold rounded-2xl hover:bg-[#0a1628] transition-all text-base shadow-lg">
              {tr ? 'Devam Et →' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── ADIM 2 — KİŞİSEL BİLGİLER & ÖZEL YARDIM ── */}
        {adim === 2 && (
          <div className="space-y-6">

            {/* Kişisel bilgiler */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">
                {tr ? 'Kişisel Bilgileriniz' : 'Your Personal Information'}
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  {tr ? 'Ad Soyad *' : 'Full Name *'}
                </label>
                <input type="text" value={adSoyad} maxLength={60}
                  placeholder={tr ? 'Adınız ve soyadınız' : 'Your full name'}
                  onChange={e => { const t = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s\-]/g, ''); setAdSoyad(t); if (t.trim().length < 2) setAdSoyadHata(tr ? 'En az 2 karakter' : 'At least 2 characters'); else setAdSoyadHata(''); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white ${adSoyadHata ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-[#0f3460]/30'}`} />
                {adSoyadHata && <p className="mt-1 text-xs text-red-600">{adSoyadHata}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  {tr ? 'E-posta *' : 'Email *'}
                </label>
                <input type="email" value={email} maxLength={100}
                  placeholder="ornek@email.com"
                  onChange={e => { const t = e.target.value.replace(/[<>"';&\\`\n\r]/g, ''); setEmail(t); if (t && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) setEmailHata(tr ? 'Geçerli e-posta girin' : 'Enter valid email'); else setEmailHata(''); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white ${emailHata ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-[#0f3460]/30'}`} />
                {emailHata && <p className="mt-1 text-xs text-red-600">{emailHata}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  {tr ? 'Telefon *' : 'Phone *'}
                </label>
                <input type="tel" value={telefon}
                  placeholder="+90 5XX XXX XX XX"
                  onChange={e => { const t = e.target.value.replace(/[^0-9+\s\-()]/g, ''); if (t.replace(/\D/g, '').length > 15) return; setTelefon(t); if (t && t.replace(/\D/g, '').length < 10) setTelefonHata(tr ? 'En az 10 rakam' : 'At least 10 digits'); else setTelefonHata(''); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white ${telefonHata ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-[#0f3460]/30'}`} />
                {telefonHata && <p className="mt-1 text-xs text-red-600">{telefonHata}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  {tr ? 'Tercih Tarihi *' : 'Preferred Date *'}
                </label>
                <input type="date" value={tarih}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setTarih(e.target.value); setTarihHata(''); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white ${tarihHata ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-[#0f3460]/30'}`} />
                {tarihHata && <p className="mt-1 text-xs text-red-600">{tarihHata}</p>}
              </div>
            </div>

            {/* Özel Yardım */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {tr ? 'Özel Yardım ve Erişilebilirlik' : 'Special Assistance & Accessibility'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {tr ? 'Yolcularınızın özel ihtiyaçları varsa belirtin' : 'Indicate any special needs your passengers may have'}
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 text-xs text-blue-700">
                🔒 {tr ? 'Bu bilgiler gizli tutulur' : 'This information is kept confidential'}
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700">
                  {tr ? 'Özel yardım gerektiren yolcu var mı?' : 'Any passengers requiring special assistance?'}
                </span>
                <div className="flex gap-2">
                  {['Evet', 'Hayır'].map(opt => (
                    <button key={opt}
                      onClick={() => setAssistanceData({ ...assistanceData, gerekli: opt === 'Evet', fiziksel: [], zihinsel: [], tibbi: [] })}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        (opt === 'Evet' ? assistanceData.gerekli : !assistanceData.gerekli)
                          ? 'bg-[#0f3460] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                      {opt === 'Evet' ? (tr ? 'Evet' : 'Yes') : (tr ? 'Hayır' : 'No')}
                    </button>
                  ))}
                </div>
              </div>

              {assistanceData.gerekli && (
                <div className="space-y-5">
                  {/* FİZİKSEL */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-blue-500 rounded-full" />
                      <h3 className="text-sm font-bold text-gray-700">{tr ? 'Fiziksel / Hareketlilik' : 'Physical / Mobility'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'tekerlekli', tr: 'Tekerlekli Sandalye', en: 'Wheelchair' },
                        { val: 'yurume', tr: 'Yürüme Güçlüğü', en: 'Mobility Difficulty' },
                        { val: 'gorme', tr: 'Görme Engeli', en: 'Visual Impairment' },
                        { val: 'isitme', tr: 'İşitme Engeli', en: 'Hearing Impairment' },
                        { val: 'cihaz', tr: 'Koltuk Değneği / Cihaz', en: 'Crutches / Device' },
                      ].map(item => (
                        <label key={item.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          assistanceData.fiziksel.includes(item.val) ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-gray-50'
                        }`}>
                          <input type="checkbox" checked={assistanceData.fiziksel.includes(item.val)}
                            onChange={() => toggleAssistance('fiziksel', item.val)}
                            className="accent-[#0f3460]" />
                          <span className="text-sm font-medium text-gray-800">{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ZİHİNSEL */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-purple-500 rounded-full" />
                      <h3 className="text-sm font-bold text-gray-700">{tr ? 'Zihinsel / Psikolojik' : 'Mental / Psychological'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'anksiyete', tr: 'Anksiyete / Panik', en: 'Anxiety / Panic' },
                        { val: 'otizm', tr: 'Otizm Spektrum', en: 'Autism Spectrum' },
                        { val: 'ptsd', tr: 'PTSD', en: 'PTSD' },
                        { val: 'demans', tr: 'Demans / Alzheimer', en: 'Dementia / Alzheimer\'s' },
                      ].map(item => (
                        <label key={item.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          assistanceData.zihinsel.includes(item.val) ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-gray-50'
                        }`}>
                          <input type="checkbox" checked={assistanceData.zihinsel.includes(item.val)}
                            onChange={() => toggleAssistance('zihinsel', item.val)}
                            className="accent-purple-600" />
                          <span className="text-sm font-medium text-gray-800">{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* TIBBİ */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-green-500 rounded-full" />
                      <h3 className="text-sm font-bold text-gray-700">{tr ? 'Tıbbi Gereksinimler' : 'Medical Requirements'}</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { val: 'oksijen', tr: 'Oksijen Cihazı', en: 'Oxygen Device' },
                        { val: 'diyabet', tr: 'Diyabet / İnsülin', en: 'Diabetes / Insulin' },
                        { val: 'hamile', tr: 'Hamilelik (28+ Hafta)', en: 'Pregnancy (28+ Weeks)' },
                        { val: 'ameliyat', tr: 'Ameliyat Sonrası', en: 'Post-Surgery' },
                        { val: 'diger', tr: 'Diğer', en: 'Other' },
                      ].map(item => (
                        <label key={item.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          assistanceData.tibbi.includes(item.val) ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'
                        }`}>
                          <input type="checkbox" checked={assistanceData.tibbi.includes(item.val)}
                            onChange={() => toggleAssistance('tibbi', item.val)}
                            className="accent-green-600" />
                          <span className="text-sm font-medium text-gray-800">{tr ? item.tr : item.en}</span>
                        </label>
                      ))}
                    </div>

                    {assistanceData.tibbi.includes('hamile') && (
                      <div className="ml-4 mt-2">
                        <input type="number" min="28" max="42" placeholder={tr ? 'Kaçıncı hafta?' : 'Which week?'}
                          value={assistanceData.hamileyse_hafta}
                          onChange={e => setAssistanceData({ ...assistanceData, hamileyse_hafta: e.target.value })}
                          className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                      </div>
                    )}

                    {assistanceData.tibbi.includes('diger') && (
                      <div className="ml-4 mt-2">
                        <textarea placeholder={tr ? 'Açıklayın...' : 'Please describe...'}
                          value={assistanceData.diger_aciklama}
                          onChange={e => setAssistanceData({ ...assistanceData, diger_aciklama: e.target.value })}
                          rows={3} maxLength={500}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" />
                      </div>
                    )}
                  </div>

                  {/* Ek not */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                      {tr ? 'Ek Bilgi' : 'Additional Notes'}
                    </label>
                    <textarea value={assistanceData.ek_not}
                      onChange={e => setAssistanceData({ ...assistanceData, ek_not: e.target.value })}
                      placeholder={tr ? 'Özel istek veya not...' : 'Special request or note...'}
                      rows={3} maxLength={500}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 resize-none" />
                  </div>

                  {/* Acil iletişim */}
                  {(assistanceData.fiziksel.length > 0 || assistanceData.zihinsel.length > 0 || assistanceData.tibbi.length > 0) && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                      <h3 className="text-sm font-bold text-gray-800 mb-4">
                        🚨 {tr ? 'Acil Durum İletişim Kişisi' : 'Emergency Contact'}
                      </h3>
                      <div className="space-y-3">
                        <input type="text" placeholder={tr ? 'Ad Soyad' : 'Full Name'}
                          value={assistanceData.acil_ad}
                          onChange={e => setAssistanceData({ ...assistanceData, acil_ad: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        <input type="tel" placeholder={tr ? 'Telefon' : 'Phone'}
                          value={assistanceData.acil_telefon}
                          onChange={e => setAssistanceData({ ...assistanceData, acil_telefon: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                        <select value={assistanceData.acil_iliski}
                          onChange={e => setAssistanceData({ ...assistanceData, acil_iliski: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
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
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                ← {tr ? 'Geri' : 'Back'}
              </button>
              <button onClick={() => { if (adim2Dogrula()) setAdim(3); }}
                className="flex-[2] py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors">
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingInner />
    </Suspense>
  );
}