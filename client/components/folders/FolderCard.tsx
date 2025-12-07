'use client';

import type { Folder } from '@/types/folder';

interface FolderCardProps {
  folder: Folder;
  onClick?: () => void;
}

// Placeholder User icon
const User = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function FolderCard({ folder, onClick }: FolderCardProps) {
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col w-40 h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group bg-white flex-shrink-0"
    >
      {/* TOP SECTION - COLORED BACKGROUND WITH ICON */}
      <div
        className="flex-1 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, ${folder.color || '#E3F2FD'} 0%, ${folder.color || '#E3F2FD'}dd 100%)`
        }}
      >
        {/* Decorative dashed border circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-white/30"
          />
        </div>

        {/* Circular icon background */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-sm relative z-10 flex-shrink-0">
          <span className="text-3xl">{folder.icon || '📁'}</span>
        </div>
      </div>

      {/* BOTTOM SECTION - WHITE BACKGROUND WITH TEXT */}
      <div className="flex-[0.5] bg-white px-3 py-2.5 flex flex-col items-center justify-between">
        {/* Folder Name */}
        <h3 className="text-xs font-semibold text-[#3B5A7A] text-center line-clamp-2 leading-tight">
          {folder.name}
        </h3>
        
        {/* Metadata */}
        <div className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
          <span>Last edited: {formatDate(folder.updated_at)}</span>
          <User size={12} />
        </div>
      </div>
    </button>
  );
}
