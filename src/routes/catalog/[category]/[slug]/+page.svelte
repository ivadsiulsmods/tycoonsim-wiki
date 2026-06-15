<script lang="ts">
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import "katex/dist/katex.min.css";
	import katex from "katex";
	import type { CatalogSummaryItem, CatalogVariant } from "$lib/types";

	type PageData = {
		item: CatalogSummaryItem;
	};

	type LambdaExtraEffectOutcome = {
		description: string;
		math: string;
	};

	type LambdaDescription = {
		outcomes: LambdaExtraEffectOutcome[];
		survivalFormulaText: string;
	};

	type LambdaFormula = {
		description: string;
		latex: string;
	};

	type SummaryRow = {
		label: string;
		value: string;
	};

	type LuckControlKey = "luck" | "shiny" | "mythic";

	type LuckOption = {
		boostPercent: number;
		key: string;
		label: string;
	};

	type LinkedTextSegment = {
		href?: string;
		text: string;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
	const lambdaDesmosUrl = "https://www.desmos.com/calculator/7gs3pmi3au";
	const luckOptions: LuckOption[] = [
		{ key: "none", label: "no luck", boostPercent: 0 },
		{ key: "luck-1", label: "luck i", boostPercent: 5 },
		{ key: "luck-2", label: "luck ii", boostPercent: 10 },
		{ key: "luck-3", label: "luck iii", boostPercent: 25 },
		{ key: "luck-4", label: "luck iv", boostPercent: 50 },
		{ key: "luck-5", label: "luck v", boostPercent: 100 },
		{ key: "luck-6", label: "luck vi", boostPercent: 200 }
	];
	const baseLambdaDescription: LambdaDescription = {
		outcomes: [
			{ description: "multiply the ore by 3.2", math: "1/19" },
			{ description: "add 1,000 value", math: "1/19" },
			{ description: "create an explosion", math: "1/19" },
			{ description: "set the ore value to 1", math: "1/19" },
			{ description: "multiply the ore by 6 and apply sparkle", math: "1/19" },
			{ description: "multiply the ore by 2.2", math: "13/19" }
		],
		survivalFormulaText: "1.5^(n - 1) / n!"
	};
	const shinyLambdaDescription: LambdaDescription = {
		outcomes: [
			{ description: "multiply the ore by 3.52", math: "1/19" },
			{ description: "add 1,100 value", math: "1/19" },
			{ description: "create an explosion", math: "1/19" },
			{ description: "set the ore value to 1", math: "1/19" },
			{ description: "fling the ore and multiply it by 2.42", math: "1/19" },
			{ description: "multiply the ore by 6.6 and apply the sparkle effect to the ore", math: "1/19" },
			{ description: "multiply the ore by 2.42", math: "13/19" }
		],
		survivalFormulaText: "1.5^(n-1) / n!"
	};
	const lambdaFormulas: LambdaFormula[] = [
		{
			description: "general survival chance after n uses",
			latex:
				String.raw`P(\text{survive after } n)=\prod_{k=1}^{n}\frac{1.5}{k}=\frac{1.5^n}{n!}`
		},
		{
			description: "survival chance after n uses when the first use starts at k = 2",
			latex:
				String.raw`P(\text{survive after } n,\text{ using }k=2\text{ first})=\prod_{k=2}^{n}\frac{1.5}{k}=\frac{1.5^{n-1}}{n!}`
		}
	];
	const crateNames = [
		"Futuristic Crate",
		"Advanced Crate",
		"Factory Crate",
		"Quarry Crate",
		"Basic Crate"
	];
	const crateSlugByName = new Map(
		crateNames.map((name) => [
			name.toLowerCase(),
			name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "")
		])
	);
	const crateMentionPattern = new RegExp(
		crateNames
			.toSorted((left, right) => right.length - left.length)
			.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
			.join("|"),
		"gi"
	);

	let { data }: { data: PageData } = $props();
	const hasValue = (value: string): boolean => value.trim().toUpperCase() !== "N/A";

	let activeVariant = $state("N/A");
	let openLuckMenu = $state<LuckControlKey | null>(null);
	let selectedLuckKey = $state("none");
	let selectedShinyLuckKey = $state("none");
	let selectedMythicLuckKey = $state("none");

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
	const getLuckOption = (key: string): LuckOption =>
		luckOptions.find((option) => option.key === key) ?? luckOptions[0];
	const getLuckSelectionKey = (controlKey: LuckControlKey): string => {
		if (controlKey === "shiny") {
			return selectedShinyLuckKey;
		}

		if (controlKey === "mythic") {
			return selectedMythicLuckKey;
		}

		return selectedLuckKey;
	};
	const setLuckSelectionKey = (controlKey: LuckControlKey, optionKey: string) => {
		if (controlKey === "shiny") {
			selectedShinyLuckKey = optionKey;
			return;
		}

		if (controlKey === "mythic") {
			selectedMythicLuckKey = optionKey;
			return;
		}

		selectedLuckKey = optionKey;
	};
	const getLuckControlLabel = (controlKey: LuckControlKey): string => {
		const selectedOption = getLuckOption(getLuckSelectionKey(controlKey));

		if (selectedOption.boostPercent > 0) {
			if (controlKey === "shiny") {
				return `shiny ${selectedOption.label}`;
			}

			if (controlKey === "mythic") {
				return `mythic ${selectedOption.label}`;
			}

			return selectedOption.label;
		}

		if (controlKey === "shiny") {
			return "no shiny";
		}

		if (controlKey === "mythic") {
			return "no mythic";
		}

		return selectedOption.label;
	};
	const visibleLuckControls = $derived.by<LuckControlKey[]>(() => {
		const controls: LuckControlKey[] = ["luck"];
		const normalizedVariant = selectedVariant.variant.toLowerCase();

		if (normalizedVariant.includes("shiny")) {
			controls.push("shiny");
		}

		if (normalizedVariant.includes("mythic")) {
			controls.push("mythic");
		}

		return controls;
	});
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
	const normalizeOddsValue = (value: string): string => value.trim().replace(/(\d[\d,]*)\.00\b/g, "$1");
	const parseOddsDenominator = (value: string): number | null => {
		const normalized = normalizeOddsValue(value).replace(/\s+/g, "");
		const match = normalized.match(/^1\/([0-9,.]+)$/);

		if (match == null) {
			return null;
		}

		const denominator = Number(match[1].replaceAll(",", ""));

		if (Number.isNaN(denominator) === true) {
			return null;
		}

		return denominator;
	};
	const getLuckOddsMultiplier = (controlKey: LuckControlKey): number => {
		const selectedOption = getLuckOption(getLuckSelectionKey(controlKey));

		return 1 + selectedOption.boostPercent / 200;
	};
	const getDisplayedOddsValue = (value: string): string => {
		const denominator = parseOddsDenominator(value);

		if (denominator == null) {
			return value;
		}

		let adjustedDenominator = denominator;

		for (const controlKey of visibleLuckControls) {
			adjustedDenominator /= getLuckOddsMultiplier(controlKey);
		}

		return `1/${formatShortNumber(Math.max(adjustedDenominator, 1))}`;
	};

	const summaryRows = $derived<SummaryRow[]>(
		[
			hasValue(selectedVariant.rarity)
				? { label: "rarity class", value: selectedVariant.rarity }
				: null,
			hasValue(data.item.categoryType) ? { label: "type", value: data.item.categoryType } : null,
			hasValue(selectedVariant.obtainmentMethod)
				? { label: "crate", value: selectedVariant.obtainmentMethod }
				: null,
			data.item.availableVariants.length > 0
				? { label: "available forms", value: data.item.availableVariants.join(", ") }
				: null
		].filter((row) => row !== null)
	);

	const visibleDetails = $derived(selectedVariant.details.filter((detail) => hasValue(detail.value)));

	const isLambdaExtraEffectDetail = (label: string): boolean =>
		data.item.name.toLowerCase() === "lambda upgrader" && label === "extra effect";
	const activeLambdaDescription = $derived<LambdaDescription>(
		selectedVariant.variant.toLowerCase() === "shiny" ? shinyLambdaDescription : baseLambdaDescription
	);

	const renderDisplayMath = (latex: string): string =>
		katex.renderToString(latex, {
			displayMode: true,
			throwOnError: false
		});

	const linkifyCrateMentions = (value: string): LinkedTextSegment[] => {
		const segments: LinkedTextSegment[] = [];
		let cursor = 0;

		for (const match of value.matchAll(crateMentionPattern)) {
			const matchedText = match[0];
			const startIndex = match.index ?? 0;

			if (startIndex > cursor) {
				segments.push({
					text: value.slice(cursor, startIndex)
				});
			}

			const slug = crateSlugByName.get(matchedText.toLowerCase());

			if (slug == null) {
				segments.push({ text: matchedText });
			} else {
				segments.push({
					href: `/crates/${slug}`,
					text: matchedText
				});
			}

			cursor = startIndex + matchedText.length;
		}

		if (cursor < value.length) {
			segments.push({
				text: value.slice(cursor)
			});
		}

		return segments.length > 0 ? segments : [{ text: value }];
	};
</script>

<svelte:head>
	<title>{data.item.name} | tycoon simulator wiki</title>
	<meta name="description" content={`view full tycoon simulator item info for ${data.item.name}.`} />
</svelte:head>

<main class="detail-shell">
	<header class="topbar">
		<a class="brand" href="/">tycoon sim wiki</a>
		<div class="topbar-actions">
			<a class="primary top-button" href={joinGameUrl} target="_blank" rel="noreferrer"
				>join the game</a
			>
			<a class="secondary top-button" href="/extra-info">extra info</a>
			<a class="secondary top-button" href="/crates">crates</a>
			<a class="secondary top-button" href="/builder">builder</a>
			<ThemeToggle />
		</div>
	</header>

	<section class="detail-top">
		<div>
			<a class="back-link" href="/catalog">back to index</a>
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
					openLuckMenu = null;
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

		{#if summaryRows.length > 0}
			<div class="summary-grid">
				{#each summaryRows as row}
					<div>
						<dt>{row.label}</dt>
						<dd>
							{#if row.label === "crate"}
								{#each linkifyCrateMentions(row.value) as segment}
									{#if segment.href != null}
										<a class="detail-link" href={segment.href}>{segment.text}</a>
									{:else}
										{segment.text}
									{/if}
								{/each}
							{:else}
								{row.value}
							{/if}
						</dd>
					</div>
				{/each}
			</div>
		{/if}

		{#if visibleDetails.length > 0}
			<dl class="details-list">
				{#each visibleDetails as detail}
					<div class:odds-detail-row={detail.label === "odds"}>
						<dt>{detail.label}</dt>
						<dd class:odds-detail-value={detail.label === "odds"}>
							{#if isLambdaExtraEffectDetail(detail.label)}
								<div class="lambda-extra-effect">
									<p>
										Each upgrade has a
										<span class="math-text">1 - (1.5 / n)</span>
										chance to destroy the ore, where
										<span class="math-text">n = upgrade count</span>.
									</p>
									<p>If the ore survives, one of these effects happens:</p>
									<ul>
										{#each activeLambdaDescription.outcomes as outcome}
											<li>
												<span class="math-text">{outcome.math}</span>
												chance to {outcome.description}.
											</li>
										{/each}
									</ul>
									<p>
										Total survival chance after
										<span class="math-text">n</span>
										upgrades:
										<span class="math-text">{activeLambdaDescription.survivalFormulaText}</span>
									</p>
									<p>
										Click <a class="detail-link" href={lambdaDesmosUrl} target="_blank" rel="noreferrer"
											>here</a
										> to graph this formula on Desmos.
									</p>
									<div class="lambda-formulas" aria-label="lambda survival formulas">
										{#each lambdaFormulas as formula}
											<div class="lambda-formula">
												<span class="sr-only">{formula.description}</span>
												{@html renderDisplayMath(formula.latex)}
											</div>
										{/each}
									</div>
								</div>
							{:else if detail.label === "odds"}
								<div class="odds-display-line">
									<span class="odds-value-text">{getDisplayedOddsValue(detail.value)}</span>
									<div class="luck-controls">
										{#each visibleLuckControls as controlKey}
											<div class="luck-control">
												<button
													type="button"
													class="luck-button"
													class:active={openLuckMenu === controlKey}
													aria-expanded={openLuckMenu === controlKey}
													onclick={() => {
														openLuckMenu = openLuckMenu === controlKey ? null : controlKey;
													}}
												>
													<strong>{getLuckControlLabel(controlKey)}</strong>
												</button>

												{#if openLuckMenu === controlKey}
													<div class="luck-dropdown">
														{#each luckOptions as option}
															<button
																type="button"
																class:selected-luck-option={getLuckSelectionKey(controlKey) === option.key}
																onclick={() => {
																	setLuckSelectionKey(controlKey, option.key);
																	openLuckMenu = null;
																}}
															>
																<span>{option.label}</span>
																<small>
																	{option.boostPercent === 0
																		? "no boost"
																		: `+${option.boostPercent}% luck`}
																</small>
															</button>
														{/each}
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{:else}
								{#each detail.segments as segment}
									{#if segment.href != null}
										<a class="detail-link" href={segment.href} target="_blank" rel="noreferrer">
											{segment.text}
										</a>
									{:else}
										{segment.text}
									{/if}
								{/each}
							{/if}
						</dd>
					</div>
				{/each}
			</dl>
		{/if}
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

	.odds-detail-row {
		position: relative;
	}

	dd {
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	.odds-detail-value {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		white-space: normal;
	}

	.odds-display-line {
		display: inline-flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 0.45rem;
		width: fit-content;
		max-width: 100%;
	}

	.odds-value-text {
		white-space: nowrap;
	}

	.luck-controls {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.45rem;
		flex: none;
	}

	.luck-control {
		position: relative;
	}

	.luck-button {
		display: inline-flex;
		align-items: center;
		padding: 0.28rem 0.55rem;
		border: 1px solid var(--border);
		background: var(--surface-raised);
		color: var(--text);
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-transform: lowercase;
		width: auto;
		flex: none;
		white-space: nowrap;
	}

	.luck-button.active {
		border-color: var(--border-strong);
		color: #a9c0ff;
	}

	.luck-button strong {
		font-size: 0.72rem;
		font-weight: 400;
		color: #ffffff;
	}

	.luck-dropdown {
		position: absolute;
		bottom: calc(100% + 0.35rem);
		right: 0;
		z-index: 3;
		display: grid;
		gap: 0.3rem;
		min-width: 200px;
		padding: 0.35rem;
		border: 1px solid var(--border);
		background: color-mix(in srgb, var(--card-bg) 72%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow:
			inset 0 1px 0 0 var(--border),
			var(--shadow);
	}

	.luck-dropdown button {
		display: grid;
		gap: 0.15rem;
		padding: 0.6rem 0.65rem;
		border: 1px solid var(--line);
		background: var(--panel);
		color: var(--text);
		text-align: left;
		text-transform: lowercase;
	}

	.luck-dropdown button small {
		color: #8fb0ff;
	}

	.luck-dropdown button.selected-luck-option {
		border-color: #5c87ff;
	}

	.lambda-extra-effect {
		display: grid;
		gap: 0.7rem;
	}

	.lambda-extra-effect p,
	.lambda-extra-effect ul {
		margin: 0;
	}

	.lambda-extra-effect ul {
		padding-left: 1.15rem;
	}

	.lambda-extra-effect li + li {
		margin-top: 0.25rem;
	}

	.lambda-formulas {
		display: grid;
		gap: 0.6rem;
		padding-top: 0.2rem;
	}

	.lambda-formula {
		overflow-x: auto;
		padding: 0.85rem 1rem;
		border: 1px solid var(--line);
	}

	.math-text {
		color: #5ea7ff;
		font-family: "Cambria Math", "STIX Two Math", "Times New Roman", serif;
		font-style: italic;
	}

	:global(.katex-display) {
		margin: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.detail-link {
		color: #8fb0ff;
		text-decoration: underline;
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
			grid-template-columns: 1fr 1fr 1fr auto;
		}

		.detail-header {
			flex-direction: column;
		}
	}
</style>
