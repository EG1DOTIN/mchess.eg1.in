import React, { useState, useEffect, useId } from 'react';
import { useTheme } from 'eg-web-core';
import './MarwadiChessLogo.css';

export interface MarwadiChessLogoProps {
  /** Size in pixels for the SVG Staunton badge (default: 56) */
  size?: number;
  /** Explicit theme override ('light' | 'dark' | 'auto') */
  theme?: 'light' | 'dark' | 'auto';
  /** Horse style variant: 'auto' (matches theme), 'white-horse' (white piece), 'dark-horse' (black piece) */
  horseVariant?: 'auto' | 'white-horse' | 'dark-horse';
  /** Whether to render the brand text ("Marwadi Chess" + version + tagline) */
  showText?: boolean;
  /** Whether to display the tagline below the brand title */
  showTagline?: boolean;
  /** Whether to display the superscript version badge */
  showVersion?: boolean;
  /** Explicit version string override (e.g. 'v3.9.3') */
  version?: string;
  /** Navigation destination or handler */
  href?: string;
  onNavigate?: (href: string) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Authentic Marwadi Chess Staunton Brand Badge Logo component.
 * Faithfully implements the exact vector SVG Staunton Knight badge,
 * gold gradient boundary (#fbbf24 -> #d4af37 -> #b45309), dark/light horse options,
 * dynamic SSOT version resolution from updates.json, and responsive typography.
 *
 * @example
 * ```tsx
 * <MarwadiChessLogo size={56} onNavigate={navigateTo} />
 * ```
 */
export const MarwadiChessLogo: React.FC<MarwadiChessLogoProps> = ({
  size = 56,
  theme = 'auto',
  horseVariant = 'auto',
  showText = true,
  showTagline = true,
  showVersion = true,
  version: explicitVersion,
  href = 'index',
  onNavigate,
  onClick,
  className = '',
  style = {},
}) => {
  const { isDark: activeIsDark } = useTheme();
  const isDark = theme === 'dark' ? true : theme === 'light' ? false : activeIsDark;
  const gradientId = useId().replace(/:/g, '_');

  // Horse group variant resolution
  const useWhiteHorse =
    horseVariant === 'white-horse'
      ? true
      : horseVariant === 'dark-horse'
      ? false
      : isDark;

  const badgeBg = useWhiteHorse ? '#090d16' : '#FFFFFF';
  const horseFill = useWhiteHorse ? '#FFFFFF' : '#111827';
  const eyeOuter = useWhiteHorse ? '#090d16' : '#FFFFFF';
  const eyeInner = useWhiteHorse ? '#FFFFFF' : '#111827';

  // Version Single Source of Truth
  const [appVersion, setAppVersion] = useState<string>(() => {
    if (explicitVersion) return explicitVersion;
    try {
      const cached = sessionStorage.getItem('mchess_version_ssot');
      if (cached) return cached;
    } catch {
      // Ignore
    }
    return 'v3.9.3';
  });

  useEffect(() => {
    if (explicitVersion) {
      setAppVersion(explicitVersion);
      return;
    }

    let active = true;
    fetch('data/updates.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !Array.isArray(data)) return;
        const topItem = data.find((i: Record<string, unknown>) => i && i.version) || data[0];
        if (topItem && topItem.version) {
          let verStr = String(topItem.version).trim();
          if (!verStr.startsWith('v')) verStr = `v${verStr}`;
          setAppVersion(verStr);
          try {
            sessionStorage.setItem('mchess_version_ssot', verStr);
          } catch {
            // Ignore
          }
        }
      })
      .catch(() => {
        // Fallback default remains v3.9.3
      });

    return () => {
      active = false;
    };
  }, [explicitVersion]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (onNavigate && href && !href.startsWith('http')) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`mchess-logo-link ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '14px',
        paddingRight: '4px',
        marginRight: '0px',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
      title="Marwadi Chess - Play, Learn & Master Chess"
    >
      {/* Staunton Knight Badge SVG */}
      <div className="mchess-logo-badge-wrapper">
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          style={{
            display: 'block',
            filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))',
            transition: 'transform 0.2s ease',
          }}
        >
          <defs>
            <linearGradient id={`goldGrad_${gradientId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Outer Golden Boundary */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="20"
            fill={badgeBg}
            stroke={`url(#goldGrad_${gradientId})`}
            strokeWidth="5"
          />
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="16"
            fill="none"
            stroke="#d4af37"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Enhanced Staunton Knight Silhouette */}
          <g transform="translate(14, 10) scale(1.45)">
            <rect x="10" y="38" width="29" height="3" rx="1" fill={horseFill} />
            <path d="M 12 38 L 37 38 L 35 35 L 14 35 Z" fill={horseFill} />
            <path d="M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18 Z" fill={horseFill} />
            <path
              d="M 24 18 C 24.38 20.91 18.45 25.37 16 27 C 13 29 13.18 31.34 11 31 C 9.958 30.06 12.41 27.96 11 28 C 10 28 11.19 29.23 10 30 C 9 30 5.997 31 6 26 C 6 24 12 14 12 14 C 12 14 13.89 12.1 14 10.5 C 13.27 9.506 13.5 8.5 13.5 7.5 C 14.5 6.5 16.5 10 16.5 10 C 16.5 10 18.55 9.245 19 6.5 C 19.5 4 21 3 22.5 3 C 23.5 3 24.5 4.14 24.5 5.5 C 24.5 6.86 23.5 8 24.5 8 C 27.5 7.5 30.5 8.5 32 10.5 C 33.5 12.5 33 16 33 16 C 33 16 31 18 29.5 18.5 C 28 19 24.28 19.33 24 18 Z"
              fill={horseFill}
            />
            {/* Eye and Accents */}
            <circle cx="9.5" cy="25.5" r="1.6" fill={eyeOuter} />
            <circle cx="9.5" cy="25.5" r="0.7" fill={eyeInner} />
            <path d="M 12 29 C 15 27 19 25 21 21" stroke={eyeOuter} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.9" />
            <path d="M 25 9 C 27 12 29 15 28 18" stroke={eyeOuter} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 28 12 C 30 15 32 19 31 23" stroke={eyeOuter} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 31 16 C 33 20 34 25 33 30" stroke={eyeOuter} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 7.2 26.5 Q 8 25.5 8.8 26.8" stroke={eyeOuter} strokeWidth="0.6" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Brand Title & Tagline */}
      {showText && (
        <div
          className="mchess-logo-text-wrapper"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 1.15,
          }}
        >
          <div
            className="mchess-logo-title"
            style={{
              fontSize: size >= 50 ? '24px' : '20px',
              fontFamily: '"PT Sans", "Roboto Slab", -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.3px',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}
          >
            <strong
              style={{
                color: isDark ? '#f8fafc' : '#111827',
                fontWeight: 800,
              }}
            >
              Marwadi
            </strong>{' '}
            <strong
              style={{
                color: '#d4af37',
                fontWeight: 700,
              }}
            >
              Chess
            </strong>
            {showVersion && (
              <sup
                className="brand-version"
                style={{
                  fontSize: '0.58em',
                  fontWeight: 700,
                  color: isDark ? '#94a3b8' : '#6b7280',
                  marginLeft: '3px',
                  marginRight: '2px',
                  verticalAlign: 'super',
                  lineHeight: 0,
                  display: 'inline',
                  letterSpacing: '0.02em',
                }}
              >
                {appVersion}
              </sup>
            )}
          </div>
          {showTagline && (
            <span
              className="mchess-logo-tagline"
              style={{
                fontSize: '11.5px',
                color: isDark ? '#94a3b8' : '#6b7280',
                letterSpacing: '0.4px',
                fontWeight: 500,
                marginTop: '3px',
              }}
            >
              Play, Learn & Master Chess
            </span>
          )}
        </div>
      )}
    </a>
  );
};
