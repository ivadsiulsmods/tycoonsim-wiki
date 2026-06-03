import { error } from "@sveltejs/kit";
import type { CatalogSection, CatalogSummaryItem, CatalogVariant, CategoryKey } from "$lib/types";

const SHEET_ID = "1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU";

const SECTION_CONFIG: Array<{
	description: string;
	key: CategoryKey;
	label: string;
	sheet: string;
	type: string;
}> = [
	{
		key: "droppers",
		label: "droppers",
		sheet: "Droppers",
		type: "dropper",
		description: "ore producers, variants, rarity, and crate sources."
	},
	{
		key: "upgraders",
		label: "upgraders",
		sheet: "Upgraders",
		type: "upgrader",
		description: "value boosters, effect applicators, and route planning pieces."
	},
	{
		key: "furnaces",
		label: "furnaces",
		sheet: "Furnaces",
		type: "furnace",
		description: "end-line processors, multipliers, and special finish effects."
	}
];

type RawCatalogItem = {
	category: CategoryKey;
	categoryLabel: string;
	categoryType: string;
	details: Array<{
		label: string;
		value: string;
	}>;
	name: string;
	obtainmentMethod: string;
	rarity: string;
	searchText: string;
	variant: string;
};

const variantPriority = ["N/A", "Shiny", "Mythic", "Shiny Mythic"];

const isNotAvailable = (value: string | null | undefined): boolean => {
	return typeof value === "string" && value.trim() === "N/A";
};

const toDisplayValue = (value: string | null | undefined): string => {
	if (value == null) {
		return "N/A";
	}

	if (value.trim() === "") {
		return "N/A";
	}

	return value;
};

const normalizeLabel = (label: string): string => {
	const normalized = label.toLowerCase();

	if (normalized === "multiplyer") {
		return "multiplier";
	}

	return normalized;
};

const normalizeObtainmentMethod = (value: string): string => {
	if (isNotAvailable(value)) {
		return value;
	}

	return value
		.replace(/^obtained from\s+/i, "")
		.replace(/^obtained through\s+/i, "")
		.trim()
		.toLowerCase();
};

const slugify = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const parseCsv = (payload: string): string[][] => {
	const rows: string[][] = [];
	let currentRow: string[] = [];
	let currentValue = "";
	let index = 0;
	let inQuotes = false;

	while (index < payload.length) {
		const character = payload[index];

		if (character === "\"") {
			const nextCharacter = payload[index + 1];

			if (inQuotes === true && nextCharacter === "\"") {
				currentValue += "\"";
				index += 2;
				continue;
			}

			inQuotes = inQuotes === false;
			index += 1;
			continue;
		}

		if (inQuotes === false && character === ",") {
			currentRow.push(currentValue);
			currentValue = "";
			index += 1;
			continue;
		}

		if (inQuotes === false && (character === "\n" || character === "\r")) {
			currentRow.push(currentValue);
			rows.push(currentRow);
			currentRow = [];
			currentValue = "";

			if (character === "\r" && payload[index + 1] === "\n") {
				index += 2;
				continue;
			}

			index += 1;
			continue;
		}

		currentValue += character;
		index += 1;
	}

	if (currentValue !== "" || currentRow.length > 0) {
		currentRow.push(currentValue);
		rows.push(currentRow);
	}

	return rows.filter((row) => row.some((value) => value.trim() !== ""));
};

const normalizeVariant = (item: RawCatalogItem): CatalogVariant => ({
	details: item.details,
	obtainmentMethod: item.obtainmentMethod,
	rarity: item.rarity,
	searchText: item.searchText,
	variant: item.variant
});

const getVariantOrder = (variant: string) => {
	const index = variantPriority.indexOf(variant);
	return index === -1 ? variantPriority.length : index;
};

const groupItems = (items: RawCatalogItem[]): CatalogSummaryItem[] => {
	const groups = new Map<string, RawCatalogItem[]>();

	for (const item of items) {
		const key = `${item.category}:${item.name.toLowerCase()}`;
		const existing = groups.get(key) ?? [];
		existing.push(item);
		groups.set(key, existing);
	}

	return Array.from(groups.values())
		.map((group) => {
			group.sort((a, b) => getVariantOrder(a.variant) - getVariantOrder(b.variant));

			const first = group[0];
			const variants = group.map(normalizeVariant);
			const defaultVariant =
				variants.find((variant) => variant.variant === "N/A") ??
				variants.find((variant) => variant.variant === "Shiny") ??
				variants[0];

			return {
				availableVariants: variants
					.filter((variant) => variant.variant !== "N/A")
					.map((variant) => variant.variant.toLowerCase()),
				category: first.category,
				categoryLabel: first.categoryLabel,
				categoryType: first.categoryType,
				defaultVariant,
				name: first.name.toLowerCase(),
				searchText: group
					.flatMap((item) => [item.name, item.variant, item.rarity, item.obtainmentMethod, item.searchText])
					.join(" ")
					.toLowerCase(),
				slug: slugify(first.name),
				variants
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
};

const normalizeSection = (
	key: CategoryKey,
	label: string,
	description: string,
	type: string,
	rows: string[][]
): CatalogSection => {
	const [headerRow = [], ...dataRows] = rows;
	const columns = headerRow.map((column) => column.trim()).filter((column) => column !== "");

	const rawItems = dataRows
		.map((row): RawCatalogItem | null => {
			const values = columns.map((_, index) => toDisplayValue(row[index]));
			const rowMap = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
			const name = rowMap["Name"];

			if (name == null || isNotAvailable(name)) {
				return null;
			}

			const variant = rowMap["Variant"] ?? "N/A";
			const rarity = rowMap["Rarity"] ?? "N/A";
			const obtainmentMethod = normalizeObtainmentMethod(rowMap["Obtainment Method"] ?? "N/A");
			const details = columns
				.filter((column) => column !== "Name" && column !== "Variant")
				.map((column) => ({
					label: normalizeLabel(column),
					value:
						column === "Obtainment Method"
							? normalizeObtainmentMethod(rowMap[column] ?? "N/A")
							: rowMap[column] ?? "N/A"
				}));

			return {
				category: key,
				categoryLabel: label,
				categoryType: type,
				details,
				name,
				obtainmentMethod,
				rarity,
				searchText: Object.values(rowMap).join(" ").toLowerCase(),
				variant
			};
		})
		.filter((item): item is RawCatalogItem => item !== null);

	return {
		description,
		items: groupItems(rawItems),
		key,
		label
	};
};

export const getCatalogSections = async (fetchFn: typeof fetch): Promise<CatalogSection[]> => {
	const sections = await Promise.all(
		SECTION_CONFIG.map(async (section) => {
			const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(section.sheet)}`;
			const response = await fetchFn(url);

			if (response.ok === false) {
				throw new Error(`Failed to load ${section.label} from Google Sheets.`);
			}

			const payload = await response.text();
			const parsed = parseCsv(payload);

			return normalizeSection(
				section.key,
				section.label,
				section.description,
				section.type,
				parsed
			);
		})
	);

	return sections;
};

export const getCatalogItemByParams = async (
	fetchFn: typeof fetch,
	category: string,
	slug: string
): Promise<CatalogSummaryItem> => {
	const sections = await getCatalogSections(fetchFn);
	const section = sections.find((entry) => entry.key === category);

	if (section == null) {
		throw error(404, "category not found");
	}

	const item = section.items.find((entry) => entry.slug === slug);

	if (item == null) {
		throw error(404, "item not found");
	}

	return item;
};
