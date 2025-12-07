'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: '🔍', href: '/search', label: 'Search' },
    { icon: '📁', href: '/folders', label: 'Folders' },
    { icon: '📝', href: '/notes', label: 'Notes' },
    { icon: '👥', href: '/groups', label: 'Groups' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-[#1C3654] flex flex-col items-center py-6 z-20">
      {/* Logo - LINKS TO DASHBOARD */}
      <Link href="/dashboard" className="w-9 h-9 mb-12 flex flex-col gap-1 hover:opacity-80 transition-opacity">
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-white"></div>
          <div className="w-4 h-4 bg-white"></div>
        </div>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-white"></div>
          <div className="w-4 h-4 bg-white"></div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 flex-1">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href.replace('/', '')) || pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all text-xl ${
                isActive 
                  ? 'bg-[#3B82F6] text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-[#2D5282]/50'
              }`}
              title={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>

      {/* Location Pin (bottom) */}
      <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-[#2D5282]/50 transition-all text-xl">
        📍
      </button>
    </aside>
  );
}
