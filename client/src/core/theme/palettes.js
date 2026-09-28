/**
 * Brand color palettes for the Company Settings color picker.
 * Each palette sets CSS custom properties on :root so that
 * the sidebar, buttons, and accents update app-wide.
 */

export const COLOR_PALETTES = [
  {
    id: 'indigo',
    name: 'Indigo Blue',
    description: 'Classic & Professional',
    swatch: ['#4f46e5', '#6366f1', '#c7d2fe'],
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#eef2ff',
    primaryText: '#4f46e5',
    primaryMuted: '#a5b4fc',
    shadow: 'rgba(79,70,229,0.25)',
    sidebar: { accent: '#6366f1', muted: '#c7d2fe' },
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    description: 'Creative & Luxurious',
    swatch: ['#7c3aed', '#8b5cf6', '#ddd6fe'],
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryText: '#7c3aed',
    primaryMuted: '#c4b5fd',
    shadow: 'rgba(124,58,237,0.25)',
    sidebar: { accent: '#8b5cf6', muted: '#ddd6fe' },
  },
  {
    id: 'rose',
    name: 'Rose Red',
    description: 'Bold & Energetic',
    swatch: ['#e11d48', '#f43f5e', '#fecdd3'],
    primary: '#e11d48',
    primaryHover: '#be123c',
    primaryLight: '#fff1f2',
    primaryText: '#e11d48',
    primaryMuted: '#fda4af',
    shadow: 'rgba(225,29,72,0.25)',
    sidebar: { accent: '#f43f5e', muted: '#fecdd3' },
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    description: 'Growth & Prosperity',
    swatch: ['#059669', '#10b981', '#a7f3d0'],
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    primaryText: '#059669',
    primaryMuted: '#6ee7b7',
    shadow: 'rgba(5,150,105,0.25)',
    sidebar: { accent: '#10b981', muted: '#a7f3d0' },
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    description: 'Trust & Clarity',
    swatch: ['#0284c7', '#0ea5e9', '#bae6fd'],
    primary: '#0284c7',
    primaryHover: '#0369a1',
    primaryLight: '#f0f9ff',
    primaryText: '#0284c7',
    primaryMuted: '#7dd3fc',
    shadow: 'rgba(2,132,199,0.25)',
    sidebar: { accent: '#0ea5e9', muted: '#bae6fd' },
  },
  {
    id: 'teal',
    name: 'Teal',
    description: 'Modern & Balanced',
    swatch: ['#0d9488', '#14b8a6', '#99f6e4'],
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#f0fdfa',
    primaryText: '#0d9488',
    primaryMuted: '#5eead4',
    shadow: 'rgba(13,148,136,0.25)',
    sidebar: { accent: '#14b8a6', muted: '#99f6e4' },
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    description: 'Warm & Premium',
    swatch: ['#d97706', '#f59e0b', '#fde68a'],
    primary: '#d97706',
    primaryHover: '#b45309',
    primaryLight: '#fffbeb',
    primaryText: '#d97706',
    primaryMuted: '#fcd34d',
    shadow: 'rgba(217,119,6,0.25)',
    sidebar: { accent: '#f59e0b', muted: '#fde68a' },
  },
  {
    id: 'orange',
    name: 'Orange',
    description: 'Vibrant & Confident',
    swatch: ['#ea580c', '#f97316', '#fed7aa'],
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#fff7ed',
    primaryText: '#ea580c',
    primaryMuted: '#fdba74',
    shadow: 'rgba(234,88,12,0.25)',
    sidebar: { accent: '#f97316', muted: '#fed7aa' },
  },
  {
    id: 'pink',
    name: 'Hot Pink',
    description: 'Playful & Expressive',
    swatch: ['#db2777', '#ec4899', '#fbcfe8'],
    primary: '#db2777',
    primaryHover: '#be185d',
    primaryLight: '#fdf2f8',
    primaryText: '#db2777',
    primaryMuted: '#f9a8d4',
    shadow: 'rgba(219,39,119,0.25)',
    sidebar: { accent: '#ec4899', muted: '#fbcfe8' },
  },
  {
    id: 'slate',
    name: 'Graphite',
    description: 'Minimal & Elegant',
    swatch: ['#475569', '#64748b', '#cbd5e1'],
    primary: '#475569',
    primaryHover: '#334155',
    primaryLight: '#f8fafc',
    primaryText: '#475569',
    primaryMuted: '#94a3b8',
    shadow: 'rgba(71,85,105,0.25)',
    sidebar: { accent: '#64748b', muted: '#cbd5e1' },
  },
];

export const DEFAULT_PALETTE_ID = 'indigo';

export function getPaletteById(id) {
  return COLOR_PALETTES.find(p => p.id === id) ?? COLOR_PALETTES[0];
}

/** Applies a palette's CSS custom properties to :root so the entire app reacts */
export function applyPalette(palette) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', palette.primary);
  root.style.setProperty('--brand-primary-hover', palette.primaryHover);
  root.style.setProperty('--brand-primary-light', palette.primaryLight);
  root.style.setProperty('--brand-primary-text', palette.primaryText);
  root.style.setProperty('--brand-primary-muted', palette.primaryMuted);
  root.style.setProperty('--brand-shadow', palette.shadow);
  root.style.setProperty('--brand-sidebar-accent', palette.sidebar.accent);
  root.style.setProperty('--brand-sidebar-muted', palette.sidebar.muted);
}
