import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown, Layers, Package, Pencil, Star, Truck } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../animations/gsap';
import { TelegramButton } from '../components/TelegramButton';
import { useCommerce } from '../commerce';
import { CatalogShowcase } from '../components/CatalogShowcase';
import { ReadyKits, BusinessPlans } from '../components/Offers';
import { LaunchModal } from './LaunchModal';
import heroImage from '../../Hero.png';
import hero2Image from '../../Hero2.png';
import studioImage from '../../Hero1.png';


const TELEGRAM_URL = 'https://t.me/takto_order';

const slides = [
  {
    image: heroImage,
    alt: 'Коробка TAKTO., голографические наклейки, бирка и визитки',
    label: 'Упаковка с характером'
  },
  {
    image: hero2Image,
    alt: 'Фигурные голографические стикеры TAKTO.',
    label: 'Маленькие детали. Большие эмоции.'
  },
  {
    image: '/assets/windows.webp',
    alt: 'Фирменная графика TAKTO. на стекле витрины',
    label: 'Ваш бренд — в пространстве'
  },
];

const directions = [
  { slug: 'stickers', number: '01', title: 'Маленькая деталь.\nБольшой характер.', label: 'Стикеры и наклейки', image: '/assets/stickers-light.webp', alt: 'Визуальная концепция фигурных стикеров TAKTO.' },
  { slug: 'packaging', number: '02', title: 'Первое впечатление\nначинается с упаковки.', label: 'Упаковка и коробки', image: '/assets/03-packaging.webp', alt: 'Визуальная концепция брендированной упаковки TAKTO.' },
  { slug: 'cards', number: '03', title: 'То, что хочется\nоставить у себя.', label: 'Визитки и карточки', image: '/assets/cards-light.webp', alt: 'Визуальная концепция визиток TAKTO. на фактурной бумаге' },
];

const benefits = [
  { Icon: Pencil, title: 'Дизайн', text: 'и подготовка макетов' },
  { Icon: Layers, title: 'Печать', text: 'на разных материалах' },
  { Icon: Star, title: 'Резка и плоттер', text: '(винил, контур)' },
  { Icon: Box, title: 'Сборка', text: 'и упаковка' },
  { Icon: Truck, title: 'Доставка', text: 'по Узбекистану' },
];
const steps = [
  { n: '01', title: 'Обсуждаем идею', text: 'Расскажите о бренде и задаче. Вместе выберем формат, материал и тираж.' },
  { n: '02', title: 'Создаём дизайн', text: 'Подготовим макет с нуля или проверим ваш. Согласуем каждую деталь до печати.' },
  { n: '03', title: 'Производим', text: 'Печатаем, режем, добавляем отделку. Проверяем цвет, форму и сборку.' },
  { n: '04', title: 'Передаём заказ', text: 'Бережно упакуем готовую продукцию и согласуем удобный способ доставки.' },
];
const faqs = [
  ['Какой минимальный тираж?', 'Он зависит от изделия и технологии. Для части продукции возможны небольшие тиражи и единичные образцы. Укажите количество в заявке — предложим подходящий способ производства.'],
  ['Сколько времени занимает производство?', 'Простые заказы могут быть готовы от одного рабочего дня после согласования макета. Сложная упаковка, отделка и большие тиражи требуют больше времени. Точный срок подтверждаем перед запуском.'],
  ['Можно заказать без готового макета?', 'Да. Поможем с идеей и подготовкой дизайна. Если макет уже есть, проверим размеры, вылеты, шрифты и пригодность для выбранной технологии.'],
  ['Как выбрать материал?', 'Начните с задачи: где будет использоваться изделие, какой нужен эффект и тираж. Покажем варианты и согласуем физический образец, когда это необходимо. Изображения на сайте иллюстрируют идеи оформления.'],
  ['Доставляете по Узбекистану?', 'Способ, стоимость и сроки доставки согласуем индивидуально при оформлении заказа. Стоимость доставки уточняем при обсуждении заказа.'],
  ['Как узнать точную стоимость?', 'Напишите нам в Telegram. Итоговую стоимость рассчитаем после уточнения макета, материала, тиража и дополнительных услуг.'],
];

function HeroSlider() {
  const [active, setActive] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const previous = useRef(0);
  useGSAP((context) => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishTransition = () => {
      if (!preference.matches) return;
      context.add(() => {
        const items = gsap.utils.toArray<HTMLElement>('.hero-slide', container.current);
        gsap.killTweensOf(items);
        items.forEach(item => gsap.set(item, { opacity: item.getAttribute('aria-hidden') === 'false' ? 1 : 0, scale: 1 }));
        const caption = container.current?.querySelector('.slide-caption');
        if (caption) {
          gsap.killTweensOf(caption);
          gsap.set(caption, { clearProps: 'transform,opacity' });
        }
      });
    };
    preference.addEventListener('change', finishTransition);
    return () => preference.removeEventListener('change', finishTransition);
  }, { scope: container });
  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>('.hero-slide', container.current);
    const changed = previous.current !== active;
    gsap.killTweensOf(items);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item, index) => gsap.set(item, { opacity: index === active ? 1 : 0, scale: 1, zIndex: index === active ? 2 : 1 }));
    } else {
      items.forEach((item, index) => {
        gsap.set(item, { zIndex: index === active ? 2 : 1 });
        if (index !== active) gsap.to(item, { opacity: 0, duration: .3, overwrite: true });
      });
      gsap.fromTo(items[active], { opacity: changed ? 0 : 1, scale: changed ? 1.045 : 1 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out', overwrite: true });
      if (changed) gsap.fromTo('.slide-caption', { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'power2.out', overwrite: true, clearProps: 'transform,opacity' });
    }
    previous.current = active;
    return () => { gsap.killTweensOf(items); };
  }, { scope: container, dependencies: [active] });
  const move = (delta: number) => setActive(value => (value + delta + slides.length) % slides.length);
  return <div className="hero-visual" ref={container} role="region" aria-roledescription="карусель" aria-label="Примеры продукции" tabIndex={0} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
    <div className="hero-image-frame">{slides.map((slide, index) => <div className="hero-slide" key={slide.image} style={{opacity: index === 0 ? 1 : 0}} aria-hidden={index !== active}><img src={slide.image} alt={slide.alt} width="1536" height="1024" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'}/></div>)}<span className="hero-image-curtain" aria-hidden="true"/></div>
    <div className="hero-image-label"><span>TAKTO. / DESIGN IN DETAILS</span><span>Визуальные концепции продукции</span></div>
    <div className="slider-controls"><span className="slide-caption" aria-live="polite">{slides[active].label}</span><span className="slide-number" aria-hidden="true">0{active + 1} <span>/ 03</span></span><button className="slider-arrow" onClick={() => move(-1)} aria-label="Предыдущий слайд"><ArrowLeft size={18}/></button><div className="slider-dots">{slides.map((slide,index) => <button key={slide.image} aria-label={`Слайд ${index+1}: ${slide.label}`} aria-current={active===index ? 'true' : undefined} onClick={() => setActive(index)} className={active===index ? 'active' : ''}/>)}</div><button className="slider-arrow" onClick={() => move(1)} aria-label="Следующий слайд"><ArrowRight size={18}/></button></div>
  </div>;
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!content.current) return;
    if (!open && content.current.getBoundingClientRect().height === 0) {
      gsap.killTweensOf(content.current);
      gsap.set(content.current, { height: 0, opacity: 0 });
      return;
    }
    // Animate the actual height in both directions; an open answer remains fluid on resize.
    const tween = gsap.to(content.current, {
      height: open ? 'auto' : 0,
      opacity: open ? 1 : 0,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .4,
      ease: 'power3.out',
      overwrite: true,
      onComplete: () => ScrollTrigger.refresh(),
    });
    return () => { tween.kill(); };
  }, { dependencies: [open] });
  return <div className={`faq-item ${open ? 'is-open' : ''}`}>
    <h3><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`faq-${index}`} id={`faq-heading-${index}`}><span>{question}</span><ChevronDown size={22} aria-hidden="true"/></button></h3>
    <div ref={content} id={`faq-${index}`} role="region" aria-labelledby={`faq-heading-${index}`} className="faq-answer" aria-hidden={!open}><p>{answer}</p></div>
  </div>;
}

export default function Home() {
  const { openContact } = useCommerce();
  const root = useRef<HTMLElement>(null);
  useGSAP(() => {
    const page = root.current;
    if (!page) return;
    const media = gsap.matchMedia();
    let disposed = false;
    media.add('(prefers-reduced-motion: no-preference)', context => {
      let stopped = false;
      let catalogFrame = 0;
      const splits: ReturnType<typeof SplitText.create>[] = [];
      const entrances = new Map<HTMLElement, ReturnType<typeof gsap.from> | ReturnType<typeof gsap.timeline>>();
      const shownCards = new WeakSet<HTMLElement>();
      const defaults = { duration: .55, ease: 'power3.out', clearProps: 'transform,opacity' };

      // Splitting each original hero line keeps its own font size and line box.
      const splitHeading = (heading: HTMLElement, heroDelay?: number) => {
        let complete = false;
        splits.push(SplitText.create(heading, {
          type: 'lines', mask: 'lines', linesClass: 'headline-line', autoSplit: true,
          onSplit: self => {
            if (complete || stopped) return;
            const tween = gsap.from(self.lines, {
              ...defaults, yPercent: 105, opacity: 0, duration: .65, stagger: .075,
              delay: heroDelay ?? 0,
              ...(heroDelay === undefined ? { scrollTrigger: { trigger: heading, start: 'top 92%', once: true } } : {}),
              onComplete: () => { complete = true; },
            });
            entrances.set(heading, tween);
            return tween;
          },
        }));
      };
      page.querySelectorAll<HTMLElement>('.hero-heading-line').forEach((line, index) => splitHeading(line, .06 + index * .1));
      page.querySelectorAll<HTMLElement>('[data-split-heading]').forEach(heading => splitHeading(heading));

      const heroIntro = gsap.timeline({ defaults })
        .from('.hero-eyebrow', { y: 8, opacity: 0, duration: .35 }, 0)
        .fromTo('.hero-image-curtain', { scaleX: 1 }, { scaleX: 0, duration: .7, clearProps: 'transform' }, .08)
        .from('.hero-slide:first-child img', { scale: 1.065, duration: .7 }, .08)
        .from('.hero-description', { y: 12, opacity: 0, duration: .45 }, .22)
        .from('.hero-actions > *', { y: 10, opacity: 0, stagger: .055, duration: .4 }, .32)
        .from('.hero-image-label, .slider-controls', { y: 8, opacity: 0, duration: .4, stagger: .05 }, .3);

      const reveal = (element: HTMLElement, index = 0) => {
        if (entrances.has(element)) return;
        const tween = gsap.from(element, {
          ...defaults, y: 20, opacity: 0, delay: Math.min(index, 3) * .055,
          scrollTrigger: { trigger: element, start: 'top 94%', once: true },
        });
        entrances.set(element, tween);
      };
      page.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => reveal(element));
      page.querySelectorAll<HTMLElement>('[data-stagger]').forEach(group => {
        Array.from(group.children).forEach((child, index) => {
          if (child instanceof HTMLElement) reveal(child, index);
        });
      });

      // A single short image reveal; frames retain their dimensions throughout.
      page.querySelectorAll<HTMLElement>('.studio-photo, .faq-visual').forEach(frame => {
        const image = frame.querySelector('img');
        const stamp = frame.querySelector('.studio-stamp');
        const timeline = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 92%', once: true } })
          .fromTo(frame, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .65, ease: 'power3.inOut', clearProps: 'clipPath' });
        if (image) timeline.from(image, { scale: 1.065, duration: .7, ease: 'power3.out', clearProps: 'transform' }, 0);
        if (stamp) timeline.from(stamp, { y: 10, rotation: -5, duration: .4, ease: 'power3.out', clearProps: 'transform' }, .25);
        entrances.set(frame, timeline);
      });
      page.querySelectorAll<HTMLElement>('.step-number').forEach(number => {
        entrances.set(number, gsap.from(number, {
          scale: .82, rotation: -8, duration: .5, ease: 'back.out(1.3)', clearProps: 'transform',
          scrollTrigger: { trigger: number, start: 'top 92%', once: true },
        }));
      });

      // IO respects horizontal clipping: off-screen carousel cards wait their turn.
      const cards = new IntersectionObserver(entries => {
        if (stopped) return;
        entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          if (shownCards.has(element)) return;
          shownCards.add(element);
          entrances.get(element)?.delay(Math.min(index, 3) * .055).restart(true);
          cards.unobserve(element);
        });
      }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
      const registerOffers = () => {
        page.querySelectorAll<HTMLElement>('.home-catalog .section-heading, .home-kits .section-heading, .home-business .section-heading, .kits-toolbar, .business-period, .business-extras, .offers-note').forEach(element => reveal(element));
        page.querySelectorAll<HTMLElement>('.business-grid > article').forEach((element, index) => reveal(element, index));
        page.querySelectorAll<HTMLElement>('.home-catalog .showcase-slide, .home-kits .kit-card').forEach(card => {
          if (entrances.has(card)) return;
          entrances.set(card, gsap.from(card, { ...defaults, y: 18, opacity: 0, paused: true }));
          cards.observe(card);
        });
      };
      registerOffers();
      // Catalog data can arrive after mount; never observe GSAP's style mutations.
      const catalog = page.querySelector('.home-catalog');
      const catalogObserver = new MutationObserver(() => {
        if (stopped || catalogFrame) return;
        catalogFrame = requestAnimationFrame(() => {
          catalogFrame = 0;
          if (stopped) return;
          context.add(registerOffers);
          ScrollTrigger.refresh();
        });
      });
      if (catalog) catalogObserver.observe(catalog, { childList: true, subtree: true });

      // Keyboard users should never have to wait for a control to become visible.
      const finishOnFocus = (event: FocusEvent) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (event.target.closest('.hero')) heroIntro.progress(1);
        for (const [element, animation] of entrances) {
          if (element.contains(event.target)) {
            cards.unobserve(element);
            shownCards.add(element);
            animation.scrollTrigger?.kill(false, true);
            animation.progress(1);
          }
        }
      };
      page.addEventListener('focusin', finishOnFocus);
      return () => {
        stopped = true;
        cards.disconnect();
        catalogObserver.disconnect();
        cancelAnimationFrame(catalogFrame);
        page.removeEventListener('focusin', finishOnFocus);
        splits.forEach(split => split.revert());
        entrances.clear();
      };
    });
    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.getTweensOf(page.querySelectorAll('.faq-answer')).forEach(tween => tween.progress(1));
    });
    // The font promise can resolve after route navigation; do not refresh a stale page.
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; media.revert(); };
  }, { scope: root });

  return <><main id="main-content" className="editorial-home" ref={root}>
    <div className="first-screen">
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="brand-dot" aria-hidden="true"/>СТУДИЯ ПЕЧАТИ И БРЕНДИРОВАНИЯ</p>
          <h1 id="hero-title" className="hero-heading"><span className="hero-heading-line hero-heading-lead">ПЕЧАТЬ</span><span className="hero-heading-line">С ХАРАКТЕРОМ.</span></h1>
          <div className="hero-aside">
            <p className="hero-description">Полиграфия, упаковка и детали для вашего бренда. От первого эскиза до готового изделия.</p>
            <div className="hero-actions"><Link to="/catalog" className="button button-orange">В каталог <ArrowRight size={20} aria-hidden="true"/></Link><button type="button" className="text-link" onClick={() => openContact()}>Обсудить идею <ArrowUpRight size={18} aria-hidden="true"/></button></div>
          </div>
        </div>
        <HeroSlider/>
      </section>
      <section className="benefits-bar page-width" aria-labelledby="benefits-title">
        <h2 id="benefits-title">От идеи<br/> до результата.</h2>
        <div className="benefits-items" data-stagger>{benefits.map(({ Icon, title, text }) => <div className="benefit-item" key={title}><Icon size={28} strokeWidth={1.4} aria-hidden="true"/><p>{title}<span>{text}</span></p></div>)}</div>
      </section>
    </div>

    <section className="directions-section page-width section-space" aria-labelledby="directions-title">
      <div className="section-heading"><div><p className="eyebrow" data-reveal>01 / НАПРАВЛЕНИЯ</p><h2 id="directions-title" data-split-heading>Что<br/> мы делаем</h2></div><Link className="text-link" to="/catalog">Все направления <ArrowUpRight size={19} aria-hidden="true"/></Link></div>
      <div className="directions-grid" data-stagger>{directions.map(direction => <Link className={`direction-card direction-${direction.slug}`} to={`/catalog/${direction.slug}`} key={direction.slug}>
        <div className="direction-image"><img src={direction.image} alt={direction.alt} width="800" height="800" loading="lazy" decoding="async"/><span aria-hidden="true">{direction.number}</span></div>
        <div className="direction-caption"><div><h3>{direction.label}</h3><p>{direction.title}</p></div><ArrowUpRight size={26} strokeWidth={1.5} aria-hidden="true"/></div>
      </Link>)}</div>
      <div className="direction-more"><p>А ещё</p><Link to="/catalog/tags">Бирки и ярлыки <ArrowUpRight size={16} aria-hidden="true"/></Link><Link to="/catalog/vinyl">Винил и плоттер <ArrowUpRight size={16} aria-hidden="true"/></Link><Link to="/catalog/windows">Оформление витрин <ArrowUpRight size={16} aria-hidden="true"/></Link><span>Изображения — визуальные концепции.</span></div>
    </section>

    <div className="home-catalog"><CatalogShowcase/></div>
    <div className="home-kits"><ReadyKits/></div>
    <div className="home-business"><BusinessPlans/></div>

    <section
  className="studio-section"
  id="about"
  aria-labelledby="studio-title"
>
  <div className="page-width studio-grid">
    <div className="studio-copy" data-reveal>
      <p className="eyebrow">
        О СТУДИИ / CREATIVE PRINT STUDIO
      </p>

      <h2 id="studio-title" className="studio-tagline">
        TAKTO.
      </h2>

      <p>
        Соединяем дизайн и производство, чтобы ваш бренд
        можно было увидеть, почувствовать и взять в руки.
      </p>

      <p>
        От наклейки до упаковки: поможем выбрать материал,
        продумать детали и создать цельное впечатление.
      </p>

      <a
        className="text-link"
        href={TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Обсудить идею
        <ArrowUpRight size={20} aria-hidden="true" />
      </a>
    </div>

    

<div className="studio-photo" data-reveal>
  <img
    src={studioImage}
    width="800"
    height="800"
    loading="lazy"
    decoding="async"
    alt="Фирменная продукция TAKTO."
    style={{
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />

  <span className="studio-stamp">
    <Star size={24} aria-hidden="true" />
    <span>
      БОЛЬШЕ, ЧЕМ<br />
      ПРОСТО ПЕЧАТЬ
    </span>
  </span>
</div>


  </div>

    </section>
    <section className="process-section page-width section-space" id="services" aria-labelledby="process-title">
      <div className="section-heading" data-reveal><div><p className="eyebrow">КАК МЫ РАБОТАЕМ</p><h2 id="process-title">Простой<br/> процесс</h2></div><ArrowDown className="section-arrow" size={38} strokeWidth={1.2} aria-hidden="true"/></div>
      <div className="process-grid" data-stagger>{steps.map(step => <article className="process-card" key={step.n}><span className="step-number">{step.n}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      <div className="service-note"><Check size={19} aria-hidden="true"/><p>Одна команда на всех этапах: дизайн, печать, резка и сборка.</p><Package size={22} aria-hidden="true"/></div>
    </section>

    <section className="faq-section page-width" aria-labelledby="faq-title">
      <div className="faq-heading" data-reveal><p className="eyebrow">ВОПРОСЫ И ОТВЕТЫ</p><h2 id="faq-title">FAQ</h2><a className="text-link" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Задать вопрос <ArrowUpRight size={18} aria-hidden="true"/></a></div>
      <div className="faq-list" data-stagger>{faqs.map(([question, answer], index) => <FAQItem key={question} question={question} answer={answer} index={index}/>)}</div>
      <div className="faq-visual"><img src="/assets/01-stickers.webp" width="800" height="800" loading="lazy" decoding="async" alt="Фигурные стикеры TAKTO. с голографическим эффектом"/><span>ДЕТАЛИ РЕШАЮТ.</span></div>
    </section>

    <section className="contact-section page-width" id="contacts" aria-labelledby="contact-title">
      <div className="contact-spark" aria-hidden="true">✳</div>
      <p className="eyebrow">СЛЕДУЮЩИЙ ПРОЕКТ — ВАШ</p>
      <h2 id="contact-title" data-split-heading>Расскажите<br/>о своей задаче</h2>
      <p>Подберём форму и материал, рассчитаем стоимость и поможем воплотить вашу идею.</p>
      <div className="contact-actions" data-reveal><button type="button" className="button button-paper" onClick={() => openContact()}>Обсудить проект <ArrowRight size={20} aria-hidden="true"/></button><TelegramButton className="contact-telegram"/></div>
    </section>
  </main><LaunchModal onAfterClose={() => { if (root.current) ScrollTrigger.refresh(); }}/></>;
}
