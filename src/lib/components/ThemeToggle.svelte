<script lang="ts">
	import { Settings2 } from "@lucide/svelte";
</script>

<a
	class="icon-button"
	href="/settings"
	aria-label="Open settings"
>
	<Settings2 aria-hidden="true" size={16} strokeWidth={2} />
</a>

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		padding: 0.9rem 0;
		border: 1px solid var(--border);
		background: var(--surface-raised);
		color: var(--text);
	}

	.icon-button :global(svg) {
		width: 1rem;
		height: 1rem;
	}
</style>
