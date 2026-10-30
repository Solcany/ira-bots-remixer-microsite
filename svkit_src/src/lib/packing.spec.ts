import { describe, expect, it } from 'vitest';
import { packCircles, type Circle } from './packing.ts';

/** Small deterministic PRNG (mulberry32) so failures are reproducible. */
function seeded(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const size = { width: 800, height: 600 };
const overlaps = (a: Circle, b: Circle) => Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r;

describe('packCircles', () => {
	const exclusions = [
		{ x: 400, y: 300, r: 150 },
		{ x: 400, y: 450, r: 150 }
	];
	const packed = packCircles(size, exclusions, 100, 40, 200, seeded(1));

	it('never returns the exclusion zones themselves', () => {
		expect(packed).not.toContainEqual(exclusions[0]);
		expect(packed).not.toContainEqual(exclusions[1]);
	});

	it('keeps circles clear of every exclusion zone', () => {
		for (const c of packed) for (const zone of exclusions) expect(overlaps(c, zone)).toBe(false);
	});

	it('keeps circles apart and inside the canvas', () => {
		packed.forEach((a, i) => {
			expect(a.x - a.r).toBeGreaterThan(0);
			expect(a.y - a.r).toBeGreaterThan(0);
			expect(a.x + a.r).toBeLessThan(size.width);
			expect(a.y + a.r).toBeLessThan(size.height);
			for (const b of packed.slice(i + 1)) expect(overlaps(a, b)).toBe(false);
		});
	});

	it('returns at most `count` circles, fewer when space runs out', () => {
		expect(packed.length).toBeGreaterThan(0);
		expect(packed.length).toBeLessThanOrEqual(100);
		expect(packCircles({ width: 100, height: 100 }, [], 50, 40, 50, seeded(2)).length).toBeLessThan(
			2
		);
	});
});
