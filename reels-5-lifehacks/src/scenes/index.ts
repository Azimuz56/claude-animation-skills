import React from 'react';
import {SceneProps} from './types';
import {Hook} from './Hook';
import {Omelet} from './Omelet';
import {Bread} from './Bread';
import {Closet} from './Closet';
import {Shirt} from './Shirt';
import {Sneaker} from './Sneaker';
import {Cta} from './Cta';

/** Реестр сцен: имя в config.ts → компонент. Новая сцена = новый файл + строка здесь. */
export const sceneRegistry: Record<string, React.FC<SceneProps>> = {Hook, Omelet, Bread, Closet, Shirt, Sneaker, Cta};
