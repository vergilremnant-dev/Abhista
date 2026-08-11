export default function SkeletonUsers() {
  return (
    <div className="space-y-6 text-left animate-pulse select-none" aria-hidden="true">
      {/* Statistics Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[...Array(7)].map((_, idx) => (
          <div key={idx} className="bg-white border border-light-border p-4 rounded-2xl h-24 space-y-3">
            <div className="w-6 h-6 rounded-lg bg-stone-200" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-stone-200 rounded w-10" />
              <div className="h-2.5 bg-stone-200 rounded w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white border border-light-border p-5 rounded-3xl h-20" />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table skeleton (Col span 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-light-border rounded-3xl p-6 h-[400px] space-y-4">
            <div className="h-4 bg-stone-200 rounded w-32 pb-2" />
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex gap-4 items-center border-b border-light-border/40 pb-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-2.5 bg-stone-200 rounded w-1/4" />
                </div>
                <div className="h-4 bg-stone-200 rounded w-16" />
                <div className="h-4 bg-stone-200 rounded w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* User Details side panel skeleton (Col span 4) */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-light-border p-6 rounded-3xl h-[450px] space-y-6">
            <div className="flex gap-3 items-center border-b border-light-border pb-4">
              <div className="w-10 h-10 rounded-full bg-stone-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-stone-200 rounded w-1/2" />
                <div className="h-2.5 bg-stone-200 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="h-2.5 bg-stone-150 rounded w-1/4" />
                  <div className="h-3 bg-stone-200 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
