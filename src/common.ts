import path from 'path';

const basicPath = path.resolve();

export const Paths = {
	dirname: basicPath + "/src",
	public: basicPath + "/src/public",
	views: basicPath + "/src/views",
	livekit: basicPath + "/node_modules/livekit-client",
} 