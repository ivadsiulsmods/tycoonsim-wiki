import { getCrateBySlug, getCrates } from "$lib/server/sheets";

export const entries = async () => {
	const crates = await getCrates(fetch);

	return crates.map((crate) => ({
		slug: crate.slug
	}));
};

export const load = async ({ fetch, params }) => {
	const crate = await getCrateBySlug(fetch, params.slug);

	return {
		crate
	};
};
