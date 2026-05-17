'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import type { ClinicApplication } from '@/lib/types';

const UZMANLIK_SECENEKLERI = [
  'diş', 'estetik', 'ortopedi', 'göz', 'kardiyoloji',
  'nöroloji', 'dermatoloji', 'saç ekimi', 'onkoloji', 'check-up',
];

export default function ClinicOnboarding() {
  const router = useRouter();
  const [kullaniciId, setKullaniciId] = useState('');
  const [email, setEmail]             = useState('');
  const [mevcutBasvuru, setMevcutBasvuru] = useState<ClinicApplication | null>(null);
  const [yukleniyor, setYukleniyor]   = useState(true);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata]               = useState('');

  const [isim, setIsim]       = useState('');
  const [sehir, setSehir]     = useState('');
  const [aciklama, setAciklama] = useState('');
  const [uzmanlik, setUzmanlik] = useState<string[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth'); return; }
      setKullaniciId(user.id);
      setEmail(user.email ?? '');

      // Zaten clinic_manager ise dashboard'a yönlendir
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('rol')
        .eq('kullanici_id', user.id)
        .single();

      if (roleRow?.rol === 'clinic_manager' || roleRow?.rol === 'super_admin') {
        router.push('/clinic');
        return;
      }

      // Mevcut başvuru var mı?
      const res = await fetch(`/api/clinic/application?kullanici_id=${user.id}`);
      const json = await res.json();
      if (json.success && json.data) setMevcutBasvuru(json.data);
      setYukleniyor(false);
    });
  }, [router]);

  function uzmanlikToggle(u: string) {
    setUzmanlik((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
    );
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!isim || !sehir || uzmanlik.length === 0) {
      setHata('Klinik adı, şehir ve en az bir uzmanlık zorunludur.');
      return;
    }
    setGonderiliyor(true); setHata('');

    const res = await fetch('/api/clinic/application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kullanici_id: kullaniciId,
        klinik_isim: isim,
        iletisim_email: email,
        uzmanlik,
        sehir,
        aciklama: aciklama || undefined,
      }),
    });

    const json = await res.json();
    if (json.success) {
      setMevcutBasvuru(json.data);
    } else {
      setHata(json.error ?? 'Başvuru gönderilemedi.');
    }
    setGonderiliyor(false);
  }

  if (yukleniyor) return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Yükleniyor...</p></div>;

  if (mevcutBasvuru) {
    const renk = mevcutBasvuru.durum === 'pending' ? 'amber' : mevcutBasvuru.durum === 'approved' ? 'green' : 'red';
    const mesaj: Record<string, string> = {
      pending:  'Başvurunuz inceleniyor. Admin onayladığında panele erişebilirsiniz.',
      approved: 'Başvurunuz onaylandı! Dashboard\'a yönlendiriliyorsunuz...',
      rejected: `Başvurunuz reddedildi.${mevcutBasvuru.admin_notu ? ` Neden: ${mevcutBasvuru.admin_notu}` : ''}`,
    };

    if (mevcutBasvuru.durum === 'approved') {
      setTimeout(() => router.push('/clinic'), 1500);
    }

    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className={`bg-${renk}-50 border border-${renk}-200 rounded-2xl p-6`}>
          <p className={`font-bold text-${renk}-700 text-lg`}>{mevcutBasvuru.klinik_isim}</p>
          <p className={`text-${renk}-600 text-sm mt-2`}>{mesaj[mevcutBasvuru.durum]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Klinik Başvurusu</h1>
        <p className="text-gray-500 text-sm mt-1">Bilgilerinizi doldurun, admin onayından sonra panele erişin.</p>
      </div>

      <form onSubmit={gonder} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Klinik Adı *</label>
          <input
            type="text"
            value={isim}
            onChange={(e) => setIsim(e.target.value)}
            placeholder="ör. İstanbul Diş Kliniği"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">İletişim E-posta *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şehir *</label>
          <input
            type="text"
            value={sehir}
            onChange={(e) => setSehir(e.target.value)}
            placeholder="ör. İstanbul"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Uzmanlık Alanları *</label>
          <div className="flex flex-wrap gap-2">
            {UZMANLIK_SECENEKLERI.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => uzmanlikToggle(u)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                  uzmanlik.includes(u)
                    ? 'bg-[#0f3460] text-white border-[#0f3460]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#0f3460]/40'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Klinik Hakkında (opsiyonel)</label>
          <textarea
            rows={3}
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Kliniğinizi kısaca tanıtın..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30"
          />
        </div>

        {hata && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{hata}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-50"
        >
          {gonderiliyor ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
        </button>
      </form>
    </div>
  );
}
