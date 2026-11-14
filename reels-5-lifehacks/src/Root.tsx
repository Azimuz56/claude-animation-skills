import React from 'react';
import {Composition} from 'remotion';
import {video} from './config';
import {totalFrames} from './lib';
import {Video} from './Video';

export const RemotionRoot: React.FC = () => (
	<Composition id={video.id} component={Video} durationInFrames={totalFrames} fps={video.fps} width={video.width} height={video.height} />
);
