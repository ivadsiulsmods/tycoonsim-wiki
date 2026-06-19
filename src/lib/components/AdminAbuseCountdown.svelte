<script lang="ts">
	import { onMount } from "svelte";

	const EVENT_HOUR_UTC = 20;
	const SATURDAY_UTC = 6;
	const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
	const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

	let countdown = $state("calculating...");
	let isMoreThanOneDayAway = $state(false);
	let isReady = $state(false);

	function getNextEvent(now: Date): Date {
		const daysUntilSaturday = (SATURDAY_UTC - now.getUTCDay() + 7) % 7;
		let eventTime = Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + daysUntilSaturday,
			EVENT_HOUR_UTC
		);

		if (eventTime <= now.getTime()) {
			eventTime += WEEK_IN_MILLISECONDS;
		}

		return new Date(eventTime);
	}

	function formatCountdown(milliseconds: number): string {
		const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
		const days = Math.floor(totalSeconds / 86_400);
		const hours = Math.floor((totalSeconds % 86_400) / 3_600);
		const minutes = Math.floor((totalSeconds % 3_600) / 60);
		const seconds = totalSeconds % 60;

		if (days > 0) {
			return `${days}d ${hours}h`;
		}

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}

		return `${minutes}m ${seconds}s`;
	}

	function updateCountdown() {
		const now = new Date();
		const millisecondsRemaining = getNextEvent(now).getTime() - now.getTime();
		countdown = formatCountdown(millisecondsRemaining);
		isMoreThanOneDayAway = millisecondsRemaining > DAY_IN_MILLISECONDS;
		isReady = true;
	}

	onMount(() => {
		updateCountdown();
		const intervalId = window.setInterval(updateCountdown, 1000);

		return () => window.clearInterval(intervalId);
	});
</script>

<aside
	class="event-banner"
	class:is-distant={isMoreThanOneDayAway}
	class:is-ready={isReady}
	aria-label="next admin abuse event"
>
	<span class="event-indicator" aria-hidden="true"></span>
	<span>admin abuse in {countdown}</span>
</aside>

<style>
	.event-banner {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 0.8rem 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		border: 1px solid var(--border-strong);
		background: var(--accent-soft);
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-align: center;
		text-transform: var(--site-text-transform);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
		visibility: hidden;
	}

	.event-banner.is-ready {
		visibility: visible;
	}

	.event-banner.is-distant {
		position: fixed;
		z-index: 10;
		left: max(1rem, env(safe-area-inset-left));
		bottom: max(1rem, env(safe-area-inset-bottom));
		width: auto;
		max-width: calc(100% - 2rem);
		justify-content: flex-start;
	}

	.event-indicator {
		width: 0.5rem;
		height: 0.5rem;
		flex: 0 0 auto;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 0.25rem var(--accent-soft);
	}

	@media (max-width: 520px) {
		.event-banner {
			padding-inline: 0.75rem;
			font-size: 0.78rem;
		}
	}
</style>
