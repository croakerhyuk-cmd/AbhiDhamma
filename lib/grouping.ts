import type { Classification, Citta, CittaGroup } from './types';

export function groupCittas(cittas: Citta[], classification: Classification): CittaGroup[] {
  const byId = new Map(cittas.map((citta) => [citta.id, citta]));
  return classification.groups.map((group, index) => ({
    index,
    items: cittas.filter((citta) => citta.groups[classification.id] === group.name.en),
    name: group.name,
  }));
}
