import { Utensils, Infinity, Mountain, Sparkles, type LucideIcon } from 'lucide-react';

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
  rupa: { icon: Mountain, className: 'bhumi-rupa' },
  arupa: { icon: Infinity, className: 'bhumi-arupa' },
  lokuttara: { icon: Sparkles, className: 'bhumi-lokuttara' },
};

export function getJatiVisual(jati?: string) {
  const normalizedJati = jati?.replaceAll('-', '_');
  return jatiVisuals[normalizedJati as keyof typeof jatiVisuals] ?? '#d9d4c9';
}

export function getBhumiVisual(bhumi?: string) {
  return bhumiVisuals[bhumi ?? ''] ?? { icon: Sparkles, className: 'bhumi-unknown' };
}
