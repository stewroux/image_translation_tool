
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TranslationBlock {
  japaneseText: string;
  englishText: string;
  boundingBox: BoundingBox;
}
