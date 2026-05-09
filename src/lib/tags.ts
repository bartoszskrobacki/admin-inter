export const PROMOTION_TAGS = [
  'bar_u_piotra',
  'restauracja_goscinna',
  'stolowka_studencka',
] as const;

export type PromotionTag = typeof PROMOTION_TAGS[number];
