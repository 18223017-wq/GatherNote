'use client';

import { useState } from 'react';
import { mockFolders } from '@/lib/mockData';

// Placeholder SVG Icons
const Search = ({ size = 20, className = '' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const MoreVertical = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const User = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Mock note items for folders
const mockNotesByFolder = {
  1: [ // My Business Ideas
    'Innovation-Based Prototyping Tools',
    '3D Sketched Learning Modules',
    '3rd-Party Packaging School',
    'Weekly Non-Graded Material Assignments',
    'Final Client Design Optimization Season',
    'After-Client Ideas for New Markets'
  ],
  2: [ // Uncategorized
    'Random thoughts and ideas',
    'Meeting notes from last week',
    'Project brainstorming session',
    'Quick reminders and todos',
    'Research materials collection'
  ],
  3: [ // Data Mining
    'Classification algorithms overview',
    'Decision tree implementation',
    'Neural network basics',
    'Data preprocessing techniques',
    'Clustering methods comparison',
    'Final project requirements'
  ],
  4: [ // Coffee Roastery
    'PLC programming basics',
    'Temperature control system',
    'Roasting profiles documentation',
    'IoT sensor integration',
    'Quality control checklist',
    'Production workflow diagram'
  ],
  5: [ // Web Development
    'React component patterns',
    'Next.js best practices',
    'TypeScript guidelines',
    'CSS-in-JS solutions',
    'API integration methods',
    'Performance optimization'
  ],
  6: [ // Recipe Collection
    'Chocolate chip cookies recipe',
    'Pasta carbonara technique',
    'Sourdough bread guide',
    'Asian fusion flavors',
    'Sous vide cooking method',
    'Seasonal ingredient ideas'
  ],
  7: [ // Python Notes
    'List comprehension examples',
    'Decorators and closures',
    'Async/await patterns',
    'Testing with pytest',
    'Package management setup',
    'Virtual environment config'
  ],
  8: [ // Design System
    'Color palette guidelines',
    'Typography standards',
    'Component specifications',
    'Spacing and grid system',
    'Icon design principles',
    'Accessibility checklist'
  ]
};

// Folder Detail Card Component
function FolderDetailCard({ folder }: { folder: any }) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const notes = mockNotesByFolder[folder.id as keyof typeof mockNotesByFolder] || [
    'Sample note 1',
    'Sample note 2',
    'Sample note 3'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Folder Icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 mt-1"
            style={{ backgroundColor: folder.color || '#E3F2FD' }}
          >
            {folder.icon || '📁'}
          </div>

          {/* Folder Info */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{folder.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {folder.description || 'A collection of notes and ideas'}
            </p>
          </div>
        </div>
        
        {/* Menu Button */}
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-2.5 mb-6 mt-6">
        {notes.map((note, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-gray-400 text-sm mt-0.5">- </span>
            <a 
              href="#" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline leading-relaxed flex-1"
            >
              {note}
            </a>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Last edited: {formatDate(folder.updated_at)}
        </span>
        <div className="flex items-center gap-1">
          <User size={16} />
        </div>
      </div>
    </div>
  );
}

export default function FoldersPage() {
  const [folders] = useState(mockFolders);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter folders based on search
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split folders into two columns
  const leftColumnFolders = filteredFolders.filter((_, index) => index % 2 === 0);
  const rightColumnFolders = filteredFolders.filter((_, index) => index % 2 === 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5EBF1] via-[#EDF2F7] to-[#F3F7FB] pl-16">
      <div className="max-w-[1400px] mx-auto px-20 py-12">

        {/* Search Bar - Top Center */}
        <div className="flex items-center justify-center mb-12">
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📁</span>
            <span>Your Folders</span>
          </h1>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            {leftColumnFolders.map((folder) => (
              <FolderDetailCard key={folder.id} folder={folder} />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {rightColumnFolders.map((folder) => (
              <FolderDetailCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredFolders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No folders found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or create a new folder</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Create New Folder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
