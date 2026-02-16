import { Config } from '@remotion/cli/config';

// Remotion configuration
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Output settings
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

// Performance (max 2 cores on this system)
Config.setConcurrency(2);

export default Config;
