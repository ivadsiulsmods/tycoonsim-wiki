import { getExtraInfo } from "$lib/server/sheets";

export const load = async ({ fetch }) => {
	const extraInfo = await getExtraInfo(fetch);

	return {
		infoSections: extraInfo.infoSections,
		maxPlotSize: extraInfo.maxPlotSize
	};
};
