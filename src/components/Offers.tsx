import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import { useCommerce } from '../commerce';
import { additionalBatchPrice, businessPlans, commercialTermsConfirmed, readyKits, subscriptionTerms, welcomeKitPrice } from '../config/offers';
import { formatPrice } from '../data/pricing';
import '../pages/products.css';
// Small vector mockups illustrate the kits without claiming to be product photos.
function KitArtwork({ id, name }: { id: string; name: string }) {
  return <svg viewBox="0 0 420 270" role="img" aria-label={`Визуальная концепция набора ${name}`} className={`kit-art kit-art-${id}`}>
    <rect width="420" height="270" fill={id === 'premium' ? '#222632' : '#e8e4d9'}/>
    {id === 'space' ? <g><rect x="85" y="20" width="250" height="230" rx="5" fill="#bfc9c5" stroke="#10131c" strokeWidth="7"/><path d="M210 20V250M85 195H335" stroke="#10131c" strokeWidth="5"/><text x="120" y="110" fontSize="43" fontWeight="800" fill="#10131c">TAKTO.</text><path d="M125 130H185M125 143H170" stroke="#10131c" strokeWidth="5"/><circle cx="230" cy="160" r="4" fill="#10131c"/></g> : <g>
      {id === 'premium' && <g transform="translate(220 65) rotate(12)"><path d="M0 0H125V105H0Z" fill="#d6ff00"/><path d="M0 0L25 -20H145L125 0ZM125 0L145 -20V85L125 105Z" fill="#a0bd14"/><text x="15" y="50" fill="#10131c" fontSize="23" fontWeight="800">TAKTO.</text></g>}
      <g transform="translate(55 75) rotate(-10)"><rect width="165" height="105" rx="5" fill="#10131c"/><text x="19" y="45" fontSize="26" fontWeight="800" fill="#f5f1e8">THANK YOU.</text><path d="M20 64H110M20 75H80" stroke="#d6ff00" strokeWidth="3"/></g>
      <g transform="translate(225 125) rotate(16)"><path d="M0 0L20 -16H82V115H0Z" fill="#f5f1e8" stroke="#d1ccc0"/><circle cx="40" cy="3" r="4" fill="#10131c"/><path d="M40 3C60 -55 90 -60 75 -15" fill="none" stroke="#10131c"/><text x="12" y="60" fontSize="15" fontWeight="800">TAKTO.</text></g>
      <circle cx="150" cy="203" r="37" fill="#d6ff00"/><text x="129" y="213" fill="#10131c" fontSize="38">✳</text>
      {id === 'marketplace' && <g transform="translate(260 35)"><rect width="105" height="70" rx="5" fill="white"/>{Array.from({length:13},(_,i) => <rect key={i} x={12+i*6} y="13" width={i%3+1} height="38" fill="#10131c"/>)}</g>}
      {id === 'standard' && <g transform="translate(265 40) rotate(8)"><rect width="95" height="60" rx="5" fill="#d6ff00"/><text x="12" y="36" fontSize="18" fontWeight="800">TAKTO.</text></g>}
    </g>}
    <text x="18" y="251" fontSize="9" letterSpacing="2" fill={id === 'premium' ? '#a9acb6' : '#64665f'}>TAKTO. / ВИЗУАЛЬНАЯ КОНЦЕПЦИЯ</text>
  </svg>;
}
export function ReadyKits() {
  const { openContact } = useCommerce();
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => track.current?.scrollBy({
    left: direction * (track.current.clientWidth * .8),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });

  return <section className="ready-kits page-width section-space" id="kits" aria-labelledby="kits-title">
    <div className="section-heading">
      <div><p className="eyebrow">ГОТОВЫЕ НАБОРЫ TAKTO.</p><h2 id="kits-title">Детали в сборе.</h2></div>
      <p className="section-intro">Пять комплектов для разных задач бизнеса. От первых этикеток до упаковки и оформления пространства.</p>
    </div>
    <div className="kits-toolbar">
      <p><span>01 — 05</span> Найдите свой комплект</p>
      <div className="showcase-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Предыдущие наборы" aria-controls="kits-track"><ArrowLeft size={20}/></button>
        <button type="button" onClick={() => move(1)} aria-label="Следующие наборы" aria-controls="kits-track"><ArrowRight size={20}/></button>
      </div>
    </div>
    <div className="kits-track" id="kits-track" ref={track} tabIndex={0} aria-label="Пять готовых наборов" onKeyDown={event => {
      if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
      }
    }}>
      {readyKits.map((kit, index) => <article className="kit-card" key={kit.id} aria-labelledby={`kit-${kit.id}`}>
        <div className="kit-visual"><span className="kit-index">0{index + 1}</span><KitArtwork id={kit.id} name={kit.name}/></div>
        <div className="kit-content">
          <span className="kit-number">РАЗОВЫЙ КОМПЛЕКТ</span>
          <h3 id={`kit-${kit.id}`}>{kit.name}</h3>
          <p>{kit.description}</p>
          <details><summary>Что входит <Plus size={16} aria-hidden="true"/></summary><ul>{kit.contents.map(item => <li key={item}>{item}</li>)}</ul></details>
          <strong>{formatPrice(kit.price)} <small>сум</small></strong>
          <button className="button button-dark" onClick={() => openContact(`Готовый набор: ${kit.name}\nСостав:\n${kit.contents.map(i => `• ${i}`).join('\n')}\nСтоимость: ${formatPrice(kit.price)} сум\n${commercialTermsConfirmed ? '' : 'Проектные условия. Требуется окончательное подтверждение студии.'}`)}>Выбрать набор <ArrowUpRight size={18}/></button>
        </div>
      </article>)}
    </div>
    <p className="track-hint">Листайте, чтобы увидеть все наборы <ArrowRight size={16} aria-hidden="true"/></p>
    {!commercialTermsConfirmed && <p className="offers-note">Проектные коммерческие условия. Состав и стоимость окончательно подтверждаем перед запуском заказа.</p>}
  </section>;
}
export function BusinessPlans() {
  const { openContact } = useCommerce();
  const [term, setTerm] = useState<number>(3);

  return <section className="business-section" id="business" aria-labelledby="business-title"><div className="page-width">
    <div className="section-heading">
      <div><p className="eyebrow">TAKTO. BUSINESS</p><h2 id="business-title">В ритме<br/>вашего бизнеса.</h2></div>
      <p className="section-intro">Регулярные поставки фирменной продукции и обновления дизайна без постоянного оформления новых заказов.</p>
    </div>
    <div className="business-period">
      <span>Выберите срок подписки</span>
      <div role="group" aria-label="Срок подписки">{subscriptionTerms.map(value => <button type="button" key={value} aria-pressed={term === value} onClick={() => setTerm(value)}>{value} мес.</button>)}</div>
    </div>
    <div className="business-grid">{businessPlans.map((plan, index) => <article key={plan.id} aria-labelledby={`plan-${plan.id}`}>
      <div className="business-plan-heading"><span>0{index + 1}</span><h3 id={`plan-${plan.id}`}>{plan.name}</h3></div>
      <strong className="business-price">{formatPrice(plan.price)} <small>сум / месяц</small></strong>
      <ul>
        <li><Check size={16} aria-hidden="true"/>{plan.deliveries} {plan.deliveries === 1 ? 'поставка' : 'поставки'} × 50 изделий в месяц</li>
        <li><Check size={16} aria-hidden="true"/>{plan.designUpdates} {plan.designUpdates === 1 ? 'обновление' : 'обновления'} дизайна в месяц</li>
        <li><Check size={16} aria-hidden="true"/>Срок: {term} мес.</li>
      </ul>
      <button className="button button-dark" onClick={() => openContact(`Подписка TAKTO. BUSINESS\nТариф: ${plan.name}\nСтоимость: ${formatPrice(plan.price)} сум/мес.\nСрок: ${term} месяцев\nПоставки: ${plan.deliveries} × 50 изделий в месяц\nОбновлений дизайна: ${plan.designUpdates} в месяц\nОбсудить условия и начало подписки.`)}>Обсудить подписку <ArrowUpRight size={18}/></button>
    </article>)}</div>
    <div className="business-extras">
      <p><span>Дополнительная партия</span><b>{formatPrice(additionalBatchPrice)} сум</b></p>
      <p><span>Отдельный Welcome Kit</span><b>{formatPrice(welcomeKitPrice)} сум</b></p>
    </div>
    {!commercialTermsConfirmed && <p className="offers-note">Условия подписки и дату первой поставки согласуем со студией перед оформлением.</p>}
  </div></section>;
}
