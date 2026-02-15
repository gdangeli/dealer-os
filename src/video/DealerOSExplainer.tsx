import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { ProblemScene } from './scenes/ProblemScene';
import { SolutionScene } from './scenes/SolutionScene';
import { FeaturesScene } from './scenes/FeaturesScene';
import { SocialProofScene } from './scenes/SocialProofScene';
import { CTAScene } from './scenes/CTAScene';

// Video timing configuration (in frames at 30fps)
export const VIDEO_CONFIG = {
  fps: 30,
  durationInFrames: 90 * 30, // 90 seconds
  width: 1920,
  height: 1080,
  scenes: {
    problem: { start: 0, duration: 15 * 30 },      // 0-15s
    solution: { start: 15 * 30, duration: 15 * 30 }, // 15-30s
    features: { start: 30 * 30, duration: 30 * 30 }, // 30-60s
    socialProof: { start: 60 * 30, duration: 15 * 30 }, // 60-75s
    cta: { start: 75 * 30, duration: 15 * 30 },     // 75-90s
  },
};

// Dealer OS Brand Colors
export const COLORS = {
  skyLight: '#E0F2FE',
  sky: '#0EA5E9',
  skyDark: '#0284C7',
  slate: '#1E293B',
  slateMuted: '#64748B',
  white: '#FFFFFF',
  red: '#DC2626',
  redLight: '#FEE2E2',
  emerald: '#10B981',
  emeraldLight: '#D1FAE5',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
};

export const DealerOSExplainer: React.FC = () => {
  const { scenes } = VIDEO_CONFIG;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.white }}>
      {/* Scene 1: Problem (0-15s) */}
      <Sequence from={scenes.problem.start} durationInFrames={scenes.problem.duration}>
        <ProblemScene />
      </Sequence>

      {/* Scene 2: Solution (15-30s) */}
      <Sequence from={scenes.solution.start} durationInFrames={scenes.solution.duration}>
        <SolutionScene />
      </Sequence>

      {/* Scene 3: Features (30-60s) */}
      <Sequence from={scenes.features.start} durationInFrames={scenes.features.duration}>
        <FeaturesScene />
      </Sequence>

      {/* Scene 4: Social Proof (60-75s) */}
      <Sequence from={scenes.socialProof.start} durationInFrames={scenes.socialProof.duration}>
        <SocialProofScene />
      </Sequence>

      {/* Scene 5: CTA (75-90s) */}
      <Sequence from={scenes.cta.start} durationInFrames={scenes.cta.duration}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
