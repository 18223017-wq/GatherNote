import { Folder, UpdateFolderDTO } from '@/types/folder';
import { getAuthToken } from './client';

const API_BASE_URL = 'http://localhost:3001/api/v1';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all folders for the authenticated user with error handling
 */
export async function getFolders(): Promise<ApiResult<Folder[]>> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return { data: null, error: 'Not authenticated. Please log in.' };
    }

    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to fetch folders: ${response.status} ${response.statusText}`,
      };
    }

    const result = await response.json();
    return { data: result.data || result, error: null };
  } catch (error) {
    console.error('Error fetching folders:', error);
    return {
      data: null,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Get a single folder by ID
 */
export async function getFolderById(id: string): Promise<ApiResult<Folder>> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return { data: null, error: 'Not authenticated. Please log in.' };
    }

    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to fetch folder: ${response.status}`,
      };
    }

    const result = await response.json();
    return { data: result.data || result, error: null };
  } catch (error) {
    console.error('Error fetching folder:', error);
    return {
      data: null,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Update a folder (used for pinning/unpinning)
 */
export async function updateFolder(
  id: string,
  data: UpdateFolderDTO
): Promise<ApiResult<Folder>> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return { data: null, error: 'Not authenticated. Please log in.' };
    }

    const response = await fetch(`${API_BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return {
        data: null,
        error: `Failed to update folder: ${response.status}`,
      };
    }

    const result = await response.json();
    return { data: result.data || result, error: null };
  } catch (error) {
    console.error('Error updating folder:', error);
    return {
      data: null,
      error: 'Network error. Please check your connection.',
    };
  }
}

/**
 * Toggle folder pin status
 */
export async function toggleFolderPin(
  id: string,
  isPinned: boolean
): Promise<ApiResult<Folder>> {
  return updateFolder(id, { is_pinned: !isPinned });
}
