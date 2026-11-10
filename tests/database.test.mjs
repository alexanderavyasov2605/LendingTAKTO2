import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Execute the real migration in PostgreSQL WASM. Only Supabase-managed schemas
// are stubbed; product tables, RPC, grants, triggers and RLS are the shipped SQL.
test('catalog migration and authorization lifecycle in PostgreSQL', async t => {
  const db = new PGlite();
  const admin = '10000000-0000-0000-0000-000000000001';
  const other = '10000000-0000-0000-0000-000000000002';
  const id = '20000000-0000-0000-0000-000000000001';
  const image1 = '30000000-0000-0000-0000-000000000001';
  const image2 = '30000000-0000-0000-0000-000000000002';
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth; create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated;
      create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;`);
    await db.exec(await readFile(new URL('../supabase/migrations/202611100001_catalog.sql',import.meta.url),'utf8'));
    await db.query('insert into auth.users(id) values ($1),($2)',[admin,other]);
    await db.query('insert into private.catalog_admin(user_id) values ($1)',[admin]);
    const role = async (name,uid='') => { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]); await db.exec(`set role ${name}`); };
    const count = async table => Number((await db.query(`select count(*)::int n from ${table}`)).rows[0].n);
    const category = (await db.query('select id from public.categories order by sort_order limit 1')).rows[0].id;
    let p = { id,slug:'test-product',title:'Тестовая карточка',sku:'',short_description:'',description:'',category_id:category,price:null,price_unit:'piece',price_status:'on_request',specifications:{},status:'draft' };
    let images = [image1,image2].map((image,index) => ({id:image,storage_path:`${id}/${image}.webp`,alt_text:`Фото ${index+1}`,is_cover:index===0,sort_order:index}));
    const save = async (product=p,photos=images,expected=p.updated_at ?? null) => (await db.query('select public.save_catalog_product($1::jsonb,$2::jsonb,$3::timestamptz) p',[JSON.stringify(product),JSON.stringify(photos),expected])).rows[0].p;
    await t.test('starts with eight categories and no seeded products',async () => { assert.equal(await count('public.categories'),8); assert.equal(await count('public.products'),0); assert.equal((await db.query('select public from storage.buckets')).rows[0].public,false); });
    await t.test('anonymous visitors cannot insert, call save, upload or read admin membership',async () => {
      await role('anon'); assert.equal((await db.query('select public.is_catalog_admin() admin')).rows[0].admin,false);
      await assert.rejects(save, /permission denied/); await assert.rejects(() => db.query('insert into public.products(id,slug,title,category_id) values ($1,$2,$3,$4)',[id,'bad','bad',category]), /permission denied/);
      await assert.rejects(() => db.query("insert into storage.objects(bucket_id,name) values ('product-images',$1)",[images[0].storage_path]),/row-level security/);
      await assert.rejects(() => db.query('select * from private.catalog_admin'),/permission denied/);
    });
    await t.test('authenticated non-admin cannot self-promote via metadata or write catalogue',async () => {
      await role('postgres'); await db.query('update auth.users set raw_user_meta_data=$1 where id=$2',[JSON.stringify({role:'admin'}),other]);
      await role('authenticated',other); assert.equal((await db.query('select public.is_catalog_admin() admin')).rows[0].admin,false); await assert.rejects(save,/Administrator required/);
      await assert.rejects(() => db.query('insert into private.catalog_admin(user_id) values ($1)',[other]),/permission denied/);
    });
    await t.test('administrator uploads multiple images and creates a private draft',async () => {
      await role('authenticated',admin);
      for(const image of images) await db.query("insert into storage.objects(bucket_id,name) values ('product-images',$1)",[image.storage_path]);
      p=await save(); assert.equal(p.status,'draft'); assert.equal(await count('public.product_images'),2);
      assert.equal((await db.query('delete from storage.objects returning id')).rows.length,0, 'Referenced files survive cancelled/retried uploads after an ambiguous save response');
      await role('anon'); assert.equal(await count('public.products'),0); assert.equal(await count('public.product_images'),0); assert.equal(await count('storage.objects'),0);
    });
    await t.test('publishing exposes only this product and its image metadata/objects',async () => {
      await role('authenticated',admin); p=await save({...p,status:'published'});
      await role('anon'); assert.equal(await count('public.products'),1); assert.equal(await count('public.product_images'),2); assert.equal(await count('storage.objects'),2);
      assert.equal((await db.query("update storage.objects set name='bad' returning id")).rows.length,0);
    });
    await t.test('non-admin updates and deletes cannot change published data',async () => {
      await role('authenticated',other);
      assert.equal((await db.query("update public.products set title='hacked' returning id")).rows.length,0);
      assert.equal((await db.query('delete from public.products returning id')).rows.length,0);
      assert.equal((await db.query('delete from storage.objects returning id')).rows.length,0);
    });
    await t.test('gallery reorder and cover replacement save atomically',async () => {
      await role('authenticated',admin); images=[{...images[1],is_cover:true,sort_order:0},{...images[0],is_cover:false,sort_order:1}];
      const prior=p.updated_at; p=await save({...p,title:'Отредактировано'});
      assert.equal((await db.query('select id from public.product_images where is_cover')).rows[0].id,image2);
      await assert.rejects(() => save({...p,title:'Stale'},images,prior),/Concurrent edit/);
      await assert.rejects(() => save({...p,title:'Must roll back'},[{...images[0],storage_path:`${id}/40000000-0000-0000-0000-000000000001.webp`}]),/Image has not been uploaded/);
      assert.equal((await db.query('select title from public.products')).rows[0].title,'Отредактировано'); assert.equal(await count('public.product_images'),2);
    });
    await t.test('multiple covers, zero price and slug changes are rejected',async () => {
      await assert.rejects(() => save(p,images.map(i => ({...i,is_cover:true}))),/Exactly one cover/);
      await assert.rejects(() => save({...p,price:0,price_status:'fixed'}),/check constraint/);
      await assert.rejects(() => db.query("update public.products set slug='changed'"),/permanent/);
    });
    await t.test('removed image is no longer publicly accessible; hiding blocks all reads',async () => {
      images=[images[0]]; p=await save();
      await role('anon'); assert.equal(await count('storage.objects'),1);
      await role('authenticated',admin); p=await save({...p,status:'archived'});
      await role('anon'); assert.equal(await count('public.products'),0); assert.equal(await count('storage.objects'),0);
    });
    await t.test('admin can delete; signed-out identity loses privileges',async () => {
      await role('authenticated',admin); await db.exec('delete from public.products; delete from storage.objects;'); assert.equal(await count('public.product_images'),0);
      await role('anon'); assert.equal((await db.query('select public.is_catalog_admin() admin')).rows[0].admin,false);
      await role('postgres'); await assert.rejects(() => db.query('insert into private.catalog_admin(user_id) values ($1)',[other]),/unique constraint/);
    });
  } finally { await db.close(); }
});
