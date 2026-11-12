import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Send, X } from 'lucide-react';
import launchArtwork from './assets/takto-launch.png';
import styles from './LaunchModal.module.css';

const LAUNCH_AT = Date.parse('2027-01-10T00:00:00+05:00');
const SESSION_KEY = 'takto:launch:2027-01-10:dismissed';
const TELEGRAM_URL = 'https://t.me/takto_order';
let dismissedInMemory = false;

function secondsUntilLaunch(now = Date.now()) {
  return Math.max(0, Math.ceil((LAUNCH_AT - now) / 1000));
}

function wasDismissed() {
  if (dismissedInMemory) return true;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberDismissal() {
  dismissedInMemory = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Keep dismissal across SPA navigation when browser storage is unavailable.
  }
}

export function LaunchModal({ onAfterClose }: { onAfterClose?: () => void }) {
  const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed');
  const [remaining, setRemaining] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissing = useRef(false);
  const backdropPress = useRef(false);
  const afterClose = useRef(onAfterClose);
  const titleId = useId();
  const descriptionId = useId();
  const isOpen = phase !== 'closed';

  useEffect(() => { afterClose.current = onAfterClose; }, [onAfterClose]);

  useEffect(() => {
    const seconds = secondsUntilLaunch();
    if (seconds > 0 && !wasDismissed()) {
      setRemaining(seconds);
      setPhase('open');
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    if (secondsUntilLaunch() === 0) {
      setPhase('closed');
      return;
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const html = document.documentElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
    const bodyPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    const bodyProperties = ['position', 'top', 'left', 'width', 'overflow', 'padding-right'] as const;
    const savedBody = bodyProperties.map(property => ({ property, value: body.style.getPropertyValue(property), priority: body.style.getPropertyPriority(property) }));
    const savedOverflow = html.style.getPropertyValue('overflow');
    const savedOverflowPriority = html.style.getPropertyPriority('overflow');

    if (!dialog.open) dialog.showModal();
    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.left = `${-scrollX}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${bodyPadding + scrollbarWidth}px`;
    html.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    let stopped = false;
    let tickTimer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (stopped) return;
      clearTimeout(tickTimer);
      const now = Date.now();
      const seconds = secondsUntilLaunch(now);
      setRemaining(seconds);
      if (seconds === 0) {
        // Expiry closes immediately, without persisting a user dismissal.
        setPhase('closed');
        return;
      }
      tickTimer = setTimeout(tick, Math.min(1000, LAUNCH_AT - now));
    };
    const resync = () => {
      if (document.visibilityState === 'visible') tick();
    };
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishExit = () => {
      if (preference.matches && dismissing.current) setPhase('closed');
    };
    tick();
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('focus', resync);
    preference.addEventListener('change', finishExit);

    return () => {
      stopped = true;
      clearTimeout(tickTimer);
      if (exitTimer.current !== null) clearTimeout(exitTimer.current);
      exitTimer.current = null;
      dismissing.current = false;
      backdropPress.current = false;
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('focus', resync);
      preference.removeEventListener('change', finishExit);
      if (dialog.open) dialog.close();
      savedBody.forEach(({ property, value, priority }) => {
        if (value) body.style.setProperty(property, value, priority);
        else body.style.removeProperty(property);
      });
      if (savedOverflow) html.style.setProperty('overflow', savedOverflow, savedOverflowPriority);
      else html.style.removeProperty('overflow');
      const scrollBehavior = html.style.getPropertyValue('scroll-behavior');
      const scrollPriority = html.style.getPropertyPriority('scroll-behavior');
      html.style.setProperty('scroll-behavior', 'auto', 'important');
      window.scrollTo(scrollX, scrollY);
      if (scrollBehavior) html.style.setProperty('scroll-behavior', scrollBehavior, scrollPriority);
      else html.style.removeProperty('scroll-behavior');
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      if (dialog.isConnected) afterClose.current?.();
    };
  }, [isOpen]);

  const dismiss = () => {
    if (!dialogRef.current?.open || dismissing.current) return;
    rememberDismissal();
    dismissing.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('closed');
      return;
    }
    setPhase('closing');
    exitTimer.current = setTimeout(() => setPhase('closed'), 240);
  };

  const isOutside = (x: number, y: number) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    return !!rect && (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom);
  };
  const units = [
    { label: 'дни', value: Math.floor(remaining / 86400) },
    { label: 'часы', value: Math.floor(remaining / 3600) % 24 },
    { label: 'минуты', value: Math.floor(remaining / 60) % 60 },
    { label: 'секунды', value: remaining % 60 },
  ];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      data-state={phase}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); dismiss(); }}
      onPointerDown={event => { backdropPress.current = event.target === event.currentTarget && isOutside(event.clientX, event.clientY); }}
      onPointerCancel={() => { backdropPress.current = false; }}
      onClick={event => {
        if (backdropPress.current && event.target === event.currentTarget && isOutside(event.clientX, event.clientY)) dismiss();
        backdropPress.current = false;
      }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <button ref={closeRef} className={styles.close} type="button" aria-label="Закрыть окно запуска студии" onClick={dismiss}>
        <X size={28} strokeWidth={1.5} aria-hidden="true"/>
      </button>
      <div className={styles.panel}>
        <div className={styles.artwork} aria-hidden="true">
          <img src={launchArtwork} alt="" width="1536" height="1024" decoding="async"/>
        </div>
        <div className={styles.content}>
          <div className={styles.topline}>
            <span className={styles.wordmark} aria-hidden="true">TAKTO.</span>
            <span className={styles.badge}><span aria-hidden="true"/>СКОРО ОТКРЫТИЕ</span>
          </div>
          <h2 className={styles.title} id={titleId}>
            <span>ЗАПУСК</span>
            <span>СТУДИИ <span className={styles.brandAccent}>TAKTO.</span></span>
          </h2>
          <p className={styles.description} id={descriptionId}>Печать, упаковка и брендирование с характером.</p>
          <time className={styles.date} dateTime="2027-01-10T00:00:00+05:00">
            <CalendarDays size={20} strokeWidth={1.7} aria-hidden="true"/>
            <span>Старт: <strong>10 января 2027</strong></span>
          </time>
          <div className={styles.countdown} role="timer" aria-label="До запуска студии" aria-live="off">
            <dl className={styles.timer}>
              {units.map(unit => <div className={styles.unit} key={unit.label}>
                <dt>{unit.label}</dt>
                <dd>{String(unit.value).padStart(2, '0')}</dd>
              </div>)}
            </dl>
          </div>
          <a className={styles.cta} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={dismiss}>
            <Send size={24} strokeWidth={1.6} aria-hidden="true"/>
            <span>Следить за запуском в Telegram</span>
            <ArrowRight className={styles.ctaArrow} size={22} strokeWidth={1.6} aria-hidden="true"/>
          </a>
        </div>
      </div>
    </dialog>
  );
}
