export interface Song {
  id: string;
  artist: string;
  title: string;
  album?: string;
  genre: string;
  releaseDate?: string;
  coverUrl?: string; // We might use a placeholder or search result image
}

export type ViewState = 'home' | 'favorites' | 'settings';

export interface AppSettings {
  defaultService: 'spotify' | 'apple' | 'youtube' | 'ask';
  region: string;
  explicit: boolean;
}

export interface StreamingService {
  id: string;
  name: string;
  icon: React.ReactNode;
  urlGen: (term: string) => string;
}
