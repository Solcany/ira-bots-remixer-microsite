<script lang="ts">
	let { columns = 50, rows = 4 }: { columns?: number; rows?: number } = $props();
</script>

<div
	class="pattern"
	style:grid-template-columns="repeat({columns}, 3px)"
	style:grid-template-rows="repeat({rows}, 3px)"
	aria-hidden="true"
>
	{#each { length: columns * rows }, i (i)}
		<span></span>
	{/each}
</div>

<style>
	.pattern {
		display: grid;
		gap: 2px 4px;
		width: 90%;
		height: 100%;
		align-content: center;
		overflow: hidden;
		pointer-events: none;
	}
	span {
		background: var(--gray);
	}
</style>
