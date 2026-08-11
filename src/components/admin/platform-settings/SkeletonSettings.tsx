/** Reusable skeleton row card — defined at module scope to prevent "component created during render" violations. */
function SkeletonSectionCard({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white border border-light-border rounded-3xl shadow-apple-sm overflow-hidden animate-pulse" aria-hidden="true">
      <div className="px-6 py-5 border-b border-light-border flex items-center gap-3">
        <div className="w-6 h-6 bg-stone-200 rounded-lg shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-stone-200 rounded w-36" />
          <div className="h-2.5 bg-stone-100 rounded w-52" />
        </div>
      </div>
      <div className="p-6 space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-light-border/60 last:border-0">
            <div className="space-y-1.5">
              <div className="h-2.5 bg-stone-200 rounded w-24" />
              <div className="h-2 bg-stone-100 rounded w-32" />
            </div>
            <div className="col-span-2">
              <div className="h-9 bg-stone-100 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkeletonSettings() {

  return (
    <div className="space-y-6 select-none" aria-label="Loading platform settings…" aria-busy="true">
      {/* Header Skeleton */}
      <div className="bg-white border border-light-border p-6 rounded-3xl animate-pulse flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-2.5 bg-stone-200 rounded w-40" />
          <div className="h-6 bg-stone-200 rounded w-56" />
          <div className="h-2.5 bg-stone-100 rounded w-64" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-stone-100 rounded-xl w-28" />
          <div className="h-9 bg-stone-200 rounded-xl w-28" />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <SkeletonSectionCard rows={5} />
          <SkeletonSectionCard rows={4} />
          <SkeletonSectionCard rows={6} />
          <SkeletonSectionCard rows={4} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          {/* Quick actions sidebar skeleton */}
          <div className="bg-white border border-light-border rounded-3xl shadow-apple-sm animate-pulse overflow-hidden">
            <div className="px-5 py-4 border-b border-light-border space-y-1.5">
              <div className="h-3.5 bg-stone-200 rounded w-28" />
              <div className="h-2.5 bg-stone-100 rounded w-40" />
            </div>
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-2xl" />
              ))}
            </div>
          </div>
          <SkeletonSectionCard rows={3} />
        </div>
      </div>
    </div>
  );
}
