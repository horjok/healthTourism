import { getKlinikById } from '@/lib/supabase';
import { ok, err } from '@/lib/api-response';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getKlinikById(params.id);
    return ok(data);
  } catch {
    return err('Klinik bulunamadı', 404);
  }
}
