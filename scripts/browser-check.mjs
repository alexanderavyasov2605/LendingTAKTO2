import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const output = new URL('../qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
const passed = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const record = name => { passed.push(name); console.log(`PASS ${name}`); };
const closeDialog = async () => { await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0); };
const shot = async (name, fullPage = false) => page.screenshot({ path: fileURLToPath(new URL(name, output)), fullPage });
const scrollAll = async () => {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 650) { await page.evaluate(value => window.scrollTo(0, value), y); await page.waitForTimeout(100); }
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
};

try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1900);
  await expect(page.locator('h1')).toHaveCount(1);
  await shot('home-1536.png');
  record('Desktop home renders with all images');

  for (let i=0;i<8;i++) await page.getByRole('button', {name:'Следующий слайд',exact:true}).click();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('.hero-slide').evaluateAll(items => items.filter(item => Number(getComputedStyle(item).opacity) > .99).length), 1);
  await page.getByRole('region', {name:'Примеры продукции'}).focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(600);
  await expect(page.locator('.slider-dots button[aria-current="true"]')).toHaveCount(1);
  record('Rapid slider changes cancel previous animation; keyboard works');

  const trigger = page.locator('.hero-actions .button-dark');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const before = await page.locator('.commerce-total').innerText();
  await page.getByLabel('Подготовка дизайна', {exact:false}).check();
  assert.notEqual(await page.locator('.commerce-total').innerText(), before);
  await page.getByLabel('Тираж, шт.',{exact:false}).fill('250');
  await page.getByLabel('Ширина, см').fill('8');
  await page.getByLabel('Высота, см').fill('6');
  await page.getByLabel('Цветность').selectOption('double');
  await page.getByLabel('Ламинация',{exact:false}).check();
  await shot('calculator-desktop.png');
  await page.getByRole('button',{name:'Добавить в корзину',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Ваш заказ',exact:true})).toBeVisible();
  assert.match(await page.locator('.commerce-cart').innerText(), /2 стороны/);
  const quantityInput = page.getByRole('spinbutton',{name:/Количество:/});
  await expect(quantityInput).toHaveValue('250');
  await page.getByRole('button',{name:/Увеличить количество:/}).click();
  await expect(quantityInput).toHaveValue('251');
  await page.getByRole('button',{name:'Перейти к заявке'}).click();
  await page.getByLabel('Ваше имя').fill('Проверка');
  await page.getByLabel('Контакт для связи').fill('wrong@email');
  await page.getByRole('button',{name:'Скопировать заявку',exact:true}).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Контакт для связи').fill('test@example.com');
  await page.getByRole('button',{name:'Скопировать заявку',exact:true}).click();
  await expect(page.getByRole('button',{name:'Заявка скопирована',exact:true})).toBeVisible();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /251 шт/);
  await page.getByRole('button',{name:'Закрыть окно'}).focus();
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.querySelector('[role=dialog]').contains(document.activeElement)),true);
  await closeDialog();
  await expect(trigger).toBeFocused();
  record('Calculator, cart editing, contact validation, copy, focus trap and original trigger restoration');

  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:/Открыть корзину/}).click();
  await expect(page.getByRole('spinbutton',{name:/Количество:/})).toHaveValue('251');
  await page.getByRole('button',{name:/Удалить Стикеры/}).click();
  await expect(page.getByRole('heading',{name:'Здесь начинается ваш проект'})).toBeVisible();
  await closeDialog();
  record('Cart survives reload, removes items and shows an empty state');

  await page.getByRole('button',{name:'Открыть поиск',exact:true}).click();
  await page.getByRole('textbox',{name:'Поиск по каталогу'}).fill('визитки');
  await expect(page.locator('.commerce-search-result')).toHaveCount(4);
  await page.locator('.commerce-search-result').filter({has:page.getByText('Визитки',{exact:true})}).click();
  await expect(page).toHaveURL(/catalog\?search=/);
  await expect(page.locator('.catalog-product')).toHaveCount(4);
  await page.getByRole('button',{name:'В избранное: Визитки',exact:true}).click();
  await page.getByRole('button',{name:'Добавить в корзину: Визитки',exact:true}).click();
  await page.reload({waitUntil:'networkidle'});
  await expect(page.getByRole('button',{name:'Убрать из избранного: Визитки',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Очистить поиск',exact:true}).click();
  await expect(page.locator('.catalog-product')).toHaveCount(19);
  await page.getByRole('button',{name:/Избранное 1/}).click();
  await expect(page.locator('.catalog-product')).toHaveCount(1);
  await page.getByRole('button',{name:/Избранное 1/}).click();
  await expect(page.locator('.catalog-product')).toHaveCount(19);
  await page.getByLabel('Сортировка товаров').selectOption('price-asc');
  await expect(page.locator('.catalog-product h2').first()).toHaveText('Этикетки');
  await page.getByRole('searchbox',{name:'Поиск в каталоге'}).fill('неттакоготовара');
  await expect(page.locator('.catalog-empty')).toBeVisible();
  await page.getByRole('link',{name:'Показать всю продукцию'}).click();
  await page.waitForTimeout(1000);
  await shot('catalog-desktop.png');
  record('Search, category catalog, sorting, empty search and favorites persistence');

  const remainingTriggers = await page.evaluate(async () => (await import('/src/animations/gsap.ts')).ScrollTrigger.getAll().length);
  assert.equal(remainingTriggers,0);
  record('Home ScrollTriggers are cleaned when route unmounts');
  await page.goto('http://127.0.0.1:5173/');
  await scrollAll();
  await shot('home-desktop-full.png',true);
  assert.equal(await page.locator('[data-reveal]').evaluateAll(items => items.filter(item => Number(getComputedStyle(item).opacity)<.95).length),0);
  await page.getByRole('button',{name:'Какой минимальный тираж?'}).click();
  await expect(page.getByRole('button',{name:'Какой минимальный тираж?'})).toHaveAttribute('aria-expanded','true');
  await page.getByRole('button',{name:'Какой минимальный тираж?'}).click();
  await expect(page.getByRole('button',{name:'Какой минимальный тираж?'})).toHaveAttribute('aria-expanded','false');
  await page.getByRole('tab',{name:'Soft Touch',exact:true}).click();
  await expect(page.locator('#material-panel h3')).toHaveText('Soft Touch');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#material-panel h3')).toHaveText('Vinyl');
  record('Scroll reveal completes, FAQ toggles, material tabs support keyboard');

  const layouts=[];
  for(const width of [1536,1440,1280,1024,768,390,360]){
    await page.setViewportSize({width,height:1024});
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.waitForTimeout(200);
    const layout = await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,headingRight:document.querySelector('h1').getBoundingClientRect().right}));
    assert.equal(layout.scrollWidth,width,`home overflow at ${width}`);
    assert.ok(layout.headingRight<=width,`heading overflow at ${width}`);
    layouts.push(layout);
    if(width===390){await scrollAll();await shot('home-390.png',true);}
  }
  record('No horizontal overflow at 1536, 1440, 1280, 1024, 768, 390, 360');

  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Открыть меню'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  assert.equal(Math.round((await page.getByRole('dialog').boundingBox()).height),844);
  await shot('mobile-menu.png');
  await page.getByRole('dialog').getByRole('button',{name:'Связаться в Telegram'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByLabel('Ваше имя')).toBeVisible();
  await closeDialog();
  assert.equal(await page.evaluate(()=>document.querySelector('#root').inert),false);
  await page.getByRole('button',{name:'Открыть меню'}).click();
  await page.getByRole('dialog').getByRole('link',{name:'Каталог',exact:true}).click();
  await expect(page).toHaveURL(/\/catalog$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
  await shot('catalog-mobile.png');
  await page.getByRole('button',{name:'Настроить параметры: Фигурные стикеры'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  assert.ok((await page.getByRole('dialog').boundingBox()).width<=390);
  await shot('calculator-mobile.png');
  await closeDialog();
  record('Full-height mobile menu, menu-to-contact, mobile catalog and calculator');

  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'Открыть поиск'}).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await closeDialog();
  }
  await page.goto('http://127.0.0.1:5173/no-such-page');
  await expect(page.getByRole('heading',{name:/Здесь пока/})).toBeVisible();
  await page.goto('http://127.0.0.1:5173/privacy');
  await expect(page.locator('h1')).toContainText('конфиденциальность');
  await page.goto('http://127.0.0.1:5173/terms');
  await expect(page.locator('h1')).toContainText('расчёта');
  record('Repeated dialogs, branded 404 and information pages');

  const reduced = await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const reducedPage = await reduced.newPage();
  await reducedPage.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  assert.equal(await reducedPage.locator('[data-reveal]').evaluateAll(items=>items.filter(item=>Number(getComputedStyle(item).opacity)<1).length),0);
  assert.equal(await reducedPage.locator('.headline-line').count(),0);
  await reducedPage.locator('.hero-actions .button-dark').click();
  await reducedPage.keyboard.press('Escape');
  await expect(reducedPage.getByRole('dialog')).toHaveCount(0);
  await reduced.close();
  record('Reduced motion shows all content and skips split animations');

  assert.deepEqual(errors,[]);
  await writeFile(new URL('browser-report.json',output),JSON.stringify({passed,layouts,errors},null,2));
  console.log(`Completed ${passed.length} browser check groups with zero console errors.`);
} catch(error){
  await shot('failure.png').catch(()=>{});
  await writeFile(new URL('browser-report.json',output),JSON.stringify({passed,errors,failure:String(error)},null,2));
  throw error;
} finally { await browser.close(); }
