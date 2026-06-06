// Association entre le nom d'une famille de matériel et son icône, partagée dans toute l'application.
// Les noms de famille correspondent au jeu de données du back (table equipment_family).
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
