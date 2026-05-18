export interface Klinik {
  id: string;
  isim: string;
  sehir: string;
  uzmanlik: string[];
  puan: number;
  akredite: boolean;
  fiyat_aralik: string;
  fotograf_url: string;
}

export interface Paket {
  id: string;
  baslik: string;
  klinik: Klinik;
  otel_isim: string;
  otel_dahil: boolean;
  ucus_dahil: boolean;
  transfer_dahil: boolean;
  uzmanlik: string;
  toplam_fiyat: number;
  sure_gun: number;
  aciklama: string;
}

export interface ErisilebilirlikBilgisi {
  gerekli: boolean;
  fiziksel: string[];
  zihinsel: string[];
  tibbi: string[];
  hamileyse_hafta?: string;
  diger_aciklama?: string;
  ek_not?: string;
  acil_ad?: string;
  acil_telefon?: string;
  acil_iliski?: string;
}

export type RezervasyonItemTipi = 'package' | 'flight' | 'transfer' | 'tour' | 'hotel' | 'health';

export interface Rezervasyon {
  id: string;
  kullanici_id: string;
  paket: Paket | null;
  paket_id?: string | null;
  item_tipi?: RezervasyonItemTipi;
  item_isim?: string | null;
  item_fiyat?: number | null;
  grup_kodu?: string | null;
  tarih: string;
  durum: 'beklemede' | 'onaylandi' | 'tamamlandi' | 'iptal' | 'arsivlendi';
  olusturma_tarihi: string;
  takip_kodu?: string;
  item_detay?: string | null;
  sepet_ozeti?: Record<string, unknown>[] | null;
  erisilebilirlik?: ErisilebilirlikBilgisi | null;
}

export interface KullaniciProfil {
  id: string;
  ad: string;
  email: string;
  rezervasyonlar: Rezervasyon[];
}

export interface Yorum {
  id: string;
  klinik_id: string;
  kullanici_id: string;
  puan: number;
  yorum_metni: string | null;
  olusturma_tarihi: string;
}

// ─── AI Pipeline Tipleri ──────────────────────────────────────────────────────

export interface ChatIstegi {
  mesaj: string;
  butce?: number;
  tarih?: string;
}

// Agent 1 çıktısı — deterministik algoritmaya girdi
export interface CikarimSonucu {
  uzmanlik: string;
  maxButce: number | null;
  sehir: string | null;
  kapsamDisi?: true; // platform konusu dışında sorgu
}

export interface PaketOnerisi {
  klinik_isim: string;
  tahmini_fiyat: string;
  avantajlar: string[];
}

export interface PipelineSonucu {
  uzmanlik_alani: string;
  oneri_ozeti: string;
  guvenilirlik_skoru: number;
  uyarilar: string[];
  onerilen_paketler: PaketOnerisi[];
  ham_analiz: {
    agent1: string;
    agent2: string;
    agent3: string;
  };
}

// ─── RBAC Tipleri ─────────────────────────────────────────────────────────────

export type KullaniciRolu = 'super_admin' | 'clinic_manager' | 'user';

export interface UserRole {
  id: string;
  kullanici_id: string;
  rol: KullaniciRolu;
  klinik_id: string | null;
  olusturma_tarihi: string;
}

export interface ClinicApplication {
  id: string;
  kullanici_id: string;
  klinik_isim: string;
  iletisim_email: string;
  uzmanlik: string[];
  sehir: string;
  aciklama: string | null;
  durum: 'pending' | 'approved' | 'rejected';
  klinik_id: string | null;
  admin_notu: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface Ticket {
  id: string;
  kullanici_id: string;
  konu: string;
  mesaj: string;
  durum: 'acik' | 'islemde' | 'kapali';
  admin_yaniti: string | null;
  olusturma_tarihi: string;
  guncelleme_tarihi: string;
}

export interface AdminStats {
  toplam_kullanici: number;
  toplam_rezervasyon: number;
  bekleyen_basvuru: number;
  acik_bilet: number;
}

export interface AdminKullanici {
  id: string;
  email: string;
  created_at: string;
  rol: KullaniciRolu | null;
  klinik_id: string | null;
}

// ─── Ödeme Tipleri ────────────────────────────────────────────────────────────

export interface OdemeSonucu {
  islem_id: string;
  tutar: number;
  durum: 'basarili';
  tarih: string;
  son_dort_hane: string;
}
