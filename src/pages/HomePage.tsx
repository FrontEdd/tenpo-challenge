import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2, AlertCircle } from 'lucide-react'
import { ListItemCard } from '@components/common/ListItemCard'
import { fetchListItems } from '@services/listService'
import type { ListItem } from '@app-types/index'

const ITEM_HEIGHT = 72

export function HomePage() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
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
    return () => { cancelled = true }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Photos</h2>
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length.toLocaleString()} items loaded
            </p>
          )}
        </div>
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
              onClick={() => window.location.reload()}
              className="btn-primary text-sm px-4 py-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
          >
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
                <ListItemCard item={items[virtualRow.index]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
