import type { TextStyleOptions } from 'pixi.js';
import type { AssetPath } from '$app/types';

/** Font used for all canvas text; loaded through @fontsource in the root layout. */
export const CANVAS_FONT = 'IBM Plex Mono';

/** Original fade was 0.1 alpha per frame, i.e. ~10 frames at 60 fps. */
export const FADE_MS = 170;

export const BACKGROUND = 0x000000;

export const AVATAR_FILES = 384; // static/img/avatar/0.png … 383.png
export const PLACEHOLDER_AVATAR = 'img/avatar/empty.png' satisfies AssetPath;

export const MAIN_AVATAR = { diameter: 300 };

// The ring count isn't fixed: enough rings are drawn to reach the canvas corners.
export const RINGS = {
	spacing: 0.25 * (MAIN_AVATAR.diameter / 2),
	width: 0.5,
	color: 0x4c4b4b
};

export const PHOTOS = {
	count: 300,
	diameter: 40,
	hoverDiameter: 50,
	packingDiameter: 55,
	attempts: 200
};

export const NAMES = {
	count: 100,
	packingDiameter: 80,
	attempts: 200,
	/** Reserved zone below the main avatar where the chosen name is shown. */
	reservedOffsetY: 150
};

export const BIOS = {
	count: 30,
	packingDiameter: 120,
	attempts: 200,
	reservedOffsetY: 200
};

/** Where the bot's name and bio sit, measured from the canvas centre to the top of the text. */
export const BOT_NAME_OFFSET_Y = 178;
export const BOT_BIO_OFFSET_Y = 238;

export const WORD_STYLE: TextStyleOptions = {
	fontFamily: CANVAS_FONT,
	fontSize: 12,
	align: 'center',
	fill: '#595959'
};

export const BIO_WORD_STYLE: TextStyleOptions = {
	...WORD_STYLE,
	wordWrap: true,
	wordWrapWidth: BIOS.packingDiameter - 10
};

export const WORD_HOVER = { style: { fill: '#ffffff' }, scale: 1.3 };

export const BOT_NAME_STYLE: TextStyleOptions = {
	fontFamily: CANVAS_FONT,
	fontSize: 34,
	align: 'center',
	fill: '#b2b2b2'
};

export const BOT_BIO_STYLE: TextStyleOptions = {
	fontFamily: CANVAS_FONT,
	fontSize: 18,
	align: 'center',
	fill: '#b2b2b2',
	wordWrap: true,
	wordWrapWidth: 350
};

export const SHADOW_COLOR = 0x595959;

export const DEFAULT_NAME = 'a nameless bot';
export const DEFAULT_BIO = 'a nondescript bot';
export const BOTNET_TEXT = 'work in progress';
