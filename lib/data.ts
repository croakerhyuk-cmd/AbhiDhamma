import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { z } from 'zod';
import type { Classification, Citta, ExplorerDataset, LocaleText } from './types';

const localeSchema = z.object({ kor: z.string(), pli: z.string(), en: z.string() });
const legacyLocaleSchema = z.object({ ko: z.string(), pi: z.string().optional(), en: z.string().optional() });
const cittaSchema = z.object({
  id: z.string(), number: z.number().optional(),
  name: z.union([localeSchema, legacyLocaleSchema]),
  groups: z.record(z.string(), z.string()).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  short: z.unknown().optional(), icon: z.string().optional(),
});
const classificationSchema = z.object({
  id: z.string(),
  name: z.union([localeSchema, legacyLocaleSchema]).optional(),
  label: legacyLocaleSchema.optional(),
  description: z.union([z.object({ kor: z.string() }), z.object({ ko: z.string() })]),
  groups: z.array(z.union([
    z.object({ name: localeSchema }),
    z.object({ label: z.object({ ko: z.string() }), items: z.array(z.string()).optional() }),
  ])),
});

function locale(value: z.infer<typeof localeSchema> | z.infer<typeof legacyLocaleSchema>): LocaleText {
  if ('kor' in value) return value;
  return { kor: value.ko, pli: value.pi ?? '', en: value.en ?? '' };
}

function normalizeCitta(raw: z.infer<typeof cittaSchema>): Citta {
  const groups = { ...(raw.groups ?? raw.attributes ?? {}) };
  if (groups.plane) {
    groups.bhumi = groups.plane;
    delete groups.plane;
  }
  return { id: raw.id, number: raw.number, name: locale(raw.name), groups };
}

function normalizeClassification(raw: z.infer<typeof classificationSchema>): Classification {
  return {
    id: raw.id,
    name: locale(raw.name ?? raw.label!),
    description: { kor: 'kor' in raw.description ? raw.description.kor : raw.description.ko },
    groups: raw.groups.map((group) => 'name' in group
      ? group
      : { name: { kor: group.label.ko, pli: '', en: groupValue(raw.id, group.label.ko) } }),
  };
}

function groupValue(classificationId: string, kor: string): string {
  const values: Record<string, Record<string, string>> = {
    bhumi: { '욕계 마음': 'sense-sphere', '색계 마음': 'fine-material', '무색계 마음': 'immaterial', '출세간 마음': 'supramundane' },
    feeling: { 기쁨: 'joy', 평온: 'equanimity', 불쾌: 'aversion', '즐거운 감각': 'pleasure', '괴로운 감각': 'pain' },
    root: { 탐욕: 'greed', 성냄: 'hatred', 어리석음: 'delusion', '탐욕 없음': 'non-greed', '뿌리 없음': 'neutral' },
    prompt: { 자발적: 'spontaneous', 유도됨: 'prompted' },
  };
  return values[classificationId]?.[kor] ?? kor;
}

function readYaml<T>(file: string): T {
  return load(fs.readFileSync(path.join(process.cwd(), 'data', file), 'utf8')) as T;
}

export function getCittas(): Citta[] { return z.array(cittaSchema).parse(readYaml<unknown>('citta.yaml')).map(normalizeCitta); }
export function getClassifications(): Classification[] { return z.array(classificationSchema).parse(readYaml<unknown>('citta-classification.yaml')).map(normalizeClassification); }

const datasetSchema = z.object({
  id: z.string(),
  name: z.union([localeSchema, legacyLocaleSchema]).optional(), label: legacyLocaleSchema.optional(),
  description: z.union([z.object({ kor: z.string() }), z.object({ ko: z.string() })]),
  itemName: z.union([localeSchema, legacyLocaleSchema]).optional(), itemLabel: legacyLocaleSchema.optional(),
  itemsFile: z.string(), classificationsFile: z.string(),
});

export function getExplorerDatasets(): ExplorerDataset[] {
  const datasets = z.array(datasetSchema).parse(readYaml<unknown>('datasets.yaml'));
  return datasets.map((dataset) => ({
    id: dataset.id,
    name: locale(dataset.name ?? dataset.label!),
    description: { kor: 'kor' in dataset.description ? dataset.description.kor : dataset.description.ko },
    itemName: locale(dataset.itemName ?? dataset.itemLabel!),
    items: z.array(cittaSchema).parse(readYaml<unknown>(dataset.itemsFile)).map(normalizeCitta),
    classifications: z.array(classificationSchema).parse(readYaml<unknown>(dataset.classificationsFile)).map(normalizeClassification),
  }));
}
