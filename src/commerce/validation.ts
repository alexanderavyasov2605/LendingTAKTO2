/** Accept a usable email, phone number, or Telegram username without guessing the channel. */
export function isValidContact(value: string): boolean {
  const contact = value.trim();
  if (/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(contact)) return true;
  if (/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(contact)) return true;
  const digitCount = contact.replace(/\D/g, '').length;
  return /^\+?[\d\s().-]+$/.test(contact) && digitCount >= 7 && digitCount <= 15;
}
