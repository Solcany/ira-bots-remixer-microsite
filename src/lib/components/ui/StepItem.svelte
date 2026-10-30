<script lang="ts">
	let {
		label,
		active,
		done,
		onclick
	}: {
		label: string;
		active: boolean;
		done: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="step"
	class:active
	aria-current={active ? 'step' : undefined}
	{onclick}
>
	<span class="tickbox" class:done></span>
	{label}
</button>

<style>
	.step {
		display: flex;
		align-items: center;
		padding: 0;
		font-family: var(--font-mono);
		font-size: 14px;
		line-height: 22px;
		color: var(--gray);
		background: var(--black);
		border: none;
		cursor: pointer;
	}
	.step.active {
		color: var(--white);
	}
	.step:focus {
		outline: 0;
	}
	.step:focus-visible {
		outline: 1px dashed var(--bevel-light);
	}
	.tickbox {
		display: inline-block;
		width: 4px;
		height: 4px;
		margin-right: 5px;
		background: var(--gray);
	}
	.tickbox.done {
		background: var(--done);
	}
</style>
