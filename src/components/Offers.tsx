import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Plus } from 'lucide-react';
import { useCommerce } from '../commerce';
import { additionalBatchPrice, businessPlans, commercialTermsConfirmed, readyKits, subscriptionTerms, welcomeKitPrice } from '../config/offers';
import { formatPrice } from '../data/pricing';
import '../pages/products.css';import startImage from '../../nabstan.png';
import standardImage from '../../nablite.png';
import premiumImage from '../../nabprem.png';
import marketplaceImage from '../../nabmarket.png';
import spaceImage from '../../nabSpace.png';


const kitImages: Record<string, string> = {
  start: startImage,
  standard: standardImage,
  premium: premiumImage,
  marketplace: marketplaceImage,
  space: spaceImage,
};


function KitArtwork({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const image = kitImages[id];

  return (
    <img
      src={image}
      alt={`Набор TAKTO. ${name}`}
      className={`kit-art kit-art-${id}`}
      loading="lazy"
      decoding="async"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
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
