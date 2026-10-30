<script lang="ts">
	import { onMount } from 'svelte';

	let { src }: { src: string } = $props();

	let audio: HTMLAudioElement;
	let started = false;

	// Browsers block autoplay with sound, so start on the first interaction anywhere.
	function start() {
		if (started) return;
		started = true;
		audio.play().catch(() => (started = false));
	}

	// A click that lands before hydration has no listener to catch it, but the browser remembers
	// the page was interacted with (sticky activation), so playback is already allowed.
	onMount(() => {
		if (navigator.userActivation?.hasBeenActive) start();
	});
</script>

<svelte:window onpointerdown={start} onkeydown={start} />

<audio bind:this={audio} {src} preload="auto"></audio>
