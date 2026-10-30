<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { Application, type ColorSource } from 'pixi.js';
	import { setParent } from '#lib/pixi/context.ts';
	import type { Size } from '#lib/packing.ts';

	let {
		background = 0x000000,
		onready,
		onresize,
		children
	}: {
		background?: ColorSource;
		onready?: (app: Application) => void;
		/** Called when the canvas follows its container to a new size (in CSS px). */
		onresize?: (size: Size) => void;
		children?: Snippet;
	} = $props();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let ready = $state(false);

	const app = new Application();
	setParent(app.stage);

	onMount(() => {
		let destroyed = false;
		app
			.init({
				canvas,
				resizeTo: host,
				background,
				antialias: true,
				resolution: window.devicePixelRatio,
				autoDensity: true
			})
			.then(() => {
				if (destroyed) return app.destroy();
				app.renderer.on('resize', (width, height) => onresize?.({ width, height }));
				ready = true;
				onready?.(app);
			});

		return () => {
			destroyed = true;
			if (ready) app.destroy({ removeView: false });
		};
	});
</script>

<div class="pixi" bind:this={host}>
	<canvas bind:this={canvas}></canvas>
</div>

{#if ready}
	{@render children?.()}
{/if}

<style>
	.pixi {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	canvas {
		display: block;
	}
</style>
