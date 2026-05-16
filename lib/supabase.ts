// SUNUCU TARAFI — Bu dosyayı yalnızca API route'larında ve Server Component'larda kullan.
// Client Component'larda @/lib/supabase-client kullan, aksi hâlde addListener hatası alırsın.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Klinik, Paket, Rezervasyon } from './types';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
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
  }
  return _supabase;
}

// ─── Klinikler ────────────────────────────────────────────────────────────────

export async function getKlinikler(): Promise<Klinik[]> {
  const { data, error } = await getSupabase()
    .from('klinikler')
    .select('*')
    .order('puan', { ascending: false });

  if (error) throw new Error(`Klinikler getirilemedi: ${error.message}`);
  return data as Klinik[];
}

export async function getKlinikById(id: string): Promise<Klinik> {
  const { data, error } = await getSupabase()
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
  klinik_id?: string;
  sehir?: string;
  ucus_dahil?: boolean;
  otel_dahil?: boolean;
  akredite?: boolean;
  min_puan?: number;
}

export async function getPaketler(filtreler?: PaketFiltreler): Promise<Paket[]> {
  let query = getSupabase()
    .from('paketler')
    .select(`*, klinik:klinikler(*)`);

  if (filtreler?.klinik_id) {
    query = query.eq('klinik_id', filtreler.klinik_id);
  }

  // Klinik tarafı filtreler — tek sorguda tüm kısıtları uygula
  const klinikFiltreliMi =
    filtreler?.uzmanlik ||
    filtreler?.sehir ||
    filtreler?.akredite !== undefined ||
    filtreler?.min_puan !== undefined;

  if (klinikFiltreliMi) {
    let kq = getSupabase().from('klinikler').select('id');
    if (filtreler?.uzmanlik) kq = kq.contains('uzmanlik', [filtreler.uzmanlik]);
    if (filtreler?.sehir)    kq = kq.eq('sehir', filtreler.sehir);
    if (filtreler?.akredite !== undefined) kq = kq.eq('akredite', filtreler.akredite);
    if (filtreler?.min_puan !== undefined) kq = kq.gte('puan', filtreler.min_puan);

    const { data: klinikler } = await kq;
    const ids = (klinikler ?? []).map((k) => k.id);
    if (ids.length === 0) return [];
    query = query.in('klinik_id', ids);
  }

  if (filtreler?.max_fiyat !== undefined)  query = query.lte('toplam_fiyat', filtreler.max_fiyat);
  if (filtreler?.tarih)                    query = query.gte('tarih', filtreler.tarih);
  if (filtreler?.ucus_dahil !== undefined) query = query.eq('ucus_dahil', filtreler.ucus_dahil);
  if (filtreler?.otel_dahil !== undefined) query = query.eq('otel_dahil', filtreler.otel_dahil);

  const { data, error } = await query.order('toplam_fiyat', { ascending: true });
  if (error) throw new Error(`Paketler getirilemedi: ${error.message}`);
  return data as Paket[];
}

export async function getPaketById(id: string): Promise<Paket> {
  const { data, error } = await getSupabase()
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
  const { data, error } = await getSupabase()
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

export async function cancelRezervasyonById(id: string, kullanici_id: string): Promise<Rezervasyon> {
  const { data, error } = await getSupabase()
    .from('rezervasyonlar')
    .update({ durum: 'iptal' })
    .eq('id', id)
    .eq('kullanici_id', kullanici_id) // güvenlik: sadece kendi rezervasyonunu iptal edebilir
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .single();

  if (error) throw new Error(`Rezervasyon iptal edilemedi: ${error.message}`);
  return data as Rezervasyon;
}

export async function getKullaniciRezervasyonlari(kullanici_id: string): Promise<Rezervasyon[]> {
  const { data, error } = await getSupabase()
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
