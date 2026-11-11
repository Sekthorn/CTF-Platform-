import React, { useState } from 'react';
import { getAvatarUrl, DEFAULT_AVATAR } from '@/data/avatars';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  role?: string;
  showGlow?: boolean;
  onClick?: () => void;
}

const sizeClasses: Record<AvatarSize, { container: string; img: string }> = {
  xs: { container: 'w-7 h-7', img: 'w-7 h-7' },
  sm: { container: 'w-9 h-9', img: 'w-9 h-9' },
  md: { container: 'w-12 h-12', img: 'w-12 h-12' },
  lg: { container: 'w-16 h-16', img: 'w-16 h-16' },
  xl: { container: 'w-20 h-20', img: 'w-20 h-20' },
  '2xl': { container: 'w-28 h-28', img: 'w-28 h-28' },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'Hacker Avatar',
  size = 'md',
  className = '',
  role,
  showGlow = false,
  onClick,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(getAvatarUrl(src));
  const [hasError, setHasError] = useState(false);

  // Sync state if src changes
  React.useEffect(() => {
    setImgSrc(getAvatarUrl(src));
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_AVATAR);
    }
  };

  const isAdmin = role === 'ADMIN';
  const borderColor = isAdmin
    ? 'border-emerald-500/70 group-hover:border-emerald-400'
    : 'border-cyan-500/50 group-hover:border-cyan-400';

  const glowClass = showGlow
    ? isAdmin
      ? 'shadow-[0_0_15px_rgba(16,185,129,0.35)]'
      : 'shadow-[0_0_15px_rgba(6,182,212,0.35)]'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block rounded-full flex-shrink-0 transition-transform ${sizeClasses[size].container} ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
    >
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className={`rounded-full object-cover border-2 ${borderColor} ${glowClass} ${sizeClasses[size].img} bg-cyber-bg transition-all duration-200`}
        loading="lazy"
      />
    </div>
  );
};

export default UserAvatar;
