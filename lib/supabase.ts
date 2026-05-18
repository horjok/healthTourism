// SUNUCU TARAFI DB KATMANI.
// Her fonksiyon kendi SupabaseClient'ını ALMAZ — caller seçimi (public / session / admin) zorlar.
// Bu sayede RLS bağlamı yanlışlıkla geçilemez. İstemciler için: lib/supabase-clients.ts.
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicSupabase, createServerSupabase, createAdminClient } from './supabase-clients';
import type {
  AdminStats, ClinicApplication, ErisilebilirlikBilgisi, Klinik, Paket,
  Rezervasyon, RezervasyonItemTipi, Ticket, UserRole, Yorum,
} from './types';

// Geriye dönük uyum için yeniden ihraç. Yeni kodda doğrudan supabase-clients'ten alın.
export { getPublicSupabase, createServerSupabase, createAdminClient };

// ─── Klinikler (public okuma) ────────────────────────────────────────────────

export async function getKlinikler(sb: SupabaseClient = getPublicSupabase()): Promise<Klinik[]> {
  const { data, error } = await sb
    .from('klinikler')
    .select('*')
    .order('puan', { ascending: false });

  if (error) throw new Error(`Klinikler getirilemedi: ${error.message}`);
  return data as Klinik[];
}

export async function getKlinikById(id: string, sb: SupabaseClient = getPublicSupabase()): Promise<Klinik> {
  const { data, error } = await sb
    .from('klinikler')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Klinik bulunamadı (id: ${id}): ${error.message}`);
  return data as Klinik;
}

// ─── Paketler (public okuma) ─────────────────────────────────────────────────

interface PaketFiltreler {
  uzmanlik?: string;        // klinikler.uzmanlik array-contains filtresi
  paket_uzmanlik?: string;  // paketler.uzmanlik tam eşleşme
  baslik_arama?: string;    // paketler.baslik ILIKE araması
  max_fiyat?: number;
  tarih?: string;
  klinik_id?: string;
  sehir?: string;
  ucus_dahil?: boolean;
  otel_dahil?: boolean;
  akredite?: boolean;
  min_puan?: number;
}

export async function getPaketler(
  filtreler?: PaketFiltreler,
  sb: SupabaseClient = getPublicSupabase()
): Promise<Paket[]> {
  let query = sb.from('paketler').select(`*, klinik:klinikler(*)`);

  if (filtreler?.klinik_id) query = query.eq('klinik_id', filtreler.klinik_id);

  const klinikFiltreliMi =
    filtreler?.uzmanlik ||
    filtreler?.sehir ||
    filtreler?.akredite !== undefined ||
    filtreler?.min_puan !== undefined;

  if (klinikFiltreliMi) {
    let kq = sb.from('klinikler').select('id');
    if (filtreler?.uzmanlik) kq = kq.contains('uzmanlik', [filtreler.uzmanlik]);
    if (filtreler?.sehir)    kq = kq.eq('sehir', filtreler.sehir);
    if (filtreler?.akredite !== undefined) kq = kq.eq('akredite', filtreler.akredite);
    if (filtreler?.min_puan !== undefined) kq = kq.gte('puan', filtreler.min_puan);

    const { data: klinikler } = await kq;
    const ids = (klinikler ?? []).map((k) => k.id);
    if (ids.length === 0) return [];
    query = query.in('klinik_id', ids);
  }

  if (filtreler?.paket_uzmanlik) query = query.eq('uzmanlik', filtreler.paket_uzmanlik);
  if (filtreler?.baslik_arama)  query = query.ilike('baslik', `%${filtreler.baslik_arama}%`);
  if (filtreler?.max_fiyat !== undefined)  query = query.lte('toplam_fiyat', filtreler.max_fiyat);
  if (filtreler?.tarih)                    query = query.gte('tarih', filtreler.tarih);
  if (filtreler?.ucus_dahil !== undefined) query = query.eq('ucus_dahil', filtreler.ucus_dahil);
  if (filtreler?.otel_dahil !== undefined) query = query.eq('otel_dahil', filtreler.otel_dahil);

  const { data, error } = await query.order('toplam_fiyat', { ascending: true });
  if (error) throw new Error(`Paketler getirilemedi: ${error.message}`);
  return data as Paket[];
}

export async function getPaketById(id: string, sb: SupabaseClient = getPublicSupabase()): Promise<Paket> {
  const { data, error } = await sb
    .from('paketler')
    .select(`*, klinik:klinikler(*)`)
    .eq('id', id)
    .single();

  if (error) throw new Error(`Paket bulunamadı (id: ${id}): ${error.message}`);
  return data as Paket;
}

// ─── Rezervasyonlar (session-scoped) ─────────────────────────────────────────

type YeniRezervasyon = {
  kullanici_id: string;
  tarih: string;
  durum?: Rezervasyon['durum'];
  paket_id?: string | null;
  takip_kodu?: string;
  sepet_ozeti?: Record<string, unknown>[] | null;
  item_tipi?: RezervasyonItemTipi;
  item_isim?: string | null;
  item_detay?: string | null;
  item_fiyat?: number | null;
  grup_kodu?: string | null;
  erisilebilirlik?: ErisilebilirlikBilgisi | null;
};

export async function createRezervasyon(
  rezervasyon: YeniRezervasyon,
  sb: SupabaseClient
): Promise<Rezervasyon> {
  const payload: Record<string, unknown> = {
    kullanici_id: rezervasyon.kullanici_id,
    tarih: rezervasyon.tarih,
    durum: rezervasyon.durum ?? 'beklemede',
  };
  if (rezervasyon.paket_id)      payload.paket_id      = rezervasyon.paket_id;
  if (rezervasyon.sepet_ozeti)   payload.sepet_ozeti   = rezervasyon.sepet_ozeti;
  if (rezervasyon.takip_kodu)    payload.takip_kodu    = rezervasyon.takip_kodu;
  if (rezervasyon.item_tipi)     payload.item_tipi     = rezervasyon.item_tipi;
  if (rezervasyon.item_isim)     payload.item_isim     = rezervasyon.item_isim;
  if (rezervasyon.item_detay)    payload.item_detay    = rezervasyon.item_detay;
  if (rezervasyon.item_fiyat)    payload.item_fiyat    = rezervasyon.item_fiyat;
  if (rezervasyon.grup_kodu)     payload.grup_kodu     = rezervasyon.grup_kodu;
  if (rezervasyon.erisilebilirlik !== undefined) payload.erisilebilirlik = rezervasyon.erisilebilirlik;

  const { data, error } = await sb
    .from('rezervasyonlar')
    .insert(payload)
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .single();

  if (error) throw new Error(`Rezervasyon oluşturulamadı: ${error.message}`);
  return data as Rezervasyon;
}

export async function cancelRezervasyonById(
  id: string,
  kullanici_id: string,
  sb: SupabaseClient
): Promise<Rezervasyon> {
  const { data, error } = await sb
    .from('rezervasyonlar')
    .update({ durum: 'iptal' })
    .eq('id', id)
    .eq('kullanici_id', kullanici_id) // çift güvence — yalnız sahibi iptal eder
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .single();

  if (error) throw new Error(`Rezervasyon iptal edilemedi: ${error.message}`);
  return data as Rezervasyon;
}

export async function getKullaniciRezervasyonlari(
  kullanici_id: string,
  sb: SupabaseClient
): Promise<Rezervasyon[]> {
  const { data, error } = await sb
    .from('rezervasyonlar')
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .eq('kullanici_id', kullanici_id)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Rezervasyonlar getirilemedi: ${error.message}`);
  return data as Rezervasyon[];
}

// ─── Admin (yalnız admin client ile çağrılmalı) ──────────────────────────────

export async function getAdminStats(sb: SupabaseClient): Promise<AdminStats> {
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

export async function getClinicApplications(
  durum: string | undefined,
  sb: SupabaseClient
): Promise<ClinicApplication[]> {
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
  sb: SupabaseClient
): Promise<ClinicApplication> {
  const { data, error } = await sb
    .from('clinic_applications')
    .update({ ...updates, guncelleme_tarihi: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Başvuru güncellenemedi: ${error.message}`);

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

export async function getTumRezervasyonlar(sb: SupabaseClient): Promise<Rezervasyon[]> {
  const { data, error } = await sb
    .from('rezervasyonlar')
    .select(`*, paket:paketler(*, klinik:klinikler(*))`)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Rezervasyonlar getirilemedi: ${error.message}`);
  return data as Rezervasyon[];
}

export async function getTickets(durum: string | undefined, sb: SupabaseClient): Promise<Ticket[]> {
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
  sb: SupabaseClient
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

// ─── Klinik Manager (session-scoped + klinik_id zorunlu) ─────────────────────

export async function getUserRole(kullanici_id: string, sb: SupabaseClient): Promise<UserRole | null> {
  const { data } = await sb
    .from('user_roles')
    .select('*')
    .eq('kullanici_id', kullanici_id)
    .maybeSingle();
  return data as UserRole | null;
}

export async function getClinicApplication(
  kullanici_id: string,
  sb: SupabaseClient
): Promise<ClinicApplication | null> {
  const { data } = await sb
    .from('clinic_applications')
    .select('*')
    .eq('kullanici_id', kullanici_id)
    .order('olusturma_tarihi', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as ClinicApplication | null;
}

export async function createClinicApplication(
  payload: Omit<ClinicApplication, 'id' | 'durum' | 'klinik_id' | 'admin_notu' | 'olusturma_tarihi' | 'guncelleme_tarihi'>,
  sb: SupabaseClient
): Promise<ClinicApplication> {
  const { data, error } = await sb
    .from('clinic_applications')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Başvuru oluşturulamadı: ${error.message}`);
  return data as ClinicApplication;
}

export async function getPaketlerByKlinik(klinik_id: string, sb: SupabaseClient): Promise<Paket[]> {
  const { data, error } = await sb
    .from('paketler')
    .select(`*, klinik:klinikler(*)`)
    .eq('klinik_id', klinik_id)
    .order('toplam_fiyat', { ascending: true });

  if (error) throw new Error(`Klinik paketleri getirilemedi: ${error.message}`);
  return data as Paket[];
}

type YeniPaket = Omit<Paket, 'id' | 'klinik'> & { klinik_id: string };

export async function createPaket(paket: YeniPaket, sb: SupabaseClient): Promise<Paket> {
  const { data, error } = await sb
    .from('paketler')
    .insert(paket)
    .select(`*, klinik:klinikler(*)`)
    .single();

  if (error) throw new Error(`Paket oluşturulamadı: ${error.message}`);
  return data as Paket;
}

export async function updatePaket(
  id: string,
  updates: Partial<YeniPaket>,
  sb: SupabaseClient
): Promise<Paket> {
  const { data, error } = await sb
    .from('paketler')
    .update(updates)
    .eq('id', id)
    .select(`*, klinik:klinikler(*)`)
    .single();

  if (error) throw new Error(`Paket güncellenemedi: ${error.message}`);
  return data as Paket;
}

export async function deletePaket(id: string, sb: SupabaseClient): Promise<void> {
  const { error } = await sb.from('paketler').delete().eq('id', id);
  if (error) throw new Error(`Paket silinemedi: ${error.message}`);
}

// Bir paketin gerçekten verilen kliniğe ait olduğunu doğrular.
// Klinik yöneticisi route'larında zorunlu — başka kliniğin paketi üstünde yazma engellenir.
export async function assertPaketKlinikSahipligi(
  paket_id: string,
  klinik_id: string,
  sb: SupabaseClient
): Promise<void> {
  const { data, error } = await sb
    .from('paketler')
    .select('klinik_id')
    .eq('id', paket_id)
    .maybeSingle();

  if (error) throw new Error(`Paket sahipliği doğrulanamadı: ${error.message}`);
  if (!data) throw new Error('Paket bulunamadı');
  if (data.klinik_id !== klinik_id) throw new Error('Bu paket başka bir kliniğe ait');
}

export async function getRezervasyonlarByKlinik(klinik_id: string, sb: SupabaseClient): Promise<Rezervasyon[]> {
  const { data, error } = await sb
    .from('rezervasyonlar')
    .select(`*, paket:paketler!inner(*, klinik:klinikler(*))`)
    .eq('paket.klinik_id', klinik_id)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Klinik rezervasyonları getirilemedi: ${error.message}`);
  return data as Rezervasyon[];
}

export async function getYorumlarByKlinik(klinik_id: string, sb: SupabaseClient): Promise<Yorum[]> {
  const { data, error } = await sb
    .from('yorumlar')
    .select('*')
    .eq('klinik_id', klinik_id)
    .order('olusturma_tarihi', { ascending: false });

  if (error) throw new Error(`Yorumlar getirilemedi: ${error.message}`);
  return data as Yorum[];
}

type RezervasyonDurum = Rezervasyon['durum'];

export async function updateRezervasyonDurum(
  id: string,
  durum: RezervasyonDurum,
  klinik_id: string,
  sb: SupabaseClient
): Promise<Rezervasyon> {
  const { data: rez } = await sb
    .from('rezervasyonlar')
    .select('id, paket_id, paket:paketler(klinik_id)')
    .eq('id', id)
    .single();

  if (!rez) throw new Error('Rezervasyon bulunamadı');

  const paketKlinikId = (rez.paket as unknown as { klinik_id: string } | null)?.klinik_id;
  if (!paketKlinikId || paketKlinikId !== klinik_id) {
    throw new Error('Bu rezervasyon bu kliniğe ait değil');
  }

  const { data, error } = await sb
    .from('rezervasyonlar')
    .update({ durum })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Rezervasyon durumu güncellenemedi: ${error.message}`);
  return data as Rezervasyon;
}

export async function getClinicStats(
  klinik_id: string,
  sb: SupabaseClient
): Promise<{ toplamGelir: number; aktifRezervasyonSayisi: number; ortPuan: number; yorumSayisi: number }> {
  const [{ data: rezData }, { data: yorumData }] = await Promise.all([
    sb.from('rezervasyonlar')
      .select('durum, paket:paketler!inner(toplam_fiyat, klinik_id)')
      .eq('paket.klinik_id', klinik_id),
    sb.from('yorumlar')
      .select('puan')
      .eq('klinik_id', klinik_id),
  ]);

  type RezRow = { durum: string; paket: { toplam_fiyat: number } | null };
  const rezervasyonlar = (rezData ?? []) as unknown as RezRow[];
  const yorumlar = (yorumData ?? []) as { puan: number }[];

  const toplamGelir = rezervasyonlar
    .filter((r) => r.durum === 'tamamlandi')
    .reduce((acc, r) => acc + (r.paket?.toplam_fiyat ?? 0), 0);

  const aktifRezervasyonSayisi = rezervasyonlar
    .filter((r) => r.durum === 'beklemede' || r.durum === 'onaylandi').length;

  const ortPuan = yorumlar.length > 0
    ? yorumlar.reduce((acc, y) => acc + y.puan, 0) / yorumlar.length
    : 0;

  return { toplamGelir, aktifRezervasyonSayisi, ortPuan, yorumSayisi: yorumlar.length };
}

export async function createTicket(
  payload: Pick<Ticket, 'kullanici_id' | 'konu' | 'mesaj'>,
  sb: SupabaseClient
): Promise<Ticket> {
  const { data, error } = await sb
    .from('tickets')
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(`Bilet oluşturulamadı: ${error.message}`);
  return data as Ticket;
}
