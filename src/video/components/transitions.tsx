import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ReactNode } from 'react';

interface TransitionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

// Fade in from transparent
export const FadeIn: React.FC<TransitionProps> = ({ children, delay = 0, duration = 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const opacity = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return <div style={{ opacity }}>{children}</div>;
};

// Scale in with spring physics
export const ScaleIn: React.FC<TransitionProps> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const scale = spring({
    frame: frame - delay * fps,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(
    frame,
    [delay * fps, (delay + 0.3) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

// Slide in from direction
export const SlideIn: React.FC<TransitionProps & { from?: 'left' | 'right' | 'top' | 'bottom' }> = ({
  children,
  delay = 0,
  duration = 0.5,
  from = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const offset = 50 * (1 - progress);
  
  const transforms = {
    left: `translateX(${-offset}px)`,
    right: `translateX(${offset}px)`,
    top: `translateY(${-offset}px)`,
    bottom: `translateY(${offset}px)`,
  };

  return (
    <div style={{ transform: transforms[from], opacity: progress }}>
      {children}
    </div>
  );
};

// Blur in effect
export const BlurIn: React.FC<TransitionProps> = ({ children, delay = 0, duration = 0.5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const blur = 20 * (1 - progress);

  return (
    <div style={{ filter: `blur(${blur}px)`, opacity: progress }}>
      {children}
    </div>
  );
};

// Typewriter effect for text
export const Typewriter: React.FC<{ text: string; delay?: number; speed?: number }> = ({
  text,
  delay = 0,
  speed = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsToShow = Math.floor(
    interpolate(
      frame,
      [delay * fps, delay * fps + (text.length / speed) * fps],
      [0, text.length],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  );

  return <span>{text.slice(0, charsToShow)}</span>;
};

// Counter animation
export const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}> = ({ from = 0, to, delay = 0, duration = 1, suffix = '', prefix = '' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const value = interpolate(
    frame,
    [delay * fps, (delay + duration) * fps],
    [from, to],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <span>
      {prefix}
      {Math.round(value).toLocaleString('de-CH')}
      {suffix}
    </span>
  );
};
