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
		visible = true,
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
		visible?: boolean;
		hovered?: boolean;
		/** Clip the sprite to a circle of diameter `size`. */
		circleMask?: boolean;
		onpointerover?: () => void;
		onpointerout?: () => void;
		onpointertap?: () => void;
	} = $props();

	const parent = getParent();
	const sprite = new Sprite({ anchor: 0.5 });
	/** Created only for sprites that use `circleMask`. */
	let mask: Graphics | null = null;
	parent.addChild(sprite);
	onDestroy(() => {
		if (!sprite.destroyed) sprite.destroy();
		if (mask && !mask.destroyed) mask.destroy();
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
	});
	$effect(() => {
		sprite.visible = visible;
	});
	$effect(() => {
		const width = hovered ? hoverSize : size;
		sprite.setSize(width, (width * texture.height) / texture.width);
	});
	$effect(() => {
		if (!circleMask) {
			sprite.mask = null;
			if (mask) mask.visible = false;
			return;
		}
		mask ??= parent.addChild(new Graphics());
		mask
			.clear()
			.circle(0, 0, size / 2)
			.fill(0xffffff);
		mask.position.set(x, y);
		mask.visible = true;
		sprite.mask = mask;
	});
</script>
