import { Play, Pause, SkipBack, SkipForward, Image as ImageIcon } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useEffect, useRef, useState } from 'react';

export default function SmartPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, queue, currentIndex } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progressState, setProgressState] = useState({ queueIndex: -1, percent: 0 });
  const progress = currentIndex === progressState.queueIndex ? progressState.percent : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentTrack?.preview_url) {
      audio.play().catch(() => {
        // Playback may require a user gesture in the browser.
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgressState({
        queueIndex: currentIndex,
        percent: total ? (current / total) * 100 : 0,
      });
    }
  };

  if (!currentTrack) return null;
  const hasPreview = Boolean(currentTrack.preview_url);
  const hasSpotifyEmbed = Boolean(currentTrack.spotify_id);
  const spotifyEmbedUrl = currentTrack.spotify_id
    ? `https://open.spotify.com/embed/track/${encodeURIComponent(currentTrack.spotify_id)}?utm_source=generator&theme=0`
    : undefined;

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${hasSpotifyEmbed && !hasPreview ? 'min-h-40 py-3' : 'h-24'} bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 z-50 flex items-center justify-between gap-4 px-4 lg:px-12`}>
      
      <audio 
        ref={audioRef}
        src={currentTrack.preview_url || undefined}
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Left: Album Art & Track Info */}
      <div className="flex items-center gap-4 w-1/3">
        {currentTrack.image_url ? (
          <img src={currentTrack.image_url} alt="Album Art" className="w-14 h-14 rounded-lg shadow-lg object-cover" />
        ) : (
          <div className="w-14 h-14 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 shrink-0">
             <ImageIcon className="text-gray-600" size={24} />
          </div>
        )}
        
        <div className="truncate">
          <h4 className="text-white font-bold text-sm lg:text-base truncate">{currentTrack.track_name}</h4>
          <p className="text-gray-400 text-xs truncate">{currentTrack.artists}</p>
        </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex flex-col items-center justify-center w-1/3 min-w-0">
        {hasSpotifyEmbed && !hasPreview ? (
          <iframe
            title={`Play ${currentTrack.track_name} on Spotify`}
            src={spotifyEmbedUrl}
            width="352"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="max-w-full rounded-xl"
          />
        ) : (
          <>
        <div className="flex items-center gap-6 mb-2">
          <button onClick={playPrevious} disabled={currentIndex === 0} className="text-gray-400 hover:text-white disabled:opacity-30 transition">
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!hasPreview}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-50"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
          
          <button onClick={playNext} disabled={currentIndex === queue.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 transition">
            <SkipForward size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md flex items-center gap-3">
          <span className="text-[10px] font-mono text-amber-500">
            {hasPreview ? 'PREVIEW' : 'NO AUDIO'}
          </span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-[10px] font-mono text-gray-500">
            {currentIndex + 1}/{queue.length}
          </span>
        </div>
          </>
        )}
      </div>

      <div className="w-1/3 flex justify-end">
        {hasSpotifyEmbed && !hasPreview && (
          <div className="flex items-center gap-4">
            <button
              onClick={playPrevious}
              disabled={currentIndex === 0}
              aria-label="Play previous track"
              className="text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              <SkipBack size={24} />
            </button>
            <span className="text-[10px] font-mono text-gray-500">{currentIndex + 1}/{queue.length}</span>
            <button
              onClick={playNext}
              disabled={currentIndex === queue.length - 1}
              aria-label="Play next track"
              className="text-gray-400 hover:text-white disabled:opacity-30 transition"
            >
              <SkipForward size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}