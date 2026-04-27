import { useState } from 'react'
import { MapPin } from 'lucide-react'
import type { ListItem } from '@app-types/index'

interface ArtworkCardProps {
  item: ListItem
}

const CATEGORY_COLORS: Record<string, string> = {
  Painting: 'bg-amber-100 text-amber-800',
  Print: 'bg-purple-100 text-purple-800',
  Drawing: 'bg-blue-100 text-blue-800',
  Photography: 'bg-gray-100 text-gray-700',
  Object: 'bg-emerald-100 text-emerald-800',
  Media: 'bg-rose-100 text-rose-800',
  Other: 'bg-slate-100 text-slate-700',
}

function ArtworkImage({ item }: { item: ListItem }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const showPlaceholder = !item.imageUrl || errored

  return (
    <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex-shrink-0">
      {/* LQIP blur placeholder */}
      {item.lqip && !loaded && !errored && (
        <img
          src={item.lqip}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-sm"
        />
      )}

      {/* Real image */}
      {!showPlaceholder && (
        <img
          src={item.imageUrl}
          alt={item.imageAlt ?? item.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Default placeholder when no image */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-2">
          <svg viewBox="0 0 80 60" className="w-16 h-12 opacity-20" fill="currentColor">
            <rect width="80" height="60" rx="4" className="text-gray-400" />
            <circle cx="26" cy="22" r="8" className="text-gray-300" />
            <path d="M0 42 L20 28 L36 40 L54 22 L80 42 V60 H0Z" className="text-gray-300" />
          </svg>
          <span className="text-xs text-gray-400">No image available</span>
        </div>
      )}

      {/* Hover overlay with medium detail */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
        {item.mediumDisplay && (
          <p className="text-white text-xs px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 leading-tight line-clamp-2">
            {item.mediumDisplay}
          </p>
        )}
      </div>

      {/* Dominant color accent stripe */}
      {item.accentColor && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: item.accentColor }}
        />
      )}
    </div>
  )
}

export function ArtworkCard({ item }: ArtworkCardProps) {
  const badgeClass = CATEGORY_COLORS[item.badge ?? 'Other'] ?? CATEGORY_COLORS.Other

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
      <ArtworkImage item={item} />

      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight flex-1">
            {item.title}
          </h3>
          {item.badge && (
            <span className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${badgeClass}`}>
              {item.badge}
            </span>
          )}
        </div>

        {item.subtitle && (
          <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
        )}

        {item.meta && (
          <div className="flex items-center gap-1 mt-auto pt-1">
            <MapPin size={11} className="text-gray-300 flex-shrink-0" />
            <p className="text-xs text-gray-400 truncate">{item.meta}</p>
          </div>
        )}
      </div>
    </div>
  )
}
