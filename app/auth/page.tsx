'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase-client';

type Sekme = 'giris' | 'kayit';

// Supabase hata kodu veya mesajını Türkçeye çevir
function hataMesaji(hata: string): string {
  if (hata.includes('Invalid login credentials'))  return 'E-posta veya şifre hatalı.';
  if (hata.includes('Email not confirmed'))        return 'E-posta adresinizi onaylamanız gerekiyor.';
  if (hata.includes('User already registered'))    return 'Bu e-posta adresi zaten kayıtlı.';
  if (hata.includes('email_address_invalid'))      return 'Geçersiz e-posta adresi formatı.';
  if (hata.includes('is invalid'))                 return 'Geçersiz e-posta adresi formatı.';
  if (hata.includes('Password should be'))         return 'Şifre en az 6 karakter olmalıdır.';
  if (hata.includes('Unable to validate'))         return 'Geçersiz e-posta adresi.';
  if (hata.includes('signup is disabled'))         return 'Kayıt şu an kapalı.';
  if (hata.includes('rate limit'))                 return 'Çok fazla deneme. Lütfen biraz bekleyin.';
  if (hata.includes('over_email_send_rate_limit')) return 'Çok fazla deneme. Lütfen biraz bekleyin.';
  return 'Bir hata oluştu. Lütfen tekrar deneyin.';
}

export default function AuthPage() {
  const router = useRouter();

  const [sekme, setSekme]           = useState<Sekme>('giris');
  const [email, setEmail]           = useState('');
  const [sifre, setSifre]           = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata]             = useState('');
  const [basarili, setBasarili]     = useState('');

  function sekmeGec(yeni: Sekme) {
    setSekme(yeni);
    setHata('');
    setBasarili('');
  }

  async function gonderFormu(e: React.FormEvent) {
    e.preventDefault();
    setHata('');
    setBasarili('');
    setGonderiyor(true);
    const supabase = getSupabaseClient();

    try {
      if (sekme === 'giris') {
        // ── Giriş ──────────────────────────────────────────────────────────
        const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
        if (error) { setHata(hataMesaji(`${error.code ?? ''} ${error.message}`)); return; }
        router.push('/');

      } else {
        // ── Kayıt ──────────────────────────────────────────────────────────
        const { error } = await supabase.auth.signUp({ email, password: sifre });
        if (error) { setHata(hataMesaji(`${error.code ?? ''} ${error.message}`)); return; }
        // Supabase varsayılan olarak onay e-postası gönderir;
        // demo ortamında bunu atlayıp doğrudan bilgi verelim
        setBasarili('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
        setSekme('giris');
        setSifre('');
      }
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">
      {/* Logo */}
      <Link href="/" className="mb-8">
        <span className="text-2xl font-extrabold text-[#0f3460] tracking-tight">
          Health<span className="text-blue-400">Tour</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Sekme başlıkları */}
        <div className="flex border-b border-gray-100">
          {(['giris', 'kayit'] as Sekme[]).map((s) => (
            <button
              key={s}
              onClick={() => sekmeGec(s)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                sekme === s
                  ? 'text-[#0f3460] border-b-2 border-[#0f3460] bg-white'
                  : 'text-gray-400 hover:text-gray-600 bg-gray-50'
              }`}
            >
              {s === 'giris' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={gonderFormu} className="px-8 py-7 space-y-5">
          {/* Başarı mesajı */}
          {basarili && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-sm text-green-700">{basarili}</p>
            </div>
          )}

          {/* Hata mesajı */}
          {hata && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{hata}</p>
            </div>
          )}

          {/* E-posta */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              E-posta Adresi
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@email.com"
              value={email}
              maxLength={100}
              onChange={(e) => {
                // Enjeksiyon karakterlerini filtrele
                setEmail(e.target.value.replace(/[<>"';&\\`\n\r]/g, ''));
              }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Şifre
            </label>
            <input
              type="password"
              required
              autoComplete={sekme === 'giris' ? 'current-password' : 'new-password'}
              placeholder={sekme === 'giris' ? 'Şifreniz' : 'En az 6 karakter'}
              value={sifre}
              minLength={6}
              maxLength={72}
              onChange={(e) => setSifre(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f3460]/30 focus:border-[#0f3460] bg-white"
            />
          </div>

          {/* Gönder butonu */}
          <button
            type="submit"
            disabled={gonderiyor}
            className="w-full py-3.5 bg-[#0f3460] text-white font-bold rounded-xl hover:bg-[#16213e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {gonderiyor ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{sekme === 'giris' ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}</span>
              </>
            ) : (
              <span>{sekme === 'giris' ? 'Giriş Yap' : 'Hesap Oluştur'}</span>
            )}
          </button>

          {/* Alt geçiş linki */}
          <p className="text-center text-sm text-gray-500">
            {sekme === 'giris' ? (
              <>
                Hesabın yok mu?{' '}
                <button
                  type="button"
                  onClick={() => sekmeGec('kayit')}
                  className="text-[#0f3460] font-semibold hover:underline"
                >
                  Kayıt ol
                </button>
              </>
            ) : (
              <>
                Zaten hesabın var mı?{' '}
                <button
                  type="button"
                  onClick={() => sekmeGec('giris')}
                  className="text-[#0f3460] font-semibold hover:underline"
                >
                  Giriş yap
                </button>
              </>
            )}
          </p>
        </form>
      </div>

      {/* Demo notu */}
      <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
        Bu bir hackathon demosudur. Gerçek e-posta doğrulaması devre dışıdır.
      </p>
    </main>
  );
}
