import type { MediumCategory } from '@app-types/index'

const MEDIUM_RULES: Array<{ keywords: string[]; category: MediumCategory }> = [
  { keywords: ['oil', 'acrylic', 'tempera', 'fresco', 'gouache on canvas', 'paint'], category: 'Painting' },
  { keywords: ['woodblock', 'etching', 'engraving', 'lithograph', 'screenprint', 'aquatint', 'mezzotint', 'linocut', 'drypoint', 'print'], category: 'Print' },
  { keywords: ['gelatin silver', 'photograph', 'daguerreotype', 'chromogenic', 'albumen', 'cyanotype', 'photogram'], category: 'Photography' },
  { keywords: ['pencil', 'chalk', 'charcoal', 'pastel', 'ink', 'watercolor', 'gouache', 'crayon', 'graphite', 'pen and'], category: 'Drawing' },
  { keywords: ['bronze', 'marble', 'terracotta', 'ceramic', 'glass', 'earthenware', 'stoneware', 'porcelain', 'silver', 'steel', 'iron', 'wood', 'stone', 'plaster', 'cast', 'wax', 'ivory', 'gilt'], category: 'Object' },
  { keywords: ['video', 'film', 'digital', 'audio', 'sound', 'media', 'installation', 'animation', 'projection'], category: 'Media' },
]

export function parseMediumCategory(medium: string | null | undefined): MediumCategory {
  if (!medium) return 'Other'
  const lower = medium.toLowerCase()
  for (const rule of MEDIUM_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.category
  }
  return 'Other'
}

export function buildAccentColor(color: { h: number; l: number; s: number } | null, colorfulness: number): string | undefined {
  if (!color || colorfulness < 5) return undefined
  // Ensure lightness is in a visible range for the accent strip
  const l = Math.max(30, Math.min(70, color.l))
  return `hsl(${color.h}, ${color.s}%, ${l}%)`
}

export function buildImageUrl(imageId: string | null, width = '400'): string | undefined {
  if (!imageId) return undefined
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`
}

export function parseArtistName(artistDisplay: string | null | undefined): string {
  if (!artistDisplay) return ''
  return artistDisplay.split('\n')[0].trim()
}

// Extracts a numeric year from date_display for sorting
export function parseSortYear(dateDisplay: string): number {
  if (!dateDisplay || dateDisplay === 'n.d.') return 9999

  // BCE dates: "410-400 BCE" → -410
  const bceMatch = dateDisplay.match(/(\d{1,4}).*BCE/i)
  if (bceMatch) return -parseInt(bceMatch[1], 10)

  // Extract first 3-4 digit year
  const yearMatch = dateDisplay.match(/\d{3,4}/)
  if (yearMatch) return parseInt(yearMatch[0], 10)

  return 9999
}
