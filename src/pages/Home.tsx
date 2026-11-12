import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown, Layers, Package, Pencil, Star, Truck } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../animations/gsap';
import { TelegramButton } from '../components/TelegramButton';
import { useCommerce } from '../commerce';
import { CatalogShowcase } from '../components/CatalogShowcase';
import { ReadyKits, BusinessPlans } from '../components/Offers';
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
  useGSAP(() => {
    const items = gsap.utils.toArray<HTMLElement>('.hero-slide', container.current);
    gsap.killTweensOf(items);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item, index) => gsap.set(item, { opacity: index === active ? 1 : 0, scale: 1 }));
    } else {
      items.forEach((item, index) => {
        if (index !== active) gsap.to(item, { opacity: 0, scale: .98, duration: .25, overwrite: true });
      });
      gsap.fromTo(items[active], { opacity: previous.current === active ? 1 : 0, scale: previous.current === active ? 1 : 1.035 }, { opacity: 1, scale: 1, duration: .55, ease: 'power2.out', overwrite: true });
    }
    previous.current = active;
    return () => { gsap.killTweensOf(items); };
  }, { scope: container, dependencies: [active] });
  const move = (delta: number) => setActive(value => (value + delta + slides.length) % slides.length);
  return <div className="hero-visual" ref={container} role="region" aria-roledescription="карусель" aria-label="Примеры продукции" tabIndex={0} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } }}>
    <div className="hero-image-frame">{slides.map((slide, index) => <div className="hero-slide" key={slide.image} style={{opacity: index === 0 ? 1 : 0}} aria-hidden={index !== active}><img src={slide.image} alt={slide.alt} width="1536" height="1024" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'}/></div>)}</div>
    <div className="hero-image-label"><span>TAKTO. / DESIGN IN DETAILS</span><span>Визуальные концепции продукции</span></div>
    <div className="slider-controls"><span className="slide-caption" aria-live="polite">{slides[active].label}</span><span className="slide-number" aria-hidden="true">0{active + 1} <span>/ 03</span></span><button className="slider-arrow" onClick={() => move(-1)} aria-label="Предыдущий слайд"><ArrowLeft size={18}/></button><div className="slider-dots">{slides.map((slide,index) => <button key={slide.image} aria-label={`Слайд ${index+1}: ${slide.label}`} aria-current={active===index ? 'true' : undefined} onClick={() => setActive(index)} className={active===index ? 'active' : ''}/>)}</div><button className="slider-arrow" onClick={() => move(1)} aria-label="Следующий слайд"><ArrowRight size={18}/></button></div>
  </div>;
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    // Animate the actual height in both directions; an open answer remains fluid on resize.
    const tween = gsap.to(content.current, {
      height: open ? 'auto' : 0,
      opacity: open ? 1 : 0,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .35,
      ease: 'power2.out',
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
    const media = gsap.matchMedia();
    let disposed = false;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const splits: ReturnType<typeof SplitText.create>[] = [];
      const heroTitle = root.current?.querySelector<HTMLElement>('.hero-heading');
      if (heroTitle) {
        splits.push(SplitText.create(heroTitle, {
          type: 'lines',
          linesClass: 'headline-line',
          autoSplit: true,
          onSplit: self => gsap.from(self.lines, {
            y: 24, opacity: 0, stagger: .09, duration: .6,
            delay: .08, ease: 'power3.out', clearProps: 'transform,opacity',
          }),
        }));
      }
      gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } })
        .from('.hero-eyebrow', { y: 8, opacity: 0, duration: .35 }, 0)
        .from('.hero-visual', { y: 16, scale: .98, opacity: 0, duration: .65 }, .12)
        .from('.hero-description', { y: 10, opacity: 0, duration: .45 }, .25)
        .from('.hero-actions', { y: 8, opacity: 0, duration: .4 }, .4);

      // Group cards under one trigger, keeping stagger short even on narrow screens.
      gsap.utils.toArray<HTMLElement>('[data-stagger]', root.current).forEach(group => {
        gsap.from(Array.from(group.children), {
          y: 16, opacity: 0, stagger: .06, duration: .45, ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: group, start: 'top 94%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current).forEach(element => {
        gsap.from(element, {
          y: 16, opacity: 0, duration: .5, ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>('[data-split-heading]', root.current).forEach(heading => {
        splits.push(SplitText.create(heading, {
          type: 'lines', linesClass: 'headline-line', autoSplit: true,
          onSplit: self => gsap.from(self.lines, {
            y: 14, opacity: 0, stagger: .07, duration: .5, ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: heading, start: 'top 94%', once: true },
          }),
        }));
      });
      return () => { splits.forEach(split => split.revert()); };
    });
    // The font promise can resolve after route navigation; do not refresh a stale page.
    document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; media.revert(); };
  }, { scope: root });

  return <main id="main-content" className="editorial-home" ref={root}>
    <div className="first-screen">
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span className="brand-dot" aria-hidden="true"/>СТУДИЯ ПЕЧАТИ И БРЕНДИРОВАНИЯ</p>
          <h1 id="hero-title" className="hero-heading"><span className="hero-heading-line">ПЕЧАТЬ</span><span className="hero-heading-line">С ХАРАКТЕРОМ.</span></h1>
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
      <div className="section-heading" data-reveal><div><p className="eyebrow">01 / НАПРАВЛЕНИЯ</p><h2 id="directions-title">Что<br/> мы делаем</h2></div><Link className="text-link" to="/catalog">Все направления <ArrowUpRight size={19} aria-hidden="true"/></Link></div>
      <div className="directions-grid" data-stagger>{directions.map(direction => <Link className={`direction-card direction-${direction.slug}`} to={`/catalog/${direction.slug}`} key={direction.slug}>
        <div className="direction-image"><img src={direction.image} alt={direction.alt} width="800" height="800" loading="lazy" decoding="async"/><span aria-hidden="true">{direction.number}</span></div>
        <div className="direction-caption"><div><h3>{direction.label}</h3><p>{direction.title}</p></div><ArrowUpRight size={26} strokeWidth={1.5} aria-hidden="true"/></div>
      </Link>)}</div>
      <div className="direction-more"><p>А ещё</p><Link to="/catalog/tags">Бирки и ярлыки <ArrowUpRight size={16} aria-hidden="true"/></Link><Link to="/catalog/vinyl">Винил и плоттер <ArrowUpRight size={16} aria-hidden="true"/></Link><Link to="/catalog/windows">Оформление витрин <ArrowUpRight size={16} aria-hidden="true"/></Link><span>Изображения — визуальные концепции.</span></div>
    </section>

    <div className="home-catalog" data-reveal><CatalogShowcase/></div>
    <div className="home-kits" data-reveal><ReadyKits/></div>
    <div className="home-business" data-reveal><BusinessPlans/></div>

    
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
      <div className="faq-list" data-reveal>{faqs.map(([question, answer], index) => <FAQItem key={question} question={question} answer={answer} index={index}/>)}</div>
      <div className="faq-visual" data-reveal><img src="/assets/01-stickers.webp" width="800" height="800" loading="lazy" decoding="async" alt="Фигурные стикеры TAKTO. с голографическим эффектом"/><span>ДЕТАЛИ РЕШАЮТ.</span></div>
    </section>

    <section className="contact-section page-width" id="contacts" aria-labelledby="contact-title">
      <div className="contact-spark" aria-hidden="true">✳</div>
      <p className="eyebrow">СЛЕДУЮЩИЙ ПРОЕКТ — ВАШ</p>
      <h2 id="contact-title" data-split-heading>Расскажите<br/>о своей задаче</h2>
      <p>Подберём форму и материал, рассчитаем стоимость и поможем воплотить вашу идею.</p>
      <div className="contact-actions" data-reveal><button type="button" className="button button-paper" onClick={() => openContact()}>Обсудить проект <ArrowRight size={20} aria-hidden="true"/></button><TelegramButton className="contact-telegram"/></div>
    </section>
  </main>;
}
