<script lang="ts">
	import CatalogSummaryCard from "$lib/components/CatalogSummaryCard.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import type { CatalogSection, CategoryKey } from "$lib/types";

	type IndexSectionKey = CategoryKey | "all";

	type VisibleSection = {
		description: string;
		items: CatalogSection["items"];
		key: IndexSectionKey;
		label: string;
	};

	type PageData = {
		sections: CatalogSection[];
		totalItems: number;
	};

	type SortKey = "name-asc" | "name-desc" | "rarity-asc" | "rarity-desc" | "category";
	type SortOption = {
		key: SortKey;
		label: string;
	};

	const joinGameUrl = "https://www.roblox.com/games/start?placeId=123076957357158";
	const rarityOrder = ["common", "uncommon", "rare", "epic", "legendary", "secret"];
	const categoryOrder: Record<CategoryKey, number> = {
		droppers: 0,
		upgraders: 1,
		furnaces: 2
	};

	let { data }: { data: PageData } = $props();

	let activeSection = $state<IndexSectionKey>("all");
	let query = $state("");
	let sortKey = $state<SortKey>("name-asc");
	let sortMenuOpen = $state(false);

	const baseSortOptions: SortOption[] = [
		{ key: "name-asc", label: "name: a to z" },
		{ key: "name-desc", label: "name: z to a" },
		{ key: "rarity-asc", label: "rarity: low to high" },
		{ key: "rarity-desc", label: "rarity: high to low" }
	];

	const compareByName = (
		left: CatalogSection["items"][number],
		right: CatalogSection["items"][number]
	): number => left.name.localeCompare(right.name);

	const compareByRarity = (
		left: CatalogSection["items"][number],
		right: CatalogSection["items"][number]
	): number =>
		rarityOrder.indexOf(left.defaultVariant.rarity.toLowerCase()) -
		rarityOrder.indexOf(right.defaultVariant.rarity.toLowerCase());

	const sortItems = (items: CatalogSection["items"]): CatalogSection["items"] => {
		const sorted = [...items];

		if (sortKey === "name-desc") {
			return sorted.sort((left, right) => compareByName(right, left));
		}

		if (sortKey === "rarity-asc") {
			return sorted.sort((left, right) => {
				const rarityDifference = compareByRarity(left, right);
				return rarityDifference !== 0 ? rarityDifference : compareByName(left, right);
			});
		}

		if (sortKey === "rarity-desc") {
			return sorted.sort((left, right) => {
				const rarityDifference = compareByRarity(right, left);
				return rarityDifference !== 0 ? rarityDifference : compareByName(left, right);
			});
		}

		if (sortKey === "category") {
			return sorted.sort((left, right) => {
				const categoryDifference = categoryOrder[left.category] - categoryOrder[right.category];
				return categoryDifference !== 0 ? categoryDifference : compareByName(left, right);
			});
		}

		return sorted.sort(compareByName);
	};

	$effect(() => {
		const firstSection = visibleSections[0];
		const hasActiveSection = data.sections.some((section) => section.key === activeSection);
		const isAllSectionActive = activeSection === "all";

		if (hasActiveSection === false && isAllSectionActive === false && firstSection != null) {
			activeSection = firstSection.key;
		}
	});

	$effect(() => {
		if (activeSection !== "all" && sortKey === "category") {
			sortKey = "name-asc";
		}
	});

	const availableSortOptions = $derived<SortOption[]>(
		activeSection === "all"
			? [...baseSortOptions, { key: "category", label: "category" }]
			: baseSortOptions
	);

	const activeSortLabel = $derived(
		availableSortOptions.find((option) => option.key === sortKey)?.label ?? "name: a to z"
	);

	const visibleSections = $derived.by<VisibleSection[]>(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const filteredSections = data.sections.map((section) => {
			const filteredItems =
				normalizedQuery === ""
					? section.items
					: section.items.filter((item) => item.searchText.includes(normalizedQuery));

			return {
				...section,
				items: sortItems(filteredItems)
			};
		});
		const allItems = sortItems(filteredSections.flatMap((section) => section.items));

		return [
			{
				key: "all",
				label: "all",
				description: "every catalog item from every category in one view.",
				items: allItems
			},
			...filteredSections
		];
	});

	const currentSection = $derived(
		visibleSections.find((section) => section.key === activeSection) ?? visibleSections[0]
	);
</script>

<svelte:head>
	<title>drillbit index</title>
	<meta
		name="description"
		content="browse drillbit droppers, upgraders, and furnaces sourced from the live community spreadsheet."
	/>
</svelte:head>

<main class="catalog-shell">
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

	<section class="catalog-top">
		<div>
			<h1>the drillbit <span>index</span></h1>
			<p class="intro">a community-made spreadsheet of most drillbit items</p>
		</div>

		<div class="stats">
			<div>
				<strong>{data.totalItems}</strong>
				<span>unique items</span>
			</div>
			<div>
				<strong>{data.sections.length}</strong>
				<span>categories</span>
			</div>
		</div>
	</section>

	<section class="toolbar">
		<div class="toolbar-row">
			<div class="tabs" aria-label="catalog sections">
				{#each visibleSections as section}
					<button
						type="button"
						class:active={section.key === activeSection}
						onclick={() => {
							activeSection = section.key;
						}}
					>
						<span>{section.label}</span>
						<small>{section.items.length}</small>
					</button>
				{/each}
			</div>

			<div
				class="sort-menu"
				tabindex="-1"
				onfocusout={(event) => {
					const nextTarget = event.relatedTarget;

					if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
						return;
					}

					sortMenuOpen = false;
				}}
			>
				<span>sort by</span>
				<button
					type="button"
					class="sort-trigger"
					aria-expanded={sortMenuOpen}
					aria-haspopup="menu"
					onclick={() => {
						sortMenuOpen = !sortMenuOpen;
					}}
				>
					<strong>{activeSortLabel}</strong>
					<small>{sortMenuOpen ? "−" : "+"}</small>
				</button>

				{#if sortMenuOpen}
					<div class="sort-options" role="menu" aria-label="sort options">
						{#each availableSortOptions as option}
							<button
								type="button"
								role="menuitemradio"
								aria-checked={option.key === sortKey}
								class:active-option={option.key === sortKey}
								onclick={() => {
									sortKey = option.key;
									sortMenuOpen = false;
								}}
							>
								<span>{option.label}</span>
								{#if option.key === sortKey}
									<small>active</small>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<label class="search">
			<span>search items</span>
			<input bind:value={query} placeholder="type a name, rarity, effect, or crate..." />
		</label>
	</section>

	{#if currentSection}
		<section class="section-header">
			<div>
				<p class="section-label">{currentSection.label}</p>
				<h2>{currentSection.items.length} results</h2>
			</div>
		</section>

		{#if currentSection.items.length > 0}
			<section class="grid" aria-label="{currentSection.label} items">
				{#each currentSection.items as item}
					<CatalogSummaryCard {item} />
				{/each}
			</section>
		{:else}
			<div class="empty-state">
				<h3>no items match that search.</h3>
				<p>try a broader item name, rarity, effect, or crate keyword.</p>
			</div>
		{/if}
	{/if}
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
	.top-button,
	.tabs button,
	.search input,
	.sort-trigger,
	.sort-options button {
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
	.toolbar,
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
		text-transform: lowercase;
	}

	h2 {
		font-size: clamp(1.6rem, 4vw, 2.2rem);
	}

	h1 span {
		color: var(--accent);
	}

	.intro,
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

	.toolbar {
		position: sticky;
		top: 1rem;
		z-index: 2;
		display: grid;
		gap: 1rem;
		padding: 1rem;
	}

	.toolbar-row {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		flex: 1 1 auto;
	}

	.tabs button {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.8rem 1rem;
		color: var(--text);
	}

	.tabs button.active {
		border-color: var(--border-strong);
		color: #a9c0ff;
	}

	.tabs small {
		padding: 0.2rem 0.45rem;
		background: var(--surface-soft);
		color: var(--muted);
	}

	.tabs button.active small {
		color: #c4d3ff;
	}

	.search {
		display: grid;
		gap: 0.45rem;
	}

	.sort-menu {
		position: relative;
		display: grid;
		gap: 0.45rem;
		min-width: 220px;
	}

	.search span {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.sort-menu span {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.search input {
		width: 100%;
		padding: 0.95rem 1rem;
		color: var(--text);
	}

	.sort-trigger {
		width: 100%;
		padding: 0.95rem 1rem;
		color: var(--text);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		text-align: left;
	}

	.sort-trigger strong,
	.sort-trigger small {
		font-size: 0.9rem;
		font-weight: 400;
	}

	.sort-options {
		position: absolute;
		top: calc(100% + 0.4rem);
		right: 0;
		left: 0;
		display: grid;
		gap: 0.35rem;
		padding: 0.4rem;
		border: 1px solid var(--border);
		background: var(--panel);
		box-shadow: var(--shadow);
	}

	.sort-options button {
		padding: 0.8rem 0.9rem;
		color: var(--text);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		text-align: left;
	}

	.sort-options button.active-option {
		border-color: var(--border-strong);
		color: #a9c0ff;
	}

	.sort-options small {
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

	.empty-state {
		padding: 3rem 1rem;
		text-align: center;
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.empty-state h3 {
		margin: 0 0 0.4rem;
		font-size: 1.4rem;
	}

	.empty-state p {
		margin: 0;
		color: var(--muted);
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
			grid-template-columns: 1fr 1fr auto;
		}

		.toolbar-row {
			flex-direction: column;
		}

		.sort-menu {
			width: 100%;
			min-width: 0;
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
