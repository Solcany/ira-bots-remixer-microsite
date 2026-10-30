import { describe, expect, it } from 'vitest';
import { range, sample } from './sample.ts';

describe('sample', () => {
	it('picks n distinct items from the input', () => {
		const items = range(384);
		const picked = sample(items, 300);
		expect(picked).toHaveLength(300);
		expect(new Set(picked).size).toBe(300);
		for (const item of picked) expect(items).toContain(item);
	});

	it('can pick every index, including the last one', () => {
		const seen = new Set<number>();
		for (let i = 0; i < 200; i++) sample(range(10), 3).forEach((n) => seen.add(n));
		expect(seen).toEqual(new Set(range(10)));
	});

	it('caps at the input length and leaves the input untouched', () => {
		const items = [1, 2, 3];
		expect(sample(items, 10)).toHaveLength(3);
		expect(items).toEqual([1, 2, 3]);
	});
});
