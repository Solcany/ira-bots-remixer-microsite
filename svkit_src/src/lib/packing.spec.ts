import { describe, expect, it } from 'vitest';
import { packCircles, repackCircles, type Circle } from './packing.ts';

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

describe('repackCircles', () => {
	const zone = { x: 400, y: 300, r: 150 };
	const before = packCircles(size, [zone], 120, 30, 200, seeded(3));

	it('keeps every circle that still fits when the area grows', () => {
		const bigger = { width: 1000, height: 700 };
		// shift by the centre offset, as the stage does: positions are kept relative to the centre
		const shift = (c: Circle) => ({ ...c, x: c.x + 100, y: c.y + 50 });
		const after = repackCircles(bigger, [shift(zone)], before.map(shift), 30, 200, seeded(4));
		expect(after.slice(0, before.length)).toEqual(before.map(shift));
	});

	it('only moves the circles that no longer fit when the area shrinks', () => {
		const smaller = { width: 600, height: 400 };
		const shift = (c: Circle) => ({ ...c, x: c.x - 100, y: c.y - 100 });
		const previous = before.map(shift);
		const after = repackCircles(smaller, [shift(zone)], previous, 30, 200, seeded(5));
		const inside = (c: Circle) =>
			c.x - c.r > 0 && c.y - c.r > 0 && c.x + c.r < smaller.width && c.y + c.r < smaller.height;

		previous.forEach((c, i) => {
			if (inside(c)) expect(after[i]).toEqual(c);
		});
		const placed = after.filter((c): c is Circle => c !== null);
		for (const c of placed) expect(inside(c)).toBe(true);
		placed.forEach((a, i) =>
			placed.slice(i + 1).forEach((b) => expect(overlaps(a, b)).toBe(false))
		);
	});

	it('returns one slot per input, placing previously hidden ones when there is room', () => {
		const after = repackCircles(size, [], [null, null, null], 30, 200, seeded(6));
		expect(after).toHaveLength(3);
		expect(after.every((c) => c !== null)).toBe(true);
	});
});
