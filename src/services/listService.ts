import type { ListItem } from '@app-types/index'
import { artworkAdapter } from './adapters/artworkAdapter'
import { ARTIC } from '@config/constants'

const TOTAL_PAGES = ARTIC.TOTAL_ITEMS / ARTIC.ITEMS_PER_PAGE // 20 pages

export type OnBatchCallback = (items: ListItem[], loadedCount: number, total: number) => void

/**
 * Streams 2000 artworks progressively from the ARTIC API.
 * Fetches pages 1–20 sequentially, calling onBatch after each page arrives.
 * Pass a signal to cancel in-flight requests on unmount or retry.
 */
export async function streamArtworks(
  onBatch: OnBatchCallback,
  signal?: AbortSignal
): Promise<void> {
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    if (signal?.aborted) break
    try {
      const raw = await artworkAdapter.fetchItems(page, ARTIC.ITEMS_PER_PAGE)
      const batch = raw.map(item => artworkAdapter.normalize(item))
      if (!signal?.aborted) {
        onBatch(batch, page * ARTIC.ITEMS_PER_PAGE, ARTIC.TOTAL_ITEMS)
      }
    } catch {
      if (!signal?.aborted) break
    }
  }
}
