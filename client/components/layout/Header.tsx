'use client';

export default function TopHeader() {
  return (
    <header className="fixed top-0 left-16 right-0 h-20 bg-[#E5EBF1] border-b border-gray-200 px-8 flex items-center justify-between z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-6 ml-8">
        <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <button className="p-2 hover:bg-white/50 rounded-full transition-colors relative">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="text-gray-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors">
          <img
            src="https://ui-avatars.com/api/?name=Ghazy+Urbayani&background=3B82F6&color=fff"
            alt="User avatar"
            width={40}
            height={40}
          />
        </button>
      </div>
    </header>
  );
}
