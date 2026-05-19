'use client';

import { useState } from 'react';

export interface BiletItem {
  isim: string;
  detay?: string | null;
  tip?: string;
  fiyat?: number;
}

// jsPDF Helvetica WinAnsi encoding kullanır; ç/ö/ü/é destekler ama ş/ı/ğ İ Ş Ğ DESTEKLEMEZ.
// Bu karakterleri ASCII karşılıklarına normalize ederek PDF'te bozuk render önlenir.
const TR_MAP: Record<string, string> = {
  'ş': 's', 'Ş': 'S',
  'ı': 'i', 'İ': 'I',
  'ğ': 'g', 'Ğ': 'G',
};
function tr(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/[şŞıİğĞ]/g, (c) => TR_MAP[c] ?? c);
}

interface Props {
  grupKodu: string;
  items: BiletItem[];
  tarih?: string;
  yolcuAd?: string;
  yolcuEmail?: string;
  yolcuTel?: string;
  toplam?: number;
  // Kompakt mod — profil sayfasında listede daha küçük buton gerekli
  kompakt?: boolean;
}

// Boarding-pass / itinerary PDF — sunucuya 0 yük, tamamen client-side
export default function DownloadTicketButton({
  grupKodu, items, tarih, yolcuAd, yolcuEmail, yolcuTel, toplam, kompakt = false,
}: Props) {
  const [yukleniyor, setYukleniyor] = useState(false);

  async function indir() {
    setYukleniyor(true);
    try {
      // Dinamik import — bundle'ı initial JS'den ayır
      const [{ jsPDF }, QRCode] = await Promise.all([
        import('jspdf'),
        import('qrcode'),
      ]);

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const W = doc.internal.pageSize.getWidth();

      // ─── Üst bar (navy) ────────────────────────────────────────────────────
      doc.setFillColor(15, 52, 96); // #0f3460
      doc.rect(0, 0, W, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('HealthTour', 14, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(180, 200, 230);
      doc.text('Boarding Pass / Itinerary', 14, 25);

      doc.setFontSize(8);
      doc.text(tr(new Date().toLocaleString('tr-TR')), W - 14, 8, { align: 'right' });

      // ─── PNR kutusu ────────────────────────────────────────────────────────
      doc.setFillColor(217, 119, 6); // amber-600
      doc.roundedRect(14, 48, W - 28, 22, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('PNR / GRUP KODU', 20, 56);
      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      doc.text(tr(grupKodu), 20, 65);

      // QR kod — PNR'yi encode et
      const qrDataUrl = await QRCode.toDataURL(grupKodu, {
        margin: 0, width: 200, color: { dark: '#0f3460', light: '#ffffff' },
      });
      doc.addImage(qrDataUrl, 'PNG', W - 38, 50, 18, 18);

      // ─── Yolcu + tarih satırı ──────────────────────────────────────────────
      let y = 82;
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('YOLCU', 14, y);
      doc.text(tr('TARİH'), W / 2, y);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(tr(yolcuAd ?? 'Misafir'), 14, y + 6);
      doc.text(tr(tarih ?? '—'), W / 2, y + 6);

      // E-posta ve telefon — yolcu adının altına ince yazı
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      let infoY = y + 11;
      if (yolcuEmail) {
        doc.text(tr(yolcuEmail), 14, infoY);
        infoY += 4;
      }
      if (yolcuTel) {
        doc.text(tr(yolcuTel), 14, infoY);
      }

      // ─── Item listesi ──────────────────────────────────────────────────────
      y = 105;
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y, W - 14, y);
      y += 8;

      doc.setTextColor(15, 52, 96);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(tr('Rezervasyon Detayları'), 14, y);
      y += 8;

      items.forEach((it, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, W - 28, 22, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(tr(`${i + 1}. ${it.isim}`), 18, y + 8);

        if (it.detay) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(tr(it.detay.slice(0, 90)), 18, y + 14);
        }

        if (typeof it.fiyat === 'number') {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(15, 52, 96);
          doc.text(`${it.fiyat.toLocaleString('tr-TR')} EUR`, W - 18, y + 12, { align: 'right' });
        }

        if (it.tip) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(8, 145, 178);
          doc.text(tr(it.tip.toUpperCase()), 18, y + 20);
        }
        y += 26;
      });

      // ─── Toplam ────────────────────────────────────────────────────────────
      if (typeof toplam === 'number') {
        y += 4;
        doc.setDrawColor(15, 52, 96);
        doc.setLineWidth(0.5);
        doc.line(14, y, W - 14, y);
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text('TOPLAM', 14, y);
        doc.setTextColor(15, 52, 96);
        doc.text(`${toplam.toLocaleString('tr-TR')} EUR`, W - 14, y, { align: 'right' });
      }

      // ─── Alt bilgi ─────────────────────────────────────────────────────────
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        tr('Bu doküman dijital rezervasyon kanıtıdır. Klinige girişte PNR ile birlikte ibraz edilmelidir.'),
        W / 2, 285, { align: 'center' }
      );

      doc.save(`HealthTour-${grupKodu}.pdf`);
    } finally {
      setYukleniyor(false);
    }
  }

  const sinif = kompakt
    ? 'h-9 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3.5 bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed'
    : 'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 text-[#0f172a] font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';

  return (
    <button
      onClick={indir}
      disabled={yukleniyor}
      className={sinif}
    >
      {yukleniyor ? (
        <>
          <span className={`${kompakt ? 'w-3 h-3 border-amber-700' : 'w-4 h-4 border-[#0f172a]'} border-2 border-t-transparent rounded-full animate-spin`} />
          Hazırlanıyor…
        </>
      ) : (
        <>
          <svg width={kompakt ? 14 : 18} height={kompakt ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          PDF Bilet İndir
        </>
      )}
    </button>
  );
}
