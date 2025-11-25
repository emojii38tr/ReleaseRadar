import React, { useState, useEffect, useCallback } from 'react';
import { Song, ViewState, AppSettings } from './types';
import { fetchNewReleases } from './services/geminiService';
import { ReleaseCard } from './components/ReleaseCard';
import { StreamModal } from './components/StreamModal';
import { HomeIcon, HeartIcon, CogIcon, RadarIcon } from './components/Icons';

const GENRES = ['Alle', 'Pop', 'Hip Hop', 'Electronic', 'Rock', 'R&B', 'K-Pop', 'Latin'];

export default function App() {
  // --- State ---
  const [view, setView] = useState<ViewState>('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Alle');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null); // For Modal
  const [settings, setSettings] = useState<AppSettings>({
    defaultService: 'ask',
    region: 'Deutschland',
    explicit: true
  });

  // --- Effects ---
  
  // Initial Load
  useEffect(() => {
    loadSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Load favorites from local storage
  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    }
  }, []);

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // --- Handlers ---

  const loadSongs = async (genre?: string) => {
    setIsLoading(true);
    setSongs([]); // Clear current list to show skeleton better or just keep prev? Let's clear for new search feel.
    
    // Construct genre parameter
    const genreParam = genre === 'Alle' ? undefined : genre;
    
    const newSongs = await fetchNewReleases(settings.region, genreParam);
    setSongs(newSongs);
    setIsLoading(false);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    loadSongs(genre);
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) {
        return prev.filter(s => s.id !== song.id);
      }
      return [...prev, song];
    });
  };

  const handleSongClick = (song: Song) => {
    if (settings.defaultService === 'ask') {
      setSelectedSong(song);
    } else {
      // Direct deep linking based on settings (simplified for demo)
      let url = '';
      const term = encodeURIComponent(`${song.artist} ${song.title}`);
      if (settings.defaultService === 'spotify') url = `https://open.spotify.com/search/${term}`;
      else if (settings.defaultService === 'apple') url = `https://music.apple.com/us/search?term=${term}`;
      else if (settings.defaultService === 'youtube') url = `https://www.youtube.com/results?search_query=${term}`;
      
      window.open(url, '_blank');
    }
  };

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* Header & Genre Filter */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10 py-4 -mx-4 px-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <RadarIcon className="w-6 h-6 text-pink-500" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-600">
                ReleaseRadar
                </h1>
            </div>
             <button 
                onClick={() => loadSongs(selectedGenre)}
                className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition"
                disabled={isLoading}
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => handleGenreSelect(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedGenre === g 
                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Release List */}
      <div className="space-y-3 min-h-[50vh]">
        {isLoading ? (
          // Skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 rounded-xl bg-zinc-900 animate-pulse">
              <div className="w-16 h-16 bg-zinc-800 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : songs.length > 0 ? (
          songs.map(song => (
            <ReleaseCard 
              key={song.id} 
              song={song} 
              isFavorite={favorites.some(f => f.id === song.id)}
              onToggleFavorite={toggleFavorite}
              onClick={handleSongClick}
            />
          ))
        ) : (
            <div className="text-center py-20">
                <p className="text-zinc-500">Keine Releases gefunden.</p>
                <button onClick={() => loadSongs()} className="mt-4 text-blue-400 hover:text-blue-300">Erneut versuchen</button>
            </div>
        )}
        
        {!isLoading && songs.length > 0 && (
             <div className="text-center py-6">
                <p className="text-xs text-zinc-600 uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
        )}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6 pb-24 pt-4">
      <h1 className="text-2xl font-bold text-white">Favoriten</h1>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <HeartIcon className="w-16 h-16 mb-4 opacity-20" />
          <p>Noch keine Favoriten gespeichert.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map(song => (
            <ReleaseCard 
              key={song.id} 
              song={song} 
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onClick={handleSongClick}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 pb-24 pt-4">
      <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
      
      <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 divide-y divide-zinc-800">
        <div className="p-4 flex flex-col space-y-2">
            <label className="text-sm font-medium text-zinc-300">Standard Dienst</label>
            <div className="grid grid-cols-2 gap-2">
                {(['ask', 'spotify', 'apple', 'youtube'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setSettings({...settings, defaultService: s})}
                        className={`px-3 py-2 rounded-lg text-sm capitalize border ${
                            settings.defaultService === s 
                            ? 'bg-zinc-700 border-zinc-600 text-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900'
                        }`}
                    >
                        {s === 'ask' ? 'Immer fragen' : s}
                    </button>
                ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
                {settings.defaultService === 'ask' 
                ? 'Wir fragen dich jedes Mal, welche App du öffnen möchtest.' 
                : `Songs werden direkt in ${settings.defaultService} gesucht.`}
            </p>
        </div>

        <div className="p-4 flex flex-col space-y-2">
            <label className="text-sm font-medium text-zinc-300">Region</label>
             <select 
                value={settings.region}
                onChange={(e) => setSettings({...settings, region: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
                <option value="Worldwide">Weltweit</option>
                <option value="Deutschland">Deutschland</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Japan">Japan</option>
            </select>
        </div>
        
         <div className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Datenquelle</span>
            <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded">Gemini Live Search</span>
        </div>
      </div>
      
       <div className="text-center">
        <p className="text-xs text-zinc-600">ReleaseRadar v1.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <main className="flex-1 w-full max-w-xl mx-auto px-4">
        {view === 'home' && renderHome()}
        {view === 'favorites' && renderFavorites()}
        {view === 'settings' && renderSettings()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 z-40">
        <div className="max-w-xl mx-auto flex justify-around items-center h-16">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center space-y-1 w-16 ${view === 'home' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setView('favorites')}
            className={`flex flex-col items-center space-y-1 w-16 ${view === 'favorites' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <HeartIcon className="w-6 h-6" solid={view === 'favorites'} />
             <span className="text-[10px] font-medium">Favoriten</span>
          </button>

          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center space-y-1 w-16 ${view === 'settings' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CogIcon className="w-6 h-6" />
             <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Streaming Modal */}
      {selectedSong && (
        <StreamModal 
          song={selectedSong} 
          onClose={() => setSelectedSong(null)} 
        />
      )}
    </div>
  );
}