import { GlitchFilter, PixelateFilter } from 'pixi-filters';
import type { Application, Container } from 'pixi.js';

export interface GlitchOptions {
	/** How many ticker frames the effect lasts. */
	frames?: number;
	/** Re-seed the glitch every frame so the slices jump around. */
	animate?: boolean;
}

const running = new WeakMap<Container, Promise<void>>();
// Filters are reused across glitches: destroying them right after removal trips Pixi's
// "destroyed while still bound to a shader" warning, and they're cheap to keep around.
const filters = new WeakMap<Container, { glitch: GlitchFilter; pixelate: PixelateFilter }>();

function filtersFor(target: Container) {
	let pair = filters.get(target);
	if (!pair) {
		pair = {
			glitch: new GlitchFilter({ offset: 15, average: true, green: [4, 4] }),
			pixelate: new PixelateFilter(10)
		};
		filters.set(target, pair);
	}
	return pair;
}

/**
 * The original pick transition: glitch + pixelate over `target` for a few frames.
 * Calling it again while it runs returns the same promise instead of stacking a second effect.
 */
export function glitch(
	app: Application,
	target: Container,
	{ frames = 20, animate = true }: GlitchOptions = {}
): Promise<void> {
	const current = running.get(target);
	if (current) return current;

	const { glitch: glitchFilter, pixelate } = filtersFor(target);
	const previous = [...(target.filters ?? [])];
	glitchFilter.seed = 0.5;
	target.filters = [glitchFilter, pixelate];

	const done = new Promise<void>((resolve) => {
		let frame = 0;
		const tick = () => {
			frame += 1;
			if (animate) glitchFilter.seed = frame;
			if (frame < frames) return;

			app.ticker.remove(tick);
			target.filters = previous;
			running.delete(target);
			resolve();
		};
		app.ticker.add(tick);
	});

	running.set(target, done);
	return done;
}
