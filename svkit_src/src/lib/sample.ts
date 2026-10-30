import type { Random } from './packing.ts';

/** Returns `n` distinct items picked at random (partial Fisher–Yates). */
export function sample<T>(items: readonly T[], n: number, random: Random = Math.random): T[] {
	const pool = [...items];
	const count = Math.min(n, pool.length);
	for (let i = 0; i < count; i++) {
		const j = i + Math.floor(random() * (pool.length - i));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, count);
}

export function range(n: number): number[] {
	return Array.from({ length: n }, (_, i) => i);
}
