<script lang="ts">
	import type { CatalogSummaryItem } from "$lib/types";

	type Props = {
		item: CatalogSummaryItem;
	};

	let { item }: Props = $props();

	const hasValue = (value: string): boolean => value.trim().toUpperCase() !== "N/A";
	const crate = $derived(item.defaultVariant.obtainmentMethod);
	const variantSummary = $derived(
		item.availableVariants.length > 0 ? item.availableVariants.join(", ") : "base only"
	);
	const rarityClass = $derived(
		`rarity-${item.defaultVariant.rarity.toLowerCase().replaceAll(" ", "-")}`
	);
	const summaryRows = $derived(
		[
			hasValue(item.defaultVariant.rarity)
				? { label: "rarity class", value: item.defaultVariant.rarity, className: "rarity-value" }
				: null,
			hasValue(item.categoryType) ? { label: "type", value: item.categoryType, className: "" } : null,
			hasValue(variantSummary)
				? { label: "shiny/mythic", value: variantSummary, className: "" }
				: null,
			hasValue(crate) ? { label: "crate", value: crate, className: "" } : null
		].filter((row) => row !== null)
	);
</script>

<a class={`summary-card ${rarityClass}`} href={`/index/${item.category}/${item.slug}`}>
	<p class="type">{item.categoryLabel}</p>
	<h3>{item.name}</h3>

	{#if summaryRows.length > 0}
		<dl>
			{#each summaryRows as row}
				<div>
					<dt>{row.label}</dt>
					<dd class={row.className}>{row.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}
</a>

<style>
	.summary-card {
		--rarity-color: rgba(255, 255, 255, 0.12);
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
		border: 1px solid var(--rarity-color);
		background: var(--card-bg);
		color: var(--text);
		text-transform: lowercase;
	}

	.summary-card:hover {
		border-color: var(--border-strong);
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

	.rarity-value {
		color: var(--rarity-color);
	}

	.rarity-common {
		--rarity-color: rgba(255, 255, 255, 0.3);
	}

	.rarity-uncommon {
		--rarity-color: rgba(79, 201, 109, 0.42);
	}

	.rarity-rare {
		--rarity-color: rgba(77, 145, 255, 0.45);
	}

	.rarity-epic {
		--rarity-color: rgba(171, 92, 255, 0.45);
	}

	.rarity-legendary {
		--rarity-color: rgba(255, 187, 64, 0.48);
	}

	.rarity-secret {
		--rarity-color: rgba(255, 76, 76, 0.56);
	}
</style>
