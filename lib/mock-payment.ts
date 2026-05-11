import type { OdemeSonucu } from './types';

// Demo ortamında her ödeme başarılı döner — gerçek kart bilgisi işlenmez
export async function processMockPayment(tutar: number): Promise<OdemeSonucu> {
  // Gerçekçi görünmesi için 2 saniyelik yapay gecikme
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));

  const islemId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  return {
    islem_id: islemId,
    tutar,
    durum: 'basarili',
    tarih: new Date().toISOString(),
    son_dort_hane: '4242',
  };
}
