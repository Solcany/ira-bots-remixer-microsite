<script lang="ts">
	import { onMount } from 'svelte';

	let { src, oncanplay }: { src: string; oncanplay?: () => void } = $props();

	let video: HTMLVideoElement;

	// The prerendered <video> may be ready before hydration attaches the listener.
	onMount(() => {
		if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) oncanplay?.();
	});
</script>

<video bind:this={video} {src} autoplay loop muted playsinline {oncanplay}></video>

<style>
	video {
		position: relative;
		z-index: 1;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
