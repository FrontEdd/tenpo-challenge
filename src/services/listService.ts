import type { ListItem } from '@app-types/index'
import { photoAdapter } from './adapters/photoAdapter'

const ITEM_LIMIT = 2000

// Active adapter — swap this import to switch data sources without touching components
const activeAdapter = photoAdapter

export async function fetchListItems(): Promise<ListItem[]> {
  const raw = await activeAdapter.fetchItems(ITEM_LIMIT)
  return raw.map(item => activeAdapter.normalize(item))
}
