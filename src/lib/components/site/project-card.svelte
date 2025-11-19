<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { ProjectType } from '$lib/projects';
	import { ArrowRight, Github, Play, Box, Layers } from 'lucide-svelte';
	import TechStackIcon from './techstack-icon.svelte';
	import { cn } from '$lib/utils';

	export let project: ProjectType;

	let hover: boolean = false;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={cn(
		'group relative flex flex-col h-full overflow-hidden rounded-xl transition-all duration-300',
		'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800',
		'hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/30',
		'hover:-translate-y-1'
	)}
	on:mouseenter={() => (hover = true)}
	on:mouseleave={() => (hover = false)}
>
	<!-- 顶部装饰条 -->
	<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

	<!-- 图片区域 -->
	{#if project.image}
		<div class="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
			<img 
				src={project.image} 
				alt={project.title} 
				class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
				loading="lazy" 
			/>
			<!-- 遮罩层 -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
				<div class="flex gap-2">
					{#if project.source}
						<a href={project.source} target="_blank" class="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
							<Github size={16} />
						</a>
					{/if}
					<a href={project.href} target="_blank" class="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg">
						<ArrowRight size={16} />
					</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
			<Box size={48} />
		</div>
	{/if}

	<!-- 内容区域 -->
	<div class="flex flex-col flex-1 p-3 gap-2">
		<div class="space-y-1">
			<div class="flex items-start justify-between gap-2">
				<h3 class="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
					<a href={project.href}>{project.title}</a>
				</h3>
				<!-- 视频演示按钮 (极简版) -->
				{#if project.videoLink}
					<a 
						href={project.videoLink} 
						target="_blank" 
						class="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
						title="Watch Demo"
					>
						<Play size={10} class="fill-current" />
						<span>Demo</span>
					</a>
				{/if}
			</div>
			
			<p class="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed h-8">
				{project.description}
			</p>
		</div>

		<div class="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
			<!-- 技术栈图标 (纯图标模式) -->
			<div class="flex gap-1.5 flex-wrap">
				{#each project.techstack.slice(0, 6) as icon}
					<div class="w-5 h-5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center" title={icon}>
						<TechStackIcon {icon} hideText={true} />
					</div>
				{/each}
				{#if project.techstack.length > 6}
					<div class="w-5 h-5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[9px] font-medium text-slate-500">
						+{project.techstack.length - 6}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
