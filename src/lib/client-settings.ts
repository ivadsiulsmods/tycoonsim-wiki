export type ThemeMode = "dark" | "light";
export type TextCaseMode = "lowercase" | "normal";

export const THEME_STORAGE_KEY = "tycoon-sim-wiki-theme";
export const BASE_LUCK_STORAGE_KEY = "tycoon-sim-wiki-base-luck";
export const TEXT_CASE_STORAGE_KEY = "tycoon-sim-wiki-text-case";
export const DEFAULT_BASE_LUCK = 1;
export const DEFAULT_TEXT_CASE: TextCaseMode = "lowercase";
const THEME_TRANSITION_MS = 320;

const clampBaseLuck = (value: number): number => {
	if (Number.isFinite(value) === false || value <= 0) {
		return DEFAULT_BASE_LUCK;
	}

	return value;
};

export const formatSettingNumber = (value: number): string => value.toFixed(2).replace(/\.?0+$/, "");

export const parseBaseLuckValue = (value: string | number | null | undefined): number => {
	if (typeof value === "number") {
		return clampBaseLuck(value);
	}

	if (typeof value !== "string") {
		return DEFAULT_BASE_LUCK;
	}

	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return DEFAULT_BASE_LUCK;
	}

	return clampBaseLuck(Number(trimmed));
};

export const readStoredTheme = (): ThemeMode | null => {
	if (typeof window === "undefined") {
		return null;
	}

	const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

	return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
};

export const resolvePreferredTheme = (): ThemeMode => {
	const storedTheme = readStoredTheme();

	if (storedTheme != null) {
		return storedTheme;
	}

	if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
		return "light";
	}

	return "dark";
};

const beginThemeTransition = () => {
	if (typeof window === "undefined") {
		return;
	}

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		return;
	}

	document.documentElement.dataset.themeChanging = "true";
	window.clearTimeout(beginThemeTransition.timeoutId);
	beginThemeTransition.timeoutId = window.setTimeout(() => {
		delete document.documentElement.dataset.themeChanging;
		beginThemeTransition.timeoutId = 0;
	}, THEME_TRANSITION_MS);
};

beginThemeTransition.timeoutId = 0;

export const applyTheme = (theme: ThemeMode, withTransition = false) => {
	if (typeof window === "undefined") {
		return;
	}

	if (withTransition === true) {
		beginThemeTransition();
	}

	document.documentElement.dataset.theme = theme;
	window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const readStoredBaseLuck = (): number => {
	if (typeof window === "undefined") {
		return DEFAULT_BASE_LUCK;
	}

	return parseBaseLuckValue(window.localStorage.getItem(BASE_LUCK_STORAGE_KEY));
};

export const writeStoredBaseLuck = (value: string | number): number => {
	const normalized = parseBaseLuckValue(value);

	if (typeof window !== "undefined") {
		window.localStorage.setItem(BASE_LUCK_STORAGE_KEY, formatSettingNumber(normalized));
	}

	return normalized;
};

export const readStoredTextCase = (): TextCaseMode => {
	if (typeof window === "undefined") {
		return DEFAULT_TEXT_CASE;
	}

	const storedTextCase = window.localStorage.getItem(TEXT_CASE_STORAGE_KEY);

	return storedTextCase === "normal" || storedTextCase === "lowercase"
		? storedTextCase
		: DEFAULT_TEXT_CASE;
};

export const applyTextCase = (textCase: TextCaseMode) => {
	if (typeof window === "undefined") {
		return;
	}

	document.documentElement.dataset.textCase = textCase;
	window.localStorage.setItem(TEXT_CASE_STORAGE_KEY, textCase);
};
