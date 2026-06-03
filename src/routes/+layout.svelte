<script lang="ts">
	import { onMount } from "svelte";
	import favicon from '$lib/assets/favicon.svg';
	import "../app.css";

	let { children } = $props();

	const updatePointer = (x: number, y: number) => {
		document.documentElement.style.setProperty("--mouse-x", `${x}px`);
		document.documentElement.style.setProperty("--mouse-y", `${y}px`);
	};

	const handlePointerMove = (event: PointerEvent) => {
		updatePointer(event.clientX, event.clientY);
	};

	onMount(() => {
		updatePointer(window.innerWidth / 2, window.innerHeight / 2);
	});
</script>

<svelte:window onpointermove={handlePointerMove} />

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		const storedTheme = localStorage.getItem("drillbit-theme");
		const preferredTheme =
			storedTheme === "light" || storedTheme === "dark"
				? storedTheme
				: window.matchMedia("(prefers-color-scheme: light)").matches
					? "light"
					: "dark";
		document.documentElement.dataset.theme = preferredTheme;
	</script>
</svelte:head>

<div class="app-shell">
	<div class="site-background" aria-hidden="true"></div>
	<div class="app-content">
		{@render children()}
	</div>
</div>
