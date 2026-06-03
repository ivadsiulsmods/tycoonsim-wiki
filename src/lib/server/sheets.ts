import { error } from "@sveltejs/kit";
import * as XLSX from "xlsx";
import type {
	CatalogDetailSegment,
	CatalogSection,
	CatalogSummaryItem,
	CatalogVariant,
	CategoryKey
} from "$lib/types";

const SHEET_ID = "1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU";
const SECTION_CACHE_TTL_MS = 5 * 60 * 1000;

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

type SectionConfig = (typeof SECTION_CONFIG)[number];

type RawCatalogItem = {
	category: CategoryKey;
	categoryLabel: string;
	categoryType: string;
	details: Array<{
		label: string;
		segments: CatalogDetailSegment[];
		value: string;
	}>;
	name: string;
	obtainmentMethod: string;
	rarity: string;
	searchText: string;
	variant: string;
};

type SectionCacheEntry = {
	expiresAt: number;
	section: CatalogSection;
};

type WorkbookCacheEntry = {
	expiresAt: number;
	workbook: XLSX.WorkBook;
};

type ParsedSheetCell = {
	segments: CatalogDetailSegment[];
	value: string;
};

const sectionCache = new Map<CategoryKey, SectionCacheEntry>();
const inFlightSectionLoads = new Map<CategoryKey, Promise<CatalogSection>>();
let workbookCache: WorkbookCacheEntry | null = null;
let inFlightWorkbookLoad: Promise<XLSX.WorkBook> | null = null;

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

const normalizeSearchText = (value: string): string => value.trim().toLowerCase();

const slugify = (value: string): string =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const decodeXmlEntities = (value: string): string =>
	value
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", "\"")
		.replaceAll("&apos;", "'")
		.replaceAll("&#10;", "\n")
		.replaceAll("&#13;", "\r");

const mergeSegments = (segments: CatalogDetailSegment[]): CatalogDetailSegment[] => {
	const merged: CatalogDetailSegment[] = [];

	for (const segment of segments) {
		if (segment.text === "") {
			continue;
		}

		const previous = merged[merged.length - 1];

		if (previous != null && previous.href === segment.href) {
			previous.text += segment.text;
			continue;
		}

		merged.push({ ...segment });
	}

	return merged;
};

const parseCellSegments = (cell: XLSX.CellObject | undefined): CatalogDetailSegment[] => {
	const value = toDisplayValue(cell?.w ?? (cell?.v?.toString() ?? undefined));
	const href = cell?.l?.Target;

	if (typeof cell?.r !== "string") {
		return href == null ? [{ text: value }] : [{ href, text: value }];
	}

	const segments: CatalogDetailSegment[] = [];
	const runPattern = /<r>([\s\S]*?)<\/r>/g;

	for (const runMatch of cell.r.matchAll(runPattern)) {
		const runXml = runMatch[1];
		const isLinked = href != null && runXml.includes("<u/>");
		const textPattern = /<t(?: [^>]*)?>([\s\S]*?)<\/t>/g;

		for (const textMatch of runXml.matchAll(textPattern)) {
			segments.push({
				href: isLinked ? href : undefined,
				text: decodeXmlEntities(textMatch[1])
			});
		}
	}

	if (segments.length === 0) {
		return href == null ? [{ text: value }] : [{ href, text: value }];
	}

	const mergedSegments = mergeSegments(segments);

	if (href != null && mergedSegments.every((segment) => segment.href == null)) {
		return [{ href, text: value }];
	}

	return mergedSegments;
};

const parseSheetCell = (cell: XLSX.CellObject | undefined): ParsedSheetCell => {
	const segments = parseCellSegments(cell);

	return {
		segments,
		value: toDisplayValue(segments.map((segment) => segment.text).join(""))
	};
};

const getDetailCell = (
	rowMap: Record<string, ParsedSheetCell>,
	column: string
): { segments: CatalogDetailSegment[]; value: string } => {
	const cell = rowMap[column];
	const label = normalizeLabel(column);

	if (cell == null) {
		return {
			segments: [{ text: "N/A" }],
			value: "N/A"
		};
	}

	// Some furnace multiplier cells contain mixed text like "15.62 or 15.63".
	// Preserve any non-empty spreadsheet text verbatim instead of treating it like a failed number parse.
	if (label === "multiplier" && cell.value.trim() !== "") {
		return {
			segments: cell.segments,
			value: cell.value
		};
	}

	return {
		segments: cell.segments,
		value: cell.value
	};
};

const getSheetRows = (sheet: XLSX.WorkSheet): ParsedSheetCell[][] => {
	const reference = sheet["!ref"];

	if (typeof reference !== "string") {
		return [];
	}

	const range = XLSX.utils.decode_range(reference);
	const rows: ParsedSheetCell[][] = [];

	for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
		const row: ParsedSheetCell[] = [];

		for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
			const address = XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex });
			row.push(parseSheetCell(sheet[address]));
		}

		if (row.some((cell) => cell.value.trim() !== "")) {
			rows.push(row);
		}
	}

	return rows;
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
	rows: ParsedSheetCell[][]
): CatalogSection => {
	const [headerRow = [], ...dataRows] = rows;
	const columns = headerRow.map((column) => column.value.trim()).filter((column) => column !== "");

	const rawItems = dataRows
		.map((row): RawCatalogItem | null => {
			const cells = columns.map((_, index) => row[index] ?? parseSheetCell(undefined));
			const rowMap = Object.fromEntries(columns.map((column, index) => [column, cells[index]]));
			const name = rowMap["Name"]?.value;

			if (name == null || isNotAvailable(name)) {
				return null;
			}

			const variant = rowMap["Variant"]?.value ?? "N/A";
			const rarity = rowMap["Rarity"]?.value ?? "N/A";
			const obtainmentMethod = rowMap["Obtainment Method"]?.value ?? "N/A";
			const details = columns
				.filter((column) => column !== "Name" && column !== "Variant")
				.map((column) => {
					const detailCell = getDetailCell(rowMap, column);

					return {
						label: normalizeLabel(column),
						segments: detailCell.segments,
						value: detailCell.value
					};
				});

			return {
				category: key,
				categoryLabel: label,
				categoryType: type,
				details,
				name,
				obtainmentMethod,
				rarity,
				searchText: Object.values(rowMap)
					.map((cell) => normalizeSearchText(cell.value))
					.join(" "),
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

const loadWorkbook = async (fetchFn: typeof fetch): Promise<XLSX.WorkBook> => {
	const now = Date.now();

	if (workbookCache != null && workbookCache.expiresAt > now) {
		return workbookCache.workbook;
	}

	if (inFlightWorkbookLoad != null) {
		return inFlightWorkbookLoad;
	}

	inFlightWorkbookLoad = (async () => {
		const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
		const response = await fetchFn(url);

		if (response.ok === false) {
			throw new Error(`Received ${response.status} from Google Sheets.`);
		}

		const payload = await response.arrayBuffer();
		const workbook = XLSX.read(Buffer.from(payload), {
			cellFormula: false,
			type: "buffer"
		});

		workbookCache = {
			expiresAt: Date.now() + SECTION_CACHE_TTL_MS,
			workbook
		};

		return workbook;
	})();

	try {
		return await inFlightWorkbookLoad;
	} finally {
		inFlightWorkbookLoad = null;
	}
};

const getSectionConfig = (category: string): SectionConfig => {
	const section = SECTION_CONFIG.find((entry) => entry.key === category);

	if (section == null) {
		throw error(404, "category not found");
	}

	return section;
};

const loadSection = async (
	fetchFn: typeof fetch,
	section: SectionConfig
): Promise<CatalogSection> => {
	const now = Date.now();
	const cachedSection = sectionCache.get(section.key);

	if (cachedSection != null && cachedSection.expiresAt > now) {
		return cachedSection.section;
	}

	const inFlightLoad = inFlightSectionLoads.get(section.key);

	if (inFlightLoad != null) {
		return inFlightLoad;
	}

	const sectionLoad = (async () => {
		try {
			const workbook = await loadWorkbook(fetchFn);
			const sheet = workbook.Sheets[section.sheet];

			if (sheet == null) {
				throw new Error(`Sheet "${section.sheet}" was not found in the workbook export.`);
			}

			const normalizedSection = normalizeSection(
				section.key,
				section.label,
				section.description,
				section.type,
				getSheetRows(sheet)
			);

			sectionCache.set(section.key, {
				expiresAt: Date.now() + SECTION_CACHE_TTL_MS,
				section: normalizedSection
			});

			return normalizedSection;
		} catch (cause) {
			console.error(`Failed to load ${section.label} catalog data.`, cause);
			throw error(503, "catalog data is temporarily unavailable");
		} finally {
			inFlightSectionLoads.delete(section.key);
		}
	})();

	inFlightSectionLoads.set(section.key, sectionLoad);

	return sectionLoad;
};

export const getCatalogSections = async (fetchFn: typeof fetch): Promise<CatalogSection[]> => {
	const sections = await Promise.all(SECTION_CONFIG.map((section) => loadSection(fetchFn, section)));

	return sections;
};

export const getCatalogItemByParams = async (
	fetchFn: typeof fetch,
	category: string,
	slug: string
): Promise<CatalogSummaryItem> => {
	const sectionConfig = getSectionConfig(category);
	const section = await loadSection(fetchFn, sectionConfig);

	const item = section.items.find((entry) => entry.slug === slug);

	if (item == null) {
		throw error(404, "item not found");
	}

	return item;
};
