import React from 'react';
import { Song, StreamingService } from '../types';
import { SpotifyIcon, AppleMusicIcon, YoutubeIcon } from './Icons';

interface StreamModalProps {
  song: Song | null;
  onClose: () => void;
}

const SERVICES: StreamingService[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: <SpotifyIcon />,
    urlGen: (term) => `https://open.spotify.com/search/${encodeURIComponent(term)}`
  },
  {
    id: 'apple',
    name: 'Apple Music',
    icon: <AppleMusicIcon />,
    urlGen: (term) => `https://music.apple.com/us/search?term=${encodeURIComponent(term)}`
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <YoutubeIcon />,
    urlGen: (term) => `https://www.youtube.com/results?search_query=${encodeURIComponent(term)}`
  }
];

export const StreamModal: React.FC<StreamModalProps> = ({ song, onClose }) => {
  if (!song) return null;

  const searchTerm = `${song.artist} ${song.title}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all scale-100">
        <div className="p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden shadow-lg mb-4 bg-zinc-800">
             <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1 line-clamp-1">{song.title}</h2>
          <p className="text-zinc-400 mb-6 line-clamp-1">{song.artist}</p>

          <p className="text-sm text-zinc-500 mb-4 uppercase tracking-wider font-semibold">Öffnen mit</p>

          <div className="space-y-3">
            {SERVICES.map((service) => (
              <a
                key={service.id}
                href={service.urlGen(searchTerm)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-between p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors group"
              >
                <div className="flex items-center space-x-3">
                    {service.icon}
                    <span className="font-medium text-zinc-200 group-hover:text-white">{service.name}</span>
                </div>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-950 p-4 text-center border-t border-zinc-800">
             <button onClick={onClose} className="text-zinc-400 hover:text-white font-medium text-sm">Abbrechen</button>
        </div>
      </div>
    </div>
  );
};
