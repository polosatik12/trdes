import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface FaIconProps {
  icon: IconDefinition;
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Wrapper around FontAwesomeIcon that accepts className with Tailwind h-X w-X sizing.
 * Parses h-X/w-X into a pixel size for the SVG.
 */
const FaIcon: React.FC<FaIconProps> = ({ icon, className = '', size, color }) => {
  // Extract size from className like "h-4 w-4" or "h-5 w-5"
  let computedSize = size;
  if (!computedSize) {
    const match = className.match(/(?:h|w)-(\d+)/);
    if (match) {
      computedSize = parseInt(match[1]) * 4; // Tailwind units to px
    }
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{
        width: computedSize ? `${computedSize}px` : undefined,
        height: computedSize ? `${computedSize}px` : undefined,
        ...(color ? { color } : {}),
      }}
    />
  );
};

export default FaIcon;
