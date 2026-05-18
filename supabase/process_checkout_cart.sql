-- ─────────────────────────────────────────────────────────────────────────────
-- ATOMIC CHECKOUT RPC
-- Sepetteki tüm cart item'larını TEK transaction içinde rezervasyonlar tablosuna
-- yazar; herhangi bir hata olduğunda tamamı rollback olur (ya hep ya hiç).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.process_checkout_cart(
  p_kullanici_id   UUID,
  p_grup_kodu      TEXT,
  p_tarih          DATE,
  p_items          JSONB,
  p_erisilebilirlik JSONB DEFAULT NULL
)
RETURNS SETOF public.rezervasyonlar
LANGUAGE plpgsql
SECURITY INVOKER                          -- RLS politikaları zorlanır
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item JSONB;
BEGIN
  -- Defense-in-depth: kullanici_id daima oturum sahibiyle eşleşmeli
  IF p_kullanici_id IS NULL OR p_kullanici_id <> auth.uid() THEN
    RAISE EXCEPTION 'Yetkisiz: kullanıcı kimliği oturumla eşleşmiyor'
      USING ERRCODE = '42501';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Geçersiz veya boş sepet' USING ERRCODE = '22023';
  END IF;

  -- plpgsql bloğu zaten implicit transaction — tek satır bile fail olsa
  -- daha önce yapılan INSERT'ler dahil her şey geri alınır.
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    RETURN QUERY
    INSERT INTO public.rezervasyonlar (
      kullanici_id, paket_id, tarih, durum, takip_kodu,
      item_tipi, item_isim, item_detay, item_fiyat,
      grup_kodu, erisilebilirlik
    )
    VALUES (
      p_kullanici_id,
      CASE WHEN v_item->>'type' = 'package'
           THEN (v_item->>'id')::uuid
           ELSE NULL END,
      p_tarih,
      'beklemede',
      upper(substr(md5(gen_random_uuid()::text), 1, 6)),  -- per-row PNR
      v_item->>'type',
      v_item->>'name',
      v_item->>'detail',
      (v_item->>'lineTotal')::numeric,
      p_grup_kodu,
      p_erisilebilirlik
    )
    RETURNING *;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.process_checkout_cart(UUID, TEXT, DATE, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_checkout_cart(UUID, TEXT, DATE, JSONB, JSONB) TO authenticated;
