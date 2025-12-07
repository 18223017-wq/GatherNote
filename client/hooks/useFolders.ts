'use client';

import { useState, useCallback, useEffect } from 'react';
import { Folder } from '@/types/folder';
import { getFolders, toggleFolderPin } from '@/lib/api/folders';

interface UseFoldersReturn {
  folders: Folder[];
  pinnedFolders: Folder[];
  regularFolders: Folder[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  togglePin: (folderId: string, currentPinState: boolean) => Promise<void>;
}

export function useFolders(): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: apiError } = await getFolders();
      
      if (apiError) {
        setError(apiError);
      } else if (data) {
        setFolders(data);
        setError(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folders';
      setError(errorMessage);
      console.error('Error fetching folders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePin = useCallback(
    async (folderId: string, currentPinState: boolean) => {
      try {
        const { data: updatedFolder, error: apiError } = await toggleFolderPin(
          folderId,
          currentPinState
        );
        
        if (apiError) {
          setError(apiError);
          return;
        }
        
        if (updatedFolder) {
          setFolders((prevFolders) =>
            prevFolders.map((folder) =>
              folder.id === folderId
                ? { ...folder, is_pinned: updatedFolder.is_pinned }
                : folder
            )
          );
          setError(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update folder';
        setError(errorMessage);
        console.error('Error toggling pin:', err);
      }
    },
    []
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const pinnedFolders = folders.filter((f) => f.is_pinned);
  const regularFolders = folders.filter((f) => !f.is_pinned);

  return {
    folders,
    pinnedFolders,
    regularFolders,
    loading,
    error,
    refetch,
    togglePin,
  };
}
