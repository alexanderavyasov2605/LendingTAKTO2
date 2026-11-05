export interface Material {
  id: string;
  name: string;
  description: string;
  image: string;
}

/** Visual concepts from the supplied asset collection, not certified material samples. */
export const materials: Material[] = [
  { id: 'holographic', name: 'Holographic', description: 'Переливы, которые меняются вместе со светом.', image: '/assets/13-material-holographic.webp' },
  { id: 'rainbow', name: 'Rainbow', description: 'Цветные отражения и выразительный радужный эффект.', image: '/assets/14-material-dichroic.webp' },
  { id: 'broken-glass', name: 'Broken Glass', description: 'Идея преломлённого света и мерцающих граней.', image: '/assets/13-material-holographic.webp' },
  { id: 'matte', name: 'Matte', description: 'Спокойная поверхность и глубокий цвет.', image: '/assets/04-business-cards.webp' },
  { id: 'gloss', name: 'Gloss', description: 'Глянцевый акцент для яркой полиграфии.', image: '/assets/06-labels.webp' },
  { id: 'transparent', name: 'Transparent', description: 'Графика на прозрачной основе для стекла и упаковки.', image: '/assets/windows.webp' },
  { id: 'soft-touch', name: 'Soft Touch', description: 'Мягкое на ощупь покрытие для приятного первого впечатления.', image: '/assets/04-business-cards.webp' },
  { id: 'vinyl', name: 'Vinyl', description: 'Плёнки для графики, надписей и оформления пространства.', image: '/assets/vinyl.webp' },
  { id: 'metallic', name: 'Metallic', description: 'Металлические отражения для заметной детали.', image: '/assets/19-material-mirror.webp' },
  { id: 'textured-paper', name: 'Textured Paper', description: 'Выразительная фактура для тактильного знакомства с брендом.', image: '/assets/02-tags.webp' },
];

export const materialsNote = 'Визуальные концепты материалов и отделки. Фактуру, цвет и технические свойства подтверждаем по физическому образцу.';
