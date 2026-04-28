import type { ListItem } from '@app-types/index'
import { artworkAdapter } from './adapters/artworkAdapter'
import { ARTIC } from '@config/constants'

const TOTAL_PAGES = ARTIC.TOTAL_ITEMS / ARTIC.ITEMS_PER_PAGE // 20 pages

export type OnBatchCallback = (items: ListItem[], loadedCount: number, total: number) => void

export async function streamArtworks(
  onBatch: OnBatchCallback,
  signal?: AbortSignal
): Promise<void> {
  let successfulPages = 0
  let lastError: unknown

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    if (signal?.aborted) break
    try {
      const raw = await artworkAdapter.fetchItems(page, ARTIC.ITEMS_PER_PAGE)
      const batch = raw.map(item => artworkAdapter.normalize(item))
      if (!signal?.aborted) {
        onBatch(batch, page * ARTIC.ITEMS_PER_PAGE, ARTIC.TOTAL_ITEMS)
        successfulPages++
      }
    } catch (err) {
      lastError = err
      if (!signal?.aborted) break
    }
  }

  // If not a single page loaded, surface the error so the UI can show it
  if (successfulPages === 0 && !signal?.aborted) {
    throw lastError ?? new Error('Failed to load artworks')
  }
}
