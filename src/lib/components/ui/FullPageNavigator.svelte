<script lang="ts">
	// Props
	export let sections: string[] = [];
	export let currentSection: number = 0;
	export let sectionNames: string[] = [];
	export let onSectionChange: (index: number) => void = () => {};
	export let isScrolling: boolean = false;
</script>

<!-- 优化的导航指示器 -->
<div class="fixed right-8 top-1/2 transform -translate-y-1/2 z-20 space-y-1.5">
	{#each sections as section, index}
		<div class="group relative">
			<!-- 提示标签 -->
			<div class="absolute right-5 top-1/2 transform -translate-y-1/2 
						bg-black/80 dark:bg-white/90 text-white dark:text-black 
						px-3 py-1 rounded-lg text-sm font-medium
						opacity-0 group-hover:opacity-100 
						translate-x-2 group-hover:translate-x-0
						transition-all duration-300 ease-out
						pointer-events-none whitespace-nowrap
						backdrop-blur-sm">
				{sectionNames[index] || `第${index + 1}页`}
				<!-- 小箭头 -->
				<div class="absolute left-full top-1/2 transform -translate-y-1/2
							border-l-4 border-l-black/80 dark:border-l-white/90
							border-t-2 border-t-transparent
							border-b-2 border-b-transparent"></div>
			</div>
			
			<!-- 导航按钮 - 更小的点 -->
			<button
				class="w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out
					   hover:scale-125 active:scale-95
					   {currentSection === index 
						? 'bg-blue-500 shadow-md shadow-blue-500/40 scale-150' 
						: 'bg-gray-300/60 dark:bg-gray-600/60 hover:bg-blue-400/70'}"
				on:click={() => {
					if (!isScrolling) {
						onSectionChange(index);
					}
				}}
				aria-label="跳转到{sectionNames[index] || `第${index + 1}页`}"
			>
			</button>
		</div>
	{/each}
</div>