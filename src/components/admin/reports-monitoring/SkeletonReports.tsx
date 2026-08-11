export default function SkeletonReports() {
  return (
    <div className="space-y-6 text-left animate-pulse select-none" aria-hidden="true">
      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="bg-white border border-light-border p-4 rounded-2xl h-24 space-y-3">
            <div className="w-6 h-6 rounded-lg bg-stone-200" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 bg-stone-200 rounded w-10" />
              <div className="h-2.5 bg-stone-200 rounded w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel (col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white border border-light-border p-5 rounded-3xl h-44 space-y-4">
              <div className="h-3 bg-stone-200 rounded w-24 border-b border-light-border pb-1" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {[...Array(4)].map((_, sIdx) => (
                  <div key={sIdx} className="bg-stone-50 border border-stone-150 p-4 rounded-2xl h-20 space-y-2">
                    <div className="h-2.5 bg-stone-200 rounded w-12" />
                    <div className="h-3.5 bg-stone-200 rounded w-8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel (col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Health Card skeleton */}
          <div className="bg-white border border-light-border p-5 rounded-3xl h-[240px] space-y-4">
            <div className="h-3 bg-stone-200 rounded w-28" />
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-light-border/30 pb-2">
                <div className="h-3 bg-stone-200 rounded w-24" />
                <div className="h-4 bg-stone-200 rounded w-16" />
              </div>
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="bg-white border border-light-border p-5 rounded-3xl h-[220px]" />
        </div>
      </div>
    </div>
  );
}
