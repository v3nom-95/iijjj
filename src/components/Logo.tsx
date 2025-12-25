import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  showText?: boolean;
  variant?: 'default' | 'footer' | 'auth';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  alt = 'VNITS Alumni Network Logo', 
  showText = false,
  variant = 'default'
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img 
        src="/logo.png" 
        alt={alt}
        className={cn(
          'object-contain',
          size === 'sm' && 'w-10 h-10',
          size === 'md' && 'w-12 h-12',
          size === 'lg' && 'w-16 h-16',
          size === 'xl' && 'w-28 h-28',
          variant === 'auth' && 'mx-auto mb-4 w-32 h-32',
          variant === 'footer' && 'w-12 h-12'
        )}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
        onError={(e) => {
          // Fallback to icon if image fails to load
          e.currentTarget.style.display = 'none';
          const iconContainer = e.currentTarget.nextElementSibling as HTMLElement;
          if (iconContainer) iconContainer.style.display = 'flex';
        }}
      />
      <div 
        className="w-6 h-6 items-center justify-center text-secondary hidden"
        style={{ display: 'none' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M21 15V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V15M21 15C21 13.8954 20.1046 13 19 13H5C3.89543 13 3 13.8954 3 15M21 15L12 6L3 15M3 15L7 19M16 7C16 7.55228 15.5523 8 15 8C14.4477 8 14 7.55228 14 7C14 6.44772 14.4477 6 15 6C15.5523 6 16 6.44772 16 7ZM8 7C8 7.55228 7.55228 8 7 8C6.44772 8 6 7.55228 6 7C6 6.44772 6.44772 6 7 6C7.55228 6 8 6.44772 8 7Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <div className={cn(
          'font-display font-bold text-foreground leading-tight',
          textSizeClasses[size],
          variant === 'footer' && 'text-sm'
        )}>
          <div className="leading-tight">
            {variant === 'footer' ? 'VAAIT Connect' : 'VAAIT'}
          </div>
          <div className={cn(
            'text-muted-foreground',
            variant === 'footer' ? 'text-xs' : 'text-xs'
          )}>
            Vignan Alumni Association for IT
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
