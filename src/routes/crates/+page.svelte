<script lang="ts">
	import CrateSummaryCard from "$lib/components/CrateSummaryCard.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import type { CrateSummaryItem } from "$lib/types";

	type PageData = {
		crates: CrateSummaryItem[];
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";

	let { data }: { data: PageData } = $props();

	const totalSecrets = $derived(data.crates.filter((crate) => crate.hasSecret).length);
</script>

<svelte:head>
	<title>tycoon simulator crates</title>
	<meta
		name="description"
		content="browse tycoon simulator crates."
	/>
</svelte:head>

<main class="catalog-shell">
	<header class="topbar">
		<a class="brand" href="/">tycoon sim wiki</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>join the game</a
			>
			<a class="secondary top-button" href="/catalog">index</a>
			<a class="secondary top-button" href="/builder">builder</a>
			<a class="secondary top-button" href="/extra-info">extra info</a>
			<ThemeToggle />
		</div>
	</header>

	<section class="catalog-top">
		<div>
			<h1>tycoon simulator <span>crates</span></h1>
		</div>

		<div class="stats">
			<div>
				<strong>{data.crates.length}</strong>
				<span>crate types</span>
			</div>
			<div>
				<strong>{totalSecrets}</strong>
				<span>with secrets</span>
			</div>
		</div>
	</section>

	<section class="section-header">
		<div>
			<p class="section-label">all crates</p>
			<h2>{data.crates.length} results</h2>
		</div>
	</section>

	<section class="grid" aria-label="crate list">
		{#each data.crates as crate}
			<CrateSummaryCard {crate} />
		{/each}
	</section>
</main>

<style>
	.catalog-shell {
		width: min(1300px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 2rem 0 3rem;
		display: grid;
		gap: 1.35rem;
		text-transform: lowercase;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand,
	.top-button {
		border: 1px solid var(--border);
		background: var(--surface-raised);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		padding: 0.95rem 1.2rem;
		color: var(--text);
		font-size: 0.95rem;
		text-transform: lowercase;
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
	}

	.primary {
		background: linear-gradient(135deg, #5c87ff, #3d6cff);
		border-color: rgba(79, 126, 255, 0.55);
	}

	.top-button.secondary {
		color: var(--text);
	}

	.catalog-top,
	.section-header {
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.catalog-top {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.section-label {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		color: #8fb0ff;
	}

	h1,
	h2 {
		margin: 0;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	h1 {
		font-size: clamp(2.4rem, 5vw, 4.2rem);
	}

	h2 {
		font-size: clamp(1.6rem, 4vw, 2.2rem);
	}

	h1 span {
		color: var(--accent);
	}

	.section-header p {
		margin: 0.75rem 0 0;
		color: var(--muted);
		max-width: 40rem;
		line-height: 1.6;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.9rem;
		min-width: min(100%, 17rem);
	}

	.stats div {
		display: grid;
		gap: 0.3rem;
		padding: 1rem;
		border: 1px solid var(--border);
		background: var(--surface-soft);
	}

	.stats strong {
		font-size: 1.8rem;
	}

	.stats span {
		color: var(--muted);
	}

	.section-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.3rem 1.4rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1rem;
		align-items: stretch;
	}

	@media (max-width: 780px) {
		.catalog-shell {
			width: min(100% - 1rem, 1300px);
			padding-top: 1rem;
		}

		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr auto;
		}

		.catalog-top,
		.section-header {
			flex-direction: column;
			align-items: start;
		}

		.stats {
			width: 100%;
		}
	}
</style>
