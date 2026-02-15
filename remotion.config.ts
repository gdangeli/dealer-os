import { Config } from '@remotion/cli/config';

// Remotion configuration
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Output settings
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');

// Performance
Config.setConcurrency(4);

export default Config;
