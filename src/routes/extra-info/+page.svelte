<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import type { ExtraInfoPageData } from "$lib/types";

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
	let { data }: { data: ExtraInfoPageData } = $props();
</script>

<svelte:head>
	<title>extra info | tycoon simulator wiki</title>
	<meta
		name="description"
		content="quick reference info for tycoon simulator plot size, conveyor sizes, odds, effects, and codes."
	/>
</svelte:head>

<main class="info-shell">
	<header class="topbar">
		<a class="brand" href="/">Tycoon Sim Wiki</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>Join the Game</a
			>
			<a class="secondary top-button" href="/catalog">Index</a>
			<a class="secondary top-button" href="/crates">Crates</a>
			<a class="secondary top-button" href="/builder">Builder</a>
			<ThemeToggle />
		</div>
	</header>

	<section class="hero-panel">
		<div class="hero-copy">
			<p class="eyebrow">Quick Reference</p>
			<h1>Extra Info</h1>
			<p class="description">
				Some information that may come in useful
			</p>
		</div>

		<div class="plot-card">
			<span>max plot size</span>
			<strong>{data.maxPlotSize}</strong>
		</div>
	</section>

	<section class="info-grid">
		{#each data.infoSections as section}
			<article class:codes-card={section.title === "codes"} class="info-card">
				<h2>{section.title}</h2>
				{#if section.title === "codes"}
					<div class="codes-list">
						{#each section.rows as row}
							<div class="code-entry">
								<p class="code-name">{row.label}</p>
								<p class="code-reward">{row.value}</p>
							</div>
						{/each}
					</div>
				{:else}
					<dl>
						{#each section.rows as row}
							<div>
								<dt>{row.label}</dt>
								<dd>{row.value}</dd>
							</div>
						{/each}
					</dl>
				{/if}
			</article>
		{/each}
	</section>
</main>

<style>
	.info-shell {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 2rem 0 3rem;
		display: grid;
		gap: 1rem;
		text-transform: var(--site-text-transform);
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.brand,
	.top-button,
	.hero-panel,
	.info-card,
	.plot-card {
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

	.hero-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
		gap: 1rem;
		padding: 1.5rem;
	}

	.hero-copy {
		display: grid;
		gap: 0.9rem;
		align-content: center;
	}

	.eyebrow,
	dt {
		margin: 0;
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
		font-size: clamp(2.8rem, 6vw, 4.6rem);
	}

	h2 {
		font-size: 1.4rem;
	}

	.description {
		margin: 0;
		max-width: 38rem;
		color: var(--muted);
		line-height: 1.7;
	}

	.plot-card {
		display: grid;
		gap: 0.4rem;
		align-content: center;
		padding: 1.25rem;
		background:
			linear-gradient(135deg, color-mix(in srgb, #5c87ff 18%, transparent), transparent),
			var(--surface-raised);
	}

	.plot-card span {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.plot-card strong {
		font-size: clamp(2rem, 5vw, 3rem);
		color: var(--accent);
		letter-spacing: -0.05em;
	}

	.info-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
	}

	.info-card {
		display: grid;
		gap: 1rem;
		padding: 1.35rem;
	}

	dl {
		display: grid;
		gap: 0.9rem;
		margin: 0;
	}

	dl div {
		display: grid;
		gap: 0.25rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}

	dd {
		margin: 0;
		color: var(--text);
		line-height: 1.6;
	}

	.codes-card dt {
		color: #8fb0ff;
		letter-spacing: 0.08em;
	}

	.codes-list {
		display: grid;
		gap: 0.9rem;
	}

	.code-entry {
		display: grid;
		gap: 0.25rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}

	.code-name,
	.code-reward {
		margin: 0;
	}

	.code-name {
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		color: #8fb0ff;
	}

	.code-reward {
		color: #ffffff;
		line-height: 1.6;
	}

	@media (max-width: 860px) {
		.hero-panel {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 780px) {
		.info-shell {
			width: min(100% - 1rem, 1200px);
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
	}
</style>
