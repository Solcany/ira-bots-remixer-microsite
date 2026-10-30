export interface Circle {
	x: number;
	y: number;
	r: number;
}

export interface Size {
	width: number;
	height: number;
}

export type Random = () => number;

/**
 * Randomly scatters up to `count` circles of radius `r` inside `size` so that none overlap each
 * other, the canvas edge, or any of the `exclusions`. A circle that finds no free spot within
 * `attempts` tries is skipped, so fewer than `count` may come back. Exclusions are never returned.
 */
export function packCircles(
	size: Size,
	exclusions: Circle[],
	count: number,
	r: number,
	attempts: number,
	random: Random = Math.random
): Circle[] {
	const slots = repackCircles(size, exclusions, Array(count).fill(null), r, attempts, random);
	return slots.filter((c): c is Circle => c !== null);
}

/**
 * Packs one circle per slot, starting from a previous arrangement: a circle from `previous` that
 * still fits inside `size` keeps its position, and every other slot (moved out of bounds, or
 * never placed) gets a random free spot. Slots with no room stay `null`.
 */
export function repackCircles(
	size: Size,
	exclusions: Circle[],
	previous: (Circle | null)[],
	r: number,
	attempts: number,
	random: Random = Math.random
): (Circle | null)[] {
	const occupied = [...exclusions];
	const slots = previous.map((circle) => {
		if (!circle || collides(circle, occupied, size)) return null;
		occupied.push(circle);
		return circle;
	});

	return slots.map((kept) => {
		if (kept) return kept;
		for (let tries = 0; tries < attempts; tries++) {
			const circle = {
				x: Math.floor(random() * size.width),
				y: Math.floor(random() * size.height),
				r
			};
			if (!collides(circle, occupied, size)) {
				occupied.push(circle);
				return circle;
			}
		}
		return null;
	});
}

function collides(circle: Circle, others: Circle[], size: Size): boolean {
	if (circle.x - circle.r <= 0 || circle.x + circle.r >= size.width) return true;
	if (circle.y - circle.r <= 0 || circle.y + circle.r >= size.height) return true;
	return others.some((o) => Math.hypot(circle.x - o.x, circle.y - o.y) <= circle.r + o.r);
}
