import { Composition } from 'remotion';
import { DealerOSExplainer, VIDEO_CONFIG } from './DealerOSExplainer';

// This is the entry point for Remotion
// Run with: npx remotion studio src/video/index.tsx

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Explainer Video - 90 seconds at 30fps */}
      <Composition
        id="DealerOSExplainer"
        component={DealerOSExplainer}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
      
      {/* Short version for social media - 30 seconds */}
      <Composition
        id="DealerOSShort"
        component={DealerOSExplainer}
        durationInFrames={30 * 30}
        fps={30}
        width={1080}
        height={1080}
      />
      
      {/* Vertical version for mobile/stories - 60 seconds */}
      <Composition
        id="DealerOSVertical"
        component={DealerOSExplainer}
        durationInFrames={60 * 30}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
