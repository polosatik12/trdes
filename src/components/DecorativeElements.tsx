import React from 'react';

// Hexagon shape component - inspired by presentation design
export const Hexagon: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline' | 'gradient';
}> = ({ className = '', size = 'md', variant = 'filled' }) => {
  const sizeClasses = {
    sm: 'w-8 h-9',
    md: 'w-16 h-18',
    lg: 'w-24 h-28',
  };

  const variantClasses = {
    filled: 'fill-primary/20',
    outline: 'fill-none stroke-primary/30 stroke-2',
    gradient: 'fill-[url(#hexGradient)]',
  };

  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`} 
      viewBox="0 0 100 115" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(201, 72%, 30%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(170, 75%, 49%)" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <polygon 
        className={variantClasses[variant]}
        points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75" 
      />
    </svg>
  );
};

// Floating hexagons background decoration
export const FloatingHexagons: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Top right cluster */}
      <div className="absolute -top-4 right-20 opacity-40 animate-pulse">
        <Hexagon size="lg" variant="gradient" />
      </div>
      <div className="absolute top-24 right-40 opacity-30">
        <Hexagon size="md" variant="outline" />
      </div>
      <div className="absolute top-8 right-8 opacity-20">
        <Hexagon size="sm" variant="filled" />
      </div>
      
      {/* Bottom left cluster */}
      <div className="absolute bottom-32 left-10 opacity-25">
        <Hexagon size="md" variant="gradient" />
      </div>
      <div className="absolute bottom-16 left-32 opacity-15">
        <Hexagon size="sm" variant="outline" />
      </div>
      
      {/* Center accent */}
      <div className="absolute top-1/2 right-1/4 opacity-10">
        <Hexagon size="lg" variant="outline" />
      </div>
    </div>
  );
};

// Decorative dashed line connector - inspired by the timeline in presentation
export const DashedConnector: React.FC<{
  className?: string;
  direction?: 'horizontal' | 'vertical';
}> = ({ className = '', direction = 'horizontal' }) => {
  return (
    <div 
      className={`${
        direction === 'horizontal' 
          ? 'w-full h-0.5' 
          : 'w-0.5 h-full'
      } ${className}`}
      style={{
        background: `repeating-linear-gradient(
          ${direction === 'horizontal' ? '90deg' : '180deg'},
          hsl(170, 75%, 49%),
          hsl(170, 75%, 49%) 8px,
          transparent 8px,
          transparent 16px
        )`,
      }}
    />
  );
};

// Dot marker with pulse effect
export const DotMarker: React.FC<{
  className?: string;
  variant?: 'primary' | 'secondary';
}> = ({ className = '', variant = 'primary' }) => {
  const colors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-4 h-4 rounded-full ${colors[variant]}`} />
      <div 
        className={`absolute inset-0 w-4 h-4 rounded-full ${colors[variant]} animate-ping opacity-75`} 
      />
    </div>
  );
};

// Background mesh grid pattern
export const MeshBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(201, 72%, 30%, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(201, 72%, 30%, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
};

// Accent corner decoration
export const CornerAccent: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}> = ({ position, className = '' }) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  return (
    <div className={`absolute ${positionClasses[position]} ${className}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path 
          d="M0 0L120 0L120 8L8 8L8 120L0 120L0 0Z" 
          fill="url(#cornerGradient)"
        />
        <defs>
          <linearGradient id="cornerGradient" x1="0" y1="0" x2="120" y2="120">
            <stop stopColor="hsl(170, 75%, 49%)" stopOpacity="0.4" />
            <stop offset="1" stopColor="hsl(201, 72%, 30%)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Diagonal stripe pattern
export const DiagonalStripes: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none opacity-[0.02] ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          hsl(201, 72%, 30%),
          hsl(201, 72%, 30%) 2px,
          transparent 2px,
          transparent 20px
        )`,
      }}
    />
  );
};

// Glowing orb decoration
export const GlowingOrb: React.FC<{
  className?: string;
  color?: 'cyan' | 'navy';
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', color = 'cyan', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
  };

  const colorClasses = {
    cyan: 'from-primary/20 via-primary/5 to-transparent',
    navy: 'from-secondary/20 via-secondary/5 to-transparent',
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full bg-gradient-radial ${colorClasses[color]} blur-3xl ${className}`}
    />
  );
};

export default {
  Hexagon,
  FloatingHexagons,
  DashedConnector,
  DotMarker,
  MeshBackground,
  CornerAccent,
  DiagonalStripes,
  GlowingOrb,
};
