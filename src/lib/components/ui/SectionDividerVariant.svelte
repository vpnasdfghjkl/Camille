<script lang="ts">
	// Props
	export let variant: 'blue' | 'pink' = 'blue';
	export let className: string = '';
</script>

<!-- 优雅分隔线 - 可配置颜色 -->
<div class="flex justify-center mb-16 {className}">
	<div class="flex items-center space-x-4">
		{#if variant === 'blue'}
			<div class="w-12 h-px bg-gradient-to-r from-transparent to-blue-500/30"></div>
			<div class="w-2 h-2 rounded-full bg-blue-500/40"></div>
			<div class="w-24 h-px bg-gradient-to-r from-blue-500/30 via-blue-500/20 to-blue-500/30"></div>
			<div class="w-2 h-2 rounded-full bg-pink-400/40"></div>
			<div class="w-12 h-px bg-gradient-to-l from-transparent to-blue-500/30"></div>
		{:else}
			<div class="w-12 h-px bg-gradient-to-r from-transparent to-pink-400/30"></div>
			<div class="w-2 h-2 rounded-full bg-pink-400/40"></div>
			<div class="w-24 h-px bg-gradient-to-r from-pink-400/30 via-blue-500/20 to-pink-400/30"></div>
			<div class="w-2 h-2 rounded-full bg-blue-500/40"></div>
			<div class="w-12 h-px bg-gradient-to-l from-transparent to-pink-400/30"></div>
		{/if}
	</div>
</div>