export type LocaleText = { kor: string; pli: string; en: string };

export type ExplorerItem = {
  /** YAML에 id를 작성하지 않아도 되도록 앱 내부에서 생성하는 키입니다. */
  key: string;
  name: LocaleText;
  groups: Record<string, string>;
  groupIds: string[];
  /** 이 마음과 함께 일어나는 여섯 가지 원인(hetuka)입니다. */
  hetuka: string[];
};

export type Citta = ExplorerItem;

export type ClassificationGroup = {
  id: string;
  name: LocaleText;
  groups?: ClassificationGroup[];
};

export type Classification = {
  id: string;
  name: LocaleText;
  description: { kor: string };
  groups: ClassificationGroup[];
};

export type ExplorerGroup = { index: number; id: string; name: LocaleText; items: ExplorerItem[]; depth: number };
export type CittaGroup = ExplorerGroup;

export type ExplorerDataset = {
  id: string;
  name: LocaleText;
  description: { kor: string };
  itemName: LocaleText;
  items: ExplorerItem[];
  classifications: Classification[];
  parentId?: string;
  children?: string[];
  groupDatasets?: Record<string, string>;
  dhammaGroups?: ExplorerDataset[];
  itemFile?: string;
  classificationFile?: string;
};
