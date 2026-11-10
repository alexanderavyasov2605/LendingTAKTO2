import { readFile } from 'node:fs/promises';

// Public API probes only. Does not accept, log, or use a service-role key.
const env = { ...process.env };
try { for (const line of (await readFile('.env.local','utf8')).split(/\r?\n/)) { const match = line.match(/^([A-Z_]+)=(.*)$/); if (match) env[match[1]] = match[2].trim(); } } catch {}
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key || key.startsWith('sb_secret_')) throw new Error('Set the public Supabase URL/key in .env.local.');
let failed = false;
for (const [name, route, method, body] of [
  ['categories', '/rest/v1/categories?select=id,name,slug&order=sort_order', 'GET'],
  ['published products', '/rest/v1/products?select=id,slug,status&status=eq.published&limit=1', 'GET'],
  ['anonymous admin role', '/rest/v1/rpc/is_catalog_admin', 'POST', '{}'],
]) {
  const response = await fetch(url + route, { method, headers: { apikey:key, 'Content-Type':'application/json' }, body, signal:AbortSignal.timeout(15000) });
  const data = await response.json();
  const okay = response.ok && (name !== 'anonymous admin role' || data === false);
  if (!okay) failed = true;
  console.log(JSON.stringify({check:name,status:response.status,passed:okay,result:Array.isArray(data) ? {count:data.length} : typeof data === 'boolean' ? data : {code:data.code,message:data.message}}));
}
process.exitCode = failed ? 1 : 0;
