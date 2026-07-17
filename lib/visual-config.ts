import { Utensils, Infinity, Mountain, Sparkles, type LucideIcon } from 'lucide-react';

/** Visual language for the classifications shown on each citta card. */
export const jatiVisuals = {
  akusala: '#b5483f',
  kusala: '#c49a22',
  akusala_vipaka: '#477da8',
  kusala_vipaka: '#21c534',
  kiriya: '#242321',
} as const;

/** Icons suggest the four planes: sensory flow, form, formlessness, and transcendence. */
export const bhumiVisuals: Record<string, { icon: LucideIcon; className: string }> = {
  kama: { icon: Utensils, className: 'bhumi-kama' },
  rupa: { icon: Mountain, className: 'bhumi-rupa' },
  arupa: { icon: Infinity, className: 'bhumi-arupa' },
  lokuttara: { icon: Sparkles, className: 'bhumi-lokuttara' },
};

export function getJatiVisual(jati?: string) {
  return jatiVisuals[jati as keyof typeof jatiVisuals] ?? '#d9d4c9';
}

export function getBhumiVisual(bhumi?: string) {
  return bhumiVisuals[bhumi ?? ''] ?? { icon: Sparkles, className: 'bhumi-unknown' };
}
