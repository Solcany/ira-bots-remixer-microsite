import { describe, expect, it } from 'vitest';
import { Remixer } from './remixer.svelte.ts';

function deferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((r) => (resolve = r));
	return { promise, resolve };
}

describe('Remixer', () => {
	it('walks photo → name → bio and enables submit once all three are picked', async () => {
		const r = new Remixer();
		const now = () => Promise.resolve();

		await r.pick('img/avatar/1.png', now);
		expect(r.step).toBe('name');
		await r.pick('Вестник Москвы', now);
		expect(r.step).toBe('bio');
		expect(r.complete).toBe(false);
		await r.pick('a bio', now);

		expect(r.step).toBe('bio');
		expect(r.bot).toEqual({ avatar: 'img/avatar/1.png', name: 'Вестник Москвы', bio: 'a bio' });
		expect(r.complete).toBe(true);
		r.submit();
		expect(r.step).toBe('botnet');
	});

	it('ignores a second pick while the transition is playing (double click)', async () => {
		const r = new Remixer();
		r.go('name');
		const transition = deferred();
		let transitions = 0;

		const first = r.pick('first', () => (transitions++, transition.promise));
		const second = r.pick('second', () => (transitions++, Promise.resolve()));
		r.go('photo');
		transition.resolve();
		await Promise.all([first, second]);

		expect(transitions).toBe(1);
		expect(r.bot.name).toBe('first');
		expect(r.step).toBe('bio');
	});

	it('does not submit an incomplete bot', () => {
		const r = new Remixer();
		r.submit();
		expect(r.step).toBe('photo');
	});

	it('clears the hover preview when the step changes', () => {
		const r = new Remixer();
		r.hover('img/avatar/2.png');
		r.go('bio');
		expect(r.preview).toBeNull();
	});
});
