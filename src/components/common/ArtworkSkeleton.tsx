function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  )
}

export function ArtworkSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full">
      {/* Image area */}
      <Shimmer className="w-full h-48 rounded-none" />

      {/* Content area */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Shimmer className="h-4 flex-1 rounded" />
          <Shimmer className="h-4 w-14 rounded-full" />
        </div>
        <Shimmer className="h-3 w-3/4 rounded" />
        <div className="mt-auto pt-1">
          <Shimmer className="h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}
