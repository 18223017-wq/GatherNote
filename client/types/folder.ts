export interface Folder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_pinned: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderDTO {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateFolderDTO {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_pinned?: boolean;
}
