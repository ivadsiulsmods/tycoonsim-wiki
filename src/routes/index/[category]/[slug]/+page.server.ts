import { getCatalogItemByParams } from "$lib/server/sheets";

export const load = async ({ fetch, params }) => {
	const item = await getCatalogItemByParams(fetch, params.category, params.slug);

	return {
		item
	};
};
