// Canonical equipment-family → emoji icon map, shared across the app.
// Family names match the back-end seed data (table equipment_family).
const CATEGORY_ICONS: Record<string, string> = {
  'PC':              '💻',
  'Écran':           '🖥️',
  'Casque VR':       '🥽',
  'Vidéoprojecteur': '📽️',
  'Périphérique':    '🖱️',
  'Autre':           '📦',
};

export function getCategoryIcon(familyName: string): string {
  return CATEGORY_ICONS[familyName] ?? '📦';
}
