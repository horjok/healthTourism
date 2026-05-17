// SUNUCU TARAFI — Bu dosyayı yalnızca API route'larında ve Server Component'larda kullan.
// Client Component'larda @/lib/supabase-client kullan, aksi hâlde addListener hatası alırsın.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { AdminStats, ClinicApplication, Klinik, Paket, Rezervasyon, Ticket, UserRole } from './types';

type CookieStore = { getAll: () => { name: string; value: string }[] };

// Session-aware client — admin route'larında cookies() ile kullan
export function createSupabaseForRoute(cookieStore: CookieStore): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  ) as unknown as SupabaseClient;
}

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

// ─── Admin Fonksiyonları ──────────────────────────────────────────────────────

export async function getAdminStats(sb: SupabaseClient = getSupabase()): Promise<AdminStats> {
  const [kullanici, rezervasyon, basvuru, bilet] = await Promise.all([
    sb.from('user_roles').select('id', { count: 'exact', head: true }),
    sb.from('rezervasyonlar').select('id', { count: 'exact', head: true }),
    sb.from('clinic_applications').select('id', { count: 'exact', head: true }).eq('durum', 'pending'),
    sb.from('tickets').select('id', { count: 'exact', head: true }).eq('durum', 'acik'),
  ]);

  return {
    toplam_kullanici: kullanici.count ?? 0,
    toplam_rezervasyon: rezervasyon.count ?? 0,
    bekleyen_basvuru: basvuru.count ?? 0,
    acik_bilet: bilet.count ?? 0,
  };
}

export async function getClinicApplications(durum?: string, sb: SupabaseClient = getSupabase()): Promise<ClinicApplication[]> {
  let query = sb
    .from('clinic_applications')
    .select('*')
    .order('olusturma_tarihi', { ascending: false });

  if (durum) query = query.eq('durum', durum);

  const { data, error } = await query;
  if (error) throw new Error(`Başvurular getirilemedi: ${error.message}`);
  return data as ClinicApplication[];
}

export async function updateClinicApplication(
  id: string,
  updates: { durum: 'approved' | 'rejected'; admin_notu?: string; klinik_id?: string },
  sb: SupabaseClient = getSupabase()
): Promise<ClinicApplication> {

  const { data, error } = await sb
    .from('clinic_applications')
    .update({ ...updates, guncelleme_tarihi: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Başvuru güncellenemedi: ${error.message}`);

  // Onaylanınca kullanıcı rolünü clinic_manager yap
  if (updates.durum === 'approved' && updates.klinik_id) {
    const app = data as ClinicApplication;
    await sb.from('user_roles').upsert({
      kullanici_id: app.kullanici_id,
      rol: 'clinic_manager',
      klinik_id: updates.klinik_id,
    }, { onConflict: 'kullanici_id' });
  }

  return data as ClinicApplication;
}

export async function getTumRezervasyonlar(sb: SupabaseClient = getSupabase()): Promise<Rezervasyon[]> {
  const { data, error } = await sb
    .from('rezervasyonlar')
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Rezervasyonlar getirilemedi: ${error.message}`);
  return data as Rezervasyon[];
}

export async function getTickets(durum?: string, sb: SupabaseClient = getSupabase()): Promise<Ticket[]> {
  let query = sb
    .from('tickets')
    .select('*')
    .order('olusturma_tarihi', { ascending: false });

  if (durum) query = query.eq('durum', durum);

  const { data, error } = await query;
  if (error) throw new Error(`Biletler getirilemedi: ${error.message}`);
  return data as Ticket[];
}

export async function updateTicket(
  id: string,
  updates: { durum?: 'acik' | 'islemde' | 'kapali'; admin_yaniti?: string },
  sb: SupabaseClient = getSupabase()
): Promise<Ticket> {
  const { data, error } = await sb
    .from('tickets')
    .update({ ...updates, guncelleme_tarihi: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Bilet güncellenemedi: ${error.message}`);
  return data as Ticket;
}

// ─── Clinic Fonksiyonları ─────────────────────────────────────────────────────

export async function getUserRole(kullanici_id: string): Promise<UserRole | null> {
  const { data } = await getSupabase()
    .from('user_roles')
    .select('*')
    .eq('kullanici_id', kullanici_id)
    .single();

  return data as UserRole | null;
}

export async function getClinicApplication(kullanici_id: string): Promise<ClinicApplication | null> {
  const { data } = await getSupabase()
    .from('clinic_applications')
    .select('*')
    .eq('kullanici_id', kullanici_id)
    .order('olusturma_tarihi', { ascending: false })
    .limit(1)
    .single();

  return data as ClinicApplication | null;
}

export async function createClinicApplication(
  payload: Omit<ClinicApplication, 'id' | 'durum' | 'klinik_id' | 'admin_notu' | 'olusturma_tarihi' | 'guncelleme_tarihi'>
): Promise<ClinicApplication> {
  const { data, error } = await getSupabase()
    .from('clinic_applications')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Başvuru oluşturulamadı: ${error.message}`);
  return data as ClinicApplication;
}

export async function getPaketlerByKlinik(klinik_id: string): Promise<Paket[]> {
  const { data, error } = await getSupabase()
    .from('paketler')
    .select(`*, klinik:klinikler(*)`)
    .eq('klinik_id', klinik_id)
    .order('toplam_fiyat', { ascending: true });

  if (error) throw new Error(`Klinik paketleri getirilemedi: ${error.message}`);
  return data as Paket[];
}

type YeniPaket = Omit<Paket, 'id' | 'klinik'> & { klinik_id: string };

export async function createPaket(paket: YeniPaket): Promise<Paket> {
  const { data, error } = await getSupabase()
    .from('paketler')
    .insert(paket)
    .select(`*, klinik:klinikler(*)`)
    .single();

  if (error) throw new Error(`Paket oluşturulamadı: ${error.message}`);
  return data as Paket;
}

export async function updatePaket(id: string, updates: Partial<YeniPaket>): Promise<Paket> {
  const { data, error } = await getSupabase()
    .from('paketler')
    .update(updates)
    .eq('id', id)
    .select(`*, klinik:klinikler(*)`)
    .single();

  if (error) throw new Error(`Paket güncellenemedi: ${error.message}`);
  return data as Paket;
}

export async function deletePaket(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('paketler')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Paket silinemedi: ${error.message}`);
}

export async function getRezervasyonlarByKlinik(klinik_id: string): Promise<Rezervasyon[]> {
  const { data, error } = await getSupabase()
    .from('rezervasyonlar')
    .select(`*, paket:paketler!inner(*, klinik:klinikler(*))`)
    .eq('paket.klinik_id', klinik_id)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Klinik rezervasyonları getirilemedi: ${error.message}`);
  return data as Rezervasyon[];
}

export async function createTicket(
  payload: Pick<Ticket, 'kullanici_id' | 'konu' | 'mesaj'>
): Promise<Ticket> {
  const { data, error } = await getSupabase()
    .from('tickets')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Bilet oluşturulamadı: ${error.message}`);
  return data as Ticket;
}
