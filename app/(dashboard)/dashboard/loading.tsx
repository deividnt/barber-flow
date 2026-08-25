export default function Loading() {
  return (
    <div className="flex-1 animate-pulse">
      {/* Header skeleton */}
      <div className="px-8 py-5 border-b" style={{ borderColor: '#1A1A1A' }}>
        <div className="h-5 w-40 rounded-lg mb-2" style={{ background: '#1C1C1C' }} />
        <div className="h-3 w-64 rounded-lg" style={{ background: '#161616' }} />
      </div>

      <div className="p-6 space-y-5">
        {/* Top bar skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-56 rounded-lg" style={{ background: '#161616' }} />
          <div className="ml-auto h-9 w-32 rounded-lg" style={{ background: '#161616' }} />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-5 h-28" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
              <div className="h-3 w-24 rounded mb-3" style={{ background: '#1C1C1C' }} />
              <div className="h-7 w-16 rounded mb-2" style={{ background: '#1C1C1C' }} />
              <div className="h-2 w-20 rounded" style={{ background: '#161616' }} />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1A1A1A' }}>
          <div className="h-10" style={{ background: '#161616' }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ background: i % 2 === 0 ? '#111111' : '#0E0E0E', borderTop: '1px solid #1A1A1A' }}>
              <div className="h-3 w-32 rounded" style={{ background: '#1C1C1C' }} />
              <div className="h-3 w-24 rounded" style={{ background: '#161616' }} />
              <div className="h-3 w-20 rounded ml-auto" style={{ background: '#161616' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
