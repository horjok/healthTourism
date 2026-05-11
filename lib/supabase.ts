// SUNUCU TARAFI — Bu dosyayı yalnızca API route'larında ve Server Component'larda kullan.
// Client Component'larda @/lib/supabase-client kullan, aksi hâlde addListener hatası alırsın.
import { createClient } from '@supabase/supabase-js';
import type { Klinik, Paket, Rezervasyon } from './types';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,    // sunucuda localStorage yok
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// ─── Klinikler ────────────────────────────────────────────────────────────────

export async function getKlinikler(): Promise<Klinik[]> {
  const { data, error } = await supabase
    .from('klinikler')
    .select('*')
    .order('puan', { ascending: false });

  if (error) throw new Error(`Klinikler getirilemedi: ${error.message}`);
  return data as Klinik[];
}

export async function getKlinikById(id: string): Promise<Klinik> {
  const { data, error } = await supabase
    .from('klinikler')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Klinik bulunamadı (id: ${id}): ${error.message}`);
  return data as Klinik;
}

// ─── Paketler ─────────────────────────────────────────────────────────────────

interface PaketFiltreler {
  uzmanlik?: string;
  max_fiyat?: number;
  tarih?: string;
}

export async function getPaketler(filtreler?: PaketFiltreler): Promise<Paket[]> {
  let query = supabase
    .from('paketler')
    .select(`
      *,
      klinik:klinikler(*)
    `);

  if (filtreler?.uzmanlik) {
    query = query.contains('klinik.uzmanlik', [filtreler.uzmanlik]);
  }

  if (filtreler?.max_fiyat !== undefined) {
    query = query.lte('toplam_fiyat', filtreler.max_fiyat);
  }

  if (filtreler?.tarih) {
    query = query.gte('tarih', filtreler.tarih);
  }

  const { data, error } = await query.order('toplam_fiyat', { ascending: true });

  if (error) throw new Error(`Paketler getirilemedi: ${error.message}`);
  return data as Paket[];
}

export async function getPaketById(id: string): Promise<Paket> {
  const { data, error } = await supabase
    .from('paketler')
    .select(`
      *,
      klinik:klinikler(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(`Paket bulunamadı (id: ${id}): ${error.message}`);
  return data as Paket;
}

// ─── Rezervasyonlar ───────────────────────────────────────────────────────────

type YeniRezervasyon = Omit<Rezervasyon, 'id' | 'olusturma_tarihi' | 'paket'> & {
  paket_id: string;
};

export async function createRezervasyon(rezervasyon: YeniRezervasyon): Promise<Rezervasyon> {
  const { data, error } = await supabase
    .from('rezervasyonlar')
    .insert({
      kullanici_id: rezervasyon.kullanici_id,
      paket_id: rezervasyon.paket_id,
      tarih: rezervasyon.tarih,
      durum: rezervasyon.durum ?? 'beklemede',
    })
    .select(`
      *,
      paket:paketler(*, klinik:klinikler(*))
    `)
    .single();

  if (error) throw new Error(`Rezervasyon oluşturulamadı: ${error.message}`);
  return data as Rezervasyon;
}

export async function getKullaniciRezervasyonlari(kullanici_id: string): Promise<Rezervasyon[]> {
  const { data, error } = await supabase
    .from('rezervasyonlar')
    .select(`
      *,
      paket:paketler(*, klinik:klinikler(*))
    `)
    .eq('kullanici_id', kullanici_id)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Rezervasyonlar getirilemedi (kullanıcı: ${kullanici_id}): ${error.message}`);
  return data as Rezervasyon[];
}
