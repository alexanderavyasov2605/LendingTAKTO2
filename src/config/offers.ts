// Project commercial terms supplied by TAKTO. Confirm before accepting sales.
export const commercialTermsConfirmed = false;
export const readyKits = [
  { id:'start', name:'START', price:149000, description:'Первые детали вашего бренда.', contents:['50 этикеток','50 декоративных пломб','25 thank-you карточек'] },
  { id:'standard', name:'STANDARD', price:329000, description:'Цельное впечатление от каждого заказа.', contents:['100 этикеток','100 декоративных пломб','50 карточек-вкладышей','50 бирок'] },
  { id:'premium', name:'PREMIUM', price:1190000, description:'От первой детали до готовой упаковки.', contents:['200 этикеток','100 декоративных пломб','20 стикерпаков','30 малых коробок','100 бирок','100 вкладышей','10 метров брендированной ленты'] },
  { id:'marketplace', name:'MARKETPLACE', price:490000, description:'Продуманная упаковка для онлайн-продаж.', contents:['300 этикеток для маркетплейсов','100 брендированных этикеток','100 бирок','100 thank-you карточек'] },
  { id:'space', name:'SPACE BRANDING', price:720000, description:'Ваш характер — в вашем пространстве.', contents:['Логотип на стекло','Режим работы','Надписи','Монтаж'] },
] as const;
export const businessPlans = [
  { id:'lite', name:'BUSINESS LITE', price:179000, deliveries:1, designUpdates:1 },
  { id:'standard', name:'BUSINESS STANDARD', price:289000, deliveries:2, designUpdates:2 },
  { id:'max', name:'BUSINESS MAX', price:409000, deliveries:3, designUpdates:3 },
] as const;
export const subscriptionTerms = [3, 6, 12] as const;
export const additionalBatchPrice = 109000;
export const welcomeKitPrice = 129000;
