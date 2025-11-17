<script lang="ts">
	import { onMount } from 'svelte';
	
	export let type: 'dots' | 'grid' | 'wave' | 'skeleton' | 'chart' = 'dots';
	export let message = '加载中...';
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
</script>

<div class="flex flex-col items-center justify-center py-8 space-y-4">
	{#if type === 'dots'}
		<!-- 脉动圆点动画 -->
		<div class="flex space-x-2">
			{#each Array(5) as _, i}
				<div 
					class="w-3 h-3 rounded-full transition-all duration-300"
					class:bg-blue-500={mounted}
					class:bg-gray-300={!mounted}
					style="animation: pulse-dot 1.5s ease-in-out infinite {i * 0.2}s;"
				></div>
			{/each}
		</div>
		
	{:else if type === 'grid'}
		<!-- 网格动画 (模拟贡献图) -->
		<div class="grid grid-cols-7 gap-1 p-2">
			{#each Array(35) as _, i}
				<div 
					class="w-3 h-3 rounded-sm transition-all duration-300"
					class:bg-blue-200={Math.random() > 0.7}
					class:bg-blue-400={Math.random() > 0.8}
					class:bg-blue-600={Math.random() > 0.9}
					class:bg-gray-100={Math.random() <= 0.7}
					class:dark:bg-gray-700={Math.random() <= 0.7}
					style="animation: grid-shimmer 0.4s ease-in-out infinite {(i % 7) * 0.02}s;"
				></div>
			{/each}
		</div>
		
	{:else if type === 'wave'}
		<!-- 波浪动画 -->
		<div class="flex items-end space-x-1">
			{#each Array(8) as _, i}
				<div 
					class="w-2 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
					style="height: {20 + Math.sin(i) * 10}px; animation: wave-bar 1.5s ease-in-out infinite {i * 0.1}s;"
				></div>
			{/each}
		</div>
		
	{:else if type === 'skeleton'}
		<!-- 骨架屏动画 -->
		<div class="space-y-3 w-full max-w-md">
			<div class="flex space-x-2">
				<div class="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
				<div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
			</div>
			<div class="grid grid-cols-12 gap-1">
				{#each Array(84) as _, i}
					<div class="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" 
						 style="animation-delay: {(i % 12) * 0.05}s;"></div>
				{/each}
			</div>
		</div>
		
	{:else if type === 'chart'}
		<!-- 图表加载动画 -->
		<div class="relative">
			<svg width="80" height="80" viewBox="0 0 80 80">
				<circle cx="40" cy="40" r="35" stroke="#e5e7eb" stroke-width="4" fill="none"/>
				<circle cx="40" cy="40" r="35" stroke="#3b82f6" stroke-width="4" fill="none"
					stroke-dasharray="220" stroke-dashoffset="220" stroke-linecap="round"
					style="animation: chart-circle 2s ease-in-out infinite;">
				</circle>
			</svg>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
			</div>
		</div>
	{/if}
	
	<span class="text-sm text-gray-600 dark:text-gray-400 animate-pulse font-medium">
		{message}
	</span>
</div>

<style>
	@keyframes pulse-dot {
		0%, 100% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.2);
			opacity: 1;
		}
	}
	
	@keyframes grid-shimmer {
		0%, 100% {
			opacity: 0.2;
			transform: scale(0.9);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}
	
	@keyframes wave-bar {
		0%, 100% {
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