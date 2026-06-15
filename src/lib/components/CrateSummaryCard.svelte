<script lang="ts">
	import { Check, X } from "@lucide/svelte";
	import type { CrateSummaryItem } from "$lib/types";

	type Props = {
		crate: CrateSummaryItem;
	};

	let { crate }: Props = $props();

	const summaryRows = $derived([
		{ label: "cost", value: crate.cost },
		{ label: "droppers", value: crate.itemCounts.droppers.toString() },
		{ label: "upgraders", value: crate.itemCounts.upgraders.toString() },
		{ label: "furnaces", value: crate.itemCounts.furnaces.toString() }
	]);
</script>

<a class={`summary-card ${crate.hasSecret ? "has-secret" : ""}`} href={`/crates/${crate.slug}`}>
	<p class="type">crate</p>
	<h3>{crate.name}</h3>

	<dl>
		<div>
			<dt>has secret</dt>
			<dd class={`secret-icon ${crate.hasSecret ? "is-true" : "is-false"}`}>
				{#if crate.hasSecret}
					<Check size={18} strokeWidth={2.4} aria-label="has secret" />
				{:else}
					<X size={18} strokeWidth={2.4} aria-label="no secret" />
				{/if}
			</dd>
		</div>

		{#each summaryRows as row}
			<div>
				<dt>{row.label}</dt>
				<dd>{row.value}</dd>
			</div>
		{/each}
	</dl>
</a>

<style>
	.summary-card {
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
		border: 1px solid var(--border);
		background: var(--card-bg);
		color: var(--text);
		text-transform: var(--site-text-transform);
	}

	.summary-card:hover {
		border-color: var(--border-strong);
	}

	.summary-card.has-secret {
		border-color: rgba(255, 76, 76, 0.35);
	}

	.type,
	dt {
		margin: 0;
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	h3 {
		margin: 0;
		font-size: 1.22rem;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	dl {
		display: grid;
		gap: 0.8rem;
		margin: 0;
	}

	dl div {
		display: grid;
		gap: 0.18rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
	}

	dd {
		margin: 0;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	.secret-icon {
		display: inline-flex;
		align-items: center;
	}

	.secret-icon.is-true {
		color: #6dde8f;
	}

	.secret-icon.is-false {
		color: #ff7a7a;
	}
</style>
