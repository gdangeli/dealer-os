import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../DealerOSExplainer';
import { FadeIn, ScaleIn, SlideIn } from '../components/transitions';

// Problem icons as SVG components
const ExcelIcon = () => (
  <svg viewBox="0 0 100 100" width="120" height="120">
    <rect x="10" y="10" width="80" height="80" rx="8" fill="#217346" />
    <text x="50" y="60" textAnchor="middle" fill="white" fontSize="32" fontWeight="bold">X</text>
    <path d="M20 30 L80 30 M20 50 L80 50 M20 70 L80 70 M40 20 L40 80 M60 20 L60 80" stroke="white" strokeWidth="1" opacity="0.5" />
  </svg>
);

const MissedCallIcon = () => (
  <svg viewBox="0 0 100 100" width="120" height="120">
    <circle cx="50" cy="50" r="40" fill="#DC2626" />
    <path d="M30 40 Q50 60 70 40" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round" />
    <circle cx="35" cy="35" r="3" fill="white" />
    <circle cx="65" cy="35" r="3" fill="white" />
    <line x1="65" y1="25" x2="75" y2="15" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <line x1="65" y1="15" x2="75" y2="25" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 100 100" width="120" height="120">
    <circle cx="50" cy="50" r="40" fill="#F59E0B" />
    <circle cx="50" cy="50" r="32" fill="white" />
    <line x1="50" y1="50" x2="50" y2="30" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="65" y2="55" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="4" fill="#1E293B" />
    {/* Dust particles */}
    <circle cx="25" cy="75" r="3" fill="#D1D5DB" />
    <circle cx="75" cy="80" r="4" fill="#D1D5DB" />
    <circle cx="20" cy="85" r="2" fill="#D1D5DB" />
  </svg>
);

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background animation: starts white, transitions to red-tinted
  const bgOpacity = interpolate(frame, [0, fps * 3], [0, 1], { extrapolateRight: 'clamp' });

  // Text animations
  const titleOpacity = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale = spring({ frame: frame - fps * 0.5, fps, config: { damping: 12 } });

  // Icon staggered appearance
  const icon1Frame = frame - fps * 3;
  const icon2Frame = frame - fps * 5;
  const icon3Frame = frame - fps * 7;

  // Shake animation for icons
  const shake = (baseFrame: number) => {
    const shakeFrame = baseFrame - fps * 2;
    if (shakeFrame < 0) return 0;
    return Math.sin(shakeFrame * 0.5) * interpolate(shakeFrame, [0, fps], [5, 0], { extrapolateRight: 'clamp' });
  };

  // Problem labels
  const label1Opacity = interpolate(frame, [fps * 4, fps * 4.5], [0, 1], { extrapolateRight: 'clamp' });
  const label2Opacity = interpolate(frame, [fps * 6, fps * 6.5], [0, 1], { extrapolateRight: 'clamp' });
  const label3Opacity = interpolate(frame, [fps * 8, fps * 8.5], [0, 1], { extrapolateRight: 'clamp' });

  // Frustration pulse at the end
  const pulseScale = frame > fps * 12 
    ? 1 + Math.sin((frame - fps * 12) * 0.3) * 0.02 
    : 1;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.white} 0%, rgba(254, 226, 226, ${bgOpacity}) 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${pulseScale})`,
      }}
    >
      {/* Main Title */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.slate,
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Kennen Sie das?
        </h1>
        <p
          style={{
            fontSize: 32,
            color: COLORS.slateMuted,
            marginTop: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Der Alltag im Autohandel...
        </p>
      </div>

      {/* Problem Icons Container */}
      <div
        style={{
          display: 'flex',
          gap: 120,
          marginTop: 100,
        }}
      >
        {/* Excel Chaos */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              opacity: interpolate(icon1Frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `translateY(${interpolate(icon1Frame, [0, fps * 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px) rotate(${shake(icon1Frame)}deg)`,
            }}
          >
            <ExcelIcon />
          </div>
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.slate,
              marginTop: 24,
              opacity: label1Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Excel-Chaos
          </p>
          <p
            style={{
              fontSize: 18,
              color: COLORS.slateMuted,
              opacity: label1Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Verstreute Daten
          </p>
        </div>

        {/* Missed Leads */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              opacity: interpolate(icon2Frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `translateY(${interpolate(icon2Frame, [0, fps * 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px) rotate(${shake(icon2Frame)}deg)`,
            }}
          >
            <MissedCallIcon />
          </div>
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.slate,
              marginTop: 24,
              opacity: label2Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Verpasste Anfragen
          </p>
          <p
            style={{
              fontSize: 18,
              color: COLORS.slateMuted,
              opacity: label2Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Kunden gehen verloren
          </p>
        </div>

        {/* Standing Time */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              opacity: interpolate(icon3Frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
              transform: `translateY(${interpolate(icon3Frame, [0, fps * 0.5], [50, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px) rotate(${shake(icon3Frame)}deg)`,
            }}
          >
            <ClockIcon />
          </div>
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: COLORS.slate,
              marginTop: 24,
              opacity: label3Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Langsteher
          </p>
          <p
            style={{
              fontSize: 18,
              color: COLORS.slateMuted,
              opacity: label3Opacity,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Kapital gebunden
          </p>
        </div>
      </div>

      {/* Bottom frustration text */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          opacity: interpolate(frame, [fps * 10, fps * 11], [0, 1], { extrapolateRight: 'clamp' }),
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: COLORS.red,
            fontWeight: 600,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Das kostet Sie Zeit, Geld und Nerven.
        </p>
      </div>
    </AbsoluteFill>
  );
};
