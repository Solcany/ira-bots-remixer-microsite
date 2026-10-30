<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import { INTRO } from '#lib/content.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import DraggablePanel from '#lib/components/ui/DraggablePanel.svelte';
	import Loader from '#lib/components/ui/Loader.svelte';
	import VideoBackground from '#lib/components/ui/VideoBackground.svelte';

	let videoReady = $state(false);
	let minimized = $state(false);
</script>

<main>
	{#if !videoReady}
		<Loader />
	{/if}

	<DraggablePanel {minimized} height={450} ontoggle={() => (minimized = !minimized)}>
		{#each INTRO as paragraph, i (i)}
			<p>{paragraph}</p>
		{/each}
		<nav>
			<Button href={resolve('/stage')}>create a bot</Button>
			<Button disabled>enter the botnet</Button>
		</nav>
	</DraggablePanel>

	<VideoBackground src={asset('video/bots.mp4')} oncanplay={() => (videoReady = true)} />
</main>

<style>
	main {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	nav {
		display: flex;
		gap: 8px;
		padding-top: 20px;
	}
</style>
