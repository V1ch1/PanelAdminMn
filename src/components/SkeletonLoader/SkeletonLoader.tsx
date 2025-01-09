export const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-8 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
  </div>
);
