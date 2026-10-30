<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { Container } from 'pixi.js';
	import { getParent, setParent } from '#lib/pixi/context.ts';
	import { FADE_MS } from '#lib/stage/config.ts';

	let {
		x = 0,
		y = 0,
		visible = true,
		interactive = true,
		children
	}: {
		/** Position of the layer's origin; children are placed relative to it. */
		x?: number;
		y?: number;
		/** Fades the layer in or out; a fade can be reversed halfway through. */
		visible?: boolean;
		/** When false, nothing inside the layer reacts to the pointer. */
		interactive?: boolean;
		children?: Snippet;
	} = $props();

	const parent = getParent();
	const container = new Container();
	parent.addChild(container);
	setParent(container);
	onDestroy(() => {
		// children are Svelte components that destroy their own objects
		if (!container.destroyed) container.destroy();
	});

	const alpha = Tween.of(() => (visible ? 1 : 0), { duration: FADE_MS });

	$effect(() => {
		container.alpha = alpha.current;
		container.visible = alpha.current > 0;
	});
	$effect(() => {
		container.eventMode = interactive && visible ? 'passive' : 'none';
	});
	$effect(() => {
		container.position.set(x, y);
	});
</script>

{@render children?.()}
