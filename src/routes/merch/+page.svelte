<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
	const itemName = "I ♥ CHILI";
	const itemPrice = 15;
	const itemUrl = "https://www.roblox.com/catalog/110843550595158/I-CHILI";
</script>

<svelte:head>
	<title>merch | drillbit index</title>
	<meta
		name="description"
		content="official drillbit-related roblox clothing, starting with the I love chili shirt."
	/>
</svelte:head>

<main class="merch-shell">
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

	<section class="hero-panel">
		<div class="hero-copy">
			<p class="eyebrow">roblox clothing</p>
			<h1>merch</h1>
			<p class="description">buy this awesome clothing if u wanna idk</p>
		</div>
	</section>

	<section class="merch-card">
		<div class="preview-frame">
			<img src="/clothing/i-love-chili.png" alt="I love chili shirt preview" />
		</div>

		<div class="merch-copy">
			<p class="eyebrow">available now</p>
			<h2>{itemName}</h2>
			<div class="price-row">
				<span>cost</span>
				<strong>{itemPrice} Robux</strong>
			</div>
			<a class="primary buy-link" href={itemUrl} target="_blank" rel="noreferrer">
				view on roblox
			</a>
		</div>
	</section>
</main>

<style>
	.merch-shell {
		width: min(1200px, calc(100% - 2rem));
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
	.hero-panel,
	.merch-card,
	.preview-frame {
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

	.top-button,
	.buy-link {
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
		background: var(--surface-raised);
	}

	.hero-panel {
		padding: 1.5rem;
	}

	.hero-copy {
		display: grid;
		gap: 0.9rem;
	}

	.eyebrow,
	.price-row span {
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
		font-size: clamp(1.9rem, 5vw, 2.7rem);
	}

	.description {
		margin: 0;
		max-width: 38rem;
		color: var(--muted);
		line-height: 1.7;
	}

	.merch-card {
		display: grid;
		grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
		gap: 1.2rem;
		padding: 1.4rem;
	}

	.preview-frame {
		display: grid;
		place-items: center;
		padding: 1rem;
		background: var(--surface-soft);
	}

	.preview-frame img {
		width: min(100%, 320px);
		height: auto;
		display: block;
	}

	.merch-copy {
		display: grid;
		align-content: center;
		gap: 1rem;
	}

	.price-row {
		display: grid;
		gap: 0.35rem;
		padding: 1rem 0 0;
		border-top: 1px solid var(--line);
	}

	.price-row strong {
		font-size: clamp(1.8rem, 4vw, 2.4rem);
		color: var(--text);
	}

	.buy-link {
		width: fit-content;
		margin-top: 0.25rem;
	}

	@media (max-width: 900px) {
		.merch-card {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 780px) {
		.merch-shell {
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
