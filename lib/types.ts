export type LocaleText = { kor: string; pli: string; en: string };

export type Citta = {
  id: string;
  number?: number;
  name: LocaleText;
  groups: Record<string, string>;
};

export type Classification = {
  id: string;
  name: LocaleText;
  description: { kor: string };
  groups: { name: LocaleText }[];
};

export type CittaGroup = { index: number; name: LocaleText; items: Citta[] };

export type ExplorerDataset = {
  id: string;
  name: LocaleText;
  description: { kor: string };
  itemName: LocaleText;
  items: Citta[];
  classifications: Classification[];
};
