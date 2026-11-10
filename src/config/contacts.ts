/** Set the real studio contact before public launch. Leave empty until confirmed. */
export const contacts = {
  telegramUsername: 'takto_order',
  email: '',
  region: 'Узбекистан',
} as const;

export function getTelegramUrl(): string | null {
  const username = String(contacts.telegramUsername).trim().replace(/^@/, '');
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username) ? `https://t.me/${username}` : null;
}
