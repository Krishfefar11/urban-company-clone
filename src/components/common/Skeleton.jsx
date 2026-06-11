const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
)

export const ServiceCardSkeleton = () => (
  <div className="flex-shrink-0 w-44 space-y-2.5">
    <Skeleton className="w-44 h-44 rounded-xl" />
    <Skeleton className="h-3.5 w-36 rounded" />
    <Skeleton className="h-3 w-24 rounded" />
    <Skeleton className="h-3.5 w-20 rounded" />
  </div>
)

export const BookingCardSkeleton = () => (
  <div className="bg-white border border-neutral-100 rounded-xl p-4 flex gap-3">
    <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
      <div className="flex gap-3 mt-3">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
)

export const ServicesGridSkeleton = ({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="space-y-2.5">
        <Skeleton className="w-full aspect-square rounded-xl" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <Skeleton className="h-3.5 w-2/5 rounded" />
      </div>
    ))}
  </div>
)

export const HorizontalRowSkeleton = ({ count = 5 }) => (
  <div className="flex gap-4 overflow-hidden">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex-shrink-0 w-44 space-y-2.5">
        <Skeleton className="w-44 h-44 rounded-xl" />
        <Skeleton className="h-3.5 w-36 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    ))}
  </div>
)

export const ProfileSkeleton = () => (
  <div className="max-w-lg mx-auto px-4">
    <Skeleton className="h-48 w-full rounded-none" />
    <div className="px-4 -mt-8 space-y-4">
      <div className="bg-white rounded-xl border border-neutral-100 p-5 space-y-3">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-5 w-32 mx-auto rounded" />
        <Skeleton className="h-3.5 w-24 mx-auto rounded" />
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  </div>
)

export default Skeleton
