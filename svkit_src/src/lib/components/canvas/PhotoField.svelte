<script module lang="ts">
	import type { Texture } from 'pixi.js';

	export interface Photo {
		id: string;
		texture: Texture;
		x: number;
		y: number;
		/** False when there was no room for the item in the current window. */
		placed: boolean;
	}
</script>

<script lang="ts">
	import Layer from '#lib/components/pixi/Layer.svelte';
	import Sprite from '#lib/components/pixi/Sprite.svelte';

	let {
		photos,
		size,
		hoverSize,
		visible,
		interactive,
		hovered,
		onhover,
		onpick
	}: {
		photos: Photo[];
		size: number;
		hoverSize: number;
		visible: boolean;
		interactive: boolean;
		hovered: string | null;
		onhover: (id: string | null) => void;
		onpick: (id: string) => void;
	} = $props();
</script>

<Layer {visible} {interactive}>
	{#each photos as photo (photo.id)}
		<Sprite
			texture={photo.texture}
			x={photo.x}
			y={photo.y}
			{size}
			{hoverSize}
			visible={photo.placed}
			hovered={photo.id === hovered}
			onpointerover={() => onhover(photo.id)}
			onpointerout={() => hovered === photo.id && onhover(null)}
			onpointertap={() => onpick(photo.id)}
		/>
	{/each}
</Layer>
