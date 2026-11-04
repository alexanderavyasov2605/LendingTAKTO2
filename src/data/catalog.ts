import { productBasePrices } from './pricing';

export interface Category {
  id: string;
  name: string;
  shortName: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  description: string;
  basePrice: number;
}

export const categories: Category[] = [
  { id: 'stickers', name: 'Стикеры и наклейки', shortName: 'Стикеры', image: '/assets/01-stickers.webp' },
  { id: 'tags', name: 'Бирки и ярлыки', shortName: 'Бирки', image: '/assets/02-tags.webp' },
  { id: 'packaging', name: 'Упаковка и коробки', shortName: 'Упаковка', image: '/assets/03-packaging.webp' },
  { id: 'cards', name: 'Визитки и карточки', shortName: 'Полиграфия', image: '/assets/04-business-cards.webp' },
  { id: 'vinyl', name: 'Винил и плоттер', shortName: 'Винил', image: '/assets/vinyl.webp' },
  { id: 'windows', name: 'Оформление витрин и стёкол', shortName: 'Витрины', image: '/assets/windows.webp' },
];

const catalog: Omit<Product, 'basePrice'>[] = [
  { id: 'stickers', name: 'Фигурные стикеры', categoryId: 'stickers', image: '/assets/01-stickers.webp', description: 'Персонажи, логотипы и маленькие детали с большим характером. Форма по вашему контуру.' },
  { id: 'holographic-stickers', name: 'Голографические наклейки', categoryId: 'stickers', image: '/assets/13-material-holographic.webp', description: 'Переливающаяся поверхность для ярких акцентов на упаковке, технике и мерче.' },
  { id: 'labels', name: 'Этикетки', categoryId: 'stickers', image: '/assets/06-labels.webp', description: 'Этикетки для банок, флаконов и упаковки. Подберём основу под поверхность и условия использования.' },
  { id: 'hangtags', name: 'Бирки и ярлыки', categoryId: 'tags', image: '/assets/02-tags.webp', description: 'Плотная бумага, отверстие и шнурок. Продуманное первое знакомство с вашим продуктом.' },
  { id: 'business-cards', name: 'Визитки', categoryId: 'cards', image: '/assets/04-business-cards.webp', description: 'Визитки, которые хочется сохранить. От лаконичной матовой бумаги до выразительной отделки.' },
  { id: 'thank-you-cards', name: 'Thank You Cards', categoryId: 'cards', image: '/assets/05-postcards.webp', description: 'Тёплое спасибо в каждом заказе: карточки с вашим сообщением и фирменной графикой.' },
  { id: 'postcards', name: 'Открытки', categoryId: 'cards', image: '/assets/05-postcards.webp', description: 'Авторские открытки для подарков, коллекций и особенных поводов.' },
  { id: 'invitations', name: 'Приглашения', categoryId: 'cards', image: '/assets/05-postcards.webp', description: 'Бумажное начало вашего события. Индивидуальная композиция, формат и приятная фактура.' },
  { id: 'boxes', name: 'Брендированные коробки', categoryId: 'packaging', image: '/assets/03-packaging.webp', description: 'Упаковка под ваш продукт: конструкция, печать и сборка в одной студии.' },
  { id: 'belly-bands', name: 'Обечайки', categoryId: 'packaging', image: '/assets/03-packaging.webp', description: 'Бумажная лента, которая превращает стандартную упаковку в часть вашего бренда.' },
  { id: 'sleeves', name: 'Шуберы', categoryId: 'packaging', image: '/assets/03-packaging.webp', description: 'Внешний футляр для коробки с индивидуальной графикой и точной посадкой.' },
  { id: 'bags', name: 'Пакеты и шопперы', categoryId: 'packaging', image: '/assets/07-bags.webp', description: 'Пакеты для покупок, подарков и комплектов. Подберём формат, ручки и материал.' },
  { id: 'vinyl-stickers', name: 'Виниловые наклейки', categoryId: 'vinyl', image: '/assets/vinyl.webp', description: 'Графика для гладких поверхностей. Подбор плёнки зависит от места и срока размещения.' },
  { id: 'glass-lettering', name: 'Надписи на стекло', categoryId: 'windows', image: '/assets/windows.webp', description: 'Режим работы, логотип и навигация. Аккуратные надписи по индивидуальному макету.' },
  { id: 'window-branding', name: 'Оформление витрин', categoryId: 'windows', image: '/assets/windows.webp', description: 'Сезонные кампании и фирменное оформление, которые делают пространство узнаваемым.' },
  { id: 'plotter-cutting', name: 'Плоттерная резка', categoryId: 'vinyl', image: '/assets/12-personalization.webp', description: 'Точная резка букв, знаков и форм по векторному контуру. Подготовим к переносу.' },
  { id: 'stencils', name: 'Трафареты', categoryId: 'vinyl', image: '/assets/12-personalization.webp', description: 'Трафареты для нанесения надписей и повторяющейся графики. Материал под вашу задачу.' },
  { id: 'interior-graphics', name: 'Интерьерная графика', categoryId: 'windows', image: '/assets/windows.webp', description: 'Навигация и графика для стен, перегородок и рабочих пространств.' },
  { id: 'branded-goods', name: 'Брендированная продукция', categoryId: 'tags', image: '/assets/11-promo.webp', description: 'Мерч, сувениры и небольшие предметы с вашей айдентикой. Соберём цельную коллекцию.' },
];

export const products: Product[] = catalog.map(product => ({
  ...product,
  basePrice: productBasePrices[product.id],
}));
