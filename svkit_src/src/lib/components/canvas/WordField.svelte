<script module lang="ts">
	export interface Word {
		text: string;
		x: number;
		y: number;
	}
</script>

<script lang="ts">
	import type { TextStyleOptions } from 'pixi.js';
	import Layer from '#lib/components/pixi/Layer.svelte';
	import Label from '#lib/components/pixi/Label.svelte';

	let {
		words,
		style,
		hoverStyle,
		hoverScale,
		visible,
		interactive,
		hovered,
		onhover,
		onpick
	}: {
		words: Word[];
		style: TextStyleOptions;
		hoverStyle: TextStyleOptions;
		hoverScale: number;
		visible: boolean;
		interactive: boolean;
		hovered: string | null;
		onhover: (text: string | null) => void;
		onpick: (text: string) => void;
	} = $props();
</script>

<Layer {visible} {interactive}>
	{#each words as word (word.text)}
		<Label
			text={word.text}
			x={word.x}
			y={word.y}
			{style}
			{hoverStyle}
			{hoverScale}
			hovered={word.text === hovered}
			onpointerover={() => onhover(word.text)}
			onpointerout={() => hovered === word.text && onhover(null)}
			onpointertap={() => onpick(word.text)}
		/>
	{/each}
</Layer>
