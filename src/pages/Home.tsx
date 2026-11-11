import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown, Layers, Package, Pencil, Sparkles, Star, Truck } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../animations/gsap';
import { TelegramButton } from '../components/TelegramButton';
import { useCommerce } from '../commerce';
import { CatalogShowcase } from '../components/CatalogShowcase';
import { ReadyKits, BusinessPlans } from '../components/Offers';
import { materials, materialsNote } from '../data/materials';

const TELEGRAM_URL = 'https://t.me/takto_order';

const slides = [
  { image: '/assets/24-hero.webp', alt: 'Коробка TAKTO., голографические наклейки, бирка и визитки', label: 'Упаковка с характером' },
  { image: '/assets/01-stickers.webp', alt: 'Фигурные голографические стикеры TAKTO.', label: 'Маленькие детали. Большие эмоции.' },
  { image: '/assets/windows.webp', alt: 'Фирменная графика TAKTO. на стекле витрины', label: 'Ваш бренд — в пространстве' },
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

function FAQItem({ question, answer, index }: { question:string;answer:string;index:number }) {
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.set(content.current, { height: open ? 'auto' : 0 });
    gsap.fromTo(content.current, { opacity: open ? 0 : 1, y: open ? -4 : 0 }, { opacity: open ? 1 : 0, y: 0, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .25, ease: 'power2.out', overwrite: true });
  }, { dependencies: [open] });
  return <div className={`faq-item ${open ? 'is-open' : ''}`}><h3><button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`faq-${index}`} id={`faq-heading-${index}`}><span>{question}</span><ChevronDown size={22}/></button></h3><div ref={content} id={`faq-${index}`} role="region" aria-labelledby={`faq-heading-${index}`} className="faq-answer" aria-hidden={!open}><p>{answer}</p></div></div>;
}

export default function Home() {
  const { openContact } = useCommerce();
  const root = useRef<HTMLElement>(null);
  const [materialIndex, setMaterialIndex] = useState(0);
  const materialImage = useRef<HTMLImageElement>(null);
  const selectedMaterial = materials[materialIndex];
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.hero-heading', { type: 'lines', linesClass: 'headline-line' });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-eyebrow', { y: 10, opacity: 0, duration: .35 }, 0)
        .from(split.lines, { y: 20, opacity: 0, stagger: .07, duration: .55 }, .08)
        .from('.hero-description, .hero-actions', { y: 12, opacity: 0, stagger: .05, duration: .4 }, .18)
        .from('.hero-visual', { opacity: 0, y: 12, duration: .55 }, .18);
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current).forEach(section => gsap.from(section, { y: 18, opacity: 0, duration: .5, scrollTrigger: {trigger: section, start: 'top 96%', once: true} }));
      gsap.from('.benefit-item', { y: 12, opacity: 0, stagger: .06, duration: .5, scrollTrigger: { trigger: '.benefits-bar', start: 'top 95%', once: true } });
      return () => { split.revert(); };
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    return () => media.revert();
  }, []);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(materialImage.current, {opacity: .45, scale: 1.025}, {opacity: 1, scale: 1, duration: .4, overwrite: true});
  }, { dependencies: [materialIndex] });

  return <main id="main-content" className="editorial-home" ref={root}>
    <div className="first-screen">
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero-copy"><div><p className="eyebrow hero-eyebrow"><span className="brand-dot" aria-hidden="true"/>СТУДИЯ ПЕЧАТИ И БРЕНДИРОВАНИЯ</p><h1 id="hero-title" className="hero-heading">Идеи, которые<br/>можно <span>почувствовать.</span></h1></div><div className="hero-aside"><p className="hero-description">Печать, упаковка и детали, которые говорят за ваш бренд. От первого эскиза до готового изделия.</p><div className="hero-actions"><Link to="/catalog" className="button button-dark">Открыть каталог <ArrowUpRight size={20}/></Link><button className="text-link" onClick={() => openContact()}>Обсудить идею <ArrowRight size={18}/></button></div></div></div>
        <HeroSlider/>
      </section>
      <section className="benefits-bar page-width" aria-label="Возможности студии"><h2>От идеи<br/>до результата.</h2><div className="benefits-items">{benefits.map(({Icon,title,text}) => <div className="benefit-item" key={title}><Icon size={24} strokeWidth={1.3}/><p>{title}<span>{text}</span></p></div>)}</div></section>
    </div>

    <section className="directions-section page-width section-space" aria-labelledby="directions-title"><div className="section-heading" data-reveal><div><p className="eyebrow">01 / НАПРАВЛЕНИЯ</p><h2 id="directions-title">У каждой идеи<br/>есть своя форма.</h2></div><Link className="text-link" to="/catalog">Все направления <ArrowUpRight size={19}/></Link></div><div className="directions-grid">{directions.map(direction => <Link className="direction-card" to={`/catalog/${direction.slug}`} key={direction.slug} data-reveal><div className="direction-image"><img src={direction.image} alt={direction.alt} width="800" height="800" loading="lazy" decoding="async"/><span>{direction.number}</span></div><div className="direction-caption"><div><p>{direction.label}</p><h3>{direction.title}</h3></div><ArrowUpRight size={25} strokeWidth={1.3}/></div></Link>)}</div><div className="direction-more"><p>А ещё —</p><Link to="/catalog/tags">бирки и ярлыки <ArrowUpRight size={15}/></Link><Link to="/catalog/vinyl">винил и плоттер <ArrowUpRight size={15}/></Link><Link to="/catalog/windows">оформление витрин <ArrowUpRight size={15}/></Link><span>Изображения — визуальные концепции.</span></div></section>

    <CatalogShowcase/>

    <section className="materials-section page-width section-space" id="materials" aria-labelledby="materials-title">
      <div className="section-heading" data-reveal><div><p className="eyebrow">02 / БИБЛИОТЕКА МАТЕРИАЛОВ</p><h2 id="materials-title">Не только видеть.<br/><span className="muted-heading">Чувствовать.</span></h2></div><p className="section-intro">Тактильная бумага, глубокий матовый цвет или голографические переливы. Найдём то самое сочетание для вашего бренда.</p></div>
      <div className="material-showcase" data-reveal><div className="material-preview"><img key={selectedMaterial.image} ref={materialImage} src={selectedMaterial.image} alt={`Визуальная концепция ${selectedMaterial.name}`} width="800" height="800" loading="lazy"/><span className="material-index">{String(materialIndex+1).padStart(2,'0')} / {materials.length}</span><span className="material-image-caption">THE FEELING OF YOUR BRAND</span></div><div className="material-details"><div className="material-tabs" role="tablist" aria-label="Материалы" onKeyDown={event => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {event.preventDefault(); const next = event.key==='Home' ? 0 : event.key==='End' ? materials.length-1 : (materialIndex+(event.key==='ArrowRight'?1:-1)+materials.length)%materials.length; setMaterialIndex(next); document.getElementById(`material-tab-${next}`)?.focus();} }}>{materials.map((material,index) => <button id={`material-tab-${index}`} key={material.id} role="tab" aria-selected={materialIndex===index} aria-controls="material-panel" tabIndex={materialIndex===index?0:-1} onClick={() => setMaterialIndex(index)} className={materialIndex===index ? 'selected' : ''}>{material.name}</button>)}</div><div role="tabpanel" id="material-panel" aria-labelledby={`material-tab-${materialIndex}`} tabIndex={0}><Sparkles size={28} strokeWidth={1.3}/><h3>{selectedMaterial.name}</h3><p>{selectedMaterial.description}</p><a className="text-link" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Подобрать материал <ArrowUpRight size={20}/></a></div><p className="fine-print">{materialsNote}</p></div></div>
    </section>

    <ReadyKits/>
    <BusinessPlans/>

    <section className="studio-section" id="about"><div className="page-width studio-grid"><div data-reveal><p className="eyebrow">TAKTO. / CREATIVE PRINT STUDIO</p><h2 className="studio-tagline">От дизайна до того,<br/>что можно <span>пощупать.</span></h2><p>Мы соединяем дизайн и производство, чтобы ваш бренд можно было не только увидеть — но и взять в руки.</p><p>От первой наклейки до продуманной упаковки. Поможем выбрать материал, разобраться в деталях и создать цельное впечатление.</p><a className="button button-lime" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Обсудить идею <ArrowUpRight size={20}/></a></div><div className="studio-photo" data-reveal><img src="/assets/23-material-fan.webp" width="800" height="800" loading="lazy" alt="Веер фактурных, голографических и цветных материалов TAKTO."/><span className="studio-stamp"><Star size={27}/><span>БОЛЬШЕ, ЧЕМ<br/>ПРОСТО ПЕЧАТЬ</span></span></div></div></section>

    <section className="process-section page-width section-space" id="services"><div className="section-heading" data-reveal><div><p className="eyebrow">ОТ ПЕРВОГО «ПРИВЕТ» ДО ГОТОВОГО ЗАКАЗА</p><h2>Понятный процесс.<br/>Заметный результат.</h2></div><ArrowDown className="section-arrow" size={54} strokeWidth={1}/></div><div className="process-grid">{steps.map(step => <article className="process-card" key={step.n} data-reveal><span className="step-number">{step.n}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><div className="service-note"><Check size={19}/><p>Один проект — одна команда. Дизайн, печать, резка и сборка в едином процессе.</p><Package size={22}/></div></section>

    <section className="faq-section page-width" aria-labelledby="faq-title"><div data-reveal><p className="eyebrow">ЕСТЬ ВОПРОСЫ?</p><h2 id="faq-title">Хороший проект<br/>начинается<br/> с диалога.</h2><a className="text-link" href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Задать свой вопрос <ArrowUpRight size={20}/></a></div><div className="faq-list" data-reveal>{faqs.map(([question,answer],index) => <FAQItem key={question} question={question} answer={answer} index={index}/>)}</div></section>

    <section className="contact-section page-width" id="contacts" data-reveal><div className="contact-spark" aria-hidden="true">✳</div><p className="eyebrow">СЛЕДУЮЩИЙ ПРОЕКТ — ВАШ</p><h2>Всё начинается<br/>с одной идеи.</h2><p>Расскажите, что задумали. Подберём форму, материал и способ воплотить это в жизнь.</p><div className="contact-actions"><button className="button button-dark" onClick={() => openContact()}>Обсудить проект <ArrowUpRight size={20}/></button><TelegramButton className="contact-telegram"/></div></section>
  </main>;
}
