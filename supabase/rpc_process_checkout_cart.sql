-- ─── Atomik Checkout RPC ─────────────────────────────────────────────────────
-- Sepet item'larını tek transaction'da rezervasyonlar tablosuna yazar.
-- PL/pgSQL fonksiyonu varsayılan olarak tek transaction; herhangi bir INSERT
-- patlarsa exception yukarı iletilir ve TÜM satırlar geri alınır.
--
-- ÖN KOŞUL: alter_rezervasyonlar_alici_bilgileri.sql çalıştırılmış olmalı.

-- Eski imzayı düşür — parametre listesi değişti
drop function if exists public.process_checkout_cart(uuid, text, date, jsonb, jsonb);

create or replace function public.process_checkout_cart(
  p_kullanici_id    uuid,
  p_grup_kodu       text,
  p_tarih           date,
  p_items           jsonb,
  p_erisilebilirlik jsonb default null,
  p_alici_ad        text  default null,
  p_alici_email     text  default null,
  p_alici_telefon   text  default null
)
returns setof public.rezervasyonlar
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item        jsonb;
  v_rez_id      uuid;
  v_paket_id    uuid;
  v_tip         text;
  v_takip       text;
begin
  -- Çağıran daima oturum sahibi olmalı; cross-user yazımı engelle.
  if auth.uid() is null or auth.uid() <> p_kullanici_id then
    raise exception 'Yetkisiz: kullanici_id oturumla eşleşmiyor' using errcode = '42501';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items boş veya dizi değil' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_tip      := v_item->>'type';
    v_paket_id := case when v_tip = 'package' then (v_item->>'id')::uuid else null end;
    v_takip    := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

    insert into public.rezervasyonlar (
      kullanici_id, paket_id, tarih, durum,
      takip_kodu, grup_kodu,
      item_tipi, item_isim, item_detay, item_fiyat,
      erisilebilirlik,
      alici_ad, alici_email, alici_telefon
    ) values (
      p_kullanici_id,
      v_paket_id,
      p_tarih,
      'beklemede',
      v_takip,
      p_grup_kodu,
      v_tip,
      v_item->>'name',
      v_item->>'detail',
      (v_item->>'lineTotal')::numeric,
      p_erisilebilirlik,
      p_alici_ad,
      p_alici_email,
      p_alici_telefon
    )
    returning id into v_rez_id;

    return query
      select * from public.rezervasyonlar where id = v_rez_id;
  end loop;
end;
$$;

revoke all on function public.process_checkout_cart(uuid, text, date, jsonb, jsonb, text, text, text) from public;
grant execute on function public.process_checkout_cart(uuid, text, date, jsonb, jsonb, text, text, text) to authenticated;
