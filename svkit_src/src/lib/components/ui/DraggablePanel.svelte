<script lang="ts">
	import type { Snippet } from 'svelte';
	import DragHandle from './DragHandle.svelte';

	let {
		minimized = false,
		hidden = false,
		height = 340,
		ontoggle,
		ondragstart,
		ondragend,
		children
	}: {
		minimized?: boolean;
		hidden?: boolean;
		/** Height of the content area in px. */
		height?: number;
		ontoggle?: () => void;
		ondragstart?: () => void;
		ondragend?: () => void;
		children: Snippet;
	} = $props();

	let offset = $state({ x: 0, y: 0 });
	let grab: { pointerId: number; dx: number; dy: number } | null = null;

	function start(event: PointerEvent) {
		if (event.button !== 0) return;
		const bar = event.currentTarget as HTMLElement;
		bar.setPointerCapture(event.pointerId);
		grab = {
			pointerId: event.pointerId,
			dx: event.clientX - offset.x,
			dy: event.clientY - offset.y
		};
		ondragstart?.();
	}

	function move(event: PointerEvent) {
		if (grab?.pointerId !== event.pointerId) return;
		offset = { x: event.clientX - grab.dx, y: event.clientY - grab.dy };
	}

	function end(event: PointerEvent) {
		if (grab?.pointerId !== event.pointerId) return;
		grab = null;
		ondragend?.();
	}
</script>

<div class="area">
	<section class="panel" {hidden} style:transform="translate3d({offset.x}px, {offset.y}px, 0)">
		<div
			class="bar"
			role="presentation"
			onpointerdown={start}
			onpointermove={move}
			onpointerup={end}
			onpointercancel={end}
			onlostpointercapture={end}
		>
			<DragHandle />
			<button
				type="button"
				class="minimize"
				aria-label={minimized ? 'Expand panel' : 'Minimize panel'}
				aria-expanded={!minimized}
				onpointerdown={(e) => e.stopPropagation()}
				onclick={ontoggle}
			></button>
		</div>
		<div class="content" hidden={minimized} style:height="{height}px">
			{@render children()}
		</div>
	</section>
</div>

<style>
	.area {
		position: absolute;
		inset: 0;
		z-index: 5;
		pointer-events: none;
	}
	.panel {
		position: absolute;
		top: 50px;
		left: 50px;
		width: 400px;
		max-width: calc(100vw - 32px);
		border: 1px solid var(--gray);
		pointer-events: auto;
	}
	.panel[hidden] {
		display: none;
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		box-sizing: border-box;
		border: 5px solid var(--black);
		background: var(--black);
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
	.bar:active {
		cursor: grabbing;
	}
	.minimize {
		flex: none;
		width: 25px;
		height: 4px;
		margin: 0 0 2px 7px;
		padding: 0;
		background: var(--gray);
		border: none;
		border-radius: 0;
		cursor: pointer;
	}
	.minimize:hover {
		background: var(--button-hover);
	}
	.minimize:active {
		background: var(--white);
	}
	.minimize:focus {
		outline: 0;
	}
	.minimize:focus-visible {
		outline: 1px dashed var(--bevel-light);
		outline-offset: 2px;
	}
	.content {
		box-sizing: border-box;
		padding: 20px;
		overflow: auto;
		color: var(--white);
		background: var(--black);
		border: 5px solid var(--black);
		border-top: none;
		scrollbar-width: thin;
		scrollbar-color: var(--gray) var(--black);
	}
	.content[hidden] {
		display: none;
	}
	.content:hover {
		scrollbar-color: var(--button-hover) var(--black);
	}
</style>
