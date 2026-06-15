<script lang="ts">
	import { onMount } from "svelte";
	import {
		DEFAULT_BASE_LUCK,
		DEFAULT_TEXT_CASE,
		applyTextCase,
		applyTheme,
		formatSettingNumber,
		readStoredBaseLuck,
		readStoredTextCase,
		resolvePreferredTheme,
		type TextCaseMode,
		type ThemeMode,
		writeStoredBaseLuck
	} from "$lib/client-settings";

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";

	let currentTheme = $state<ThemeMode>("dark");
	let currentTextCase = $state<TextCaseMode>(DEFAULT_TEXT_CASE);
	let baseLuckMultiplier = $state(DEFAULT_BASE_LUCK);
	let baseLuckInput = $state(formatSettingNumber(DEFAULT_BASE_LUCK));

	const formatCompactNumber = (value: number): string => {
		if (Number.isInteger(value) === true) {
			return value.toString();
		}

		if (value >= 100) {
			return Math.round(value).toString();
		}

		return value.toFixed(2).replace(/\.?0+$/, "");
	};

	const formatShortNumber = (value: number): string => {
		if (value >= 1_000_000_000_000) {
			return `${formatCompactNumber(value / 1_000_000_000_000)}t`;
		}

		if (value >= 1_000_000_000) {
			return `${formatCompactNumber(value / 1_000_000_000)}b`;
		}

		if (value >= 1_000_000) {
			return `${formatCompactNumber(value / 1_000_000)}m`;
		}

		if (value >= 1_000) {
			return `${formatCompactNumber(value / 1_000)}k`;
		}

		return formatCompactNumber(value);
	};

	const applyBaseLuckInput = () => {
		const normalized = writeStoredBaseLuck(baseLuckInput);
		baseLuckMultiplier = normalized;
		baseLuckInput = formatSettingNumber(normalized);
	};

	const handleBaseLuckInput = (event: Event) => {
		baseLuckInput = (event.currentTarget as HTMLInputElement).value;
	};

	const setThemeMode = (theme: ThemeMode) => {
		currentTheme = theme;
		applyTheme(theme, true);
	};

	const setTextCaseMode = (textCase: TextCaseMode) => {
		currentTextCase = textCase;
		applyTextCase(textCase);
	};

	const resetBaseLuck = () => {
		baseLuckMultiplier = writeStoredBaseLuck(DEFAULT_BASE_LUCK);
		baseLuckInput = formatSettingNumber(baseLuckMultiplier);
	};

	const previewOdds = $derived(`1/${formatShortNumber(10_000_000 / baseLuckMultiplier)}`);

	onMount(() => {
		currentTheme = resolvePreferredTheme();
		currentTextCase = readStoredTextCase();
		baseLuckMultiplier = readStoredBaseLuck();
		baseLuckInput = formatSettingNumber(baseLuckMultiplier);
	});
</script>

<svelte:head>
	<title>settings | tycoon simulator wiki</title>
	<meta
		name="description"
		content="Configure theme, text casing, and base luck for the Tycoon Simulator wiki."
	/>
</svelte:head>

<main class="settings-shell">
	<header class="topbar">
		<a class="brand" href="/">Tycoon Sim Wiki</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>Join the Game</a
			>
			<a class="secondary top-button" href="/catalog">Index</a>
			<a class="secondary top-button" href="/crates">Crates</a>
			<a class="secondary top-button" href="/builder">Builder</a>
			<a class="secondary top-button" href="/extra-info">Extra Info</a>
		</div>
	</header>

	<section class="hero-panel">
		<div class="hero-copy">
			<p class="eyebrow">Personal Config</p>
			<h1>Settings</h1>
			<p class="description">
				Control your theme, text casing, and the base luck multiplier used when item odds are shown.
			</p>
		</div>

	</section>

	<section class="settings-grid">
		<article class="settings-card">
			<div class="card-header">
				<p class="eyebrow">Theme</p>
				<h2>Site Theme</h2>
			</div>
			<p class="card-copy">Choose the look you want the wiki to use everywhere.</p>
			<div class="theme-options">
				<button
					type="button"
					class:active-option={currentTheme === "dark"}
					onclick={() => setThemeMode("dark")}
				>
					Dark
				</button>
				<button
					type="button"
					class:active-option={currentTheme === "light"}
					onclick={() => setThemeMode("light")}
				>
					Light
				</button>
			</div>
		</article>

		<article class="settings-card">
			<div class="card-header">
				<p class="eyebrow">Text</p>
				<h2>Text Case</h2>
			</div>
			<p class="card-copy">Toggle the site's all-lowercase styling on or off.</p>
			<div class="theme-options">
				<button
					type="button"
					class:active-option={currentTextCase === "lowercase"}
					onclick={() => setTextCaseMode("lowercase")}
				>
					Lowercase
				</button>
				<button
					type="button"
					class:active-option={currentTextCase === "normal"}
					onclick={() => setTextCaseMode("normal")}
				>
					Normal
				</button>
			</div>
		</article>

		<article class="settings-card">
			<div class="card-header">
				<p class="eyebrow">Luck</p>
				<h2>Base Luck</h2>
			</div>
			<p class="card-copy">
				This is your permanent luck multiplier before any potion, shiny luck, or mythic luck is applied.
			</p>
			<label class="field-label" for="base-luck-input">Base luck multiplier</label>
			<div class="base-luck-row">
				<input
					id="base-luck-input"
					type="number"
					min="0.01"
					step="0.01"
					inputmode="decimal"
					value={baseLuckInput}
					oninput={handleBaseLuckInput}
					onblur={applyBaseLuckInput}
				/>
				<button type="button" class="secondary control-button" onclick={applyBaseLuckInput}>
					Apply
				</button>
				<button type="button" class="secondary control-button" onclick={resetBaseLuck}>Reset</button>
			</div>
		</article>
	</section>
</main>

<style>
	.settings-shell {
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
	.settings-card,
	.theme-options button,
	.control-button,
	input {
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
	.theme-options button,
	.control-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.2rem;
		color: #f2f2f2;
		background: var(--surface-raised);
	}

	.theme-options button {
		padding: 0.65rem 1rem;
	}

	.primary {
		background: linear-gradient(135deg, #5c87ff, #3d6cff);
		border-color: rgba(79, 126, 255, 0.55);
	}

	.secondary {
		color: var(--text);
	}

	.hero-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		padding: 1.5rem;
	}

	.hero-copy,
	.settings-card {
		display: grid;
		gap: 0.9rem;
	}

	.settings-card {
		padding: 1.25rem;
	}

	.card-copy {
		color: var(--muted);
	}

	.eyebrow,
	.field-label {
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

	.description,
	.card-copy {
		margin: 0;
		line-height: 1.7;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	.theme-options,
	.base-luck-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.theme-options button,
	.control-button {
		color: var(--text);
	}

	.theme-options button.active-option {
		border-color: var(--border-strong);
		color: #a9c0ff;
	}

	input {
		min-width: 160px;
		padding: 0.9rem 1rem;
		color: var(--text);
		background: var(--surface-raised);
	}

	@media (max-width: 960px) {
		.settings-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 860px) {
		.hero-panel {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 780px) {
		.settings-shell {
			width: min(100% - 1rem, 1200px);
			padding-top: 1rem;
		}

		.topbar {
			flex-direction: column;
			align-items: stretch;
		}

		.topbar-actions {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		}
	}
</style>
