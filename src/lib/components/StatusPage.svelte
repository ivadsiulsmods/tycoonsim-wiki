<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";

	type Props = {
		description: string;
		eyebrow: string;
		primaryHref: string;
		primaryLabel: string;
		secondaryHref: string;
		secondaryLabel: string;
		title: string;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";

	let {
		description,
		eyebrow,
		primaryHref,
		primaryLabel,
		secondaryHref,
		secondaryLabel,
		title
	}: Props = $props();
</script>

<main class="status-shell">
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

	<section class="status-panel">
		<div class="status-copy">
			<p class="eyebrow">{eyebrow}</p>
			<h1>{title}</h1>
			<p class="description">{description}</p>
			<div class="actions">
				<a class="primary action-button" href={primaryHref}>{primaryLabel}</a>
				<a class="secondary action-button" href={secondaryHref}>{secondaryLabel}</a>
			</div>
		</div>

		<div class="status-illustration">
			<img src="/builder-guy.svg" alt="builder guy holding a hammer" />
		</div>
	</section>
</main>

<style>
	.status-shell {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		min-height: 100vh;
		display: grid;
		align-content: start;
		padding: 2rem 0 3rem;
		gap: 1rem;
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
	.top-button,
	.status-panel {
		border: 1px solid var(--border);
		background: var(--surface-raised);
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
		align-items: center;
		gap: 0.6rem;
	}

	.top-button,
	.action-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.2rem;
	}

	.top-button {
		color: #f2f2f2;
	}

	.primary {
		background: linear-gradient(135deg, #5c87ff, #3d6cff);
		border-color: rgba(79, 126, 255, 0.55);
		color: #f2f2f2;
	}

	.secondary {
		color: var(--text);
	}

	.status-panel {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(280px, 0.85fr);
		gap: 1.5rem;
		padding: 1.5rem;
		background: var(--panel);
	}

	.status-copy {
		display: grid;
		align-content: center;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0;
		font-size: 0.78rem;
		letter-spacing: 0.14em;
		color: #8fb0ff;
	}

	h1 {
		margin: 0;
		font-size: clamp(2.8rem, 6vw, 4.8rem);
		line-height: 1;
		letter-spacing: -0.05em;
	}

	.description {
		margin: 0;
		max-width: 36rem;
		line-height: 1.7;
		color: var(--muted);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		padding-top: 0.4rem;
	}

	.action-button.secondary {
		border: 1px solid var(--border);
		background: var(--surface-raised);
	}

	.status-illustration {
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.status-illustration img {
		width: min(100%, 360px);
		height: auto;
		filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.18));
	}

	@media (max-width: 860px) {
		.status-panel {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.status-shell {
			width: min(100% - 1rem, 1200px);
			padding: 1rem 0;
		}

		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			display: grid;
			grid-template-columns: 1fr 1fr auto;
		}
	}
</style>
