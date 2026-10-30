<script lang="ts">
	import { PICK_STEPS, Remixer } from '#lib/remixer.svelte.ts';
	import { STEP_COPY } from '#lib/content.ts';
	import StageCanvas from '#lib/components/canvas/StageCanvas.svelte';
	import DraggablePanel from '#lib/components/ui/DraggablePanel.svelte';
	import StepNav from '#lib/components/stage/StepNav.svelte';

	const remixer = new Remixer();

	let canvas: ReturnType<typeof StageCanvas>;
	let dragging = $state(false);
	let minimized = $state(false);

	const copy = $derived(remixer.step === 'botnet' ? null : STEP_COPY[remixer.step]);

	function pick(value: string) {
		remixer.pick(value, () => canvas.glitch());
	}
</script>

<main>
	<StageCanvas
		bind:this={canvas}
		step={remixer.step}
		bot={remixer.bot}
		preview={remixer.preview}
		interactive={!dragging}
		onhover={(value) => remixer.hover(value)}
		onpick={pick}
	/>

	<DraggablePanel
		{minimized}
		hidden={!copy}
		ontoggle={() => (minimized = !minimized)}
		ondragstart={() => (dragging = true)}
		ondragend={() => (dragging = false)}
	>
		{#if copy}
			<h2>{copy.title}</h2>
			<p>{copy.body}</p>
		{/if}
	</DraggablePanel>
</main>

<StepNav
	steps={PICK_STEPS}
	current={remixer.step}
	done={remixer.done}
	canSubmit={remixer.complete}
	onselect={(step) => remixer.go(step)}
	onsubmit={() => remixer.submit()}
/>

<style>
	main {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
</style>
