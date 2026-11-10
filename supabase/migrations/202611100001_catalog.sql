begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.catalog_admin (
  user_id uuid primary key references auth.users(id) on delete cascade,
  singleton boolean not null default true unique check (singleton)
);
revoke all on private.catalog_admin from public, anon, authenticated;
alter table private.catalog_admin enable row level security;

create function public.is_catalog_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.catalog_admin where user_id = (select auth.uid()));
$$;
revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 150),
  slug text not null unique,
  sort_order integer not null default 0
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (length(slug) between 1 and 150),
  sku text not null default '',
  title text not null check (length(trim(title)) between 1 and 200),
  short_description text not null default '' check (length(short_description) <= 500),
  description text not null default '' check (length(description) <= 20000),
  category_id uuid not null references public.categories(id),
  price numeric(14,2) check (price > 0),
  price_unit text not null default 'piece' check (price_unit in ('piece','sheet','kit','set','linear_meter','square_meter','project','request')),
  price_status text not null default 'on_request' check (price_status in ('fixed','on_request')),
  specifications jsonb not null default '{}' check (jsonb_typeof(specifications) = 'object'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint consistent_price check (
    (price_status = 'fixed' and price is not null and price_unit <> 'request') or
    (price_status = 'on_request' and price is null)
  )
);
create unique index products_sku_unique on public.products(sku) where sku <> '';
create index products_catalog_idx on public.products(status, category_id, created_at desc, id);
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null default '' check (length(alt_text) <= 500),
  is_cover boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  constraint image_path_matches_product check (
    storage_path ~ ('^' || product_id::text || '/[0-9a-f-]+\.(webp|jpg|jpeg|png)$')
  )
);
create unique index product_images_one_cover on public.product_images(product_id) where is_cover;
create index product_images_product_idx on public.product_images(product_id, sort_order);

create function public.touch_catalog_product() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id <> old.id or new.slug <> old.slug then
    raise exception 'Product ID and slug are permanent' using errcode = '23514';
  end if;
  new.created_at := old.created_at;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
create trigger products_updated before update on public.products for each row execute function public.touch_catalog_product();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
grant select on public.categories, public.products, public.product_images to anon, authenticated;
grant insert, update, delete on public.products, public.product_images to authenticated;
revoke insert, update, delete on public.categories from anon, authenticated;
revoke insert, update, delete on public.products, public.product_images from anon;
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy products_read on public.products for select to anon, authenticated
  using (status = 'published' or (select public.is_catalog_admin()));
create policy products_admin_insert on public.products for insert to authenticated with check ((select public.is_catalog_admin()));
create policy products_admin_update on public.products for update to authenticated using ((select public.is_catalog_admin())) with check ((select public.is_catalog_admin()));
create policy products_admin_delete on public.products for delete to authenticated using ((select public.is_catalog_admin()));
create policy images_read on public.product_images for select to anon, authenticated using (
  (select public.is_catalog_admin()) or exists(select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy images_admin_insert on public.product_images for insert to authenticated with check ((select public.is_catalog_admin()));
create policy images_admin_update on public.product_images for update to authenticated using ((select public.is_catalog_admin())) with check ((select public.is_catalog_admin()));
create policy images_admin_delete on public.product_images for delete to authenticated using ((select public.is_catalog_admin()));

-- Private bucket: public buckets bypass SELECT policies when serving files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', false, 8388608, array['image/jpeg','image/png','image/webp']);
create policy catalog_storage_read on storage.objects for select to anon, authenticated using (
  bucket_id = 'product-images' and (
    (select public.is_catalog_admin()) or exists (
      select 1 from public.product_images i join public.products p on p.id = i.product_id
      where i.storage_path = name and p.status = 'published'
    )
  )
);
create policy catalog_storage_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'product-images' and (select public.is_catalog_admin())
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(webp|jpg|jpeg|png)$'
);
create policy catalog_storage_delete on storage.objects for delete to authenticated using (
  bucket_id = 'product-images' and (select public.is_catalog_admin())
  and not exists(select 1 from public.product_images i where i.storage_path = name)
);
-- Uploads use unique names, never overwrite another product's file.

-- Atomic product + gallery save; caller's RLS remains in force.
create function public.save_catalog_product(p_product jsonb, p_images jsonb, p_expected_updated_at timestamptz default null)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_product_id uuid := (p_product->>'id')::uuid;
  current_product public.products;
  image jsonb;
  found_existing boolean;
begin
  if not public.is_catalog_admin() then raise exception 'Administrator required' using errcode = '42501'; end if;
  if jsonb_typeof(p_images) <> 'array' then raise exception 'Images must be an array'; end if;
  if jsonb_array_length(p_images) > 0 and
    (select count(*) from jsonb_array_elements(p_images) x where (x->>'is_cover')::boolean) <> 1
  then raise exception 'Exactly one cover is required' using errcode = '23514'; end if;
  select * into current_product from public.products where id = v_product_id for update;
  found_existing := found;
  if found_existing and (p_expected_updated_at is null or current_product.updated_at <> p_expected_updated_at) then
    raise exception 'Concurrent edit' using errcode = '40001';
  end if;
  if not found_existing and p_expected_updated_at is not null then
    raise exception 'Product was deleted' using errcode = '40001';
  end if;
  if found_existing then
    update public.products set title = p_product->>'title', sku = coalesce(p_product->>'sku',''),
      short_description = coalesce(p_product->>'short_description',''), description = coalesce(p_product->>'description',''),
      category_id = (p_product->>'category_id')::uuid, price = (p_product->>'price')::numeric,
      price_unit = p_product->>'price_unit', price_status = p_product->>'price_status',
      specifications = coalesce(p_product->'specifications','{}'), status = p_product->>'status'
    where id = v_product_id returning * into current_product;
  else
    insert into public.products(id,slug,sku,title,short_description,description,category_id,price,price_unit,price_status,specifications,status)
    values (v_product_id,p_product->>'slug',coalesce(p_product->>'sku',''),p_product->>'title',coalesce(p_product->>'short_description',''),
      coalesce(p_product->>'description',''),(p_product->>'category_id')::uuid,(p_product->>'price')::numeric,
      p_product->>'price_unit',p_product->>'price_status',coalesce(p_product->'specifications','{}'),p_product->>'status')
    returning * into current_product;
  end if;
  delete from public.product_images where product_id = v_product_id;
  for image in select * from jsonb_array_elements(p_images) loop
    if not exists(select 1 from storage.objects where bucket_id = 'product-images' and name = image->>'storage_path') then
      raise exception 'Image has not been uploaded' using errcode = '23514';
    end if;
    insert into public.product_images(id,product_id,storage_path,alt_text,is_cover,sort_order)
      values ((image->>'id')::uuid,v_product_id,image->>'storage_path',coalesce(image->>'alt_text',''),(image->>'is_cover')::boolean,(image->>'sort_order')::integer);
  end loop;
  return to_jsonb(current_product);
end;
$$;
revoke all on function public.save_catalog_product(jsonb,jsonb,timestamptz) from public, anon;
grant execute on function public.save_catalog_product(jsonb,jsonb,timestamptz) to authenticated;

insert into public.categories(name,slug,sort_order) values
  ('Стикеры','stickers',1), ('Этикетки','labels',2), ('Упаковка','packaging',3), ('Бирки и ярлыки','tags',4),
  ('Карточки и полиграфия','cards',5), ('Фирменные ленты','ribbons',6), ('Винил и витрины','vinyl',7), ('Специальная продукция','special',8);
-- Intentionally no products or admin credentials seeded.
commit;
