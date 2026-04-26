import { ImageOff } from 'lucide-react'
import type { ListItem } from '@app-types/index'

interface ListItemCardProps {
  item: ListItem
}

export function ListItemCard({ item }: ListItemCardProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageOff size={20} className="text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate capitalize">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
        )}
      </div>

      {item.badge && (
        <span className="flex-shrink-0 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </div>
  )
}
