<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import type { CatalogSummaryItem, CatalogVariant } from "$lib/types";

	type PageData = {
		item: CatalogSummaryItem;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";

	let { data }: { data: PageData } = $props();

	let activeVariant = $state("N/A");

	$effect(() => {
		const hasActiveVariant = data.item.variants.some((variant) => variant.variant === activeVariant);

		if (hasActiveVariant === false) {
			activeVariant = data.item.defaultVariant.variant;
		}
	});

	const selectedVariant = $derived(
		data.item.variants.find((variant) => variant.variant === activeVariant) ?? data.item.defaultVariant
	);

	const rarityClass = $derived(
		`rarity-${selectedVariant.rarity.toLowerCase().replaceAll(" ", "-")}`
	);

	const glowClass = $derived.by(() => {
		const variant = selectedVariant.variant.toLowerCase();

		if (variant === "shiny mythic") {
			return "glow-shiny-mythic";
		}

		if (variant.includes("mythic")) {
			return "glow-mythic";
		}

		if (variant.includes("shiny")) {
			return "glow-shiny";
		}

		return "";
	});

	const displayVariantName = (variant: CatalogVariant) =>
		variant.variant === "N/A" ? "base" : variant.variant.toLowerCase();
</script>

<svelte:head>
	<title>{data.item.name} | drillbit index</title>
	<meta name="description" content={`view full drillbit item info for ${data.item.name}.`} />
</svelte:head>

<main class="detail-shell">
	<header class="topbar">
		<a class="brand" href="/">drillbit index</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>join the game</a
			>
			<a class="secondary top-button" href="/builder">builder</a>
			<ThemeToggle />
		</div>
	</header>

	<section class="detail-top">
		<div>
			<a class="back-link" href="/index">back to index</a>
			<h1>{data.item.name}</h1>
		</div>
	</section>

	<section class="variant-switcher">
		{#each data.item.variants as variant}
			<button
				type="button"
				class:active={variant.variant === activeVariant}
				onclick={() => {
					activeVariant = variant.variant;
				}}
			>
				{displayVariantName(variant)}
			</button>
		{/each}
	</section>

	<section class={`detail-card ${rarityClass} ${glowClass}`}>
		<div class="detail-header">
			<div>
				<p class="section-label">{data.item.categoryLabel}</p>
				<h2>{data.item.name}</h2>
			</div>
			<span class="variant-pill">{displayVariantName(selectedVariant)}</span>
		</div>

		<div class="summary-grid">
			<div>
				<dt>rarity class</dt>
				<dd>{selectedVariant.rarity}</dd>
			</div>
			<div>
				<dt>type</dt>
				<dd>{data.item.categoryType}</dd>
			</div>
			<div>
				<dt>crate</dt>
				<dd>{selectedVariant.obtainmentMethod}</dd>
			</div>
			<div>
				<dt>available forms</dt>
				<dd>
					{#if data.item.availableVariants.length > 0}
						{data.item.availableVariants.join(", ")}
					{:else}
						base only
					{/if}
				</dd>
			</div>
		</div>

		<dl class="details-list">
			{#each selectedVariant.details as detail}
				<div>
					<dt>{detail.label}</dt>
					<dd>{detail.value}</dd>
				</div>
			{/each}
		</dl>
	</section>
</main>

<style>
	.detail-shell {
		width: min(1100px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 2rem 0 3rem;
		display: grid;
		gap: 1rem;
		text-transform: lowercase;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand,
	.top-button,
	.variant-switcher button,
	.detail-top,
	.detail-card {
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		padding: 0.95rem 1.2rem;
		color: var(--text);
		font-size: 0.95rem;
	}

	.topbar-actions {
		display: flex;
		gap: 0.6rem;
	}

	.top-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.2rem;
		color: #f2f2f2;
		background: var(--surface-raised);
	}

	.primary {
		background: linear-gradient(135deg, #5c87ff, #3d6cff);
		border-color: rgba(79, 126, 255, 0.55);
	}

	.top-button.secondary {
		color: var(--text);
	}

	.detail-top {
		padding: 1.4rem;
	}

	.back-link,
	.section-label,
	dt {
		font-size: 0.78rem;
		letter-spacing: 0.08em;
		color: #8fb0ff;
	}

	h1,
	h2 {
		margin: 0;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	h1 {
		font-size: clamp(2.6rem, 5vw, 4rem);
		margin-top: 0.7rem;
	}

	h2 {
		font-size: clamp(1.5rem, 4vw, 2.2rem);
	}

	.intro {
		margin: 0.8rem 0 0;
		color: var(--muted);
	}

	.variant-switcher {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.variant-switcher button {
		padding: 0.8rem 1rem;
		color: var(--text);
		background: var(--surface-raised);
	}

	.variant-switcher button.active {
		border-color: var(--border-strong);
		color: #a9c0ff;
	}

	.detail-card {
		--rarity-color: rgba(255, 255, 255, 0.12);
		display: grid;
		gap: 1.2rem;
		padding: 1.4rem;
		border-color: var(--rarity-color);
		background: var(--card-bg);
	}

	.detail-header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.variant-pill {
		padding: 0.4rem 0.8rem;
		border: 1px solid var(--border-strong);
		background: var(--accent-soft);
		color: var(--accent);
	}

	.summary-grid,
	.details-list {
		display: grid;
		gap: 0.9rem;
	}

	.summary-grid {
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	}

	.summary-grid div,
	.details-list div {
		display: grid;
		gap: 0.2rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}

	dd {
		margin: 0;
		line-height: 1.5;
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

	.glow-shiny {
		box-shadow: 0 0 22px rgba(255, 255, 255, 0.16);
	}

	.glow-mythic {
		box-shadow: 0 0 24px rgba(255, 76, 76, 0.2);
	}

	.glow-shiny-mythic {
		box-shadow: 0 0 34px rgba(255, 76, 76, 0.32);
	}

	@media (max-width: 780px) {
		.detail-shell {
			width: min(100% - 1rem, 1100px);
			padding-top: 1rem;
		}

		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			display: grid;
			grid-template-columns: 1fr 1fr auto;
		}

		.detail-header {
			flex-direction: column;
		}
	}
</style>
