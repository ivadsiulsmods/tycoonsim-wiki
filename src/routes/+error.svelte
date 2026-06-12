<script lang="ts">
	import StatusPage from "$lib/components/StatusPage.svelte";

	let { status } = $props();

	const isNotFound = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} | tycoon simulator wiki</title>
	<meta
		name="description"
		content={isNotFound ? "page not found." : "the index is temporarily unavailable."}
	/>
</svelte:head>

<StatusPage
	eyebrow={String(status)}
	title={isNotFound ? "that page could not be found" : "the index is temporarily unavailable"}
	description={
		isNotFound
			? "looks like this page wandered off somewhere else. the little builder guy is confused too, so your best bet is heading back to a working page."
			: "the site could not load its spreadsheet data right now. it may still be loading, and the first load can take up to 1 minute. this is usually temporary, so trying again in a moment should get things back on track."
	}
	primaryHref="/catalog"
	primaryLabel={isNotFound ? "open the index" : "try the index again"}
	secondaryHref="/"
	secondaryLabel="return home"
/>
