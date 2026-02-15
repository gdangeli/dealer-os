import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS } from '../DealerOSExplainer';

// Counter animation hook
const useAnimatedCounter = (target: number, startFrame: number, duration: number) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return Math.round(target * progress);
};

// Trust badge component
const TrustBadge = ({ icon, text, delay }: { icon: string; text: string; delay: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({ frame: frame - delay, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.min(scale, 1)})`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #E2E8F0',
      }}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: COLORS.slate,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const SocialProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated counter
  const garageCount = useAnimatedCounter(50, fps * 1, fps * 2);

  // Testimonial animation
  const testimonialOpacity = interpolate(frame, [fps * 4, fps * 5], [0, 1], { extrapolateRight: 'clamp' });
  const testimonialY = interpolate(frame, [fps * 4, fps * 5], [30, 0], { extrapolateRight: 'clamp' });

  // Headline animation
  const headlineOpacity = interpolate(frame, [0, fps * 1], [0, 1], { extrapolateRight: 'clamp' });
  const headlineScale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.white} 0%, ${COLORS.skyLight} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Main Counter */}
      <div
        style={{
          textAlign: 'center',
          opacity: headlineOpacity,
          transform: `scale(${headlineScale})`,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: COLORS.sky,
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {garageCount}+
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: COLORS.slate,
            marginTop: 16,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Schweizer Garagen vertrauen uns
        </div>
      </div>

      {/* Testimonial Quote */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          opacity: testimonialOpacity,
          transform: `translateY(${testimonialY}px)`,
          maxWidth: 800,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '40px 48px',
            borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Quote mark */}
          <div
            style={{
              fontSize: 80,
              color: COLORS.skyLight,
              lineHeight: 0.5,
              marginBottom: 16,
              fontFamily: 'Georgia, serif',
            }}
          >
            "
          </div>
          <p
            style={{
              fontSize: 24,
              color: COLORS.slate,
              lineHeight: 1.6,
              fontStyle: 'italic',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Seit wir Dealer OS nutzen, haben wir die Standzeiten um 30% reduziert. Kein Zettelchaos mehr, alles digital.
          </p>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.sky} 0%, ${COLORS.skyDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              MK
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: COLORS.slate, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Marco Keller
              </div>
              <div style={{ fontSize: 14, color: COLORS.slateMuted, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Geschäftsführer, Auto Keller AG
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          display: 'flex',
          gap: 24,
        }}
      >
        <TrustBadge icon="🇨🇭" text="Swiss Made" delay={fps * 8} />
        <TrustBadge icon="🔒" text="DSGVO konform" delay={fps * 9} />
        <TrustBadge icon="⚡" text="Cloud-basiert" delay={fps * 10} />
        <TrustBadge icon="💬" text="Schweizer Support" delay={fps * 11} />
      </div>

      {/* Floating logos placeholder (simplified) */}
      <div
        style={{
          position: 'absolute',
          top: 100,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
          opacity: 0.3,
        }}
      >
        {['🚗', '🚙', '🏎️', '🚕', '🚐'].map((emoji, i) => (
          <span
            key={i}
            style={{
              fontSize: 40,
              transform: `translateY(${Math.sin((frame / fps + i) * 0.5) * 10}px)`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
