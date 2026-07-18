import {
  CircleDot,
  CircleOff,
  CircleX,
  Flower2,
  Frown,
  Heart,
  Infinity,
  Leaf,
  Minus,
  Mountain,
  ShieldAlert,
  Smile,
  Sparkles,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Visual language for the classifications shown on each citta card. */
export const jatiVisuals = {
  akusala: '#dc2626',
  kusala: '#ea580c',
  akusala_vipaka: '#ca8a04',
  kusala_vipaka: '#16a34a',
  kiriya: '#2563eb',
} as const;

/** Icons suggest the four planes: sensory flow, form, formlessness, and transcendence. */
export const bhumiVisuals: Record<string, { icon: LucideIcon; className: string }> = {
  kama: { icon: Utensils, className: 'bhumi-kama' },
  kammavacara: { icon: Utensils, className: 'bhumi-kama' },
  rupa: { icon: Mountain, className: 'bhumi-rupa' },
  rupavacara: { icon: Mountain, className: 'bhumi-rupa' },
  arupa: { icon: Infinity, className: 'bhumi-arupa' },
  arupavacara: { icon: Infinity, className: 'bhumi-arupa' },
  lokuttara: { icon: Sparkles, className: 'bhumi-lokuttara' },
};

/** Compact, recognizable markers for the group memberships displayed on cards. */
const groupVisuals: Record<string, Record<string, { icon: LucideIcon; className: string }>> = {
  jati: {
    akusala: { icon: CircleX, className: 'group-jati-akusala' },
    kusala: { icon: Leaf, className: 'group-jati-kusala' },
    'akusala-vipaka': { icon: ShieldAlert, className: 'group-jati-akusala-vipaka' },
    'kusala-vipaka': { icon: Heart, className: 'group-jati-kusala-vipaka' },
    kiriya: { icon: Zap, className: 'group-jati-kiriya' },
  },
  feeling: {
    somanassa: { icon: Smile, className: 'group-feeling-somanassa' },
    domanassa: { icon: Frown, className: 'group-feeling-domanassa' },
    upekkha: { icon: Minus, className: 'group-feeling-upekkha' },
    sukha: { icon: Heart, className: 'group-feeling-sukha' },
    dukkha: { icon: CircleX, className: 'group-feeling-dukkha' },
  },
  hetuka: {
    ahetuka: { icon: CircleOff, className: 'group-hetuka-ahetuka' },
    ekahetuka: { icon: CircleDot, className: 'group-hetuka-rooted' },
    dvihetuka: { icon: CircleDot, className: 'group-hetuka-rooted' },
    tihetuka: { icon: CircleDot, className: 'group-hetuka-rooted' },
  },
  beauty: {
    ugly: { icon: ShieldAlert, className: 'group-beauty-ugly' },
    beautiful: { icon: Flower2, className: 'group-beauty-beautiful' },
  },
};

export function getJatiVisual(jati?: string) {
  const normalizedJati = jati?.replaceAll('-', '_');
  return jatiVisuals[normalizedJati as keyof typeof jatiVisuals] ?? '#d9d4c9';
}

export function getBhumiVisual(bhumi?: string) {
  return bhumiVisuals[bhumi ?? ''] ?? { icon: Sparkles, className: 'bhumi-unknown' };
}

export function getGroupVisual(classificationId: string, groupId?: string) {
  if (classificationId === 'bhumi') return getBhumiVisual(groupId);
  return groupVisuals[classificationId]?.[groupId ?? ''] ?? { icon: CircleDot, className: 'group-unknown' };
}
