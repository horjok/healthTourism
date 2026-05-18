// Tek tip API zarfı. İstemci yalnız `success` flag'iyle dallanır; `detay` log/teşhis içindir.
import { NextResponse } from 'next/server';

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 500, detay?: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message, ...(detay ? { detay } : {}) },
    { status }
  );
}

// try/catch içinde yakalanan hataları normalize eder.
export function fail(message: string, error: unknown, status = 500): NextResponse {
  const detay = error instanceof Error ? error.message : String(error);
  return err(message, status, detay);
}
