import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
export function Modal({ title, eyebrow, onClose, children, wide = false, fullHeight = false, viewKey = title }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; wide?: boolean; fullHeight?: boolean; viewKey?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const closing = useRef(false);
  const backdropPointerDown = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const titleId = useId();
  closeRef.current = onClose;
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { closeRef.current(); return; }
    timeline.current?.kill();
    timeline.current = gsap.timeline({ onComplete: () => closeRef.current() }).to(panel.current, fullHeight ? { opacity: 0, x: 24, duration: .16 } : { opacity: 0, y: 10, duration: .16 }).to(root.current, { opacity: 0, duration: .12 }, 0);
  }, [fullHeight]);
  useGSAP(() => {
    closing.current = false;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      timeline.current = gsap.timeline({ defaults: { ease: 'power2.out' } }).from(root.current, { opacity: 0, duration: .2 }).from(panel.current, fullHeight ? { x: 24, opacity: 0, duration: .28 } : { y: 14, opacity: 0, duration: .25 }, 0);
      const fields = root.current?.querySelectorAll('.commerce-field');
      if (fields?.length) timeline.current.from(fields, { y: 8, opacity: 0, duration: .25, stagger: .025 }, .12);
      if (fullHeight) {
        const links = root.current?.querySelectorAll('.mobile-nav > a');
        if (links?.length) timeline.current.from(links, { y: 24, opacity: 0, duration: .3, stagger: .06 }, .08);
      }
    });
    return () => { timeline.current?.kill(); media.revert(); };
  }, { scope: root, dependencies: [viewKey, fullHeight], revertOnUpdate: true });
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    const outsideElements = Array.from(document.body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== root.current && !element.contains(root.current));
    const originalInert = outsideElements.map(element => element.inert);
    document.body.style.overflow = 'hidden';
    outsideElements.forEach(element => { element.inert = true; });
    panel.current?.focus({ preventScroll: true });
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]') ?? []).filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length > 0);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const elements = focusable(); const first = elements[0]; const last = elements[elements.length - 1];
        if (!first) { event.preventDefault(); return; }
        const focusIsOutside = !panel.current?.contains(document.activeElement);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current || focusIsOutside)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel.current || focusIsOutside)) { event.preventDefault(); first.focus(); }
      }
    };
    const containFocus = (event: FocusEvent) => { if (event.target instanceof Node && !panel.current?.contains(event.target)) panel.current?.focus({ preventScroll: true }); };
    document.addEventListener('keydown', handleKey); document.addEventListener('focusin', containFocus);
    return () => {
      document.body.style.overflow = originalOverflow;
      outsideElements.forEach((element, index) => { element.inert = originalInert[index]; });
      document.removeEventListener('keydown', handleKey); document.removeEventListener('focusin', containFocus);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [close]);
  useEffect(() => {
    // Keep the initial page trigger while moving between steps of the same dialog.
    panel.current?.focus({ preventScroll: true });
    if (panel.current) panel.current.scrollTop = 0;
  }, [viewKey]);
  return createPortal(<div className="commerce-overlay" ref={root} onPointerDown={event => { backdropPointerDown.current = event.target === event.currentTarget; }} onPointerCancel={() => { backdropPointerDown.current = false; }} onClick={event => { if (backdropPointerDown.current && event.target === event.currentTarget) close(); backdropPointerDown.current = false; }}>
    <div className={`commerce-modal ${wide ? 'commerce-modal--wide' : ''} ${fullHeight ? 'commerce-modal--full-height' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={panel}>
      <header className="commerce-modal-header"><div>{eyebrow && <p className="commerce-eyebrow">{eyebrow}</p>}<h2 id={titleId}>{title}</h2></div><button className="commerce-icon-button" type="button" aria-label="Закрыть окно" onClick={close}><X size={21} strokeWidth={1.5}/></button></header>
      {children}
    </div>
  </div>, document.body);
}
