interface BrandLogoProps {
  variant?: 'primary' | 'compact' | 'icon' | 'watermark' | 'stacked' | 'public' | 'workspace' | 'mobile' | 'login' | 'sidebar' | 'header';
  theme?: 'dark' | 'light' | 'monochrome';
  className?: string;
}

export function BrandLogo({
  variant = 'primary',
  theme = 'light',
  className = '',
}: BrandLogoProps) {
  // Resolve legacy variants to refined ones
  let resolvedVariant = variant;
  let resolvedTheme = theme;

  if (variant === 'header' || variant === 'workspace' || variant === 'mobile' || variant === 'sidebar') {
    resolvedVariant = 'compact';
  } else if (variant === 'login' || variant === 'public') {
    resolvedVariant = 'primary';
  }

  // Auto-detect dark background for legacy pages (login/sidebar)
  if (variant === 'login' || variant === 'sidebar') {
    resolvedTheme = 'dark';
  }

  // Height rules matching variant specifications
  const heightClasses = {
    primary: 'h-11 md:h-12',
    compact: 'h-8 sm:h-9',
    icon: 'h-7 sm:h-8',
    stacked: 'h-24 sm:h-28',
    watermark: 'h-16 md:h-24 opacity-15 select-none pointer-events-none',
  };

  const selectedHeight = heightClasses[resolvedVariant] || heightClasses.primary;

  // Theme-aware coloring
  const isDark = resolvedTheme === 'dark';
  const isMono = resolvedTheme === 'monochrome';

  // Base colors
  const houseStroke = isMono ? (isDark ? '#FFFFFF' : '#1F2937') : '#0A6B4F'; // Emerald or Mono
  const nodeFill = isMono ? (isDark ? '#FFFFFF' : '#1F2937') : '#10B981'; // Mint/Emerald or Mono
  const textFill = isDark ? '#FFFFFF' : '#1F2937'; // White or Graphite
  const subtextFill = isDark ? '#9CA3AF' : '#6B7280'; // Muted Gray

  // Refined geometric logo parts
  const renderHouseIcon = () => (
    <g id="house-icon">
      {/* Main geometric house outer frame */}
      <path
        d="M8 22L24 8L40 22V38H8V22Z"
        stroke={houseStroke}
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Dynamic connection lines: connecting center node to the corners of the house */}
      <line x1="24" y1="28" x2="24" y2="8" stroke={nodeFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />
      <line x1="24" y1="28" x2="8" y2="22" stroke={nodeFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />
      <line x1="24" y1="28" x2="40" y2="22" stroke={nodeFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />
      <line x1="24" y1="28" x2="8" y2="38" stroke={nodeFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />
      <line x1="24" y1="28" x2="40" y2="38" stroke={nodeFill} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />
      {/* Concentric connection field orbit */}
      <circle cx="24" cy="28" r="8" stroke={nodeFill} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      {/* Core connection node dot */}
      <circle cx="24" cy="28" r="3.5" fill={nodeFill} />
    </g>
  );

  // 1. Icon Only View
  if (resolvedVariant === 'icon') {
    return (
      <div className={`flex items-center select-none ${selectedHeight} ${className}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label="DBC Icon"
        >
          {renderHouseIcon()}
        </svg>
      </div>
    );
  }

  // 2. Compact View: Icon + Wordmark (128x48 viewport)
  if (resolvedVariant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 select-none ${selectedHeight} ${className}`}>
        <svg
          viewBox="0 0 128 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label="DBC Compact Logo"
        >
          {renderHouseIcon()}
          
          {/* Wordmark typography */}
          <g id="wordmark">
            {/* Letter D */}
            <path
              d="M52 14V32H61C66.5 32 70 28.5 70 23C70 17.5 66.5 14 61 14H52ZM57 18H60.5C63.5 18 65 19.5 65 23C65 26.5 63.5 28 60.5 28H57V18Z"
              fill={textFill}
            />
            {/* Letter B */}
            <path
              d="M78 14V32H87.5C92 32 95 29.5 95 26.5C95 24.5 93.5 23 91.5 22.5C93 22 94 20.5 94 19C94 16.5 91.5 14 87.5 14H78ZM83 18H86.5C88.5 18 89.5 18.5 89.5 20C89.5 21.5 88.5 22 86.5 22H83V18ZM83 25H87C89 25 90 25.5 90 27.5C90 29.5 89 30 87 30H83V25Z"
              fill={textFill}
            />
            {/* Letter C */}
            <path
              d="M112 14.5C104.5 14.5 101.5 19 101.5 23C101.5 27 104.5 31.5 112 31.5C116.5 31.5 119.5 29.5 120 26H115C114.5 27 113.5 27.5 112 27.5C108.5 27.5 106.5 25 106.5 23C106.5 21 108.5 18.5 112 18.5C113.5 18.5 114.5 19 115 20H120C119.5 16.5 116.5 14.5 112 14.5Z"
              fill={textFill}
            />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Stacked View: Centered layout (160x120 viewport)
  if (resolvedVariant === 'stacked') {
    return (
      <div className={`flex flex-col items-center select-none ${selectedHeight} ${className}`}>
        <svg
          viewBox="0 0 160 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label="DBC Stacked Logo"
        >
          {/* Centered house icon */}
          <g transform="translate(56, 12)">
            {renderHouseIcon()}
          </g>

          {/* Centered wordmark */}
          <g id="wordmark">
            {/* Letter D */}
            <path
              d="M46 14V32H55C60.5 32 64 28.5 64 23C64 17.5 60.5 14 55 14H46ZM51.5 18H55C58.5 18 60 19.5 60 23C60 26.5 58.5 28 55 28H51.5V18Z"
              fill={textFill}
            />
            {/* Letter B */}
            <path
              d="M72 14V32H81.5C86 32 89 29.5 89 26.5C89 24.5 87.5 23 85.5 22.5C87 22 88 20.5 88 19C88 16.5 85.5 14 81.5 14H72ZM77 18H80.5C82.5 18 83.5 18.5 83.5 20C83.5 21.5 82.5 22 80.5 22H77V18ZM77 25H81C83 25 84 25.5 84 27.5C84 29.5 83 30 81 30H77V25Z"
              fill={textFill}
            />
            {/* Letter C */}
            <path
              d="M106 14.5C98.5 14.5 95.5 19 95.5 23C95.5 27 98.5 31.5 106 31.5C110.5 31.5 113.5 29.5 114 26H109C108.5 27 107.5 27.5 106 27.5C102.5 27.5 100.5 25 100.5 23C100.5 21 102.5 18.5 106 18.5C107.5 18.5 108.5 19 109 20H114C113.5 16.5 110.5 14.5 106 14.5Z"
              fill={textFill}
            />
          </g>

          {/* Centered tagline */}
          <text
            x="80"
            y="102"
            textAnchor="middle"
            fill={subtextFill}
            fontSize="5.5"
            fontWeight="950"
            letterSpacing="2.2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            DESIGN · BUILD · CONNECT
          </text>
        </svg>
      </div>
    );
  }

  // 4. Primary View: Horizontal Layout (180x48 viewport)
  return (
    <div className={`flex items-center gap-3 select-none ${selectedHeight} ${className}`}>
      <svg
        viewBox="0 0 180 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="DBC Full Logo"
      >
        {renderHouseIcon()}
        
        {/* Wordmark typography */}
        <g id="wordmark">
          <path
            d="M52 14V32H61C66.5 32 70 28.5 70 23C70 17.5 66.5 14 61 14H52ZM57 18H60.5C63.5 18 65 19.5 65 23C65 26.5 63.5 28 60.5 28H57V18Z"
            fill={textFill}
          />
          <path
            d="M78 14V32H87.5C92 32 95 29.5 95 26.5C95 24.5 93.5 23 91.5 22.5C93 22 94 20.5 94 19C94 16.5 91.5 14 87.5 14H78ZM83 18H86.5C88.5 18 89.5 18.5 89.5 20C89.5 21.5 88.5 22 86.5 22H83V18ZM83 25H87C89 25 90 25.5 90 27.5C90 29.5 89 30 87 30H83V25Z"
            fill={textFill}
          />
          <path
            d="M112 14.5C104.5 14.5 101.5 19 101.5 23C101.5 27 104.5 31.5 112 31.5C116.5 31.5 119.5 29.5 120 26H115C114.5 27 113.5 27.5 112 27.5C108.5 27.5 106.5 25 106.5 23C106.5 21 108.5 18.5 112 18.5C113.5 18.5 114.5 19 115 20H120C119.5 16.5 116.5 14.5 112 14.5Z"
            fill={textFill}
          />
        </g>

        {/* Tagline */}
        <text
          x="52"
          y="42"
          fill={subtextFill}
          fontSize="5.5"
          fontWeight="950"
          letterSpacing="2.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          DESIGN · BUILD · CONNECT
        </text>
      </svg>
    </div>
  );
}
export default BrandLogo;
