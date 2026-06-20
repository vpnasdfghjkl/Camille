<script lang="ts">
	import { onMount } from 'svelte';
	import { HeartPulse } from 'lucide-svelte';
	import type { HeartRateReading } from '$lib/types/health';

	let reading: HeartRateReading | null = null;
	let isLoading = true;
	let error = '';

	function formatUpdatedAt(measuredAt: string): string {
		const timestamp = new Date(measuredAt).getTime();
		if (Number.isNaN(timestamp)) return 'unknown';

		const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
		if (diffMinutes < 1) return 'just now';
		if (diffMinutes < 60) return `${diffMinutes} min ago`;

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `${diffHours} hr ago`;

		const diffDays = Math.floor(diffHours / 24);
		return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	}

	async function loadHeartRate() {
		try {
			error = '';
			const response = await fetch('/api/health/heart-rate');
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to load heart rate');
			}

			reading = result.data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load heart rate';
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		loadHeartRate();
		const interval = window.setInterval(loadHeartRate, 60_000);

		return () => window.clearInterval(interval);
	});
</script>

<div
	class="h-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
>
	<div class="flex items-center gap-3 mb-4">
		<div class="p-2 rounded-lg bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
			<HeartPulse size={18} />
		</div>
		<div>
			<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
				Heart Rate
			</h3>
			<p class="text-[10px] text-slate-500 font-mono mt-0.5">APPLE HEALTH</p>
		</div>
	</div>

	{#if isLoading}
		<div class="text-sm text-slate-500 dark:text-slate-400">Syncing...</div>
	{:else if error}
		<div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
			Waiting for heart rate sync.
		</div>
	{:else if reading}
		<div class="flex items-end gap-2">
			<span class="text-4xl font-bold tracking-tight text-rose-500">{reading.bpm}</span>
			<span class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">BPM</span>
		</div>
		<div
			class="mt-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500"
		>
			<span class="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.55)]" />
			<span>updated {formatUpdatedAt(reading.measuredAt)}</span>
		</div>
	{:else}
		<div class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
			No heart rate data yet. Run the iPhone shortcut once to publish your latest reading.
		</div>
	{/if}
</div>
