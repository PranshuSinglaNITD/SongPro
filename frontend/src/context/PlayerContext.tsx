import { createContext, useContext, useState } from 'react';

// Define the Track interface based on your existing data
export interface Track {
  track_id: string;
  track_name: string;
  artists: string;
  energy: number;
  preview_url?: string | null;
  image_url?: string;
  spotify_id?: string;
}

interface PlayerContextType {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTrack: Track | null;
  loadJourney: (tracks: Track[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = queue.length > 0 ? queue[currentIndex] : null;

  // Load a generated mood progression array into the player
  const loadJourney = (tracks: Track[], startIndex = 0) => {
    setQueue(tracks);
    setCurrentIndex(Math.min(Math.max(startIndex, 0), Math.max(tracks.length - 1, 0)));
    setIsPlaying(tracks.length > 0);
  };

  // Auto-advance to the next song in the calculated queue
  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false); // Journey complete
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (queue.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <PlayerContext.Provider value={{ queue, currentIndex, isPlaying, currentTrack, loadJourney, playNext, playPrevious, togglePlay }}>
      {children}
    </PlayerContext.Provider>
  );
}

// The hook is exported alongside the provider for the existing context API.
// eslint-disable-next-line react-refresh/only-export-components
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
};