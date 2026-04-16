import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  isBackground?: boolean;
  backgroundSize?: string;
  children?: React.ReactNode;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt = '',
  className = '',
  style = {},
  isBackground = false,
  backgroundSize = 'cover',
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  if (isBackground) {
    return (
      <div
        className={`transition-opacity duration-500 ${className}`}
        style={{
          ...style,
          backgroundImage: isLoaded ? `url(${imageSrc})` : 'none',
          backgroundSize: backgroundSize,
          backgroundPosition: 'center',
          backgroundColor: 'hsl(201, 72%, 25%)',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Placeholder */}
      <div
        className={`absolute inset-0 bg-secondary/20 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* Actual image */}
      <img
        src={imageSrc || ''}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {children}
    </div>
  );
};

export default OptimizedImage;
