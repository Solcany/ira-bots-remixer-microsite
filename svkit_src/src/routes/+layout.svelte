<script lang="ts">
	// Only the subsets in use: Plex Mono also renders the Cyrillic bot names; the headings are Latin.
	import '@fontsource/ibm-plex-mono/latin-400.css';
	import '@fontsource/ibm-plex-mono/cyrillic-400.css';
	import '@fontsource/kaisei-tokumin/latin-400.css';
	import '../app.css';
	import { asset, resolve } from '$app/paths';
	import BackgroundMusic from '#lib/components/ui/BackgroundMusic.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<!-- no favicon; the empty data URL stops the browser requesting /favicon.ico -->
	<link rel="icon" href="data:," />
	<title>IRA bot remixer</title>
</svelte:head>

<div class="app">
	<header>
		<a href={resolve('/')}><h1>Remixer of Internet Research Agency's Twitter Bots</h1></a>
	</header>
	{@render children()}
</div>

<BackgroundMusic src={asset('audio/ira-theme.mp3')} />

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}
	header {
		position: relative;
		z-index: 999;
		flex: none;
		background: var(--black);
		border-bottom: 1px solid var(--gray);
	}
	h1 {
		padding-left: 20px;
		font-family: var(--font-serif);
		font-size: 2.6em;
		font-weight: 400;
		color: var(--white);
	}
</style>
