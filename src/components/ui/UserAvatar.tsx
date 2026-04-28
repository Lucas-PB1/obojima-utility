import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
  shape?: 'circle' | 'rounded';
}

function getFallbackLabel(name?: string | null, email?: string | null) {
  const base = (name || email || '').trim();
  if (!base) return '';
  return base[0]?.toUpperCase() || '';
}

export function UserAvatar({
  src,
  name,
  email,
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  iconClassName = '',
  shape = 'circle'
}: UserAvatarProps) {
  const safeSrc = src?.trim() || '';
  const fallbackLabel = getFallbackLabel(name, email);
  const radiusClass = shape === 'rounded' ? 'rounded-lg' : 'rounded-full';

  return (
    <div
      className={`relative overflow-hidden bg-totoro-blue/10 text-totoro-blue shadow-[inset_0_0_0_1px_rgba(var(--primary-rgb),0.14)] ${radiusClass} ${className}`}
    >
      {safeSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt={name || email || 'User avatar'}
          className={`h-full w-full object-cover ${radiusClass} ${imageClassName}`}
          referrerPolicy="no-referrer"
        />
      ) : fallbackLabel ? (
        <span
          className={`flex h-full w-full items-center justify-center font-bold uppercase ${fallbackClassName}`}
        >
          {fallbackLabel}
        </span>
      ) : (
        <span className={`flex h-full w-full items-center justify-center ${fallbackClassName}`}>
          <User className={iconClassName || 'h-5 w-5'} />
        </span>
      )}
    </div>
  );
}
