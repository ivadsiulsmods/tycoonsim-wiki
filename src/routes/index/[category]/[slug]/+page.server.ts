import { getCatalogItemByParams } from "$lib/server/sheets";
import { getCatalogSections } from "$lib/server/sheets";

export const entries = async () => {
	const sections = await getCatalogSections(fetch);

	return sections.flatMap((section) =>
		section.items.map((item) => ({
			category: section.key,
			slug: item.slug
		}))
	);
};

export const load = async ({ fetch, params }) => {
	const item = await getCatalogItemByParams(fetch, params.category, params.slug);

	return {
		item
	};
};
