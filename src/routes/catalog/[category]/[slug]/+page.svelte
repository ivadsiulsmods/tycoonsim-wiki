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

	type LambdaFormula = {
		description: string;
		latex: string;
	};

	type SummaryRow = {
		label: string;
		value: string;
	};

	type LinkedTextSegment = {
		href?: string;
		text: string;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
	const lambdaDesmosUrl = "https://www.desmos.com/calculator/7gs3pmi3au";
	const lambdaExtraEffectOutcomes: LambdaExtraEffectOutcome[] = [
		{ description: "multiply the ore by 3.2", math: "1/19" },
		{ description: "add 1,000 value", math: "1/19" },
		{ description: "create an explosion", math: "1/19" },
		{ description: "set the ore value to 1", math: "1/19" },
		{ description: "multiply the ore by 6 and apply sparkle", math: "1/19" },
		{ description: "multiply the ore by 2.2", math: "13/19" }
	];
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
					<div>
						<dt>{detail.label}</dt>
						<dd>
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
										{#each lambdaExtraEffectOutcomes as outcome}
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
										<span class="math-text">1.5^(n - 1) / n!</span>
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

	dd {
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
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
