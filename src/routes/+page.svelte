<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
</script>

<svelte:head>
	<title>The Drillbit Index</title>
	<meta
		name="description"
		content="Information collected by Minecraftwiner1, site by ivadsiuls"
	/>
</svelte:head>

<main class="hero-shell">
	<header class="topbar">
		<a class="brand" href="/">drillbit index</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>join the game</a
			>
			<ThemeToggle />
		</div>
	</header>

	<section class="hero">
		<div class="hero-copy">
			<h1>the drillbit <span>index</span></h1>
			<p class="description">Information collected by Minecraftwiner1, site by ivadsiuls</p>
			<p class="supporting">find info about every* drillbit item</p>
			<div class="actions">
				<a class="primary" href="/index">view index</a>
				<a class="secondary" href="/builder">builder</a>
			</div>
		</div>

		<div class="preview-panel" aria-hidden="true">
			<div class="preview-header">
				<span></span>
				<span></span>
				<span></span>
			</div>
			<div class="preview-grid">
				{#each Array.from({ length: 12 }) as _, index}
					<div class="preview-card">
						<strong>Item {index + 1}</strong>
						<small>Variant</small>
					</div>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.hero-shell {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		min-height: 100vh;
		display: grid;
		align-content: start;
		padding: 2rem 0 3rem;
		text-transform: lowercase;
	}

	.topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0 1.5rem;
	}

	.brand,
	.secondary,
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
		align-items: center;
		gap: 0.6rem;
	}

	.top-button,
	.secondary,
	.primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.2rem;
		color: #f2f2f2;
	}

	.primary,
	.top-button {
		background: linear-gradient(135deg, #5c87ff, #3d6cff);
		border-color: rgba(79, 126, 255, 0.55);
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(320px, 0.75fr);
		gap: 2rem;
		padding: 2rem 0 0;
	}

	.hero-copy {
		display: grid;
		align-content: center;
		gap: 1rem;
		padding: 1.75rem 0;
	}

	h1 {
		margin: 0;
		font-size: clamp(3.2rem, 7vw, 5.3rem);
		line-height: 1;
		letter-spacing: -0.06em;
		text-transform: lowercase;
	}

	h1 span {
		color: var(--accent);
	}

	.description {
		margin: 0;
		max-width: 36rem;
		font-size: 1rem;
		line-height: 1.65;
		color: var(--muted);
	}

	.supporting {
		margin: 0.5rem 0 0;
		color: var(--accent);
		font-size: 0.95rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 0.6rem;
	}

	.secondary {
		color: var(--text);
	}

	.preview-panel {
		display: grid;
		gap: 1rem;
		padding: 1.1rem;
		border: 1px solid var(--border);
		background: var(--panel);
		min-height: 28rem;
	}

	.preview-header {
		display: flex;
		gap: 0.5rem;
	}

	.preview-header span {
		width: 0.8rem;
		height: 0.8rem;
		background: var(--line);
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
		align-content: start;
	}

	.preview-card {
		display: grid;
		gap: 0.35rem;
		padding: 1rem;
		min-height: 7rem;
		border: 1px solid var(--line);
		background: var(--surface-soft);
	}

	.preview-card strong {
		font-size: 0.95rem;
	}

	.preview-card small {
		color: var(--muted);
	}

	@media (max-width: 900px) {
		.topbar {
			padding-bottom: 1rem;
		}

		.hero {
			grid-template-columns: 1fr;
		}

		.hero-shell {
			width: min(100% - 1rem, 1200px);
			padding: 1rem 0;
		}
	}

	@media (max-width: 640px) {
		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			justify-content: space-between;
		}

		.hero {
			padding-top: 1rem;
		}

		.hero-copy {
			padding: 0.25rem 0 0.75rem;
		}

		.preview-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
