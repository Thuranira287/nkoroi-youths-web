// Shared API types for St. Bhakita Catholic Youths app

// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Daily Bible Quote Types
export interface DailyQuote {
  id: string;
  verse: string;
  reference: string;
  date: string;
}

// Sunday Readings Types
export interface SundayReading {
  id: string;
  title: string;
  reading_text?: string;
  pdf_url?: string;
  sunday_date: string;
  uploaded_by: string;
  created_at: string;
}

export interface CreateReadingRequest {
  title: string;
  reading_text?: string;
  pdf_file?: File;
  sunday_date: string;
}

// Announcements Types
export interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue?: string;
  created_by: string;
  created_at: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  description: string;
  date: string;
  time?: string;
  venue?: string;
}

// Trips and Albums Types
export interface TripAlbum {
  id: string;
  title: string;
  description?: string;
  cover_photo?: string;
  created_by: string;
  created_at: string;
  photo_count: number;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

export interface CreateTripAlbumRequest {
  title: string;
  description?: string;
  cover_photo?: File;
}

// Bible Types
export interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface BibleVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlight?: string;
}

// Rosary Types
export interface RosaryMystery {
  id: string;
  type: 'joyful' | 'sorrowful' | 'glorious' | 'luminous';
  title: string;
  mysteries: string[];
  prayers: string[];
}

// Generic API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Original demo types (keeping for compatibility)
export interface DemoResponse {
  message: string;
}
