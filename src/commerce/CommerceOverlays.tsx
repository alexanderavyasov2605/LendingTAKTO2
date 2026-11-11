import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Copy, Download, Minus, Package2, Plus, Search, Send, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { categories } from '../data/catalog';
import { useCatalog } from '../catalog/CatalogProvider';
import { coverImage, priceUnits, productPrice } from '../catalog/model';
import { calculateQuote, defaultQuote, formatPrice, pricing, type QuoteOptions } from '../data/pricing';
import { getTelegramUrl } from '../config/contacts';
import { useCommerce } from './CommerceProvider';
import { Modal } from './Modal';
import { isValidContact } from './validation';
import './commerce.css';

function Calculator({ categoryId }: { categoryId?: string }) {
  const { addItem, openCart, openContact } = useCommerce();
  const [options, setOptions] = useState<QuoteOptions>({ ...defaultQuote, categoryId: categories.some(item => item.id === categoryId) ? categoryId! : defaultQuote.categoryId });
  const quote = useMemo(() => calculateQuote(options), [options]);
  const priceRef = useRef<HTMLSpanElement>(null);
  const category = categories.find(item => item.id === options.categoryId)?.name ?? 'Печатная продукция';
  const colorLabel = options.color === 'mono' ? 'чёрно-белая' : options.color === 'full' ? 'полноцветная, 1 сторона' : 'полноцветная, 2 стороны';
  const selectedServices = [options.lamination && 'ламинация', options.dieCut && 'фигурная резка', options.design && 'разработка дизайна', options.assembly && 'сборка', options.urgent && 'срочное производство'].filter(Boolean).join(', ') || 'без дополнительных услуг';
  const summary = `${category}\nМатериал: ${quote.material}\nТираж: ${quote.quantity} шт.\nРазмер: ${quote.width} × ${quote.height} см\nПечать: ${colorLabel}\nУслуги: ${selectedServices}\nПредварительная стоимость: ${formatPrice(quote.total)} UZS (${formatPrice(quote.unitPrice)} UZS/шт.)\nРасчёт по демонстрационным тарифам, требуется подтверждение студии.`;
  const update = <K extends keyof QuoteOptions>(key: K, value: QuoteOptions[K]) => setOptions(current => ({ ...current, [key]: value }));
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = gsap.fromTo(priceRef.current, { opacity: .45, y: 5 }, { opacity: 1, y: 0, duration: .22, overwrite: true });
    return () => { animation.kill(); };
  }, [quote.total]);
  const addQuote = () => {
    addItem({ id: `quote-${Object.values(options).join('-')}`, name: category, unitPrice: quote.unitPrice, quantity: quote.quantity, details: `${quote.material}, ${quote.width} × ${quote.height} см; печать: ${colorLabel}; ${selectedServices}. Цена за единицу рассчитана для тиража ${quote.quantity} шт.` });
    openCart();
  };
  return <div className="commerce-calculator">
    <form className="commerce-fields" onSubmit={event => { event.preventDefault(); openContact(summary); }} id="quote-form">
      <label className="commerce-field commerce-full">Что печатаем?<select value={options.categoryId} onChange={event => update('categoryId', event.target.value)}>{categories.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="commerce-field commerce-full">Материал<select value={options.materialId} onChange={event => update('materialId', event.target.value)}>{pricing.materials.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="commerce-field commerce-full">Тираж, шт.<input type="number" min="1" max="100000" step="1" required value={options.quantity} onChange={event => update('quantity', Number(event.target.value))}/><span className="commerce-help">От 100 шт. применяется скидка за тираж</span></label>
      <label className="commerce-field">Ширина, см<input type="number" min="1" max="300" step="0.1" required value={options.width} onChange={event => update('width', Number(event.target.value))}/></label>
      <label className="commerce-field">Высота, см<input type="number" min="1" max="300" step="0.1" required value={options.height} onChange={event => update('height', Number(event.target.value))}/></label>
      <label className="commerce-field commerce-full">Цветность<select value={options.color} onChange={event => update('color', event.target.value as QuoteOptions['color'])}><option value="mono">Чёрно-белая</option><option value="full">Полноцветная · 1 сторона</option><option value="double">Полноцветная · 2 стороны</option></select></label>
      <fieldset className="commerce-options commerce-full"><legend>Детали, которые меняют всё</legend>{([
        ['lamination', 'Ламинация', 'Защита поверхности'], ['dieCut', 'Фигурная резка', 'Форма по вашему контуру'], ['design', 'Подготовка дизайна', 'Разработаем макет'], ['assembly', 'Сборка и упаковка', 'Заказ, готовый к вручению'], ['urgent', 'Срочное производство', 'Возможность согласуем отдельно'],
      ] as const).map(([key, label, hint]) => <label className="commerce-check" key={key}><input type="checkbox" checked={options[key]} onChange={event => update(key, event.target.checked)}/><span><strong>{label}</strong><small>{hint}</small></span></label>)}</fieldset>
    </form>
    <aside className="commerce-estimate"><span className="commerce-eyebrow">ВАША ИДЕЯ В ЦИФРАХ</span><h3>Предварительный<br/> расчёт</h3><div className="commerce-total" aria-live="polite"><span ref={priceRef}>{formatPrice(quote.total)}</span><small>UZS</small></div><p className="commerce-per-unit">{formatPrice(quote.unitPrice)} UZS за единицу</p><dl><div><dt>Изделие</dt><dd>{category}</dd></div><div><dt>Тираж</dt><dd>{quote.quantity} шт.</dd></div><div><dt>Размер</dt><dd>{quote.width} × {quote.height} см</dd></div><div><dt>Материал</dt><dd>{quote.material}</dd></div>{quote.discount > 0 && <div><dt>Скидка на печать</dt><dd>−{quote.discount}%</dd></div>}</dl><p className="commerce-disclaimer">Демонстрационные тарифы. Итоговую цену и сроки подтвердим после проверки макета.</p><button className="commerce-button commerce-button--lime" type="submit" form="quote-form">Оформить заявку <ArrowRight size={18}/></button><button className="commerce-button commerce-button--outline-light" type="button" onClick={() => { const form = document.getElementById('quote-form') as HTMLFormElement; if (form.reportValidity()) addQuote(); }}><ShoppingBag size={18}/> Добавить в корзину</button></aside>
  </div>;
}

function Cart() {
  const { cart, updateQuantity, removeItem, openCalculator, openContact, closeModal, storageAvailable } = useCommerce();
  const { products: liveProducts, loading, error, refresh } = useCatalog();
  const navigate = useNavigate();
  const items = cart.map(item => { const live = item.productId ? liveProducts.find(p => p.id === item.productId) : undefined; return live ? { ...item, name: live.title, unitPrice: live.price, priceUnit: priceUnits[live.price_unit], minimum: live.specifications.minimum_quantity || 1, live } : { ...item, minimum: 1, live }; });
  const unavailable = items.some(item => item.productId && !liveProducts.some(p => p.id === item.productId));
  const invalidQuantity = items.some(item => item.quantity < item.minimum);
  const checking = items.some(item => item.productId) && (loading || Boolean(error));
  const total = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
  const unknown = items.some(item => item.unitPrice === null);
  const linePrice = (price: number | null) => price === null ? 'По запросу' : `${formatPrice(price)} сум`;
  const summary = `Заявка TAKTO.\n\n${items.map((item, index) => `${index + 1}. ${item.name}\nКоличество: ${item.quantity} ${item.priceUnit || 'шт.'}\nЦена: ${linePrice(item.unitPrice)}${item.unitPrice === null ? '' : `\nСумма: ${linePrice(item.quantity * item.unitPrice)}`}${item.details ? `\n${item.details}` : ''}`).join('\n\n')}\n\n${unknown ? 'Есть позиции по запросу. Итоговую сумму рассчитает студия.' : `Предварительная сумма: ${linePrice(total)}.`}\nСтоимость и сроки требуют подтверждения студии.`;
  if (!items.length) return <div className="commerce-empty"><div className="commerce-empty-icon"><ShoppingBag size={30} strokeWidth={1.25}/></div><span className="commerce-eyebrow">ПЕРВЫЙ ШАГ</span><h3>Место для вашей идеи</h3><p>Добавьте продукцию из каталога или начните с индивидуального расчёта.</p><div className="commerce-empty-actions"><button className="commerce-button" onClick={() => { closeModal(); navigate('/catalog'); }}>Смотреть каталог <ArrowRight size={18}/></button><button className="commerce-text-button" onClick={() => openCalculator()}>Рассчитать свой тираж</button></div></div>;
  return <div className="commerce-cart">
    <div className="commerce-cart-intro"><p className="commerce-muted">Всё для вашего проекта — в одной заявке.</p><span className="commerce-count">Позиций: {items.length}</span></div>
    {!storageAvailable && <p role="status" className="commerce-warning">Браузер не разрешает сохранение. Корзина доступна до закрытия страницы.</p>}
    {checking && <div role="status" className="commerce-status"><p>{error ? 'Не удалось проверить актуальность каталога.' : 'Проверяем цены и доступность товаров…'}</p>{error && <button className="commerce-text-button" onClick={() => void refresh()}>Повторить проверку <ArrowRight size={15}/></button>}</div>}
    {invalidQuantity && <p role="alert" className="commerce-warning">Увеличьте количество до минимального тиража, указанного у товара.</p>}
    {unavailable && !checking && <p role="alert" className="commerce-warning">Некоторые товары сняты с публикации. Удалите их из корзины перед оформлением заявки.</p>}
    <div className="commerce-cart-list">{items.map(item => <article className="commerce-cart-item" key={item.id}>
      <div className="commerce-cart-image" aria-hidden="true">{item.live && coverImage(item.live)?.url ? <img src={coverImage(item.live)?.url} alt="" width="88" height="104"/> : <Package2 size={28} strokeWidth={1.1}/>}</div>
      <div className="commerce-cart-item-content">
        <div className="commerce-cart-item-title"><div><h3>{item.name}</h3>{item.details && <p>{item.details}</p>}<span className="commerce-unit-price">{linePrice(item.unitPrice)}{item.unitPrice !== null && ` / ${item.priceUnit || 'шт.'}`}</span>{item.minimum > 1 && <span className="commerce-item-note">Минимальный тираж: {item.minimum} {item.priceUnit || 'шт.'}</span>}{item.productId && !item.live && !checking && <span className="commerce-item-note commerce-item-note--unavailable">Недоступен для заказа</span>}</div><button className="commerce-icon-button commerce-remove" aria-label={`Удалить ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 size={17} strokeWidth={1.5}/></button></div>
        <div className="commerce-cart-item-bottom"><div className="commerce-quantity"><button aria-label={`Уменьшить количество: ${item.name}`} disabled={item.quantity <= item.minimum} onClick={() => updateQuantity(item.id, Math.max(item.minimum, item.quantity - 1))}><Minus size={15}/></button><input aria-label={`Количество: ${item.name}`} aria-invalid={item.quantity < item.minimum || undefined} type="number" min={item.minimum} max="100000" step="1" inputMode="numeric" value={item.quantity} onChange={event => updateQuantity(item.id, Number(event.target.value))}/><button aria-label={`Увеличить количество: ${item.name}`} disabled={item.quantity >= 100000} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={15}/></button></div><strong>{linePrice(item.unitPrice === null ? null : item.unitPrice * item.quantity)}</strong></div>
      </div>
    </article>)}</div>
    <div className="commerce-cart-summary"><div className="commerce-cart-total" aria-live="polite"><span>Предварительная сумма</span><strong>{unknown ? 'Требуется расчёт' : linePrice(total)}</strong></div><p className="commerce-help">{unknown ? 'В заказе есть позиции по запросу. Студия уточнит стоимость всего тиража.' : 'Итоговую стоимость и сроки согласуем после проверки макета.'}</p><button disabled={checking || unavailable || invalidQuantity} className="commerce-button commerce-button--full" onClick={() => openContact(summary)}>Перейти к заявке <ArrowRight size={18}/></button><p className="commerce-next-step">Далее — ваши контакты и текст заявки для студии.</p></div>
  </div>;
}

function SearchCatalog() {
  const [query, setQuery] = useState('');
  const { closeModal } = useCommerce();
  const { products: items, categories: dynamicCategories, loading, error, refresh } = useCatalog();
  const navigate = useNavigate();
  const normalized = query.trim().toLocaleLowerCase('ru');
  const results = items.filter(item => `${item.title} ${item.short_description} ${item.sku} ${dynamicCategories.find(category => category.id === item.category_id)?.name ?? ''}`.toLocaleLowerCase('ru').includes(normalized));
  const go = (search: string) => { closeModal(); navigate(`/catalog?search=${encodeURIComponent(search)}`); };
  return <div className="commerce-search">
    <form className="commerce-search-input" role="search" onSubmit={event => { event.preventDefault(); go(query.trim()); }}><Search size={20} strokeWidth={1.5}/><input type="search" aria-label="Поиск по каталогу" placeholder="Название или артикул" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button className="commerce-icon-button" type="button" aria-label="Очистить поиск" onClick={() => setQuery('')}><X size={17}/></button>}<button className="commerce-icon-button" aria-label="Показать в каталоге" type="submit"><ArrowRight size={20}/></button></form>
    <div className="commerce-search-meta"><span className="commerce-eyebrow">{normalized ? 'РЕЗУЛЬТАТЫ ПОИСКА' : 'ПРОДУКЦИЯ СТУДИИ'}</span><span className="commerce-count" role="status">{loading ? 'Загружаем…' : error ? '' : `Найдено: ${results.length}`}</span></div>
    {error ? <div className="commerce-status" role="alert"><h3>Каталог временно недоступен</h3><p>Не удалось загрузить продукцию. Попробуйте ещё раз.</p><button className="commerce-text-button" onClick={() => void refresh()}>Повторить загрузку <ArrowRight size={15}/></button></div> : <>
      <div className="commerce-search-results" aria-busy={loading}>{results.slice(0, 12).map(item => <button key={item.id} className="commerce-search-result" onClick={() => { closeModal(); navigate(`/product/${encodeURIComponent(item.slug)}`); }}><span className="commerce-search-image" aria-hidden="true">{coverImage(item)?.url ? <img src={coverImage(item)?.url} alt="" width="64" height="72"/> : <Package2 size={24} strokeWidth={1.1}/>}</span><span className="commerce-search-result-copy"><small>{dynamicCategories.find(category => category.id === item.category_id)?.name}</small><strong>{item.title}</strong><span className="commerce-search-price">{productPrice(item)}</span></span><ArrowRight size={18} strokeWidth={1.5}/></button>)}</div>
      {results.length > 12 && <button className="commerce-button commerce-button--secondary commerce-button--full" onClick={() => go(query)}>Все результаты <ArrowRight size={18}/></button>}
      {!results.length && !loading && <div className="commerce-empty"><div className="commerce-empty-icon"><Search size={28} strokeWidth={1.25}/></div><h3>{items.length ? 'Пока ничего не нашли' : 'Каталог пополняется'}</h3><p>{items.length ? 'Попробуйте другое название или артикул. Можно начать с категории продукции.' : 'Готовим новые изделия для ваших проектов. Они появятся здесь после публикации.'}</p>{normalized && <button className="commerce-text-button" onClick={() => setQuery('')}>Сбросить поиск <ArrowRight size={15}/></button>}</div>}
    </>}
  </div>;
}

function ContactForm({ initialSummary }: { initialSummary?: string }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [product, setProduct] = useState(categories[0]?.name ?? 'Стикеры');
  const [quantity, setQuantity] = useState(100);
  const [material, setMaterial] = useState(pricing.materials[0].name as string);
  const [comment, setComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [contactError, setContactError] = useState('');
  const [readyDraft, setReadyDraft] = useState('');
  const contactRef = useRef<HTMLInputElement>(null);
  const copyRequest = useRef(0);
  useEffect(() => () => { copyRequest.current += 1; }, []);
  const telegramUrl = getTelegramUrl();
  const makeDraft = () => `Здравствуйте! Хочу обсудить проект с TAKTO.\n\nИмя: ${name.trim()}\nКонтакт: ${contact.trim()}\n\n${initialSummary || `Изделие: ${product}\nТираж: ${quantity} шт.\nМатериал: ${material}`}\n${comment.trim() ? `\nКомментарий: ${comment.trim()}\n` : ''}`;
  const handleCopy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setContactError(''); setCopied(false);
    if (name.trim().length < 2) { setError('Укажите имя: не менее двух символов.'); return; }
    if (!isValidContact(contact)) { setContactError('Введите телефон (7–15 цифр), email или Telegram @username (от 5 символов после @).'); contactRef.current?.focus(); return; }
    const requestId = ++copyRequest.current;
    const draft = makeDraft(); setReadyDraft(draft);
    try { await navigator.clipboard.writeText(draft); if (copyRequest.current === requestId) setCopied(true); }
    catch { if (copyRequest.current === requestId) setError('Автоматическое копирование недоступно. Скопируйте текст из поля ниже или скачайте заявку.'); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([readyDraft], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'TAKTO-заявка.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return <form className="commerce-contact" onSubmit={handleCopy} onChange={() => { copyRequest.current += 1; setCopied(false); setReadyDraft(''); setError(''); setContactError(''); }}>
    <p className="commerce-muted">Оставьте контакты и детали проекта. Подготовим текст заявки, который вы сможете передать студии.</p>
    <div className="commerce-fields"><label className="commerce-field">Ваше имя<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Как к вам обращаться" value={name} onChange={event => setName(event.target.value)}/></label><label className="commerce-field">Контакт для связи<input ref={contactRef} name="contact" required minLength={3} maxLength={150} autoCapitalize="none" spellCheck={false} aria-invalid={contactError ? true : undefined} aria-describedby={contactError ? 'commerce-contact-error' : undefined} placeholder="Телефон, email или @username" value={contact} onChange={event => setContact(event.target.value)}/>{contactError && <span id="commerce-contact-error" className="commerce-help" role="alert">{contactError}</span>}</label>{!initialSummary && <><label className="commerce-field commerce-full">Изделие<select value={product} onChange={event => setProduct(event.target.value)}>{categories.map(item => <option key={item.id}>{item.name}</option>)}</select></label><label className="commerce-field">Тираж, шт.<input type="number" min="1" max="100000" step="1" required value={quantity} onChange={event => setQuantity(Number(event.target.value))}/></label><label className="commerce-field">Материал<select value={material} onChange={event => setMaterial(event.target.value)}>{pricing.materials.map(item => <option key={item.id}>{item.name}</option>)}<option>Нужна консультация</option></select></label></>}<label className="commerce-field commerce-full">Комментарий <span className="commerce-optional">необязательно</span><textarea rows={3} maxLength={3000} placeholder="Расскажите про задачу, макет и желаемый срок" value={comment} onChange={event => setComment(event.target.value)}/></label></div>
    {initialSummary && <details className="commerce-summary"><summary>Состав вашей заявки</summary><pre>{initialSummary}</pre></details>}
    <p className="commerce-help">Заявка не отправляется автоматически. Скопируйте её и передайте студии удобным способом.</p>
    {error && <p className="commerce-warning" role="alert">{error}</p>}
    <button className="commerce-button commerce-button--full" type="submit">{copied ? <Check size={18}/> : <Copy size={18}/>} {copied ? 'Заявка скопирована' : 'Скопировать заявку'}</button>
    {copied && <p className="commerce-success" role="status">Текст в буфере обмена. Вы можете вставить его в сообщение.</p>}
    {readyDraft && <div className="commerce-ready-draft"><label className="commerce-field">Текст заявки<textarea readOnly rows={6} value={readyDraft} onFocus={event => event.target.select()}/></label><button type="button" className="commerce-text-button" onClick={download}><Download size={16}/> Скачать .txt</button></div>}
    {telegramUrl ? <a className="commerce-button commerce-button--secondary commerce-button--full" href={telegramUrl} target="_blank" rel="noreferrer"><Send size={18}/> Открыть Telegram студии</a> : <p className="commerce-contact-note"><Send size={17}/><span>Telegram студии пока не указан. Заявку можно скопировать или сохранить.</span></p>}
  </form>;
}

export function CommerceOverlays() {
  const { modal, closeModal } = useCommerce();
  if (!modal) return null;
  const title = modal.kind === 'calculator' ? 'Рассчитаем ваш тираж' : modal.kind === 'cart' ? 'Ваш заказ' : modal.kind === 'search' ? 'Найти своё решение' : 'Обсудим ваш проект';
  return <Modal viewKey={modal.kind} title={title} eyebrow={modal.kind === 'calculator' ? 'РАСЧЁТ СТОИМОСТИ' : modal.kind === 'contact' ? 'ЗАЯВКА В СТУДИЮ' : modal.kind === 'cart' ? 'TAKTO. / ВАШ ПРОЕКТ' : 'TAKTO. / КАТАЛОГ'} onClose={closeModal} wide={modal.kind === 'calculator'}>{modal.kind === 'calculator' ? <Calculator categoryId={modal.categoryId}/> : modal.kind === 'cart' ? <Cart/> : modal.kind === 'search' ? <SearchCatalog/> : <ContactForm initialSummary={modal.summary}/>}</Modal>;
}
