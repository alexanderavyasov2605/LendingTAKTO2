import { type ReactNode } from 'react';
import { Send } from 'lucide-react';
import { useCommerce } from '../commerce';
import { getTelegramUrl } from '../config/contacts';

export function TelegramButton({ className = '', children = 'Связаться в Telegram', beforeOpen }: {className?:string;children?: ReactNode;beforeOpen?:()=>void}) {
  const { openContact } = useCommerce();
  const url = getTelegramUrl();
  const content = <><Send size={22} strokeWidth={1.6}/><span>{children}</span></>;
  return url ? <a className={`telegram-button ${className}`} href={url} target="_blank" rel="noopener noreferrer" onClick={beforeOpen}>{content}</a> : <button className={`telegram-button ${className}`} onClick={() => {beforeOpen?.(); openContact();}}>{content}</button>;
}
