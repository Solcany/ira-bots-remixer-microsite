<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Graphics, Sprite, type Texture } from 'pixi.js';
	import { getParent } from '#lib/pixi/context.ts';

	let {
		texture,
		x,
		y,
		size,
		hoverSize = size,
		hovered = false,
		circleMask = false,
		onpointerover,
		onpointerout,
		onpointertap
	}: {
		texture: Texture;
		x: number;
		y: number;
		/** Width in px; height follows the texture's aspect ratio. */
		size: number;
		hoverSize?: number;
		hovered?: boolean;
		/** Clip the sprite to a circle of diameter `size`. */
		circleMask?: boolean;
		onpointerover?: () => void;
		onpointerout?: () => void;
		onpointertap?: () => void;
	} = $props();

	const parent = getParent();
	const sprite = new Sprite({ anchor: 0.5 });
	const mask = new Graphics();
	parent.addChild(sprite, mask);
	onDestroy(() => {
		if (!sprite.destroyed) sprite.destroy();
		if (!mask.destroyed) mask.destroy();
	});

	sprite.on('pointerover', () => onpointerover?.());
	sprite.on('pointerout', () => onpointerout?.());
	sprite.on('pointertap', () => onpointertap?.());

	$effect(() => {
		const clickable = onpointerover || onpointerout || onpointertap;
		sprite.eventMode = clickable ? 'static' : 'none';
		sprite.cursor = clickable ? 'pointer' : 'auto';
	});
	$effect(() => {
		sprite.texture = texture;
	});
	$effect(() => {
		sprite.position.set(x, y);
		mask.position.set(x, y);
	});
	$effect(() => {
		const width = hovered ? hoverSize : size;
		sprite.setSize(width, (width * texture.height) / texture.width);
	});
	$effect(() => {
		mask.clear();
		if (circleMask) mask.circle(0, 0, size / 2).fill(0xffffff);
		sprite.mask = circleMask ? mask : null;
		mask.visible = circleMask;
	});
</script>
