export default function SkeletonDashboard() {
  return (
    <div className="space-y-6 text-left animate-pulse select-none" aria-hidden="true">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {[...Array(7)].map((_, idx) => (
          <div key={idx} className="bg-white border border-light-border p-5 rounded-2xl h-28 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200" />
            <div className="space-y-1.5 pt-1">
              <div className="h-4 bg-stone-200 rounded w-12" />
              <div className="h-3 bg-stone-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Sections Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Left Column (Main) */}
        <div className="lg:col-span-8 space-y-6">
          {/* User Summary Skeleton */}
          <div className="bg-white border border-light-border p-6 rounded-3xl space-y-4">
            <div className="h-4 bg-stone-200 rounded w-48" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-14 bg-stone-100 rounded-xl" />
              <div className="h-14 bg-stone-100 rounded-xl" />
              <div className="h-14 bg-stone-100 rounded-xl" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-8 bg-stone-100 rounded-xl w-full" />
              <div className="h-8 bg-stone-100 rounded-xl w-full" />
              <div className="h-8 bg-stone-100 rounded-xl w-full" />
            </div>
          </div>

          {/* Verification Backlog Skeleton */}
          <div className="bg-white border border-light-border p-6 rounded-3xl space-y-4">
            <div className="h-4 bg-stone-200 rounded w-48" />
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1 w-full">
                    <div className="h-4 bg-stone-200 rounded w-32" />
                    <div className="h-3 bg-stone-200 rounded w-48" />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="h-7 bg-stone-200 rounded w-16" />
                    <div className="h-7 bg-stone-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline Skeleton */}
          <div className="bg-white border border-light-border p-6 rounded-3xl space-y-6">
            <div className="h-4 bg-stone-200 rounded w-40" />
            <div className="space-y-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-stone-250 bg-stone-200 shrink-0" />
                  <div className="space-y-2 flex-1 pt-1.5">
                    <div className="h-3 bg-stone-250 bg-stone-200 rounded w-3/4" />
                    <div className="h-2.5 bg-stone-250 bg-stone-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Panel Skeleton */}
          <div className="bg-white border border-light-border p-5 rounded-3xl space-y-4">
            <div className="h-4 bg-stone-200 rounded w-32" />
            <div className="space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-16 bg-stone-100 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white border border-light-border p-5 rounded-3xl space-y-4">
            <div className="h-4 bg-stone-200 rounded w-28" />
            <div className="grid gap-2 grid-cols-2">
              <div className="h-10 bg-stone-100 rounded-xl" />
              <div className="h-10 bg-stone-100 rounded-xl" />
              <div className="h-10 bg-stone-100 rounded-xl" />
              <div className="h-10 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
