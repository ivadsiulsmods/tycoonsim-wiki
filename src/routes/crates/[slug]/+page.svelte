<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import type { CategoryKey, CrateItem, CrateListEntry } from "$lib/types";

	type PageData = {
		crate: CrateItem;
	};

	type CrateSection = {
		description: string;
		items: CrateListEntry[];
		key: CategoryKey;
		label: string;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";

	let { data }: { data: PageData } = $props();

	const crateSections = $derived<CrateSection[]>([
		{
			key: "droppers",
			label: "droppers",
			description: "ore sources found in this crate.",
			items: data.crate.items.droppers
		},
		{
			key: "upgraders",
			label: "upgraders",
			description: "route pieces and value boosts found in this crate.",
			items: data.crate.items.upgraders
		},
		{
			key: "furnaces",
			label: "furnaces",
			description: "end-line processors found in this crate.",
			items: data.crate.items.furnaces
		}
	]);
</script>

<svelte:head>
	<title>{data.crate.name} | drillbit crates</title>
	<meta name="description" content={`view the contents of ${data.crate.name}.`} />
</svelte:head>

<main class="detail-shell">
	<header class="topbar">
		<a class="brand" href="/">drillbit index</a>
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

	<section class="detail-top">
		<div>
			<a class="back-link" href="/crates">back to crates</a>
			<h1>{data.crate.name}</h1>
			<p class="intro">a crate-specific view of cost, secret status, and included item pools.</p>
		</div>
		<a
			class="spreadsheet-link"
			href={data.crate.spreadsheetUrl}
			target="_blank"
			rel="noreferrer"
		>
			open spreadsheet
		</a>
	</section>

	<section class="detail-card">
		<div class="detail-header">
			<div>
				<p class="section-label">crate info</p>
				<h2>{data.crate.name}</h2>
			</div>
			<span class:secret-pill={data.crate.hasSecret} class="variant-pill">
				{data.crate.hasSecret ? "secret possible" : "no secret"}
			</span>
		</div>

		<div class="summary-grid">
			<div>
				<dt>cost</dt>
				<dd>{data.crate.cost}</dd>
			</div>
			<div>
				<dt>has secret</dt>
				<dd>{data.crate.hasSecret ? "true" : "false"}</dd>
			</div>
			<div>
				<dt>droppers</dt>
				<dd>{data.crate.itemCounts.droppers}</dd>
			</div>
			<div>
				<dt>upgraders</dt>
				<dd>{data.crate.itemCounts.upgraders}</dd>
			</div>
			<div>
				<dt>furnaces</dt>
				<dd>{data.crate.itemCounts.furnaces}</dd>
			</div>
		</div>

		<div class="crate-sections">
			{#each crateSections as section}
				<section class="crate-section" aria-label={section.label}>
					<div class="crate-section-header">
						<div>
							<p class="section-label">{section.label}</p>
							<h3>{section.items.length} items</h3>
						</div>
						<p>{section.description}</p>
					</div>

					{#if section.items.length > 0}
						<ul>
							{#each section.items as item}
								<li>
									<a href={`/catalog/${item.category}/${item.slug}`}>{item.name}</a>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="empty-copy">nothing listed here yet.</p>
					{/if}
				</section>
			{/each}
		</div>
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
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
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
	h2,
	h3 {
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

	h3 {
		font-size: 1.35rem;
	}

	.intro,
	.crate-section-header p {
		margin: 0.8rem 0 0;
		color: var(--muted);
		line-height: 1.55;
	}

	.spreadsheet-link,
	.crate-section a {
		color: #8fb0ff;
		text-decoration: underline;
	}

	.detail-card {
		display: grid;
		gap: 1.2rem;
		padding: 1.4rem;
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
		background: var(--surface-soft);
		color: var(--text);
	}

	.variant-pill.secret-pill {
		border-color: rgba(255, 76, 76, 0.46);
		color: #ff8d8d;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.9rem;
	}

	.summary-grid div,
	.crate-section {
		display: grid;
		gap: 0.2rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}

	dd {
		margin: 0;
		line-height: 1.5;
	}

	.crate-sections {
		display: grid;
		gap: 1.2rem;
	}

	.crate-section-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}

	.crate-section-header p:last-child {
		margin-top: 0;
		max-width: 28rem;
		text-align: right;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 0.8rem 1rem;
		padding: 0;
		margin: 0.9rem 0 0;
		list-style: none;
	}

	li {
		padding: 0.9rem 1rem;
		border: 1px solid var(--border);
		background: var(--surface-soft);
	}

	.empty-copy {
		margin: 0.9rem 0 0;
		color: var(--muted);
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
			grid-template-columns: 1fr 1fr 1fr 1fr auto;
		}

		.detail-top,
		.detail-header,
		.crate-section-header {
			flex-direction: column;
			align-items: start;
		}

		.crate-section-header p:last-child {
			text-align: left;
		}
	}
</style>
