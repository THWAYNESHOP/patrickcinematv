import { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize, X, AlertCircle } from 'lucide-react';
import { LiveTvChannel } from '../../data/liveTvChannels';

interface LiveTvPlayerProps {
  channel: LiveTvChannel;
  onClose: () => void;
}

export default function LiveTvPlayer({ channel, onClose }: LiveTvPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Simulate loading - iframe will handle the actual stream
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [channel.streamUrl]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!playerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await playerContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-deepBlack`}>
      <div className={isFullscreen ? 'w-full h-full flex flex-col' : 'min-h-screen py-6 sm:py-8 px-3 sm:px-4 md:px-8'}>
        <div className={isFullscreen ? 'w-full h-full flex flex-col' : 'container mx-auto max-w-7xl'}>
          {/* Header - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Live TV</h1>
                <p className="text-sm sm:text-base text-gray-400 mt-2">{channel.name}</p>
              </div>
              <button
                onClick={onClose}
                className="glass hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Player Container */}
          <div
            ref={playerContainerRef}
            className={`glass-strong rounded-lg overflow-hidden mb-6 transition-all duration-200 ${
              isFullscreen ? 'rounded-none mb-0 w-full h-full' : ''
            }`}
          >
            {/* Player Wrapper */}
            <div
              className={`relative bg-black ${
                isFullscreen ? 'w-full h-full' : 'aspect-video'
              }`}
            >
              {/* LIVE Indicator */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-red-50 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">LIVE NOW</span>
              </div>

              {/* Channel Name Badge */}
              <div className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-xs font-semibold text-white">{channel.name}</span>
              </div>

              {/* Player Controls */}
              <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>

                {/* Close Button - Only in fullscreen */}
                {isFullscreen && (
                  <button
                    onClick={onClose}
                    title="Close Player"
                    className="bg-primary/80 hover:bg-primary text-white p-2.5 rounded-lg transition-colors duration-150 active:scale-95"
                    aria-label="Close player"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              )}

              {/* Error Message */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                  <div className="text-center p-6">
                    <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold mb-2">Stream Error</p>
                    <p className="text-gray-400 text-sm">Unable to load the stream. Please try again later.</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Iframe Element */}
              <iframe
                ref={iframeRef}
                src={channel.streamUrl}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          </div>

          {/* Channel Info - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Channel Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Channel Name</p>
                  <p className="font-semibold text-white">{channel.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="font-semibold text-white">{channel.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Quality</p>
                  <p className="font-semibold text-white">{channel.isHD ? 'HD' : 'SD'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
