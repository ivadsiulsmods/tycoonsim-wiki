<script lang="ts">
	import StatusPage from "$lib/components/StatusPage.svelte";

	let { status } = $props();
</script>

<svelte:head>
	<title>{status} | drillbit index</title>
	<meta name="description" content="page not found." />
</svelte:head>

<StatusPage
	eyebrow={String(status)}
	title="that page could not be found"
	description="looks like this page wandered off somewhere else. the little builder guy is confused too, so your best bet is heading back to a working page."
	primaryHref="/index"
	primaryLabel="open the index"
	secondaryHref="/"
	secondaryLabel="return home"
/>
