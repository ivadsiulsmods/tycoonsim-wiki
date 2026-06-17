export type CrateConfig = {
	gid: string;
	key: string;
	label: string;
	spreadsheetUrl: string;
};

const SHEET_ID = "1iLCa9vykk5DKBN_JrUFIg2h34XU02hiBJp2Yzg_-5aU";

const createSpreadsheetUrl = (gid: string): string =>
	`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${gid}#gid=${gid}`;

export const crateConfigs: CrateConfig[] = [
	{
		key: "basic-crate",
		label: "Basic Crate",
		gid: "1551521706",
		spreadsheetUrl: createSpreadsheetUrl("1551521706")
	},
	{
		key: "advanced-crate",
		label: "Advanced Crate",
		gid: "971720418",
		spreadsheetUrl: createSpreadsheetUrl("971720418")
	},
	{
		key: "factory-crate",
		label: "Factory Crate",
		gid: "743536198",
		spreadsheetUrl: createSpreadsheetUrl("743536198")
	},
	{
		key: "quarry-crate",
		label: "Quarry Crate",
		gid: "391730752",
		spreadsheetUrl: createSpreadsheetUrl("391730752")
	},
	{
		key: "futuristic-crate",
		label: "Futuristic Crate",
		gid: "391596298",
		spreadsheetUrl: createSpreadsheetUrl("391596298")
	},
	{
		key: "toxic-crate",
		label: "Toxic Crate",
		gid: "881230867",
		spreadsheetUrl: createSpreadsheetUrl("881230867")
	},
	{
		key: "desert-crate",
		label: "Desert Crate",
		gid: "266360237",
		spreadsheetUrl: createSpreadsheetUrl("266360237")
	},
	{
		key: "fantasy-crate",
		label: "Fantasy Crate",
		gid: "358255744",
		spreadsheetUrl: createSpreadsheetUrl("358255744")
	},
	{
		key: "space-crate",
		label: "Space Crate",
		gid: "187618583",
		spreadsheetUrl: createSpreadsheetUrl("187618583")
	},
	{
		key: "periastron-crate",
		label: "Periastron Crate",
		gid: "1733781452",
		spreadsheetUrl: createSpreadsheetUrl("1733781452")
	},
	{
		key: "candy-crate",
		label: "Candy Crate",
		gid: "82652979",
		spreadsheetUrl: createSpreadsheetUrl("82652979")
	}
];

export const crateNames = crateConfigs.map((crate) => crate.label);
