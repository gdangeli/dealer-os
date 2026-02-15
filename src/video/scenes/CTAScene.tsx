import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../DealerOSExplainer';

// Animated button component
const CTAButton = ({ delay }: { delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delay, delay + fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 100 } });
  
  // Pulsing glow effect
  const pulseFrame = frame - delay - fps;
  const glowOpacity = pulseFrame > 0 
    ? 0.3 + Math.sin(pulseFrame * 0.1) * 0.2 
    : 0;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
        position: 'relative',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          inset: -20,
          background: COLORS.sky,
          borderRadius: 30,
          filter: 'blur(30px)',
          opacity: glowOpacity,
        }}
      />
      
      {/* Button */}
      <div
        style={{
          position: 'relative',
          background: `linear-gradient(135deg, ${COLORS.sky} 0%, ${COLORS.skyDark} 100%)`,
          color: 'white',
          padding: '28px 64px',
          borderRadius: 20,
          fontSize: 32,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 20px 40px rgba(14, 165, 233, 0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        14 Tage gratis testen
        <span style={{ fontSize: 28 }}>→</span>
      </div>
    </div>
  );
};

// Dealer OS Logo
const Logo = () => (
  <svg viewBox="0 0 200 60" width={300} height={90}>
    <rect x="0" y="5" width="50" height="50" rx="10" fill={COLORS.sky} />
    <path d="M12 15 L12 45 L30 45 Q42 45 42 30 Q42 15 30 15 Z" fill="white" />
    <circle cx="28" cy="30" r="6" fill={COLORS.sky} />
    <text x="60" y="42" fill={COLORS.slate} fontSize="36" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
      Dealer
    </text>
    <text x="155" y="42" fill={COLORS.sky} fontSize="36" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
      OS
    </text>
  </svg>
);

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const logoOpacity = interpolate(frame, [0, fps * 1], [0, 1], { extrapolateRight: 'clamp' });
  const logoScale = spring({ frame, fps, config: { damping: 12 } });

  const headlineOpacity = interpolate(frame, [fps * 1, fps * 2], [0, 1], { extrapolateRight: 'clamp' });
  const headlineY = interpolate(frame, [fps * 1, fps * 2], [30, 0], { extrapolateRight: 'clamp' });

  const sublineOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], { extrapolateRight: 'clamp' });

  const urlOpacity = interpolate(frame, [fps * 6, fps * 7], [0, 1], { extrapolateRight: 'clamp' });

  // Background particles
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const baseY = (i / 20) * 1080;
    const x = ((i * 137) % 1920);
    const floatY = Math.sin((frame / fps + i) * 0.3) * 20;
    const size = 4 + (i % 3) * 2;
    const opacity = 0.1 + (i % 5) * 0.05;
    return { x, y: baseY + floatY, size, opacity };
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.skyLight} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: COLORS.sky,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Content */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        {/* Logo */}
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            marginBottom: 48,
          }}
        >
          <Logo />
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.slate,
            marginBottom: 24,
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Bereit für mehr Übersicht?
        </h2>

        {/* Subline */}
        <p
          style={{
            fontSize: 28,
            color: COLORS.slateMuted,
            marginBottom: 16,
            opacity: sublineOpacity,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Starten Sie noch heute – kostenlos und unverbindlich.
        </p>

        {/* No credit card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 48,
            opacity: sublineOpacity,
          }}
        >
          <span style={{ fontSize: 20, color: COLORS.emerald }}>✓</span>
          <span
            style={{
              fontSize: 18,
              color: COLORS.slateMuted,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Keine Kreditkarte nötig
          </span>
        </div>

        {/* CTA Button */}
        <CTAButton delay={fps * 4} />

        {/* URL */}
        <div
          style={{
            marginTop: 60,
            opacity: urlOpacity,
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: COLORS.slate,
              fontWeight: 500,
              letterSpacing: 2,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            www.dealeros.ch
          </span>
        </div>
      </div>

      {/* Corner decoration */}
      <div
        style={{
          position: 'absolute',
          bottom: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.sky}20 0%, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.emerald}10 0%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
