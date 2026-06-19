import { getCatalogItemByParams, getCrates } from "$lib/server/sheets";

export const load = async ({ fetch, params }) => {
	const [item, crates] = await Promise.all([
		getCatalogItemByParams(fetch, params.category, params.slug),
		getCrates(fetch)
	]);

	return {
		crates,
		item
	};
};
