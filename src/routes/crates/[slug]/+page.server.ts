import { getCrateBySlug } from "$lib/server/sheets";

export const load = async ({ fetch, params }) => {
	const crate = await getCrateBySlug(fetch, params.slug);

	return {
		crate
	};
};
