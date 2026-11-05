import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateQuote, defaultQuote, pricing, productBasePrices } from '../src/data/pricing.ts';
import { isValidContact } from '../src/commerce/validation.ts';

test('standard 100-piece sticker estimate stays consistent with the displayed demo offer', () => {
  const quote = calculateQuote(defaultQuote);
  assert.equal(quote.total, 250100);
  assert.equal(quote.unitPrice, 2501);
  assert.equal(quote.total, quote.unitPrice * quote.quantity);
});

test('setup minimum applies to a single small item; design is charged once per order', () => {
  assert.equal(calculateQuote({ ...defaultQuote, quantity: 1 }).total, pricing.minimumTotal);
  for (const quantity of [100, 500, 1000]) {
    const base = calculateQuote({ ...defaultQuote, quantity });
    const withDesign = calculateQuote({ ...defaultQuote, quantity, design: true });
    assert.equal(withDesign.total - base.total, pricing.designFee);
  }
});

test('bulk discounts reduce unit prices without applying a discount to finishing services', () => {
  const small = calculateQuote({ ...defaultQuote, quantity: 100 });
  const large = calculateQuote({ ...defaultQuote, quantity: 1000 });
  assert.ok(large.unitPrice < small.unitPrice);
  for (const quantity of [100, 1000]) {
    const base = calculateQuote({ ...defaultQuote, quantity });
    const laminated = calculateQuote({ ...defaultQuote, quantity, lamination: true });
    assert.equal(laminated.total - base.total, pricing.laminationPerUnit * quantity);
  }
});

test('material, printing area, colour, assembly and urgency each change the quote', () => {
  const base = calculateQuote(defaultQuote).total;
  for (const change of [{ materialId: 'holographic' }, { width: 10 }, { color: 'double' }, { assembly: true }, { urgent: true }]) {
    assert.ok(calculateQuote({ ...defaultQuote, ...change }).total > base, JSON.stringify(change));
  }
  assert.ok(calculateQuote({ ...defaultQuote, color: 'mono' }).total < base);
  assert.ok(calculateQuote({ ...defaultQuote, dieCut: false }).total < base);
});

test('invalid and extreme numerical inputs produce a finite bounded estimate', () => {
  for (const value of [0, -10, NaN, Infinity, -Infinity, 100000000]) {
    const quote = calculateQuote({ ...defaultQuote, quantity: value, width: value, height: value });
    assert.ok(Number.isFinite(quote.total));
    assert.ok(quote.quantity >= 1 && quote.quantity <= 100000);
    assert.ok(quote.width >= 1 && quote.width <= 300);
    assert.ok(quote.height >= 1 && quote.height <= 300);
  }
  assert.equal(calculateQuote({ ...defaultQuote, quantity: 1.4 }).quantity, 1);
});

test('unknown material/category fall back safely and every catalog price is usable', () => {
  for (const categoryId of ['missing', 'constructor', '__proto__']) {
    assert.equal(calculateQuote({ ...defaultQuote, categoryId, materialId: 'missing' }).total, calculateQuote(defaultQuote).total);
  }
  assert.equal(Object.keys(productBasePrices).length, 19);
  for (const value of Object.values(productBasePrices)) assert.ok(Number.isFinite(value) && value > 0);
});

test('contact validation accepts actionable phone, email and Telegram contacts', () => {
  for (const value of ['+998 90 123-45-67', '(90) 123 45 67', 'hello@example.com', 'name+project@example.co.uk', '@takto_studio', '  hello@example.com  ']) {
    assert.equal(isValidContact(value), true, value);
  }
  for (const value of ['', '   ', 'abc', '123', '@abc', 'name@', 'name@example', 'a b@example.com', '+998 phone 1234567', '1234567890123456']) {
    assert.equal(isValidContact(value), false, value);
  }
});
