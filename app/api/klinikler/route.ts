import { getKlinikler } from '@/lib/supabase';

export async function GET() {
  try {
    const data = await getKlinikler();
    return Response.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return Response.json(
      { success: false, error: 'Klinikler alınamadı, lütfen tekrar deneyin', detay: mesaj },
      { status: 500 }
    );
  }
}
