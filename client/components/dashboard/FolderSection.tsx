'use client';

import FolderCard from '@/components/folders/FolderCard';
import type { Folder } from '@/types/folder';

interface FolderSectionProps {
  title: string;
  subtitle?: string;
  folders: Folder[];
  icon?: string;
}

// Placeholder ChevronRight icon
const ChevronRight = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function FolderSection({ title, subtitle, folders, icon = '📂' }: FolderSectionProps) {
  if (folders.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </h2>
          <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <ChevronRight size={28} className="text-gray-600" />
          </button>
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600 ml-10">{subtitle}</p>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>
    </section>
  );
}
