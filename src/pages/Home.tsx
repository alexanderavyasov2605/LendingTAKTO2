import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown, Layers, Package, Pencil, Play, Sparkles, Star, Truck, Zap } from 'lucide-react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../animations/gsap';
import { useCommerce } from '../commerce';
import { TelegramButton } from '../components/TelegramButton';
import { brand } from '../config/brand';
import { categories } from '../data/catalog';
import { materials, materialsNote } from '../data/materials';

const slides = [
  { image: '/assets/24-hero.webp', alt: 'Коробка TAKTO., голографические наклейки, бирка и визитки', label: 'Упаковка с характером' },
  { image: '/assets/01-stickers.webp', alt: 'Фигурные голографические стикеры TAKTO.', label: 'Маленькие детали. Большие эмоции.' },
  { image: '/assets/windows.webp', alt: 'Фирменная графика TAKTO. на стекле витрины', label: 'Ваш бренд — в пространстве' },
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
  ['Доставляете по Узбекистану?', 'Способ, стоимость и сроки доставки согласуем индивидуально при оформлении заказа. Доставка не включена в предварительную стоимость калькулятора.'],
  ['Цена в калькуляторе окончательная?', 'Нет. Сейчас калькулятор использует демонстрационные тарифы. Итоговую стоимость можно подтвердить только после проверки макета, материала, тиража и дополнительных услуг.'],
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
    <div className="lime-orbit lime-orbit-top" aria-hidden="true"/><div className="lime-orbit lime-orbit-bottom" aria-hidden="true"/>
    <div className="hero-image-frame">{slides.map((slide, index) => <div className="hero-slide" key={slide.image} style={{opacity: index === 0 ? 1 : 0}} aria-hidden={index !== active}><img src={slide.image} alt={slide.alt} width="1536" height="1024" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'}/></div>)}</div>
    <div className="slider-controls"><span className="slide-caption" aria-live="polite">{slides[active].label}</span><button className="slider-arrow" onClick={() => move(-1)} aria-label="Предыдущий слайд"><ArrowLeft size={17}/></button><div className="slider-dots">{slides.map((slide,index) => <button key={slide.image} aria-label={`Слайд ${index+1}: ${slide.label}`} aria-current={active===index ? 'true' : undefined} onClick={() => setActive(index)} className={active===index ? 'active' : ''}/>)}</div><button className="slider-arrow" onClick={() => move(1)} aria-label="Следующий слайд"><ArrowRight size={17}/></button></div>
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
  const root = useRef<HTMLElement>(null);
  const { openCalculator, openContact } = useCommerce();
  const [materialIndex, setMaterialIndex] = useState(0);
  const materialImage = useRef<HTMLImageElement>(null);
  const selectedMaterial = materials[materialIndex];
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.hero-heading', { type: 'lines', linesClass: 'headline-line' });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.site-header .brand-lockup', { y: 12, opacity: 0, duration: .5 }, 0)
        .from('.desktop-nav > a, .header-actions > *', { y: 8, opacity: 0, stagger: .04, duration: .4 }, .08)
        .from('.hero-eyebrow', { y: 14, opacity: 0, duration: .4 }, .18)
        .from(split.lines, { y: 24, opacity: 0, stagger: .09, duration: .6 }, .3)
        .from('.hero-highlight', { '--highlight-scale': 0, duration: .65 }, .55)
        .from('.hero-description, .hero-actions', { y: 18, opacity: 0, stagger: .08, duration: .5 }, .64)
        .from('.hero-visual', { scale: .96, opacity: 0, y: 16, duration: .8 }, .4)
        .from('.hero-stat', { y: 12, opacity: 0, stagger: .09, duration: .5 }, .85);
      gsap.from('.category-card', { y: 28, opacity: 0, stagger: .065, duration: .6, ease: 'power2.out', scrollTrigger: {trigger: '.category-strip', start: 'top 95%', once: true} });
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root.current).forEach(section => gsap.from(section, { y: 24, opacity: 0, duration: .65, scrollTrigger: {trigger: section, start: 'top 94%', once: true} }));
      gsap.from('.benefit-item', { y: 12, opacity: 0, stagger: .06, duration: .5, scrollTrigger: { trigger: '.benefits-bar', start: 'top 95%', once: true } });
      const tagline = SplitText.create('.studio-tagline', { type: 'words' });
      gsap.from(tagline.words, { opacity: .28, stagger: .12, duration: .5, ease: 'power3.out', scrollTrigger: { trigger: '.studio-tagline', start: 'top 88%', end: 'bottom 48%', scrub: .7, once: true } });
      return () => { split.revert(); tagline.revert(); };
    });
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => gsap.to('.lime-orbit', { y: 22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } }));
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    return () => media.revert();
  }, []);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(materialImage.current, {opacity: .45, scale: 1.025}, {opacity: 1, scale: 1, duration: .4, overwrite: true});
  }, { dependencies: [materialIndex] });

  return <main id="main-content" ref={root}>
    <div className="first-screen">
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow hero-eyebrow"><span className="corner-mark" aria-hidden="true"/>ПЕЧАТЬ <b>·</b> БРЕНДИРОВАНИЕ <b>·</b> УПАКОВКА</p><h1 id="hero-title" className="hero-heading">Креативная<br/>печатная продукция<br/><span className="hero-highlight">для брендов и идей</span></h1><p className="hero-description">Стикеры, упаковка, полиграфия, винил и брендинг —<br className="desktop-break"/> от дизайна до готового продукта.</p><div className="hero-actions"><button className="button button-dark" onClick={() => openCalculator()}>Рассчитать стоимость <ArrowRight size={20}/></button><Link to="/catalog" className="button button-outline"><Play size={20}/>Смотреть каталог</Link></div><div className="hero-stats">{brand.statistics.map((stat,index) => <div className="hero-stat" key={stat.label}>{index===2 && <Zap className="stat-lightning" size={42} strokeWidth={1.5}/>}<div><strong className={index===2 ? 'stat-small' : ''}>{stat.value}</strong><span>{stat.label}</span></div></div>)}</div>{!brand.statisticsConfirmed && <p className="stats-note">Целевые показатели. Возможности и сроки уточняем для вашего проекта.</p>}</div>
        <HeroSlider/>
      </section>
      <section className="category-strip page-width" aria-label="Категории продукции">{categories.map(category => <Link className={`category-card category-${category.id}`} to={`/catalog/${category.id}`} key={category.id}><div className="category-photo"><img src={category.homeImage ?? category.image} alt="" width="400" height="300" loading="lazy"/></div><div className="category-card-bottom"><h2>{category.name}</h2><span className="round-arrow"><ArrowRight size={21}/></span></div></Link>)}</section>
      <section className="benefits-bar page-width" aria-label="Возможности студии"><h2>Всё для вашего бренда</h2><div className="benefits-items">{benefits.map(({Icon,title,text}) => <div className="benefit-item" key={title}><Icon size={31} strokeWidth={1.5}/><p>{title}<span>{text}</span></p></div>)}</div></section>
    </div>

    <section className="materials-section page-width section-space" id="materials" aria-labelledby="materials-title">
      <div className="section-heading" data-reveal><div><p className="eyebrow">НЕ ТОЛЬКО ВИДЕТЬ. ЧУВСТВОВАТЬ.</p><h2 id="materials-title">Материал меняет<br/><span className="muted-heading">всё впечатление.</span></h2></div><p className="section-intro">Тактильная бумага, глубокий матовый цвет или голографические переливы. Найдём то самое сочетание для вашего бренда.</p></div>
      <div className="material-showcase" data-reveal><div className="material-preview"><img key={selectedMaterial.image} ref={materialImage} src={selectedMaterial.image} alt={`Визуальная концепция ${selectedMaterial.name}`} width="800" height="800" loading="lazy"/><span className="material-index">{String(materialIndex+1).padStart(2,'0')} / {materials.length}</span><span className="material-image-caption">THE FEELING OF YOUR BRAND</span></div><div className="material-details"><div className="material-tabs" role="tablist" aria-label="Материалы" onKeyDown={event => { if (['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) {event.preventDefault(); const next = event.key==='Home' ? 0 : event.key==='End' ? materials.length-1 : (materialIndex+(event.key==='ArrowRight'?1:-1)+materials.length)%materials.length; setMaterialIndex(next); document.getElementById(`material-tab-${next}`)?.focus();} }}>{materials.map((material,index) => <button id={`material-tab-${index}`} key={material.id} role="tab" aria-selected={materialIndex===index} aria-controls="material-panel" tabIndex={materialIndex===index?0:-1} onClick={() => setMaterialIndex(index)} className={materialIndex===index ? 'selected' : ''}>{material.name}</button>)}</div><div role="tabpanel" id="material-panel" aria-labelledby={`material-tab-${materialIndex}`} tabIndex={0}><Sparkles size={28} strokeWidth={1.3}/><h3>{selectedMaterial.name}</h3><p>{selectedMaterial.description}</p><button className="text-link" onClick={() => openContact(`Интересует материал ${selectedMaterial.name}. Помогите подобрать образец и вариант отделки.`)}>Подобрать материал <ArrowUpRight size={20}/></button></div><p className="fine-print">{materialsNote}</p></div></div>
    </section>

    <section className="studio-section" id="about"><div className="page-width studio-grid"><div data-reveal><p className="eyebrow">TAKTO. / CREATIVE PRINT STUDIO</p><h2 className="studio-tagline">От дизайна до того,<br/>что можно <span>пощупать.</span></h2><p>Мы соединяем дизайн и производство, чтобы ваш бренд можно было не только увидеть — но и взять в руки.</p><p>От первой наклейки до продуманной упаковки. Поможем выбрать материал, разобраться в деталях и создать цельное впечатление.</p><button className="button button-lime" onClick={() => openContact()}>Обсудить идею <ArrowUpRight size={20}/></button></div><div className="studio-photo" data-reveal><img src="/assets/23-material-fan.webp" width="800" height="800" loading="lazy" alt="Веер фактурных, голографических и цветных материалов TAKTO."/><span className="studio-stamp"><Star size={27}/><span>БОЛЬШЕ, ЧЕМ<br/>ПРОСТО ПЕЧАТЬ</span></span></div></div></section>

    <section className="process-section page-width section-space" id="services"><div className="section-heading" data-reveal><div><p className="eyebrow">ОТ ПЕРВОГО «ПРИВЕТ» ДО ГОТОВОГО ЗАКАЗА</p><h2>Понятный процесс.<br/>Заметный результат.</h2></div><ArrowDown className="section-arrow" size={54} strokeWidth={1}/></div><div className="process-grid">{steps.map(step => <article className="process-card" key={step.n} data-reveal><span className="step-number">{step.n}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><div className="service-note"><Check size={19}/><p>Один проект — одна команда. Дизайн, печать, резка и сборка в едином процессе.</p><Package size={22}/></div></section>

    <section className="faq-section page-width" aria-labelledby="faq-title"><div data-reveal><p className="eyebrow">ЕСТЬ ВОПРОСЫ?</p><h2 id="faq-title">Хороший проект<br/>начинается<br/> с диалога.</h2><button className="text-link" onClick={() => openContact()}>Задать свой вопрос <ArrowUpRight size={20}/></button></div><div className="faq-list" data-reveal>{faqs.map(([question,answer],index) => <FAQItem key={question} question={question} answer={answer} index={index}/>)}</div></section>

    <section className="contact-section page-width" id="contacts" data-reveal><div className="contact-spark" aria-hidden="true">✳</div><p className="eyebrow">ВАША СЛЕДУЮЩАЯ БОЛЬШАЯ ИДЕЯ</p><h2>Давайте сделаем<br/>ваш бренд заметнее.</h2><p>Расскажите, что задумали. Всё остальное обсудим вместе.</p><div className="contact-actions"><button className="button button-dark" onClick={() => openCalculator()}>Рассчитать стоимость <ArrowRight size={20}/></button><TelegramButton className="contact-telegram"/></div></section>
  </main>;
}
