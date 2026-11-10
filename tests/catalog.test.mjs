import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emptySpecifications, makeSlug, productPrice, productSummary, sampleProducts } from '../src/catalog/model.ts';
import { readyKits, businessPlans, commercialTermsConfirmed, subscriptionTerms } from '../src/config/offers.ts';

const product = (id, extra = {}) => ({ id, slug:id, title:'Этикетка', sku:'SKU-1', status:'published', price:null, price_status:'on_request', price_unit:'piece', specifications:emptySpecifications(), product_images:[{ id:`image-${id}`, url:`https://example.invalid/${id}`, is_cover:true }], ...extra });
test('missing prices never display zero; each supported price unit is preserved', () => {
  for (const price of [null, 0]) assert.equal(productPrice(product('1', { price })), 'По запросу');
  assert.equal(productPrice(product('1', { price:15000, price_status:'fixed', price_unit:'linear_meter' })), '15 000 сум / пог. м');
  assert.equal(productPrice(product('1', { price:15000, price_status:'fixed', price_unit:'request' })), 'По запросу');
});
test('carousel excludes unpublished/missing photos and never duplicates or mutates input', () => {
  const input = [product('1'), product('2'), product('1'), product('draft', { status:'draft' }), product('archived', { status:'archived' }), product('no-photo',{ product_images:[] })];
  const before = structuredClone(input); const selected = sampleProducts(input,8,() => .4);
  assert.deepEqual(new Set(selected.map(p => p.id)), new Set(['1','2'])); assert.deepEqual(input,before);
  assert.deepEqual(sampleProducts([]),[]); assert.equal(sampleProducts([product('only')]).length,1);
  assert.equal(sampleProducts(Array.from({length:50},(_,i) => product(String(i)))).length,8);
});
test('product inquiry carries identity, quantity, options and request pricing', () => {
  const summary = productSummary(product('uuid'),75,{'Материал':'Матовый','Размер':'5×5'});
  for (const value of ['ID: uuid','Артикул: SKU-1','Количество: 75','Материал: Матовый','Размер: 5×5','По запросу']) assert.ok(summary.includes(value),value);
  assert.ok(makeSlug('Новая этикетка','uuid').endsWith('-uuid'));
});
test('commercial configuration matches the supplied brief without automatic sales', () => {
  assert.deepEqual(readyKits.map(k => k.price),[149000,329000,1190000,490000,720000]);
  assert.deepEqual(businessPlans.map(p => p.price),[179000,289000,409000]);
  assert.deepEqual(subscriptionTerms,[3,6,12]); assert.equal(commercialTermsConfirmed,false);
});
