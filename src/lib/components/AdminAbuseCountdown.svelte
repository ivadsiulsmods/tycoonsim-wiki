<script lang="ts">
	import { onMount } from "svelte";

	const EVENT_HOUR_UTC = 20;
	const SATURDAY_UTC = 6;
	const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
	const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;
	const LIVE_STATUS_REFRESH_MILLISECONDS = 60 * 1000;
	const TWITCH_URL = "https://www.twitch.tv/derpmonster83";

	let countdown = $state("calculating...");
	let isMoreThanOneDayAway = $state(false);
	let isReady = $state(false);
	let isLive = $state(false);

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

	async function updateLiveStatus() {
		try {
			const response = await fetch("/api/twitch-live");

			if (response.ok === false) {
				return;
			}

			const status = (await response.json()) as { isLive: boolean };
			isLive = status.isLive === true;
		} catch {
			// keep the last known status through temporary network failures
		}
	}

	onMount(() => {
		updateCountdown();
		void updateLiveStatus();
		const countdownIntervalId = window.setInterval(updateCountdown, 1000);
		const liveStatusIntervalId = window.setInterval(
			updateLiveStatus,
			LIVE_STATUS_REFRESH_MILLISECONDS
		);

		return () => {
			window.clearInterval(countdownIntervalId);
			window.clearInterval(liveStatusIntervalId);
		};
	});
</script>

<div
	class="status-stack"
	class:is-distant={isMoreThanOneDayAway}
	class:is-ready={isReady}
>
	{#if isLive}
		<a class="live-banner" href={TWITCH_URL} target="_blank" rel="noreferrer">
			<span class="live-indicator status-indicator" aria-hidden="true"></span>
			<span>DERP IS LIVE</span>
		</a>
	{/if}

	<aside class="event-banner" aria-label="next admin abuse event">
		<span class="event-indicator status-indicator" aria-hidden="true"></span>
		<span>admin abuse in {countdown}</span>
	</aside>
</div>

<style>
	.status-stack {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		visibility: hidden;
	}

	.status-stack.is-ready {
		visibility: visible;
	}

	.event-banner,
	.live-banner {
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
	}

	.live-banner {
		align-self: center;
		border-color: rgba(255, 72, 72, 0.55);
		background: rgba(255, 48, 48, 0.13);
		color: #ff5757;
	}

	.live-banner:hover {
		border-color: #ff5757;
		background: rgba(255, 48, 48, 0.2);
	}

	.status-stack.is-distant {
		position: fixed;
		z-index: 10;
		left: max(1rem, env(safe-area-inset-left));
		bottom: max(1rem, env(safe-area-inset-bottom));
		width: auto;
		max-width: calc(100% - 2rem);
		align-items: flex-start;
	}

	.status-stack.is-distant .event-banner,
	.status-stack.is-distant .live-banner {
		justify-content: flex-start;
	}

	.status-indicator {
		width: 0.5rem;
		height: 0.5rem;
		flex: 0 0 auto;
		border-radius: 50%;
		animation: status-pulse 2s ease-in-out infinite;
	}

	.event-indicator {
		background: var(--accent);
		box-shadow: 0 0 0 0.25rem var(--accent-soft);
	}

	.live-indicator {
		background: #ff3b3b;
		box-shadow: 0 0 0 0.25rem rgba(255, 59, 59, 0.14);
	}

	@keyframes status-pulse {
		0%,
		100% {
			opacity: 0.45;
			transform: scale(0.85);
		}

		50% {
			opacity: 1;
			transform: scale(1.08);
		}
	}

	@media (max-width: 520px) {
		.event-banner,
		.live-banner {
			padding-inline: 0.75rem;
			font-size: 0.78rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.status-indicator {
			animation: none;
		}
	}
</style>
