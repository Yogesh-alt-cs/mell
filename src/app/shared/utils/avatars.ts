// 20 handcrafted, diverse circular avatars. Pure SVG, no external assets.
// Direct port of avatars.tsx from the React codebase.

export interface AvatarSpec {
  key: string;
  bg: string;
  skin: string;
  hair: string;
  shirt: string;
  hairStyle: 0 | 1 | 2 | 3 | 4;
  glasses: boolean;
  initials?: string;
  icon?: 'star' | 'music' | 'code' | 'leaf';
}

const BG   = ['#FDE7D5','#FFF6E0','#FCE4EC','#DBEAFE','#DCFCE7','#FEF9C3','#EDE9FE','#FFE4E6'] as const;
const SKIN = ['#F4C7A1','#E0A878','#B07A4E','#7C4A2A','#F7D6BA','#C68863'] as const;
const HAIR = ['#2A1B0F','#5B3A1E','#8D5A2B','#D4A24C','#B82E2E','#3F3F46','#6B21A8','#0F172A'] as const;
const SHIRT= ['#F59E0B','#10B981','#3B82F6','#EC4899','#8B5CF6','#EF4444','#14B8A6','#F97316'] as const;

function pick<T>(arr: readonly T[], i: number): T { return arr[i % arr.length]; }

export const AVATARS: AvatarSpec[] = Array.from({ length: 20 }, (_, i) => {
  const variants: Partial<AvatarSpec>[] = [
    { initials: 'AL' }, { hairStyle: 1 }, { hairStyle: 2, glasses: true }, { icon: 'star' },
    { hairStyle: 4 }, { initials: 'MK' }, { hairStyle: 3 }, { icon: 'music' },
    { hairStyle: 1, glasses: true }, { initials: 'JS' }, { hairStyle: 0 }, { icon: 'code' },
    { hairStyle: 2 }, { hairStyle: 4, glasses: true }, { initials: 'RV' }, { icon: 'leaf' },
    { hairStyle: 1 }, { hairStyle: 0, glasses: true }, { initials: 'EN' }, { hairStyle: 3 },
  ];
  const v = variants[i] ?? {};
  return {
    key: `av-${i + 1}`,
    bg: pick(BG, i),
    skin: pick(SKIN, i + 1),
    hair: pick(HAIR, i + 2),
    shirt: pick(SHIRT, i + 3),
    hairStyle: (v.hairStyle ?? (i % 5)) as AvatarSpec['hairStyle'],
    glasses: v.glasses ?? false,
    initials: v.initials,
    icon: v.icon,
  };
});

export function getAvatar(key: string | null | undefined): AvatarSpec {
  return AVATARS.find(a => a.key === key) ?? AVATARS[0];
}
