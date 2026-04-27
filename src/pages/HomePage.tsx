import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ArtworkCard } from '@components/common/ArtworkCard'
import { ArtworkSkeleton } from '@components/common/ArtworkSkeleton'
import { streamArtworks } from '@services/listService'
import { parseSortYear } from '@utils/artworkUtils'
import { useLanguage } from '@contexts/LanguageContext'
import type { ArtworkFilters, ListItem, MediumCategory } from '@app-types/index'
import { ARTIC } from '@config/constants'

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP = 16

// Card height and image class vary by column count for better proportions:
// 1-col mobile gets taller image (portrait artworks show better);
// more columns → more compact cards to fit the grid.
const COLUMN_CONFIG: Record<number, { cardHeight: number; imageClass: string }> = {
  1: { cardHeight: 390, imageClass: 'h-56' },
  2: { cardHeight: 350, imageClass: 'h-52' },
  3: { cardHeight: 320, imageClass: 'h-48' },
  4: { cardHeight: 310, imageClass: 'h-48' },
}
const DEFAULT_CONFIG = COLUMN_CONFIG[4]

const MEDIUM_FILTER_KEYS: Array<MediumCategory | 'all'> = [
  'all', 'Painting', 'Print', 'Drawing', 'Photography', 'Object', 'Media', 'Other',
]

const SORT_KEYS: ArtworkFilters['sortBy'][] = ['default', 'date-asc', 'date-desc', 'title-az']

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
      if (w < 480)       setColumns(1)
      else if (w < 768)  setColumns(2)
      else if (w < 1100) setColumns(3)
      else               setColumns(4)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  return columns
}

// ─── Component ───────────────────────────────────────────────────────────────

export function HomePage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<ListItem[]>([])
  const [loadedCount, setLoadedCount] = useState(0)
  const [isStreaming, setIsStreaming] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [filters, setFilters] = useState<ArtworkFilters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)

  const gridRef   = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const columns   = useColumnCount(gridRef)

  const { cardHeight, imageClass } = COLUMN_CONFIG[columns] ?? DEFAULT_CONFIG
  const rowHeight = cardHeight + GAP

  // ── Data loading ─────────────────────────────────────────────────────────

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
          setError(t.home.loadError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsStreaming(false)
      })

    return () => controller.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey, handleBatch])

  // ── Filtering & sorting ──────────────────────────────────────────────────

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
      result = [...result].sort(
        (a, b) => parseSortYear(a.meta ?? '') - parseSortYear(b.meta ?? '')
      )
    } else if (filters.sortBy === 'date-desc') {
      result = [...result].sort(
        (a, b) => parseSortYear(b.meta ?? '') - parseSortYear(a.meta ?? '')
      )
    } else if (filters.sortBy === 'title-az') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [items, filters])

  // Scroll to top whenever filters change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [filters])

  // ── Virtualization ───────────────────────────────────────────────────────

  const rowCount = Math.ceil(filteredItems.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  })

  // ── Filter state helpers ─────────────────────────────────────────────────

  const hasSearch         = filters.search !== ''
  const hasMedium         = filters.mediumCategory !== 'all'
  const hasSort           = filters.sortBy !== 'default'
  const hasActiveFilters  = hasSearch || hasMedium || hasSort

  const clearSearch  = () => setFilters(f => ({ ...f, search: '' }))
  const clearMedium  = () => setFilters(f => ({ ...f, mediumCategory: 'all' }))
  const clearSort    = () => setFilters(f => ({ ...f, sortBy: 'default' }))
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    scrollRef.current?.scrollTo({ top: 0 })
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch()
      searchRef.current?.blur()
    }
  }

  // ── Status message ───────────────────────────────────────────────────────

  const statusMessage = (() => {
    if (isStreaming && !hasActiveFilters)
      return t.home.statusLoading(loadedCount, ARTIC.TOTAL_ITEMS)
    if (isStreaming && hasActiveFilters)
      return t.home.statusFilteredLoading(filteredItems.length, items.length)
    if (hasActiveFilters)
      return t.home.statusFiltered(filteredItems.length, items.length)
    return t.home.statusAll(items.length)
  })()

  // ── Render ───────────────────────────────────────────────────────────────

  const isInitialLoad = isStreaming && items.length === 0

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Title row ── */}
      <div className="flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-stone-100">{t.home.title}</h2>
            <p className="text-sm text-gray-500 dark:text-stone-400 mt-0.5 truncate">{statusMessage}</p>
          </div>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              showFilters || hasActiveFilters
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-stone-700 text-gray-600 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:block">{t.home.filtersBtn}</span>
            {hasActiveFilters && (
              <span className="w-5 h-5 text-[10px] bg-white text-primary-600 rounded-full flex items-center justify-center font-bold">
                {[hasSearch, hasMedium, hasSort].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isStreaming && (
          <div className="w-full h-1 bg-gray-100 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${(loadedCount / ARTIC.TOTAL_ITEMS) * 100}%` }}
            />
          </div>
        )}

        {/* Active filter chips — always visible when filters are on */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {hasSearch && (
              <span className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 text-xs px-2.5 py-1 rounded-full max-w-[180px]">
                <Search size={10} className="flex-shrink-0" />
                <span className="truncate">&ldquo;{filters.search}&rdquo;</span>
                <button
                  onClick={clearSearch}
                  className="flex-shrink-0 hover:text-primary-900 dark:hover:text-primary-100 ml-0.5"
                  aria-label={t.home.clearSearch}
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {hasMedium && (
              <span className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 text-xs px-2.5 py-1 rounded-full">
                {t.filters[filters.mediumCategory]}
                <button
                  onClick={clearMedium}
                  className="flex-shrink-0 hover:text-primary-900 dark:hover:text-primary-100 ml-0.5"
                  aria-label={t.home.clearMediumFilter}
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {hasSort && (
              <span className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 text-xs px-2.5 py-1 rounded-full">
                {t.sort[filters.sortBy]}
                <button
                  onClick={clearSort}
                  className="flex-shrink-0 hover:text-primary-900 dark:hover:text-primary-100 ml-0.5"
                  aria-label={t.home.clearSort}
                >
                  <X size={11} />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-gray-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 underline underline-offset-2"
            >
              {t.home.clearAll}
            </button>
          </div>
        )}

        {/* Collapsible filter panel */}
        {showFilters && (
          <div className="bg-white dark:bg-stone-800 rounded-xl border border-gray-100 dark:border-stone-700 shadow-sm p-4 flex flex-col gap-3">
            {/* Search input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 pointer-events-none" />
              <input
                ref={searchRef}
                type="search"
                placeholder={t.home.searchPlaceholder}
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                onKeyDown={handleSearchKeyDown}
                className="input-field pl-9 pr-9 text-sm py-2"
              />
              {filters.search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500 hover:text-gray-600 dark:hover:text-stone-300"
                  aria-label={t.home.clearSearch}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Medium category chips */}
            <div className="flex flex-wrap gap-2">
              {MEDIUM_FILTER_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setFilters(prev => ({ ...prev, mediumCategory: key }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 ${
                    filters.mediumCategory === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-stone-700 text-gray-600 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-600'
                  }`}
                >
                  {t.filters[key]}
                </button>
              ))}
            </div>

            {/* Sort row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-stone-400 font-medium">{t.home.sortLabel}</span>
              {SORT_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setFilters(f => ({ ...f, sortBy: key }))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150 ${
                    filters.sortBy === key
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-stone-700 text-gray-600 dark:text-stone-300 hover:bg-gray-200 dark:hover:bg-stone-600'
                  }`}
                >
                  {t.sort[key]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-red-500 dark:text-red-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              className="btn-primary text-sm px-4 py-2"
            >
              {t.home.retry}
            </button>
          </div>
        </div>
      )}

      {/* ── Empty search state ── */}
      {!error && !isInitialLoad && filteredItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-stone-500 space-y-2">
            <p className="text-sm">{t.home.noResults}</p>
            <button
              onClick={resetFilters}
              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 underline underline-offset-2"
            >
              {t.home.clearAllFilters}
            </button>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {!error && (isInitialLoad || filteredItems.length > 0) && (
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto">
          <div ref={gridRef}>
            {isInitialLoad ? (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: columns * 4 }).map((_, i) => (
                  <ArtworkSkeleton key={i} imageClass={imageClass} />
                ))}
              </div>
            ) : (
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
                        height: `${cardHeight}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div
                        className="grid gap-4 h-full"
                        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                      >
                        {rowItems.map(item => (
                          <ArtworkCard key={item.id} item={item} imageClass={imageClass} />
                        ))}
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
