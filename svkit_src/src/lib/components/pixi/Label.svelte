<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Text, type Filter, type PointData, type TextStyleOptions } from 'pixi.js';
	import { getParent } from '#lib/pixi/context.ts';

	let {
		text,
		x,
		y,
		style,
		anchor = 0.5,
		hovered = false,
		hoverStyle,
		hoverScale = 1,
		filters,
		onpointerover,
		onpointerout,
		onpointertap
	}: {
		text: string;
		x: number;
		y: number;
		style: TextStyleOptions;
		anchor?: number | PointData;
		hovered?: boolean;
		/** Merged over `style` while hovered. */
		hoverStyle?: TextStyleOptions;
		hoverScale?: number;
		filters?: Filter[];
		onpointerover?: () => void;
		onpointerout?: () => void;
		onpointertap?: () => void;
	} = $props();

	const parent = getParent();
	const label = new Text();
	parent.addChild(label);
	onDestroy(() => {
		if (!label.destroyed) label.destroy();
	});

	label.on('pointerover', () => onpointerover?.());
	label.on('pointerout', () => onpointerout?.());
	label.on('pointertap', () => onpointertap?.());

	$effect(() => {
		const clickable = onpointerover || onpointerout || onpointertap;
		label.eventMode = clickable ? 'static' : 'none';
		label.cursor = clickable ? 'pointer' : 'auto';
	});
	$effect(() => {
		label.text = text;
	});
	$effect(() => {
		label.style = hovered && hoverStyle ? { ...style, ...hoverStyle } : style;
	});
	$effect(() => {
		label.scale.set(hovered ? hoverScale : 1);
	});
	$effect(() => {
		if (typeof anchor === 'number') label.anchor.set(anchor);
		else label.anchor.set(anchor.x, anchor.y);
	});
	$effect(() => {
		label.position.set(x, y);
	});
	$effect(() => {
		label.filters = filters ?? [];
	});
</script>
