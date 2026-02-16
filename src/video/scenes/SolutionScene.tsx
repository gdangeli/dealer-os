import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../DealerOSExplainer';

// Dealer OS Logo Component
const DealerOSLogo = ({ size = 200 }: { size?: number }) => (
  <svg viewBox="0 0 320 60" width={size} height={size * 0.1875}>
    {/* Logo Mark - Stylized D */}
    <rect x="0" y="5" width="50" height="50" rx="10" fill={COLORS.sky} />
    <path d="M12 15 L12 45 L30 45 Q42 45 42 30 Q42 15 30 15 Z" fill="white" />
    <circle cx="28" cy="30" r="6" fill={COLORS.sky} />
    
    {/* Logo Text - "Dealer" + " OS" with clear spacing */}
    <text x="62" y="43" fill={COLORS.slate} fontSize="36" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">
      Dealer
    </text>
    <text x="200" y="43" fill={COLORS.sky} fontSize="36" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">
      OS
    </text>
  </svg>
);

// Checkmark animation
const AnimatedCheck = ({ delay, size = 60 }: { delay: number; size?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const checkFrame = frame - delay;
  const scale = spring({ frame: checkFrame, fps, config: { damping: 10, stiffness: 100 } });
  const pathLength = interpolate(checkFrame, [fps * 0.3, fps * 0.8], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });

  if (checkFrame < 0) return null;

  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `scale(${scale})` }}>
      <circle cx="30" cy="30" r="28" fill={COLORS.emerald} />
      <path
        d="M18 30 L26 38 L42 22"
        stroke="white"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={50}
        strokeDashoffset={50 * (1 - pathLength)}
      />
    </svg>
  );
};

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background transition from red to blue
  const bgProgress = interpolate(frame, [0, fps * 2], [0, 1], { extrapolateRight: 'clamp' });
  
  // Logo animation
  const logoOpacity = interpolate(frame, [fps * 1, fps * 2], [0, 1], { extrapolateRight: 'clamp' });
  const logoScale = spring({ frame: frame - fps * 1, fps, config: { damping: 12 } });
  const logoY = interpolate(frame, [fps * 1, fps * 2], [-50, 0], { extrapolateRight: 'clamp' });

  // Tagline animation
  const taglineOpacity = interpolate(frame, [fps * 3, fps * 4], [0, 1], { extrapolateRight: 'clamp' });

  // Benefits list
  const benefits = [
    'Alle Daten an einem Ort',
    'Kein Lead geht verloren',
    'Standzeiten im Griff',
  ];

  // Particle/sparkle effect
  const sparkles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = interpolate(frame, [fps * 2, fps * 4], [0, 400], { extrapolateRight: 'clamp' });
    const opacity = interpolate(frame, [fps * 2, fps * 3, fps * 4], [0, 1, 0], { extrapolateRight: 'clamp' });
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    return { x, y, opacity, delay: i * 0.1 };
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, 
          rgba(254, 226, 226, ${1 - bgProgress}) 0%, 
          ${COLORS.skyLight} ${bgProgress * 100}%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Sparkle particles */}
      {sparkles.map((sparkle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: COLORS.sky,
            opacity: sparkle.opacity,
            transform: `translate(${sparkle.x}px, ${sparkle.y}px)`,
          }}
        />
      ))}

      {/* Main Content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale}) translateY(${logoY}px)`,
            marginBottom: 40,
          }}
        >
          <DealerOSLogo size={400} />
        </div>

        {/* Tagline */}
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: COLORS.slate,
            opacity: taglineOpacity,
            marginBottom: 60,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Bringt Ordnung in Ihre Garage
        </h2>

        {/* Benefits with checkmarks */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            alignItems: 'flex-start',
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 'fit-content',
          }}
        >
          {benefits.map((benefit, i) => {
            const benefitOpacity = interpolate(
              frame,
              [fps * (5 + i), fps * (5.5 + i)],
              [0, 1],
              { extrapolateRight: 'clamp' }
            );
            const benefitX = interpolate(
              frame,
              [fps * (5 + i), fps * (5.5 + i)],
              [-30, 0],
              { extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={benefit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  opacity: benefitOpacity,
                  transform: `translateX(${benefitX}px)`,
                }}
              >
                <AnimatedCheck delay={fps * (5 + i)} size={48} />
                <span
                  style={{
                    fontSize: 32,
                    color: COLORS.slate,
                    fontWeight: 500,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  {benefit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle glow behind logo */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.sky}20 0%, transparent 70%)`,
          opacity: logoOpacity,
          zIndex: 0,
        }}
      />
    </AbsoluteFill>
  );
};
