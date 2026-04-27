import type { ListItem, Artwork } from '@app-types/index'
import { artworkAdapter } from './adapters/artworkAdapter'
import { ARTIC } from '@config/constants'
// Seed data: first 100 artworks pre-fetched — enables instant first render
import seedRaw from '../../docs/artworks-pag.json'

const TOTAL_PAGES = ARTIC.TOTAL_ITEMS / ARTIC.ITEMS_PER_PAGE // 20 pages

// Normalize seed items (no lqip available from local JSON)
const seedItems: ListItem[] = (seedRaw.data as Artwork[]).map(raw =>
  artworkAdapter.normalize(raw)
)

export type OnBatchCallback = (items: ListItem[], loadedCount: number, total: number) => void

/**
 * Streams 2000 artworks progressively.
 * Calls onBatch immediately with local seed data (page 1),
 * then fetches pages 2–20 from the API and calls onBatch per page.
 * Pass a signal to cancel in-flight requests on unmount.
 */
export async function streamArtworks(
  onBatch: OnBatchCallback,
  signal?: AbortSignal
): Promise<void> {
  // Phase 1 – instant render from local seed
  onBatch(seedItems, seedItems.length, ARTIC.TOTAL_ITEMS)

  // Phase 2 – fetch remaining pages from API
  for (let page = 2; page <= TOTAL_PAGES; page++) {
    if (signal?.aborted) break
    try {
      const raw = await artworkAdapter.fetchItems(page, ARTIC.ITEMS_PER_PAGE)
      const batch = raw.map(item => artworkAdapter.normalize(item))
      if (!signal?.aborted) {
        onBatch(batch, (page * ARTIC.ITEMS_PER_PAGE), ARTIC.TOTAL_ITEMS)
      }
    } catch {
      if (!signal?.aborted) break
    }
  }
}
