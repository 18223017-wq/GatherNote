'use client';

import { useState } from 'react';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import StatsCard from '@/components/dashboard/QuickActions';
import FolderCard from '@/components/folders/FolderCard';
import FolderSection from '@/components/dashboard/FolderSection';
import { mockFolders } from '@/lib/mockData';

// Placeholder SVG icons
const Search = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const HelpCircle = ({ size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r=".5" />
  </svg>
);

const Bell = ({ size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronRight = ({ size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ChevronDown = ({ size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUp = ({ size = 24, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export default function DashboardPage() {
  const [folders] = useState(mockFolders);
  const [isExpanded, setIsExpanded] = useState(false);

  const recentFolders = folders.slice(0, 4);
  const pinnedFolders = folders.filter(f => f.is_pinned);
  const regularFolders = folders.filter(f => !f.is_pinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5EBF1] via-[#EDF2F7] to-[#F3F7FB] pl-16">
      <div className="max-w-[1400px] mx-auto px-20 py-12">
        
        {/* Search & Top Actions - CENTERED */}
        <div className="flex items-center justify-center mb-12 relative">
          <div className="w-full max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="absolute right-0 flex items-center gap-4">
            <button className="p-2.5 hover:bg-white/50 rounded-full transition-colors">
              <HelpCircle size={24} className="text-gray-700" />
            </button>
            <button className="p-2.5 hover:bg-white/50 rounded-full transition-colors relative">
              <Bell size={24} className="text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold text-sm hover:bg-gray-700 transition-colors">
              GU
            </button>
          </div>
        </div>

        {/* Welcome Section - PROPER SPACING */}
        <div className="flex items-start justify-between mb-12">
          <WelcomeHeader />
          <StatsCard />
        </div>

        {/* Recently Visited Section - PROPER SPACING */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <span>Recently Visited</span>
            </h2>
            <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
              <ChevronRight size={28} className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {recentFolders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>

        {/* Expand/Collapse Button - CENTER WITH PROPER SPACING */}
        <div className="flex justify-center my-12">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 rounded-full bg-[#D6E8F5] hover:bg-[#BBDEFB] transition-colors shadow-sm"
          >
            {isExpanded ? (
              <ChevronUp size={24} className="text-[#5B9BD5]" />
            ) : (
              <ChevronDown size={24} className="text-[#5B9BD5]" />
            )}
          </button>
        </div>

        {/* EXTENDED SECTIONS - PROPER SPACING */}
        {isExpanded && (
          <div className="space-y-16 animate-in fade-in slide-in-from-top-4 duration-500">
            
            {/* Your Folders Section */}
            <section>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span>📂</span>
                    <span>Your Folders</span>
                  </h2>
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <ChevronRight size={28} className="text-gray-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 ml-[52px]">Sorted by Most Opened</p>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide mb-12">
                {regularFolders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
              
              {/* My Personal Notes Subsection - INDENTED */}
              <div className="ml-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                    <span className="text-xs">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">My Personal Notes</h3>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {regularFolders.slice(0, 4).map((folder) => (
                    <FolderCard key={`personal-${folder.id}`} folder={folder} />
                  ))}
                </div>
              </div>
            </section>

            {/* Favorites Section - PROPER SPACING */}
            {pinnedFolders.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span>⭐</span>
                    <span>Favorites</span>
                  </h2>
                  <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
                    <ChevronRight size={28} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                  {pinnedFolders.map((folder) => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
