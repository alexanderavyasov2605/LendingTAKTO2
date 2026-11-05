/** Illustrative rates only. Replace with the studio's approved production price list. */
export const pricing = {
  currency: 'UZS',
  preliminary: true,
  setup: 25000,
  minimumTotal: 50000,
  baseUnit: 1800,
  baseAreaCm2: 25,
  categoryMultipliers: { stickers: 1, tags: 1.3, packaging: 8, cards: 1.6, vinyl: 2.4, windows: 3.2 } as Record<string, number>,
  materials: [
    { id: 'paper', name: 'Мелованная бумага', multiplier: 1 },
    { id: 'matte', name: 'Матовая плёнка', multiplier: 1.25 },
    { id: 'gloss', name: 'Глянцевая плёнка', multiplier: 1.3 },
    { id: 'holographic', name: 'Голографическая плёнка', multiplier: 1.9 },
    { id: 'transparent', name: 'Прозрачная плёнка', multiplier: 1.45 },
    { id: 'soft-touch', name: 'Soft Touch', multiplier: 1.65 },
    { id: 'vinyl', name: 'Винил', multiplier: 1.5 },
    { id: 'textured', name: 'Фактурная бумага', multiplier: 1.7 },
  ],
  fullColorMultiplier: 1.2,
  doubleSidedMultiplier: 1.65,
  laminationPerUnit: 400,
  dieCutPerUnit: 350,
  assemblyPerUnit: 700,
  designFee: 150000,
  urgentMultiplier: 1.3,
  quantityDiscounts: [{ min: 1000, multiplier: .65 }, { min: 500, multiplier: .75 }, { min: 100, multiplier: .88 }],
} as const;

export type QuoteOptions = {
  categoryId: string; materialId: string; quantity: number; width: number; height: number;
  color: 'mono' | 'full' | 'double'; lamination: boolean; dieCut: boolean; design: boolean; assembly: boolean; urgent: boolean;
};

export const defaultQuote: QuoteOptions = {
  categoryId: 'stickers', materialId: 'paper', quantity: 100, width: 5, height: 5,
  color: 'full', lamination: false, dieCut: true, design: false, assembly: false, urgent: false,
};

export function calculateQuote(options: QuoteOptions) {
  const quantity = Math.min(100000, Math.max(1, Math.round(Number(options.quantity) || 1)));
  const width = Math.min(300, Math.max(1, Number(options.width) || 1));
  const height = Math.min(300, Math.max(1, Number(options.height) || 1));
  const material = pricing.materials.find(item => item.id === options.materialId) ?? pricing.materials[0];
  const categoryMultiplier = Object.hasOwn(pricing.categoryMultipliers, options.categoryId) ? pricing.categoryMultipliers[options.categoryId] : 1;
  const areaMultiplier = Math.max(.35, width * height / pricing.baseAreaCm2);
  const colorMultiplier = options.color === 'full' ? pricing.fullColorMultiplier : options.color === 'double' ? pricing.doubleSidedMultiplier : 1;
  const discount = pricing.quantityDiscounts.find(tier => quantity >= tier.min)?.multiplier ?? 1;
  const extrasPerUnit = (options.lamination ? pricing.laminationPerUnit : 0) + (options.dieCut ? pricing.dieCutPerUnit : 0) + (options.assembly ? pricing.assemblyPerUnit : 0);
  const production = (pricing.baseUnit * categoryMultiplier * areaMultiplier * material.multiplier * colorMultiplier * discount + extrasPerUnit) * quantity;
  const total = Math.ceil(Math.max(pricing.minimumTotal, (production + pricing.setup + (options.design ? pricing.designFee : 0)) * (options.urgent ? pricing.urgentMultiplier : 1)) / 100) * 100;
  return { total, unitPrice: total / quantity, quantity, width, height, material: material.name, discount: Math.round((1 - discount) * 100) };
}

export const formatPrice = (amount: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount);

export const productBasePrices: Record<string, number> = {
  stickers: 1800, 'holographic-stickers': 3500, labels: 1500, hangtags: 2500,
  'business-cards': 3000, 'thank-you-cards': 2800, postcards: 4000, invitations: 6500,
  boxes: 18000, 'belly-bands': 5500, sleeves: 7000, bags: 12000,
  'vinyl-stickers': 8500, 'glass-lettering': 35000, 'window-branding': 95000,
  'plotter-cutting': 15000, stencils: 22000, 'interior-graphics': 45000, 'branded-goods': 18000,
};
