export enum Metal {
  GOLD = 'Gold',
  SILVER = 'Silber',
}

export enum WeightUnit {
  GRAM = 'g',
  OUNCE = 'oz',
}

export enum ItemType {
  COIN = 'Münze',
  BAR = 'Barren',
}

export interface Item {
  id: string;
  name: string;
  weight: number;
  weightUnit: WeightUnit;
  itemType: ItemType;
  metal: Metal;
  purity: number;
  purchaseDate: string; // ISO string format YYYY-MM-DD
  purchasePrice: number;
  quantity: number;
  mintingDate: string;
  notes: string;
}

export interface PriceData {
  date: string;
  price: number;
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export enum Timeframe {
    INTRADAY = 'Interday',
    WEEK = 'Woche',
    MONTH = 'Monat',
    YEAR = 'Jahr',
    FIVE_YEARS = '5 Jahre',
    MAX = 'Max',
}