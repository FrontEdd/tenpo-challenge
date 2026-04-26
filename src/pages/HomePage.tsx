import { useEffect, useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2, AlertCircle, Search, X } from 'lucide-react'
import { ListItemCard } from '@components/common/ListItemCard'
import { fetchListItems } from '@services/listService'
import type { ListItem } from '@app-types/index'

const ITEM_HEIGHT = 72

export function HomePage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [search, setSearch] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.badge?.toLowerCase().includes(q)
    )
  }, [items, search])

  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 10,
  })

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchListItems()
        if (!cancelled) setItems(data)
      } catch {
        if (!cancelled) setError('Failed to load items. Please try again.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [retryCount])

  const handleClearSearch = () => {
    setSearch('')
    scrollRef.current?.scrollTo({ top: 0 })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Photos</h2>
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredItems.length.toLocaleString()}
              {search ? ` of ${items.length.toLocaleString()}` : ''} items
            </p>
          )}
        </div>

        {!isLoading && !error && (
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search by title or album…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 pr-9 text-sm py-1.5"
            />
            {search && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={36} className="animate-spin" />
            <p className="text-sm">Loading {(2000).toLocaleString()} items…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-red-500">
            <AlertCircle size={36} />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              className="btn-primary text-sm px-4 py-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">No items match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {!isLoading && !error && filteredItems.length > 0 && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {virtualizer.getVirtualItems().map(virtualRow => (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ListItemCard item={filteredItems[virtualRow.index]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
