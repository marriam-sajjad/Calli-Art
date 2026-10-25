export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  website?: string;
  created_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  media_url: string;
  category: 'Arabic' | 'Copperplate' | 'Gothic' | 'Modern Brush' | 'Flourishing' | 'Digital' | 'Other';
  likes_count: number;
  created_at: string;
  author?: Profile;
  user_has_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  preview_url: string;
  category: 'Practice Sheets' | 'Brush Packs' | 'Guides & Cheat Sheets' | 'Masterclass';
  difficulty: 'Beginner' | 'Intermediate' | 'Masterclass';
  file_type: 'PDF' | 'Procreate' | 'Photoshop' | 'ZIP';
  file_size: string;
  download_count: number;
  created_at?: string;
}

export type BrushType = 'broad_chisel' | 'pointed_flex' | 'brush_script' | 'qalam_reed' | 'monoline';

export interface BrushSettings {
  type: BrushType;
  size: number;
  angle: number; // For broad edge / qalam in degrees
  color: string;
  opacity: number;
  smoothing: number;
}

export type PaperTexture = 'parchment' | 'dark_obsidian' | 'handmade_deckle' | 'clean_white';

export type GuidelineMode = 'none' | 'copperplate' | 'gothic' | 'arabic_nuqta' | 'grid';
