import { getKlinikById } from '@/lib/supabase';

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getKlinikById(params.id);
    return Response.json({ success: true, data });
  } catch {
    return Response.json(
      { success: false, error: 'Klinik bulunamadı' },
      { status: 404 }
    );
  }
}
