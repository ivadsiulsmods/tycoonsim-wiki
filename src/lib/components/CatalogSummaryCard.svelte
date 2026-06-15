<script lang="ts">
	import { onMount } from "svelte";
	import { DEFAULT_BASE_LUCK, readStoredBaseLuck } from "$lib/client-settings";
	import type { CatalogDetail, CatalogSummaryItem } from "$lib/types";

	type QuickStat = {
		label: string;
		value: string;
	};

	type Props = {
		item: CatalogSummaryItem;
	};

	let { item }: Props = $props();
	let baseLuckMultiplier = $state(DEFAULT_BASE_LUCK);

	onMount(() => {
		const syncBaseLuckMultiplier = () => {
			baseLuckMultiplier = readStoredBaseLuck();
		};

		const handleStorage = (event: StorageEvent) => {
			if (event.key === "tycoon-sim-wiki-base-luck" || event.key == null) {
				syncBaseLuckMultiplier();
			}
		};

		syncBaseLuckMultiplier();
		window.addEventListener("storage", handleStorage);

		return () => {
			window.removeEventListener("storage", handleStorage);
		};
	});

	const hasValue = (value: string): boolean => value.trim().toUpperCase() !== "N/A";
	const formatDisplayText = (value: string): string =>
		value.replace(/(^|[\s/-])([a-z])/g, (match, prefix: string, letter: string) => {
			return `${prefix}${letter.toUpperCase()}`;
		});
	const findDetailValue = (details: CatalogDetail[], label: string): string => {
		const detail = details.find((entry) => entry.label === label);
		return detail?.value.trim() ?? "N/A";
	};
	const formatCompactNumber = (value: number): string => {
		if (Number.isInteger(value) === true) {
			return value.toString();
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
	const stripWholeNumberDecimals = (value: string): string => {
		return value.replace(/(\d[\d,]*)\.00\b/g, "$1");
	};
	const normalizeQuickStatValue = (value: string): string => {
		return stripWholeNumberDecimals(value.trim());
	};
	const shortenOdds = (value: string): string => {
		const normalized = normalizeQuickStatValue(value);
		const compact = normalized.replace(/\s+/g, "");
		const match = compact.match(/^1\/([0-9,.]+)$/);

		if (match == null) {
			return normalized;
		}

		const denominator = Number(match[1].replaceAll(",", ""));

		if (Number.isNaN(denominator) === true) {
			return normalized;
		}

		return `1/${formatShortNumber(Math.max(denominator / baseLuckMultiplier, 1))}`;
	};
	const formatMultiplierValue = (value: string): string => {
		const normalized = normalizeQuickStatValue(value);

		if (hasValue(normalized) === false || normalized === "?" || normalized.endsWith("x")) {
			return normalized;
		}

		return `${normalized}x`;
	};
	const crate = $derived(formatDisplayText(item.defaultVariant.obtainmentMethod));
	const variantSummary = $derived(
		item.availableVariants.length > 0
			? item.availableVariants.map((variant) => formatDisplayText(variant)).join(", ")
			: "Base Only"
	);
	const rarityClass = $derived(
		`rarity-${item.defaultVariant.rarity.toLowerCase().replaceAll(" ", "-")}`
	);
	const quickStats = $derived.by<QuickStat[]>(() => {
		const details = item.defaultVariant.details;
		const stats: QuickStat[] = [];
		const typeValue = findDetailValue(details, "type").toLowerCase();
		const amountValue = findDetailValue(details, "amount");
		const oddsValue = findDetailValue(details, "odds");
		const sizeValue = findDetailValue(details, "size");

		if (item.category === "droppers") {
			const dropSpeed = findDetailValue(details, "drop speed");

			if (hasValue(dropSpeed)) {
				stats.push({ label: "drop speed", value: normalizeQuickStatValue(dropSpeed) });
			}
		}

		if (item.category === "upgraders") {
			if (hasValue(amountValue)) {
				stats.push({
					label: typeValue === "addative" ? "Amount" : "Multiplier",
					value:
						typeValue === "addative"
							? normalizeQuickStatValue(amountValue)
							: formatMultiplierValue(amountValue)
				});
			}
		}

		if (item.category === "furnaces") {
			const multiplier = findDetailValue(details, "multiplier");

			if (hasValue(multiplier)) {
				stats.push({ label: "Multiplier", value: formatMultiplierValue(multiplier) });
			}
		}

		if (hasValue(oddsValue)) {
			stats.push({ label: "Odds", value: shortenOdds(oddsValue) });
		}

		if (hasValue(sizeValue)) {
			stats.push({ label: "Size", value: normalizeQuickStatValue(sizeValue) });
		}

		return stats;
	});
	const summaryRows = $derived(
		[
			hasValue(item.defaultVariant.rarity)
				? {
						label: "Rarity Class",
						value: formatDisplayText(item.defaultVariant.rarity),
						className: "rarity-value"
					}
				: null,
			hasValue(item.categoryType)
				? { label: "Type", value: formatDisplayText(item.categoryType), className: "" }
				: null,
			hasValue(variantSummary)
				? { label: "Shiny/Mythic", value: variantSummary, className: "" }
				: null,
			hasValue(crate) ? { label: "Crate", value: crate, className: "" } : null
		].filter((row) => row !== null)
	);
</script>

<a class={`summary-card ${rarityClass}`} href={`/catalog/${item.category}/${item.slug}`}>
	<p class="type">{formatDisplayText(item.categoryLabel)}</p>
	<h3>{formatDisplayText(item.name)}</h3>

	{#if quickStats.length > 0}
		<div class="quick-stats" aria-label="quick item stats">
			{#each quickStats as stat}
				<div>
					<p>{stat.label}</p>
					<strong>{stat.value}</strong>
				</div>
			{/each}
		</div>
	{/if}

	{#if summaryRows.length > 0}
		<dl>
			{#each summaryRows as row}
				<div>
					<dt>{row.label}</dt>
					<dd class={row.className}>{row.value}</dd>
				</div>
			{/each}
		</dl>
	{/if}
</a>

<style>
	.summary-card {
		--rarity-color: rgba(255, 255, 255, 0.12);
		display: grid;
		gap: 0.9rem;
		padding: 1rem;
		border: 1px solid var(--rarity-color);
		background: var(--card-bg);
		color: var(--text);
		text-transform: var(--site-text-transform);
	}

	.summary-card:hover {
		border-color: var(--border-strong);
	}

	.type,
	dt {
		margin: 0;
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		color: var(--muted);
	}

	h3 {
		margin: 0;
		font-size: 1.22rem;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
		padding: 0.8rem 0 0.2rem;
		border-top: 1px solid var(--line);
	}

	.quick-stats div {
		display: grid;
		gap: 0.2rem;
		padding: 0.6rem 0.65rem;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--surface-soft) 70%, transparent);
	}

	.quick-stats p,
	.quick-stats strong {
		margin: 0;
	}

	.quick-stats p {
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		color: #8fb0ff;
	}

	.quick-stats strong {
		font-size: 0.92rem;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	dl {
		display: grid;
		gap: 0.8rem;
		margin: 0;
	}

	dl div {
		display: grid;
		gap: 0.18rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
	}

	dd {
		margin: 0;
		line-height: 1.5;
		overflow-wrap: anywhere;
	}

	.rarity-value {
		color: var(--rarity-color);
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
</style>
