import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Check, Copy, Download, Minus, Plus, Search, Send, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { categories } from '../data/catalog';
import { useCatalog } from '../catalog/CatalogProvider';
import { coverImage, priceUnits } from '../catalog/model';
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
  const { cart, updateQuantity, removeItem, openCalculator, openContact, storageAvailable } = useCommerce();
  const { products: liveProducts, loading, error, refresh } = useCatalog();
  const items = cart.map(item => { const live = item.productId ? liveProducts.find(p => p.id === item.productId) : undefined; return live ? { ...item, name: live.title, unitPrice: live.price, priceUnit: priceUnits[live.price_unit], minimum: live.specifications.minimum_quantity || 1 } : { ...item, minimum: 1 }; });
  const unavailable = items.some(item => item.productId && !liveProducts.some(p => p.id === item.productId));
  const invalidQuantity = items.some(item => item.quantity < item.minimum);
  const checking = items.some(item => item.productId) && (loading || Boolean(error));
  const total = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
  const unknown = items.some(item => item.unitPrice === null);
  const linePrice = (price: number | null) => price === null ? 'По запросу' : `${formatPrice(price)} сум`;
  const summary = `Заявка TAKTO.\n\n${items.map((item, index) => `${index + 1}. ${item.name}\nКоличество: ${item.quantity} ${item.priceUnit || 'шт.'}\nЦена: ${linePrice(item.unitPrice)}${item.unitPrice === null ? '' : `\nСумма: ${linePrice(item.quantity * item.unitPrice)}`}${item.details ? `\n${item.details}` : ''}`).join('\n\n')}\n\n${unknown ? 'Есть позиции по запросу. Итоговую сумму рассчитает студия.' : `Предварительная сумма: ${linePrice(total)}.`}\nСтоимость и сроки требуют подтверждения студии.`;
  if (!items.length) return <div className="commerce-empty"><div className="commerce-empty-icon"><ShoppingBag size={34} strokeWidth={1.4}/></div><h3>Здесь начинается ваш проект</h3><p>Выберите продукцию в каталоге или соберите индивидуальный расчёт.</p><button className="commerce-button" onClick={() => openCalculator()}>Рассчитать заказ <ArrowRight size={18}/></button></div>;
  return <div className="commerce-cart"><p className="commerce-muted">Сохраните идеи в одном заказе. Стоимость предварительная.</p>{!storageAvailable && <p role="status" className="commerce-warning">Браузер не разрешает сохранение. Корзина доступна до закрытия страницы.</p>}{checking && <p role="status">Проверяем актуальность каталога. {error && <button onClick={() => void refresh()}>Повторить</button>}</p>}{invalidQuantity && <p role="alert" className="commerce-warning">Увеличьте количество до минимального тиража, указанного в карточке товара.</p>}{unavailable && !checking && <p role="alert" className="commerce-warning">Некоторые товары сняты с публикации. Удалите их из корзины перед оформлением заявки.</p>}<div className="commerce-cart-list">{items.map(item => <article className="commerce-cart-item" key={item.id}><div className="commerce-cart-item-title"><div><h3>{item.name}</h3>{item.details && <p>{item.details}</p>}<span className="commerce-muted">{linePrice(item.unitPrice)}{item.unitPrice !== null && ` / ${item.priceUnit || 'шт.'}`}</span></div><button className="commerce-icon-button" aria-label={`Удалить ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 size={18}/></button></div><div className="commerce-cart-item-bottom"><div className="commerce-quantity"><button aria-label={`Уменьшить количество: ${item.name}`} disabled={item.quantity <= item.minimum} onClick={() => updateQuantity(item.id, Math.max(item.minimum, item.quantity - 1))}><Minus size={15}/></button><input aria-label={`Количество: ${item.name}`} type="number" min={item.minimum} max="100000" value={item.quantity} onChange={event => updateQuantity(item.id, Number(event.target.value))}/><button aria-label={`Увеличить количество: ${item.name}`} disabled={item.quantity >= 100000} onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={15}/></button></div><strong>{linePrice(item.unitPrice === null ? null : item.unitPrice * item.quantity)}</strong></div></article>)}</div><div className="commerce-cart-total"><span>Предварительно</span><strong>{unknown ? 'Требуется расчёт' : linePrice(total)}</strong></div><p className="commerce-help">Стоимость тиража и выбранных вариантов окончательно подтверждает студия.</p><button disabled={checking || unavailable || invalidQuantity} className="commerce-button commerce-button--full" onClick={() => openContact(summary)}>Перейти к заявке <ArrowRight size={18}/></button></div>;
}

function SearchCatalog() {
  const [query, setQuery] = useState('');
  const { closeModal } = useCommerce();
  const { products: items, categories: dynamicCategories, loading, error, refresh } = useCatalog();
  const navigate = useNavigate();
  const normalized = query.trim().toLocaleLowerCase('ru');
  const results = items.filter(item => `${item.title} ${item.short_description} ${item.sku} ${dynamicCategories.find(category => category.id === item.category_id)?.name ?? ''}`.toLocaleLowerCase('ru').includes(normalized));
  const go = (search: string) => { closeModal(); navigate(`/catalog?search=${encodeURIComponent(search)}`); };
  return <div className="commerce-search"><form className="commerce-search-input" onSubmit={event => { event.preventDefault(); go(query.trim()); }}><Search size={22}/><input aria-label="Поиск по каталогу" placeholder="Найдите то, что хочется создать" value={query} onChange={event => setQuery(event.target.value)}/><button className="commerce-icon-button" aria-label="Показать в каталоге" type="submit"><ArrowRight size={20}/></button></form><p className="commerce-muted" aria-live="polite">{loading ? 'Загружаем каталог…' : `Найдено: ${results.length}`}</p>{error ? <p role="alert">{error} <button onClick={() => void refresh()}>Повторить</button></p> : <><div className="commerce-search-results">{results.slice(0, 12).map(item => <button key={item.id} className="commerce-search-result" onClick={() => { closeModal(); navigate(`/product/${encodeURIComponent(item.slug)}`); }}>{coverImage(item)?.url && <img src={coverImage(item)?.url} alt="" width="64" height="64"/>}<span><strong>{item.title}</strong><small>{dynamicCategories.find(category => category.id === item.category_id)?.name}</small></span><ArrowRight size={18}/></button>)}</div>{results.length > 12 && <button className="commerce-button" onClick={() => go(query)}>Все результаты</button>}{!results.length && !loading && <div className="commerce-empty"><h3>{items.length ? 'Пока ничего не нашли' : 'Каталог пополняется'}</h3><p>{items.length ? 'Попробуйте другое название.' : 'Новые карточки появятся после публикации студией.'}</p></div>}</>}</div>;
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
    <p className="commerce-muted">Расскажите об идее — мы поможем превратить её в вещь, которую хочется держать в руках.</p>
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
  const title = modal.kind === 'calculator' ? 'Сколько стоит ваша идея?' : modal.kind === 'cart' ? 'Ваш заказ' : modal.kind === 'search' ? 'Найдём то, что нужно' : 'Давайте создадим что-то классное';
  return <Modal viewKey={modal.kind} title={title} eyebrow={modal.kind === 'calculator' ? 'РАСЧЁТ СТОИМОСТИ' : modal.kind === 'contact' ? 'НАЧАТЬ ПРОЕКТ' : 'TAKTO. CREATIVE PRINT STUDIO'} onClose={closeModal} wide={modal.kind === 'calculator'}>{modal.kind === 'calculator' ? <Calculator categoryId={modal.categoryId}/> : modal.kind === 'cart' ? <Cart/> : modal.kind === 'search' ? <SearchCatalog/> : <ContactForm initialSummary={modal.summary}/>}</Modal>;
}
