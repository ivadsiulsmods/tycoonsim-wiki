import { getCatalogSections } from "$lib/server/sheets";

export const load = async ({ fetch }) => {
	const sections = await getCatalogSections(fetch);
	const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);

	return {
		sections,
		totalItems
	};
};
