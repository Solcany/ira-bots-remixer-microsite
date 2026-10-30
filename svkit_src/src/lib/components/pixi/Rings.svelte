<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Graphics, type ColorSource } from 'pixi.js';
	import { getParent } from '#lib/pixi/context.ts';

	let {
		x,
		y,
		radius,
		count,
		spacing,
		width = 1,
		color = 0xffffff
	}: {
		x: number;
		y: number;
		/** Radius of the innermost ring. */
		radius: number;
		count: number;
		/** Distance between neighbouring rings. */
		spacing: number;
		width?: number;
		color?: ColorSource;
	} = $props();

	const parent = getParent();
	const rings = new Graphics();
	parent.addChild(rings);
	onDestroy(() => {
		if (!rings.destroyed) rings.destroy();
	});

	$effect(() => {
		rings.clear();
		for (let i = 0; i < count; i++) {
			rings.circle(x, y, radius + spacing * i).stroke({ width, color });
		}
	});
</script>
