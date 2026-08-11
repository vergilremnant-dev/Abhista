interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs animate-pulse flex flex-col justify-between ${className}`}
    >
      {/* Top Banner Skeleton */}
      <div className="h-32 sm:h-36 bg-stone-200 relative">
        <div className="absolute -bottom-4 left-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-stone-300 border-2 border-white"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-4.5 pt-5 space-y-3 flex-1">
        <div className="space-y-1.5">
          <div className="h-3.5 w-3/4 bg-stone-200 rounded"></div>
          <div className="h-2.5 w-1/3 bg-stone-100 rounded"></div>
        </div>

        <div className="flex gap-1.5">
          <div className="h-4 w-16 bg-stone-100 rounded"></div>
          <div className="h-4 w-24 bg-stone-100 rounded"></div>
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="h-2.5 w-full bg-stone-100 rounded"></div>
          <div className="h-2.5 w-4/5 bg-stone-100 rounded"></div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100 mt-2">
          <div className="h-8.5 bg-stone-100 rounded-lg"></div>
          <div className="h-8.5 bg-stone-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
