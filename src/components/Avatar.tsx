import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ src, alt = 'User avatar', size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/20 ${className}`}
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
          const nextSibling = (e.target as HTMLImageElement).nextElementSibling;
          if (nextSibling) {
            (nextSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }

  // Default avatar
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border-2 border-white/20 ${className}`}
    >
      <User
        className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-12 h-12'} text-white`}
      />
    </div>
  );
}
