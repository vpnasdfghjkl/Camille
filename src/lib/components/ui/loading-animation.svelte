<script lang="ts">
	export let type: 'dots' | 'grid' | 'wave' | 'skeleton' | 'chart' = 'dots';
	export let message = '加载中...';

	const gridCells = Array.from({ length: 35 }, (_, i) => ({
		level: [0, 1, 0, 2, 0, 1, 3][i % 7],
		delay: `${(i % 7) * 0.08}s`
	}));

	function getGridCellClass(level: number) {
		switch (level) {
			case 1:
				return 'bg-slate-300 dark:bg-slate-800';
			case 2:
				return 'bg-slate-500 dark:bg-slate-600';
			case 3:
				return 'bg-stone-700 dark:bg-stone-300';
			default:
				return 'bg-gray-100 dark:bg-gray-700';
		}
	}
</script>

<div class="flex flex-col items-center justify-center py-8 space-y-4">
	{#if type === 'grid'}
		<!-- 网格动画 (模拟贡献图) -->
		<div class="grid grid-cols-7 gap-1 p-2">
			{#each gridCells as cell}
				<div
					class="loading-grid-cell w-3 h-3 rounded-sm {getGridCellClass(cell.level)}"
					style="animation-delay: {cell.delay};"
				/>
			{/each}
		</div>
	{:else if type === 'skeleton'}
		<!-- 骨架屏动画 -->
		<div class="space-y-3 w-full max-w-md">
			<div class="flex space-x-2">
				<div class="loading-grid-cell w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
				<div class="loading-grid-cell w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
			</div>
			<div class="grid grid-cols-12 gap-1">
				{#each Array(84) as _, i}
					<div
						class="loading-grid-cell w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"
						style="animation-delay: {(i % 12) * 0.08}s;"
					/>
				{/each}
			</div>
		</div>
	{/if}
	<span class="text-sm text-gray-600 dark:text-gray-400 font-medium">
		{message}
	</span>
</div>

<style>
	.loading-grid-cell {
		animation: grid-shimmer 1.8s ease-in-out infinite;
	}

	@keyframes grid-shimmer {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}

	@keyframes wave-bar {
		0%,
		100% {
			transform: scaleY(0.5);
		}
		50% {
			transform: scaleY(1);
		}
	}

	@keyframes chart-circle {
		0% {
			stroke-dashoffset: 220;
		}
		50% {
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dashoffset: -220;
		}
	}
</style>
