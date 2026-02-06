"use client";

export default function SnackLoader() {
  return (
    <div className="fixed top-4 right-4 z-[999]">
      <div className="flex items-center gap-2 animate-pulse bg-white px-4 py-2 rounded-lg shadow-md">
        <div className="w-6 h-6 rounded bg-slate-600"></div>
        <div className="w-6 h-6 rounded bg-slate-700"></div>
        <div className="w-6 h-6 rounded bg-slate-800"></div>
        <span className="text-sm text-gray-600 ml-2">
          Loading...
        </span>
      </div>
    </div>
  );
}


/**
 * "use client";

export default function SnackLoader() {
  return (
    <div
      className=" fixed top-4 right-4 z-[999] flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-3 h-3 rounded-full bg-slate-600"></div>
        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
        <div className="w-3 h-3 rounded-full bg-slate-800"></div>
      </div>
      <span className="text-sm text-gray-700 ml-2">
        Loading...
      </span>
    </div>
  );
}

 */