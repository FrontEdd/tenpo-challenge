import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ArtworkCard } from '@components/common/ArtworkCard'
import { ArtworkSkeleton } from '@components/common/ArtworkSkeleton'
import { streamArtworks } from '@services/listService'
import { parseSortYear } from '@utils/artworkUtils'
import type { ArtworkFilters, ListItem, MediumCategory } from '@app-types/index'
import { ARTIC } from '@config/constants'

// ─── Constants ───────────────────────────────────────────────────────────────

const CARD_HEIGHT = 310   // px  (image 192 + content 118)
const GAP = 16            // px between cards
const ROW_HEIGHT = CARD_HEIGHT + GAP

const MEDIUM_FILTERS: Array<{ label: string; value: MediumCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Painting', value: 'Painting' },
  { label: 'Print', value: 'Print' },
  { label: 'Drawing', value: 'Drawing' },
  { label: 'Photography', value: 'Photography' },
  { label: 'Object', value: 'Object' },
  { label: 'Media', value: 'Media' },
  { label: 'Other', value: 'Other' },
]

const DEFAULT_FILTERS: ArtworkFilters = {
  search: '',
  mediumCategory: 'all',
  sortBy: 'default',
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      if (w < 480) setColumns(1)
      else if (w < 768) setColumns(2)
      else if (w < 1100) setColumns(3)
      else setColumns(4)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  return columns
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HomePage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [loadedCount, setLoadedCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [filters, setFilters] = useState<ArtworkFilters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const columns = useColumnCount(gridRef)

  // ── Data loading ──────────────────────────────────────────────────────────

  const handleBatch = useCallback((batch: ListItem[], loaded: number) => {
    setItems(prev => {
      const existingIds = new Set(prev.map(i => i.id))
      const fresh = batch.filter(i => !existingIds.has(i.id))
      return [...prev, ...fresh]
    })
    setLoadedCount(Math.min(loaded, ARTIC.TOTAL_ITEMS))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setItems([])
    setLoadedCount(0)
    setIsStreaming(true)
    setError(null)

    streamArtworks(handleBatch, controller.signal)
      .catch(() => {
        if (!controller.signal.aborted)
          setError('Failed to load artworks. Please try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsStreaming(false)
      })

    return () => controller.abort()
  }, [retryKey, handleBatch])

  // ── Filtering & sorting ───────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    let result = items

    const q = filters.search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle?.toLowerCase().includes(q) ||
          i.origin?.toLowerCase().includes(q)
      )
    }

    if (filters.mediumCategory !== 'all') {
      result = result.filter(i => i.mediumCategory === filters.mediumCategory)
    }

    if (filters.sortBy === 'date-asc') {
      result = [...result].sort((a, b) => parseSortYear(a.meta ?? '') - parseSortYear(b.meta ?? ''))
    } else if (filters.sortBy === 'date-desc') {
      result = [...result].sort((a, b) => parseSortYear(b.meta ?? '') - parseSortYear(a.meta ?? ''))
    } else if (filters.sortBy === 'title-az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [items, filters])

  // ── Virtualization ────────────────────────────────────────────────────────

  const rowCount = Math.ceil(filteredItems.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 3,
  })

  // ── Filter helpers ────────────────────────────────────────────────────────

  const hasActiveFilters =
    filters.search !== '' ||
    filters.mediumCategory !== 'all' ||
    filters.sortBy !== 'default'

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    scrollRef.current?.scrollTo({ top: 0 })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isInitialLoad = isStreaming && items.length === 0

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-3">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Art Collection</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isStreaming
                ? `Loading… ${loadedCount.toLocaleString()} / ${ARTIC.TOTAL_ITEMS.toLocaleString()} artworks`
                : `${filteredItems.length.toLocaleString()}${hasActiveFilters ? ` of ${items.length.toLocaleString()}` : ''} artworks`}
            </p>
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${showFilters || hasActiveFilters ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:block">Filters</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 text-xs bg-white text-primary-600 rounded-full flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isStreaming && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${(loadedCount / ARTIC.TOTAL_ITEMS) * 100}%` }}
            />
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search by title, artist or origin…"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="input-field pl-9 pr-9 text-sm py-2"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Medium category chips */}
            <div className="flex flex-wrap gap-2">
              {MEDIUM_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilters(prev => ({ ...prev, mediumCategory: f.value }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                    filters.mediumCategory === f.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort + reset row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Sort by:</span>
                <div className="flex gap-1 flex-wrap">
                  {([
                    { label: 'Default', value: 'default' },
                    { label: 'Year ↑', value: 'date-asc' },
                    { label: 'Year ↓', value: 'date-desc' },
                    { label: 'Title A→Z', value: 'title-az' },
                  ] as const).map(s => (
                    <button
                      key={s.value}
                      onClick={() => setFilters(f => ({ ...f, sortBy: s.value }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150 ${
                        filters.sortBy === s.value
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-red-500">
            <p className="text-sm">{error}</p>
            <button onClick={() => setRetryKey(k => k + 1)} className="btn-primary text-sm px-4 py-2">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state after filter ── */}
      {!error && !isInitialLoad && filteredItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-sm">No artworks match your filters.</p>
            <button onClick={resetFilters} className="text-xs text-primary-600 hover:underline mt-1">
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {!error && (isInitialLoad || filteredItems.length > 0) && (
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div ref={gridRef}>
            {isInitialLoad ? (
              /* Skeleton grid during initial load */
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns * 4 }).map((_, i) => (
                  <ArtworkSkeleton key={i} />
                ))}
              </div>
            ) : (
              /* Virtualized rows */
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const startIdx = virtualRow.index * columns
                  const rowItems = filteredItems.slice(startIdx, startIdx + columns)

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${CARD_HEIGHT}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className="grid gap-4 h-full"
                        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                      >
                        {rowItems.map(item => (
                          <ArtworkCard key={item.id} item={item} />
                        ))}
                        {/* Fill empty cells in the last row */}
                        {rowItems.length < columns &&
                          Array.from({ length: columns - rowItems.length }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
