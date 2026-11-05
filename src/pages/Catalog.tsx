
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { categories, products, type Product } from '../data/catalog';
import { useCommerce } from '../commerce';
import './catalog.css';

const TELEGRAM_URL = 'https://t.me/takto_order';
const money = new Intl.NumberFormat('ru-RU');

function CatalogProduct({ product }: { product: Product }) {
  const { favorites, toggleFavorite, addItem } = useCommerce();
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isFavorite = favorites.includes(product.id);
  const category = categories.find(
    item => item.id === product.categoryId
  );

  function addToCart() {
    addItem({
      id: product.id,
      name: product.name,
      unitPrice: product.basePrice,
      quantity: 1,
      details: product.description,
    });
    setAdded(true);
  }

  return (
    <article className="catalog-product">
      <div className="catalog-product-image">
        <a
          className="catalog-image-button"
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Уточнить стоимость: ${product.name}`}
        >
          {imageFailed ? (
            <span className="catalog-image-error">
              <ShoppingBag
                size={32}
                strokeWidth={1.3}
                aria-hidden="true"
              />
              <span>Изображение не загрузилось</span>
              <small>Уточните параметры изделия в Telegram</small>
            </span>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              width="640"
              height="640"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}
        </a>

        <button
          className={`catalog-favorite ${isFavorite ? 'is-saved' : ''}`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={`${
            isFavorite ? 'Убрать из избранного' : 'В избранное'
          }: ${product.name}`}
          aria-pressed={isFavorite}
        >
          <Heart
            size={19}
            fill={isFavorite ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
        </button>

        <span className="catalog-product-tag">
          {category?.shortName}
        </span>
      </div>

      <div className="catalog-product-content">
        <h2>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Уточнить стоимость: ${product.name}`}
          >
            {product.name}
          </a>
        </h2>

        <p>{product.description}</p>

        <div className="catalog-product-price">
          <strong>
            от {money.format(product.basePrice)} <span>UZS</span>
          </strong>
          <small>ориентир за шт.</small>
        </div>

        <div className="catalog-product-actions">
          <button
            className="catalog-add"
            onClick={addToCart}
            aria-label={`Добавить в корзину: ${product.name}`}
          >
            {added ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <ShoppingBag size={17} aria-hidden="true" />
            )}
            {added ? 'Добавить ещё' : 'В корзину'}
          </button>

          <a
            className="catalog-configure"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Уточнить параметры: ${product.name}`}
            title="Уточнить параметры в Telegram"
          >
            <SlidersHorizontal size={19} aria-hidden="true" />
          </a>
        </div>

        <span className="catalog-sr" role="status">
          {added ? `${product.name}: добавлено в корзину` : ''}
        </span>
      </div>
    </article>
  );
}

export default function Catalog() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [params, setParams] = useSearchParams();
  const pendingParams = useRef(params);

  useEffect(() => {
    pendingParams.current = params;
  }, [params]);

  const { favorites } = useCommerce();
  const root = useRef<HTMLElement>(null);

  const search = params.get('search') ?? '';
  const savedOnly = params.get('saved') === '1';
  const sort = params.get('sort') ?? 'recommended';

  const activeCategory = categories.find(
    category => category.id === categoryId
  );

  const invalidCategory = Boolean(categoryId && !activeCategory);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(pendingParams.current);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    pendingParams.current = next;
    setParams(next, { replace: true });
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ru');

    const filtered = products.filter(product => {
      const categoryName =
        categories.find(item => item.id === product.categoryId)?.name ?? '';

      return (
        (!categoryId || product.categoryId === categoryId) &&
        (!savedOnly || favorites.includes(product.id)) &&
        (!query ||
          `${product.name} ${product.description} ${categoryName}`
            .toLocaleLowerCase('ru')
            .includes(query))
      );
    });

    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    }

    if (sort === 'price-desc') {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    }

    return filtered;
  }, [categoryId, search, savedOnly, favorites, sort]);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          const cards = root.current?.querySelectorAll(
            '.catalog-product'
          );

          if (cards?.length) {
            gsap.from(cards, {
              y: 16,
              opacity: 0,
              duration: 0.4,
              stagger: 0.035,
              ease: 'power2.out',
              clearProps: 'all',
            });
          }
        }
      );

      return () => media.revert();
    },
    {
      scope: root,
      dependencies: [categoryId, search, savedOnly, sort],
      revertOnUpdate: true,
    }
  );

  const querySuffix = params.toString()
    ? `?${params.toString()}`
    : '';

  return (
    <main
      ref={root}
      className="catalog-page"
      id="main-content"
    >
      <div className="catalog-breadcrumb">
        <Link to="/">Главная</Link>
        <ChevronRight size={14} aria-hidden="true" />

        {activeCategory ? (
          <>
            <Link to="/catalog">Каталог</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{activeCategory.shortName}</span>
          </>
        ) : (
          <span>Каталог</span>
        )}
      </div>

      <div className="catalog-intro">
        <div>
          <span className="catalog-eyebrow">
            МАЛЕНЬКИЕ ДЕТАЛИ. БОЛЬШОЙ ХАРАКТЕР.
          </span>

          <h1>
            {invalidCategory
              ? 'Категория не найдена'
              : activeCategory?.name ?? 'Ваш бренд. В деталях.'}
          </h1>

          <p>
            Выберите основу. Добавьте свою идею.
            <br />
            Всё остальное — сделаем вместе.
          </p>
        </div>

        <a
          className="catalog-custom"
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Индивидуальный расчёт
          <ArrowRight size={19} aria-hidden="true" />
        </a>
      </div>

      <nav
        className="catalog-categories"
        aria-label="Категории продукции"
      >
        <Link
          to={`/catalog${querySuffix}`}
          className={!categoryId ? 'is-active' : ''}
          aria-current={!categoryId ? 'page' : undefined}
        >
          Вся продукция <span>{products.length}</span>
        </Link>

        {categories.map(category => (
          <Link
            key={category.id}
            to={`/catalog/${category.id}${querySuffix}`}
            className={
              categoryId === category.id ? 'is-active' : ''
            }
            aria-current={
              categoryId === category.id ? 'page' : undefined
            }
          >
            {category.shortName}
          </Link>
        ))}
      </nav>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={20} aria-hidden="true" />

          <input
            type="search"
            aria-label="Поиск в каталоге"
            placeholder="Найдите то, что хочется создать"
            value={search}
            onChange={event =>
              updateParam('search', event.target.value)
            }
          />

          {search && (
            <button
              aria-label="Очистить поиск"
              onClick={() => updateParam('search', '')}
            >
              <X size={17} />
            </button>
          )}
        </label>

        <button
          className={`catalog-saved-toggle ${
            savedOnly ? 'is-active' : ''
          }`}
          aria-pressed={savedOnly}
          onClick={() =>
            updateParam('saved', savedOnly ? '' : '1')
          }
        >
          <Heart
            size={17}
            fill={savedOnly ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
          Избранное <span>{favorites.length}</span>
        </button>

        <label className="catalog-sort">
          <ArrowDownWideNarrow
            size={18}
            aria-hidden="true"
          />

          <span className="catalog-sr">
            Сортировка товаров
          </span>

          <select
            value={sort}
            onChange={event =>
              updateParam(
                'sort',
                event.target.value === 'recommended'
                  ? ''
                  : event.target.value
              )
            }
          >
            <option value="recommended">
              Рекомендуемые
            </option>
            <option value="price-asc">
              Сначала дешевле
            </option>
            <option value="price-desc">
              Сначала дороже
            </option>
          </select>
        </label>
      </div>

      <div className="catalog-results-info">
        <span role="status">
          Найдено: {filteredProducts.length}
        </span>

        <span>
          Демонстрационные цены · точную стоимость уточняйте в Telegram
        </span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="catalog-grid">
          {filteredProducts.map(product => (
            <CatalogProduct
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <Search
            size={32}
            strokeWidth={1.3}
            aria-hidden="true"
          />

          <h2>
            {invalidCategory
              ? 'Начнём с полного каталога?'
              : savedOnly && !search
                ? 'Здесь будут ваши находки'
                : 'Пока ничего не нашли'}
          </h2>

          <p>
            {savedOnly && !search
              ? 'Нажмите на сердечко у понравившегося изделия, чтобы сохранить его.'
              : 'Попробуйте другое название или посмотрите все категории.'}
          </p>

          <Link to="/catalog">
            Показать всю продукцию
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="catalog-bottom-callout">
        <span className="catalog-spark" aria-hidden="true">
          ✳
        </span>

        <div>
          <h2>Не нашли свою идею?</h2>
          <p>
            Нестандартный формат, необычный материал,
            особенная задача — нам интересно.
          </p>
        </div>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Давайте обсудим
          <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>

      <p className="catalog-image-note">
        Изображения — визуальные концепты продукции.
        Материалы, тираж и итоговую стоимость согласуем
        перед производством.
      </p>
    </main>
  );
}
