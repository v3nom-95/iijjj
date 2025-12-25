import React, { useState, useEffect } from 'react';

interface ImageDiagnosticProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  style?: React.CSSProperties;
}

const ImageDiagnostic: React.FC<ImageDiagnosticProps> = ({
  src,
  alt,
  className,
  fallbackSrc,
  style
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    
    const handleLoad = () => {
      setImageStatus('loaded');
      setDebugInfo(`✓ Image loaded successfully: ${src}`);
    };
    
    const handleError = () => {
      setImageStatus('error');
      setDebugInfo(`✗ Failed to load: ${src}`);
      
      if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  // In development, show debug info
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="relative">
        <img
          src={imageStatus === 'error' && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          className={className}
          style={style}
          onError={(e) => {
            console.error(`Failed to load image: ${src}`, e);
          }}
        />
        {imageStatus === 'error' && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1">
            Debug: {debugInfo}
          </div>
        )}
      </div>
    );
  }

  // Production version - clean, no debug info
  return (
    <img
      src={imageStatus === 'error' && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        console.error(`Failed to load image: ${src}`, e);
      }}
    />
  );
};

export default ImageDiagnostic;
