import React from 'react';
import {Composition, Still} from 'remotion';
import {video} from './config';
import {totalFrames} from './lib';
import {Video} from './Video';
import {Cover} from './Cover';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id={video.id} component={Video} durationInFrames={totalFrames} fps={video.fps} width={video.width} height={video.height} />
		<Still id="Cover" component={Cover} width={video.width} height={video.height} />
	</>
);
