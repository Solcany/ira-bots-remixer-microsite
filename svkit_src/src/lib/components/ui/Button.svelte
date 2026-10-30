<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href,
		disabled = false,
		onclick,
		children
	}: {
		/** Renders a link styled as a button. */
		href?: string;
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	} = $props();
</script>

{#if href && !disabled}
	<a class="button" {href}>{@render children()}</a>
{:else}
	<button class="button" type="button" {disabled} {onclick}>{@render children()}</button>
{/if}

<style>
	.button {
		display: inline-block;
		padding: 10px;
		font-family: var(--font-mono);
		font-size: 14px;
		color: var(--white);
		background: var(--black);
		border-style: solid;
		border-width: 1px;
		border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light);
		cursor: pointer;
	}
	.button:hover {
		color: var(--black);
		background: var(--button-hover);
	}
	.button:active {
		background: var(--white);
	}
	.button:focus {
		outline: 0;
	}
	.button:focus-visible {
		outline: 1px dashed var(--bevel-light);
		outline-offset: 2px;
	}
	.button:disabled {
		color: var(--inactive);
		background: var(--black);
		border-color: var(--inactive);
		cursor: not-allowed;
	}
</style>
