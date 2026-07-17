import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';
import { z } from 'zod';
import type { Classification, ClassificationGroup, ExplorerDataset, ExplorerItem, LocaleText } from './types';

const localeSchema = z.object({ kor: z.string(), pli: z.string(), en: z.string() });
const legacyLocaleSchema = z.object({ ko: z.string(), pi: z.string().optional(), en: z.string().optional() });
const cittaSchema = z.object({
  // A citta only needs name and groups. id/number remain accepted for
  // backwards compatibility, but are not required in YAML.
  id: z.union([z.string(), z.number()]).transform(String).optional(), number: z.number().optional(),
  name: z.union([localeSchema, legacyLocaleSchema]),
  groups: z.union([z.record(z.string(), z.unknown()), z.array(z.string())]).optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  short: z.unknown().optional(), icon: z.string().optional(),
});
const classificationGroupSchema: z.ZodTypeAny = z.lazy(() => z.object({
  id: z.string().optional(),
  name: localeSchema.optional(),
  label: z.object({ ko: z.string() }).optional(),
  groups: z.array(classificationGroupSchema).optional(),
  description: z.unknown().optional(),
}));
const classificationSchema = z.object({
  id: z.string(),
  name: z.union([localeSchema, legacyLocaleSchema]).optional(),
  label: legacyLocaleSchema.optional(),
  description: z.union([z.object({ kor: z.string() }), z.object({ ko: z.string() })]),
  groups: z.union([z.array(classificationGroupSchema), z.record(z.string(), z.unknown())]),
});

function locale(value: z.infer<typeof localeSchema> | z.infer<typeof legacyLocaleSchema>): LocaleText {
  if ('kor' in value) return value;
  return { kor: value.ko, pli: value.pi ?? '', en: value.en ?? '' };
}

function normalizeCitta(raw: z.infer<typeof cittaSchema>, index: number): ExplorerItem {
  const source = raw.groups ?? raw.attributes ?? {};
  const groups = Array.isArray(source)
    ? Object.fromEntries(source.map((id) => [id, id]))
    : Object.fromEntries(Object.entries(source).map(([key, value]) => [key, typeof value === 'string' ? value : key]));
  if (groups.plane) {
    groups.bhumi = groups.plane;
    delete groups.plane;
  }
  const groupIds = Object.entries(groups).flatMap(([key, value]) => [key, value]).filter((value, i, all) => value && all.indexOf(value) === i);
  return { key: raw.id ?? `citta-${index}`, name: locale(raw.name), groups, groupIds };
}

function normalizeGroup(raw: { id?: string; name?: LocaleText; label?: { ko: string }; groups?: unknown[] }, classificationId: string, index: number): ClassificationGroup {
  const kor = raw.name?.kor ?? raw.label?.ko ?? '';
  return { id: raw.id ?? (groupValue(classificationId, kor) || `${classificationId}-${index}`), name: raw.name ?? { kor, pli: '', en: groupValue(classificationId, kor) }, groups: raw.groups?.map((child, childIndex) => normalizeGroup(child as Parameters<typeof normalizeGroup>[0], classificationId, childIndex)) };
}

function normalizeClassification(raw: z.infer<typeof classificationSchema>): Classification {
  const rawGroups = Array.isArray(raw.groups)
    ? raw.groups
    : Object.keys(raw.groups).map((id) => ({ id, name: { kor: id, pli: '', en: id } }));
  const rawName = raw.name ?? raw.label ?? { ko: raw.id, pi: raw.id, en: raw.id };
  return {
    id: raw.id,
    name: locale(rawName),
    description: { kor: 'kor' in raw.description ? raw.description.kor : raw.description.ko },
    groups: rawGroups.map((group, index) => normalizeGroup(group as Parameters<typeof normalizeGroup>[0], raw.id, index)),
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
  const filePath = path.join(process.cwd(), 'data', file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`YAML 데이터 파일을 찾을 수 없습니다: data/${file}. 파일 경로와 dhamma_group 설정을 확인하세요.`);
  }
  return load(fs.readFileSync(filePath, 'utf8')) as T;
}

function readItems(file: string) {
  return z.array(cittaSchema).parse(readYaml<unknown>(`item/${file}`)).map(normalizeCitta);
}

function readClassifications(file: string) {
  return z.array(classificationSchema).parse(readYaml<unknown>(`classification/${file}`)).map(normalizeClassification);
}

export function getCittas(): ExplorerItem[] { return readItems('citta.yaml'); }
export function getClassifications(): Classification[] { return readClassifications('citta.yaml'); }

const datasetSchema = z.object({
  id: z.string(),
  name: z.union([localeSchema, legacyLocaleSchema]).optional(), label: legacyLocaleSchema.optional(),
  description: z.union([z.object({ kor: z.string() }), z.object({ ko: z.string() })]),
  itemName: z.union([localeSchema, legacyLocaleSchema]).optional(), itemLabel: legacyLocaleSchema.optional(),
  itemsFile: z.string(), classificationsFile: z.string(),
  parentId: z.string().optional(),
  children: z.array(z.string()).optional(),
  groupDatasets: z.record(z.string(), z.string()).optional(),
});

export function getExplorerDatasets(): ExplorerDataset[] {
  const categories = z.array(datasetSchema).parse(readYaml<unknown>('datasets.yaml'));
  return categories.map((category) => {
    const indexFile = `dhamma_group/${category.id}.yaml`;
    let entries: Array<{ id: string; name?: { kor: string; pli?: string; en?: string }; item: string; classification: string }> = [];
    try { entries = z.array(z.object({ id: z.string(), name: z.object({ kor: z.string(), pli: z.string().optional(), en: z.string().optional() }).optional(), item: z.string(), classification: z.string() })).parse(readYaml<unknown>(indexFile)); } catch { /* A category may not have groups yet. */ }
    const groups = entries.map((entry) => {
      const items = readItems(entry.item);
      const classifications = readClassifications(entry.classification);
      const groupName = entry.name?.kor || entry.id;
      return {
        id: entry.id, name: { kor: groupName, pli: entry.name?.pli || entry.id, en: entry.name?.en || entry.id }, description: { kor: '' },
        itemName: locale(category.itemName ?? category.itemLabel!), items, classifications,
        itemFile: entry.item, classificationFile: entry.classification,
      } satisfies ExplorerDataset;
    });
    return {
      id: category.id, name: locale(category.name ?? category.label!),
      description: { kor: 'kor' in category.description ? category.description.kor : category.description.ko },
      itemName: locale(category.itemName ?? category.itemLabel!), items: groups[0]?.items ?? [],
      classifications: groups[0]?.classifications ?? [], dhammaGroups: groups,
    } satisfies ExplorerDataset;
  });
}
