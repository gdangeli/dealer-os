import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from 'remotion';
import { COLORS } from '../DealerOSExplainer';

// Dashboard Mockup Component
const DashboardMockup = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated counter function
  const animateNumber = (target: number, startFrame: number, duration: number) => {
    const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return Math.round(target * progress);
  };

  const vehicles = animateNumber(32, fps * 0.5, fps * 1);
  const avgDays = animateNumber(38, fps * 0.7, fps * 1);
  const leads = animateNumber(8, fps * 0.9, fps * 1);
  const margin = animateNumber(2840, fps * 1.1, fps * 1);

  return (
    <div
      style={{
        width: 800,
        backgroundColor: '#F8FAFC',
        borderRadius: 24,
        padding: 32,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: COLORS.sky,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>D</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 600, color: COLORS.slate }}>Dashboard</span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Fahrzeuge" value={vehicles.toString()} color={COLORS.sky} />
        <StatCard label="Ø Standzeit" value={`${avgDays} Tage`} color={COLORS.amber} />
        <StatCard label="Offene Leads" value={leads.toString()} color={COLORS.emerald} />
        <StatCard label="Ø Marge" value={`CHF ${margin.toLocaleString('de-CH')}`} color={COLORS.sky} />
      </div>

      {/* Mini Chart */}
      <div
        style={{
          marginTop: 24,
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #E2E8F0',
        }}
      >
        <span style={{ fontSize: 14, color: COLORS.slateMuted, fontWeight: 500 }}>Verkäufe letzte 7 Tage</span>
        <div style={{ display: 'flex', alignItems: 'end', gap: 8, marginTop: 12, height: 60 }}>
          {[40, 65, 45, 80, 55, 90, 70].map((height, i) => {
            const barProgress = interpolate(frame, [fps * (1.5 + i * 0.1), fps * (2 + i * 0.1)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: height * barProgress,
                  backgroundColor: i === 5 ? COLORS.sky : '#CBD5E1',
                  borderRadius: 4,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div
    style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      border: '1px solid #E2E8F0',
    }}
  >
    <span style={{ fontSize: 12, color: COLORS.slateMuted }}>{label}</span>
    <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.slate, marginTop: 4 }}>{value}</div>
    <div style={{ width: 40, height: 4, backgroundColor: color, borderRadius: 2, marginTop: 8 }} />
  </div>
);

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delay, delay + fps * 0.5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  const y = interpolate(frame, [delay, delay + fps * 0.5], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${Math.min(scale, 1)}) translateY(${y}px)`,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        width: 320,
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E2E8F0',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: COLORS.skyLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.slate,
          marginBottom: 8,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 16,
          color: COLORS.slateMuted,
          lineHeight: 1.5,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {description}
      </p>
    </div>
  );
};

// Icons
const CarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.sky} strokeWidth="2">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const UsersIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.sky} strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.sky} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene phases
  const showDashboard = frame < fps * 12;
  const dashboardOpacity = interpolate(frame, [fps * 10, fps * 12], [1, 0], { extrapolateRight: 'clamp' });
  const featuresOpacity = interpolate(frame, [fps * 12, fps * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Title
  const titleOpacity = interpolate(frame, [0, fps * 1], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.skyLight,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Title */}
      <h2
        style={{
          position: 'absolute',
          top: 80,
          fontSize: 48,
          fontWeight: 700,
          color: COLORS.slate,
          opacity: titleOpacity,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Alles was Sie brauchen
      </h2>

      {/* Dashboard Phase */}
      {showDashboard && (
        <div style={{ opacity: dashboardOpacity, transform: 'translateY(40px)' }}>
          <DashboardMockup />
        </div>
      )}

      {/* Features Phase */}
      {!showDashboard && (
        <div
          style={{
            display: 'flex',
            gap: 40,
            opacity: featuresOpacity,
            marginTop: 60,
          }}
        >
          <FeatureCard
            icon={<CarIcon />}
            title="Fahrzeugverwaltung"
            description="Alle Fahrzeuge zentral erfassen, mit Fotos, Dokumenten und Historie."
            delay={fps * 14}
          />
          <FeatureCard
            icon={<UsersIcon />}
            title="Lead-Management"
            description="Anfragen automatisch erfassen, nachverfolgen und konvertieren."
            delay={fps * 16}
          />
          <FeatureCard
            icon={<ClockIcon />}
            title="Standzeit-Tracking"
            description="Langsteher sofort erkennen und rechtzeitig handeln."
            delay={fps * 18}
          />
        </div>
      )}

      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at 20% 80%, ${COLORS.sky}10 0%, transparent 40%),
                       radial-gradient(circle at 80% 20%, ${COLORS.emerald}10 0%, transparent 40%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
