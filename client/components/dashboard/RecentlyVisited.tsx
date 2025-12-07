'use client';

import React from 'react';
import { Folder } from '@/types/folder';
import FolderCard from '@/components/folders/FolderCard';

interface RecentlyVisitedProps {
  folders: Folder[];
  onPin?: (folderId: string, isPinned: boolean) => void;
  loading?: boolean;
}

export default function RecentlyVisited({ folders, onPin, loading = false }: RecentlyVisitedProps) {
  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">📍 Recently Visited</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[200px] h-[180px] bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (folders.length === 0) {
    return null;
  }

  const displayFolders = folders.slice(0, 4);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📍 Recently Visited</h2>
        <button className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200 text-gray-600">
          →
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {displayFolders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} onPin={onPin} />
        ))}
      </div>
    </section>
  );
}
