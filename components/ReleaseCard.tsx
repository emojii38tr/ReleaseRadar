import React from 'react';
import { Song } from '../types';
import { HeartIcon } from './Icons';

interface ReleaseCardProps {
  song: Song;
  isFavorite: boolean;
  onToggleFavorite: (song: Song) => void;
  onClick: (song: Song) => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ song, isFavorite, onToggleFavorite, onClick }) => {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-md rounded-xl p-3 flex items-center space-x-4 hover:bg-zinc-800 transition-colors cursor-pointer group">
      {/* Cover Art Placeholder */}
      <div 
        className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-700"
        onClick={() => onClick(song)}
      >
        <img 
          src={song.coverUrl} 
          alt={song.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={() => onClick(song)}>
        <h3 className="text-white font-semibold truncate text-base">{song.title}</h3>
        <p className="text-zinc-400 text-sm truncate">{song.artist}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs bg-zinc-700/50 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">{song.genre}</span>
          {song.releaseDate && <span className="text-xs text-zinc-500">{song.releaseDate}</span>}
        </div>
      </div>

      {/* Actions */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(song);
        }}
        className="p-2 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-pink-500 transition-colors"
      >
        <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-pink-500 fill-pink-500' : ''}`} solid={isFavorite} />
      </button>
    </div>
  );
};
