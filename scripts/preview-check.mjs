import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output = new URL('../qa/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1536,height:1024},deviceScaleFactor:1});
const errors=[];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {if(message.type()==='error') errors.push(message.text());});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await page.waitForTimeout(2000);
await page.screenshot({path:fileURLToPath(new URL('home-1536.png',output))});
const layouts=[];
for(const width of [1536,1440,1280,1024,768,390,360]){
  await page.setViewportSize({width,height:1024});
  await page.waitForTimeout(300);
  layouts.push(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,brokenImages:[...document.images].filter(img=>img.complete&&img.naturalWidth===0).map(img=>img.src),heading:document.querySelector('h1').getBoundingClientRect().toJSON()})));
  if(width===390) await page.screenshot({path:fileURLToPath(new URL('home-390.png',output)),fullPage:true});
}
await writeFile(new URL('layout-report.json',output),JSON.stringify({layouts,errors},null,2));
console.log(JSON.stringify({layouts,errors},null,2));
await browser.close();
