<script lang="ts">
	// Props
	export let variant: 'blue' | 'pink' = 'blue';
	export let className: string = '';
</script>

<!-- 优雅分隔线 - 可配置颜色 -->
<div class="flex justify-center mb-16 {className}">
	<div class="flex items-center space-x-4">
		{#if variant === 'blue'}
			<div class="w-12 h-px bg-gradient-to-r from-transparent to-slate-400/30" />
			<div class="w-2 h-2 rounded-full bg-slate-400/40" />
			<div class="w-24 h-px bg-gradient-to-r from-slate-400/30 via-slate-400/20 to-slate-400/30" />
			<div class="w-2 h-2 rounded-full bg-stone-400/40" />
			<div class="w-12 h-px bg-gradient-to-l from-transparent to-slate-400/30" />
		{:else}
			<div class="w-12 h-px bg-gradient-to-r from-transparent to-stone-400/30" />
			<div class="w-2 h-2 rounded-full bg-stone-400/40" />
			<div class="w-24 h-px bg-gradient-to-r from-stone-400/30 via-slate-400/20 to-stone-400/30" />
			<div class="w-2 h-2 rounded-full bg-slate-400/40" />
			<div class="w-12 h-px bg-gradient-to-l from-transparent to-stone-400/30" />
		{/if}
	</div>
</div>
