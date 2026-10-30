<script lang="ts" generics="Id extends string">
	import Button from '#lib/components/ui/Button.svelte';
	import StepItem from '#lib/components/ui/StepItem.svelte';

	let {
		steps,
		current,
		done,
		canSubmit,
		onselect,
		onsubmit
	}: {
		steps: { id: Id; label: string }[];
		current: string;
		done: Record<Id, boolean>;
		canSubmit: boolean;
		onselect: (id: Id) => void;
		onsubmit: () => void;
	} = $props();
</script>

<footer>
	<ol>
		{#each steps as step (step.id)}
			<li>
				<StepItem
					label={step.label}
					active={current === step.id}
					done={done[step.id]}
					onclick={() => onselect(step.id)}
				/>
			</li>
			<li class="divider" aria-hidden="true">→</li>
		{/each}
		<li>
			<Button disabled={!canSubmit} onclick={onsubmit}>add the bot to botnet</Button>
		</li>
	</ol>
</footer>

<style>
	footer {
		display: flex;
		justify-content: center;
		padding: 3px 0;
		background: var(--black);
		border-top: 1px solid var(--gray);
	}
	ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		margin: 0;
		padding: 20px 16px;
		list-style: none;
	}
	.divider {
		padding: 0 25px;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--gray);
	}
</style>
