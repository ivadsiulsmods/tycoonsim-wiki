import { getCrates } from "$lib/server/sheets";

export const load = async ({ fetch }) => {
	const crates = await getCrates(fetch);

	return {
		crates
	};
};
