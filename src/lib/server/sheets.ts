import { error } from "@sveltejs/kit";
import * as XLSX from "xlsx";
import catalogSnapshot from "$lib/data/catalog-snapshot.json";
import type {
	CatalogDetailSegment,
	CrateItem,
	CrateListEntry,
	CrateSummaryItem,
	CatalogSection,
	CatalogSummaryItem,
	CatalogVariant,
	CategoryKey,
	ExtraInfoPageData,
	ExtraInfoRow,
	ExtraInfoSection
} from "$lib/types";

const SHEET_ID = "1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU";
const SECTION_CACHE_TTL_MS = 10 * 60 * 1000;

const SECTION_CONFIG: Array<{
	description: string;
	gid: string;
	key: CategoryKey;
	label: string;
	sheet: string;
	type: string;
}> = [
	{
		gid: "0",
		key: "droppers",
		label: "droppers",
		sheet: "Droppers",
		type: "dropper",
		description: "ore producers, variants, rarity, and crate sources."
	},
	{
		gid: "702910335",
		key: "upgraders",
		label: "upgraders",
		sheet: "Upgraders",
		type: "upgrader",
		description: "value boosters, effect applicators, and route planning pieces."
	},
	{
		gid: "147831486",
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

type CrateConfig = {
	gid: string;
	key: string;
	label: string;
	spreadsheetUrl: string;
};

type CrateCacheEntry = {
	crates: CrateItem[];
	expiresAt: number;
};

type ExtraInfoConfig = {
	gid: string;
};

type ExtraInfoCacheEntry = {
	data: ExtraInfoPageData;
	expiresAt: number;
};

type ExtraInfoSheetRow = {
	cells: string[];
	text: string;
};

type GoogleVisualizationCell = {
	f?: string;
	v?: boolean | number | string;
};

type GoogleVisualizationRow = {
	c: Array<GoogleVisualizationCell | null>;
};

type GoogleVisualizationPayload = {
	status: string;
	table?: {
		cols: Array<{
			label: string;
		}>;
		rows: GoogleVisualizationRow[];
	};
};
type ParsedSheetCell = {
	segments: CatalogDetailSegment[];
	value: string;
};

const sectionCache = new Map<CategoryKey, SectionCacheEntry>();
const inFlightSectionLoads = new Map<CategoryKey, Promise<CatalogSection>>();
const fallbackSections = catalogSnapshot as CatalogSection[];
let crateCache: CrateCacheEntry | null = null;
let inFlightCrateLoad: Promise<CrateItem[]> | null = null;
let extraInfoCache: ExtraInfoCacheEntry | null = null;
let inFlightExtraInfoLoad: Promise<ExtraInfoPageData> | null = null;

const variantPriority = ["N/A", "Shiny", "Mythic", "Shiny Mythic"];
const ignoredSpreadsheetLines = new Set([
	"(varients will be added once",
	"we have confirmed stats)",
	"..."
]);
const crateConfigs: CrateConfig[] = [
	{
		key: "basic-crate",
		label: "Basic Crate",
		gid: "1551521706",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=1551521706#gid=1551521706"
	},
	{
		key: "advanced-crate",
		label: "Advanced Crate",
		gid: "971720418",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=971720418#gid=971720418"
	},
	{
		key: "factory-crate",
		label: "Factory Crate",
		gid: "743536198",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=743536198#gid=743536198"
	},
	{
		key: "quarry-crate",
		label: "Quarry Crate",
		gid: "391730752",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=391730752#gid=391730752"
	},
	{
		key: "futuristic-crate",
		label: "Futuristic Crate",
		gid: "391596298",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=391596298#gid=391596298"
	},
	{
		key: "toxic-crate",
		label: "Toxic Crate",
		gid: "881230867",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=881230867#gid=881230867"
	},
	{
		key: "desert-crate",
		label: "Desert Crate",
		gid: "266360237",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=266360237#gid=266360237"
	},
	{
		key: "fantasy-crate",
		label: "Fantasy Crate",
		gid: "358255744",
		spreadsheetUrl:
			"https://docs.google.com/spreadsheets/d/1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU/edit?gid=358255744#gid=358255744"
	}
];

const extraInfoConfig: ExtraInfoConfig = {
	gid: "357911461"
};

const isNotAvailable = (value: string | null | undefined): boolean => {
	return typeof value === "string" && value.trim() === "N/A";
};

const stripIgnoredSpreadsheetLines = (value: string): string => {
	const filteredLines = value
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => ignoredSpreadsheetLines.has(line.toLowerCase()) === false);

	return filteredLines.join("\n").trim();
};

const toDisplayValue = (value: string | null | undefined): string => {
	if (value == null) {
		return "N/A";
	}

	const cleanedValue = stripIgnoredSpreadsheetLines(value);

	if (cleanedValue === "") {
		return "N/A";
	}

	return cleanedValue;
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
		const cleanedText = stripIgnoredSpreadsheetLines(segment.text);

		if (cleanedText === "") {
			continue;
		}

		const previous = merged[merged.length - 1];

		if (previous != null && previous.href === segment.href) {
			previous.text += cleanedText;
			continue;
		}

		merged.push({ ...segment, text: cleanedText });
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

const parseGvizPayload = (payload: string): GoogleVisualizationPayload => {
	const match = payload.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);

	if (match == null) {
		throw new Error("Google visualization payload could not be parsed.");
	}

	return JSON.parse(match[1]) as GoogleVisualizationPayload;
};

const gvizCellToString = (cell: GoogleVisualizationCell | null | undefined): string => {
	if (cell == null) {
		return "";
	}

	if (typeof cell.f === "string" && cell.f.trim() !== "") {
		return cell.f;
	}

	if (typeof cell.v === "boolean") {
		return cell.v === true ? "true" : "false";
	}

	if (cell.v == null) {
		return "";
	}

	return cell.v.toString();
};

const compactWhitespace = (value: string): string => value.replace(/\s+/g, " ").trim();

const normalizeExtraInfoSectionTitle = (value: string): string => {
	const normalized = compactWhitespace(value).replace(/:$/, "");

	if (normalized.toLowerCase() === "odds") {
		return "odds";
	}

	if (normalized.toLowerCase() === "effects") {
		return "effects";
	}

	if (normalized.toLowerCase() === "codes") {
		return "codes";
	}

	return normalized.toLowerCase();
};

const parseExtraInfoOddsRow = (value: string): ExtraInfoRow | null => {
	const match = value.match(/^(.+?)\s+odds\s+(.+?)\s+([0-9.]+x\s+multi)$/i);

	if (match == null) {
		return null;
	}

	return {
		label: compactWhitespace(match[1]).toLowerCase(),
		value: `${compactWhitespace(match[2])}, ${compactWhitespace(match[3]).replace(/multi$/i, "multiplier")}`
	};
};

const parseExtraInfoSimplePair = (value: string): ExtraInfoRow | null => {
	const words = compactWhitespace(value).split(" ");

	if (words.length < 2) {
		return null;
	}

	return {
		label: words[0].toLowerCase(),
		value: words.slice(1).join(" ")
	};
};

const parseExtraInfoCodeRows = (
	rows: ExtraInfoSheetRow[],
	startIndex: number
): { nextIndex: number; rows: ExtraInfoRow[] } => {
	const parsedRows: ExtraInfoRow[] = [];
	let index = startIndex;

	while (index < rows.length) {
		const currentRow = rows[index];
		const label = compactWhitespace(currentRow.cells[0] ?? "");

		if (label === "") {
			index += 1;
			continue;
		}

		const normalizedLabel = normalizeExtraInfoSectionTitle(currentRow.text);

		if (normalizedLabel === "plot size 28x28" || normalizedLabel === "coneyor size") {
			break;
		}

		if (normalizedLabel === "odds" || normalizedLabel === "effects" || normalizedLabel === "codes") {
			break;
		}

		const value = compactWhitespace(currentRow.cells[1] ?? "");

		if (value === "") {
			break;
		}

		parsedRows.push({
			label: compactWhitespace(label).toLowerCase(),
			value: compactWhitespace(value)
		});
		index += 2;
	}

	return {
		nextIndex: index,
		rows: parsedRows
	};
};

const parseExtraInfoSheet = (payload: GoogleVisualizationPayload): ExtraInfoPageData => {
	const rows: ExtraInfoSheetRow[] = (payload.table?.rows ?? [])
		.map((row) => {
			const cells = row.c.map(gvizCellToString).map(compactWhitespace);

			return {
				cells,
				text: compactWhitespace(cells.join(" "))
			};
		})
		.filter((row) => row.text !== "");
	const infoSections: ExtraInfoSection[] = [];
	let maxPlotSize = "N/A";
	let index = 0;

	while (index < rows.length) {
		const row = rows[index].text;
		const normalizedRow = normalizeExtraInfoSectionTitle(row);

		if (normalizedRow.startsWith("plot size ")) {
			maxPlotSize = compactWhitespace(row.slice("plot size".length));
			index += 1;
			continue;
		}

		if (normalizedRow === "coneyor size") {
			const conveyorRows: ExtraInfoRow[] = [];
			index += 1;

			while (index < rows.length) {
				const value = rows[index].text;
				const normalizedValue = normalizeExtraInfoSectionTitle(value);

				if (normalizedValue === "odds" || normalizedValue === "effects" || normalizedValue === "codes") {
					break;
				}

				if (value !== "") {
					conveyorRows.push({
						label: conveyorRows.length === 0 ? "sizes" : `size ${conveyorRows.length + 1}`,
						value
					});
				}

				index += 1;
			}

			if (conveyorRows.length > 0) {
				infoSections.push({
					rows: [
						{
							label: "sizes",
							value: conveyorRows.map((entry) => entry.value).join(" | ")
						}
					],
					title: "conveyor sizes"
				});
			}

			continue;
		}

		if (normalizedRow === "odds") {
			const oddsRows: ExtraInfoRow[] = [];
			index += 1;

			while (index < rows.length) {
				const parsedRow = parseExtraInfoOddsRow(rows[index].text);

				if (parsedRow == null) {
					break;
				}

				oddsRows.push(parsedRow);
				index += 1;
			}

			if (oddsRows.length > 0) {
				infoSections.push({
					rows: oddsRows,
					title: "odds"
				});
			}

			continue;
		}

		if (normalizedRow === "effects") {
			const effectRows: ExtraInfoRow[] = [];
			index += 1;

			while (index < rows.length) {
				const normalizedValue = normalizeExtraInfoSectionTitle(rows[index].text);

				if (normalizedValue === "codes") {
					break;
				}

				const parsedRow = parseExtraInfoSimplePair(rows[index].text);

				if (parsedRow != null) {
					effectRows.push(parsedRow);
				}

				index += 1;
			}

			if (effectRows.length > 0) {
				infoSections.push({
					rows: effectRows,
					title: "effects"
				});
			}

			continue;
		}

		if (normalizedRow === "codes") {
			const parsedCodes = parseExtraInfoCodeRows(rows, index + 1);
			index = parsedCodes.nextIndex;

			if (parsedCodes.rows.length > 0) {
				infoSections.push({
					rows: parsedCodes.rows,
					title: "codes"
				});
			}

			continue;
		}

		index += 1;
	}

	return {
		infoSections,
		maxPlotSize
	};
};

const dedupeCrateEntries = (entries: CrateListEntry[]): CrateListEntry[] => {
	const seen = new Set<string>();
	const result: CrateListEntry[] = [];

	for (const entry of entries) {
		const normalizedName = entry.name.trim().toLowerCase();

		if (normalizedName === "" || seen.has(normalizedName)) {
			continue;
		}

		seen.add(normalizedName);
		result.push(entry);
	}

	return result;
};

const parseCrateCost = (label: string): string => {
	const match = label.match(/Cost:\s*(.+?)\s+Dropper Name$/i);

	if (match == null) {
		return "N/A";
	}

	return match[1].trim();
};

const parseCrateSheet = (
	config: CrateConfig,
	payload: GoogleVisualizationPayload
): CrateItem => {
	const columns = payload.table?.cols ?? [];
	const rows = payload.table?.rows ?? [];
	const cost = parseCrateCost(columns[0]?.label ?? "");
	const itemGroups: Record<CategoryKey, CrateListEntry[]> = {
		droppers: [],
		upgraders: [],
		furnaces: []
	};
	let hasSecret = false;
	let currentSection: CategoryKey = "droppers";

	for (const row of rows) {
		const values = row.c.map(gvizCellToString);
		const firstValue = values[0]?.trim() ?? "";
		const normalizedFirstValue = firstValue.toLowerCase();

		if (values.some((value) => value.trim().toLowerCase() === "secret")) {
			hasSecret = true;
		}

		if (normalizedFirstValue === "" || normalizedFirstValue === "name") {
			continue;
		}

		if (normalizedFirstValue === "furnaces") {
			currentSection = "furnaces";
			continue;
		}

		if (normalizedFirstValue === "upgraders") {
			currentSection = "upgraders";
			continue;
		}

		if (normalizedFirstValue === "droppers") {
			currentSection = "droppers";
			continue;
		}

		itemGroups[currentSection].push({
			category: currentSection,
			name: firstValue,
			slug: slugify(firstValue)
		});
	}

	const droppers = dedupeCrateEntries(itemGroups.droppers);
	const upgraders = dedupeCrateEntries(itemGroups.upgraders);
	const furnaces = dedupeCrateEntries(itemGroups.furnaces);

	return {
		cost,
		hasSecret,
		itemCounts: {
			droppers: droppers.length,
			upgraders: upgraders.length,
			furnaces: furnaces.length
		},
		items: {
			droppers,
			upgraders,
			furnaces
		},
		name: config.label,
		slug: config.key,
		spreadsheetUrl: config.spreadsheetUrl
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

const loadSectionWorkbook = async (
	fetchFn: typeof fetch,
	section: SectionConfig
): Promise<XLSX.WorkBook> => {
	const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx&gid=${section.gid}`;
	const requestFetch = globalThis.fetch ?? fetchFn;
	const response = await requestFetch(url, {
		headers: {
			accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		},
		signal: AbortSignal.timeout(15_000)
	});

	if (response.ok === false) {
		throw new Error(`Received ${response.status} from the ${section.label} sheet export.`);
	}

	const contentType = response.headers.get("content-type") ?? "";

	if (contentType.includes("spreadsheetml.sheet") === false) {
		const responsePreview = (await response.text()).slice(0, 160);
		throw new Error(
			`The ${section.label} sheet export returned "${contentType}" instead of a workbook. Response started with: ${responsePreview}`
		);
	}

	const payload = await response.arrayBuffer();

	return XLSX.read(Buffer.from(payload), {
		cellFormula: false,
		type: "buffer"
	});
};

const loadCrates = async (fetchFn: typeof fetch): Promise<CrateItem[]> => {
	const now = Date.now();

	if (crateCache != null && crateCache.expiresAt > now) {
		return crateCache.crates;
	}

	if (inFlightCrateLoad != null) {
		return inFlightCrateLoad;
	}

	inFlightCrateLoad = (async () => {
		try {
			const crates = await Promise.all(
				crateConfigs.map(async (config) => {
					const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${config.gid}`;
					const response = await fetchFn(url);

					if (response.ok === false) {
						throw new Error(`Received ${response.status} from Google Sheets.`);
					}

					const payload = parseGvizPayload(await response.text());

					if (payload.status !== "ok" || payload.table == null) {
						throw new Error(`Crate sheet "${config.label}" did not return tabular data.`);
					}

					return parseCrateSheet(config, payload);
				})
			);

			crateCache = {
				crates,
				expiresAt: Date.now() + SECTION_CACHE_TTL_MS
			};

			return crates;
		} catch (cause) {
			console.error("Failed to load crate catalog data.", cause);
			throw error(503, "crate data is temporarily unavailable");
		} finally {
			inFlightCrateLoad = null;
		}
	})();

	return inFlightCrateLoad;
};

const loadExtraInfo = async (fetchFn: typeof fetch): Promise<ExtraInfoPageData> => {
	const now = Date.now();

	if (extraInfoCache != null && extraInfoCache.expiresAt > now) {
		return extraInfoCache.data;
	}

	if (inFlightExtraInfoLoad != null) {
		return inFlightExtraInfoLoad;
	}

	inFlightExtraInfoLoad = (async () => {
		try {
			const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${extraInfoConfig.gid}`;
			const response = await fetchFn(url);

			if (response.ok === false) {
				throw new Error(`Received ${response.status} from Google Sheets.`);
			}

			const payload = parseGvizPayload(await response.text());

			if (payload.status !== "ok" || payload.table == null) {
				throw new Error("Extra info sheet did not return tabular data.");
			}

			const data = parseExtraInfoSheet(payload);

			extraInfoCache = {
				data,
				expiresAt: Date.now() + SECTION_CACHE_TTL_MS
			};

			return data;
		} catch (cause) {
			console.error("Failed to load extra info data from Google Sheets.", cause);
			throw error(503, "extra info is temporarily unavailable");
		} finally {
			inFlightExtraInfoLoad = null;
		}
	})();

	return inFlightExtraInfoLoad;
};

const getSectionConfig = (category: string): SectionConfig => {
	const section = SECTION_CONFIG.find((entry) => entry.key === category);

	if (section == null) {
		throw error(404, "category not found");
	}

	return section;
};

const getFallbackSection = (category: CategoryKey): CatalogSection => {
	const fallbackSection = fallbackSections.find((section) => section.key === category);

	if (fallbackSection == null) {
		throw error(503, "catalog data is temporarily unavailable");
	}

	return fallbackSection;
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
			const workbook = await loadSectionWorkbook(fetchFn, section);
			const exportedSheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[section.sheet] ?? workbook.Sheets[exportedSheetName];

			if (sheet == null) {
				throw new Error(`Sheet "${section.sheet}" was not found in the ${section.label} export.`);
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
			console.error(`Failed to load ${section.label} catalog data from Google Sheets. Falling back to the bundled snapshot.`, cause);

			const fallbackSection = getFallbackSection(section.key);

			sectionCache.set(section.key, {
				expiresAt: Date.now() + SECTION_CACHE_TTL_MS,
				section: fallbackSection
			});

			return fallbackSection;
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

export const getCrates = async (fetchFn: typeof fetch): Promise<CrateSummaryItem[]> => {
	const crates = await loadCrates(fetchFn);

	return crates.map(({ items, ...crate }) => crate);
};

export const getCrateBySlug = async (fetchFn: typeof fetch, slug: string): Promise<CrateItem> => {
	const crates = await loadCrates(fetchFn);
	const crate = crates.find((entry) => entry.slug === slug);

	if (crate == null) {
		throw error(404, "crate not found");
	}

	return crate;
};

export const getExtraInfo = async (fetchFn: typeof fetch): Promise<ExtraInfoPageData> => {
	return loadExtraInfo(fetchFn);
};
