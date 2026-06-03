import { Play } from 'lucide-react';
import { LiveTvChannel } from '../../data/liveTvChannels';

interface ChannelCardProps {
  channel: LiveTvChannel;
  onWatch: (channel: LiveTvChannel) => void;
}

export default function ChannelCard({ channel, onWatch }: ChannelCardProps) {
  return (
    <div className="glass rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow group">
      {/* Card Content */}
      <div className="p-4">
        {/* Logo Placeholder */}
        <div className="aspect-video bg-darkSurface rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
          {/* Channel Logo Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary/80">
              {channel.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          
          {/* LIVE Indicator */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
          </div>

          {/* HD Badge */}
          {channel.isHD && (
            <div className="absolute top-2 right-2 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <span className="text-[10px] font-bold text-deepBlack tracking-wide">HD</span>
            </div>
          )}
        </div>

        {/* Channel Name */}
        <h3 className="text-white font-semibold text-sm sm:text-base mb-3 line-clamp-2 min-h-[2.5rem]">
          {channel.name}
        </h3>

        {/* Watch Button */}
        <button
          onClick={() => onWatch(channel)}
          className="w-full bg-primary hover:bg-primaryHover text-white py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 group-hover:shadow-lg group-hover:shadow-primary/30"
        >
          <Play className="w-4 h-4" />
          <span>Watch</span>
        </button>
      </div>
    </div>
  );
}
