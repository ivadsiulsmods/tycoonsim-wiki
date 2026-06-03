export type CatalogDetailSegment = {
	href?: string;
	text: string;
};

export type CategoryKey = "droppers" | "upgraders" | "furnaces";

export type CatalogDetail = {
	label: string;
	segments: CatalogDetailSegment[];
	value: string;
};

export type CatalogVariant = {
	details: CatalogDetail[];
	obtainmentMethod: string;
	rarity: string;
	searchText: string;
	variant: string;
};

export type CatalogSummaryItem = {
	availableVariants: string[];
	category: CategoryKey;
	categoryLabel: string;
	categoryType: string;
	defaultVariant: CatalogVariant;
	name: string;
	searchText: string;
	slug: string;
	variants: CatalogVariant[];
};

export type CatalogSection = {
	description: string;
	items: CatalogSummaryItem[];
	key: CategoryKey;
	label: string;
};
