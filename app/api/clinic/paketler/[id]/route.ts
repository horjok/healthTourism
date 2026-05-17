import { NextRequest, NextResponse } from 'next/server';
import { deletePaket, updatePaket } from '@/lib/supabase';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = await updatePaket(params.id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Paket güncellenemedi', detay: mesaj }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deletePaket(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const mesaj = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, error: 'Paket silinemedi', detay: mesaj }, { status: 500 });
  }
}
