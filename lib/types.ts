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
  toplam_fiyat: number;
  sure_gun: number;
  aciklama: string;
}

export interface Rezervasyon {
  id: string;
  kullanici_id: string;
  paket: Paket;
  tarih: string;
  durum: 'beklemede' | 'onaylandi' | 'iptal';
  olusturma_tarihi: string;
}

export interface KullaniciProfil {
  id: string;
  ad: string;
  email: string;
  rezervasyonlar: Rezervasyon[];
}

// ─── AI Pipeline Tipleri ──────────────────────────────────────────────────────

export interface ChatIstegi {
  mesaj: string;
  butce?: number;
  tarih?: string;
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

// ─── Ödeme Tipleri ────────────────────────────────────────────────────────────

export interface OdemeSonucu {
  islem_id: string;
  tutar: number;
  durum: 'basarili';
  tarih: string;
  son_dort_hane: string;
}
