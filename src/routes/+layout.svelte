<script lang="ts">
	import { onMount } from "svelte";
	import "../app.css";

	let { children } = $props();
	let frameId = 0;
	let pendingPointerPosition: { x: number; y: number } | null = null;

	const updatePointer = (x: number, y: number) => {
		document.documentElement.style.setProperty("--mouse-x", `${x}px`);
		document.documentElement.style.setProperty("--mouse-y", `${y}px`);
	};

	const flushPointerUpdate = () => {
		frameId = 0;

		if (pendingPointerPosition == null) {
			return;
		}

		updatePointer(pendingPointerPosition.x, pendingPointerPosition.y);
		pendingPointerPosition = null;
	};

	const handlePointerMove = (event: PointerEvent) => {
		pendingPointerPosition = {
			x: event.clientX,
			y: event.clientY
		};

		if (frameId !== 0) {
			return;
		}

		frameId = window.requestAnimationFrame(flushPointerUpdate);
	};

	onMount(() => {
		updatePointer(window.innerWidth / 2, window.innerHeight / 2);

		return () => {
			if (frameId !== 0) {
				window.cancelAnimationFrame(frameId);
			}
		};
	});
</script>

<svelte:window onpointermove={handlePointerMove} />

<svelte:head>
	<script>
		const storedTheme = localStorage.getItem("tycoon-sim-wiki-theme");
		const preferredTheme =
			storedTheme === "light" || storedTheme === "dark"
				? storedTheme
				: window.matchMedia("(prefers-color-scheme: light)").matches
					? "light"
					: "dark";
		const storedTextCase = localStorage.getItem("tycoon-sim-wiki-text-case");
		document.documentElement.dataset.theme = preferredTheme;
		document.documentElement.dataset.textCase =
			storedTextCase === "normal" || storedTextCase === "lowercase" ? storedTextCase : "lowercase";
	</script>
</svelte:head>

<div class="app-shell">
	<div class="site-background" aria-hidden="true"></div>
	<div class="app-content">
		{@render children()}
	</div>
</div>
