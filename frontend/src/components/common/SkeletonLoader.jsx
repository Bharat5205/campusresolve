export const SkeletonLoader = ({ type = "table", count = 3 }) => {
  if (type === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-28">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
        <div className="h-14 bg-gray-50 border-b border-gray-100 px-6 flex items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-6 flex justify-between items-center">
              <div className="space-y-3 w-1/2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};
