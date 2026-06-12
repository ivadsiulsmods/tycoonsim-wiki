<script lang="ts">
	import { Moon, Sun } from "@lucide/svelte";
	import { onMount } from "svelte";

	type ThemeMode = "dark" | "light";
	const THEME_TRANSITION_MS = 320;

	let theme = $state<ThemeMode>("dark");
	let transitionTimeout = 0;

	const beginThemeTransition = () => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		document.documentElement.dataset.themeChanging = "true";

		if (transitionTimeout !== 0) {
			window.clearTimeout(transitionTimeout);
		}

		transitionTimeout = window.setTimeout(() => {
			delete document.documentElement.dataset.themeChanging;
			transitionTimeout = 0;
		}, THEME_TRANSITION_MS);
	};

	const syncTheme = (nextTheme: ThemeMode) => {
		theme = nextTheme;
		document.documentElement.dataset.theme = nextTheme;
		localStorage.setItem("tycoon-sim-wiki-theme", nextTheme);
	};

	const toggleTheme = () => {
		beginThemeTransition();
		syncTheme(theme === "dark" ? "light" : "dark");
	};

	onMount(() => {
		const storedTheme = localStorage.getItem("tycoon-sim-wiki-theme");
		const preferredTheme =
			storedTheme === "light" || storedTheme === "dark"
				? storedTheme
				: window.matchMedia("(prefers-color-scheme: light)").matches
					? "light"
					: "dark";

		syncTheme(preferredTheme);

		return () => {
			if (transitionTimeout !== 0) {
				window.clearTimeout(transitionTimeout);
			}
		};
	});
</script>

<button
	class="icon-button"
	type="button"
	aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
	onclick={toggleTheme}
>
	{#if theme === "dark"}
		<Sun aria-hidden="true" size={16} strokeWidth={2} />
	{:else}
		<Moon aria-hidden="true" size={16} strokeWidth={2} />
	{/if}
</button>

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		padding: 0.9rem 0;
		border: 1px solid var(--border);
		background: var(--surface-raised);
		color: var(--text);
	}

	.icon-button :global(svg) {
		width: 1rem;
		height: 1rem;
	}
</style>
