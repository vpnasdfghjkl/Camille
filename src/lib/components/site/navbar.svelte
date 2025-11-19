<script lang="ts">
	import { page } from '$app/stores';
	import { routes } from '$lib/config';
	import { cn } from '$lib/utils';
	import { ThemeToggle } from '$lib/components/site';
	import { Terminal, Sparkles, Hash, Cpu, FlaskConical, User } from 'lucide-svelte';

	let openToWork = true;
	
	// 映射路由到图标和颜色
	function getIconConfig(name: string) {
		switch(name.toLowerCase()) {
			case 'blog': return { icon: Sparkles, color: 'text-blue-500' };     // Google Blue
			case 'tags': return { icon: Hash, color: 'text-red-500' };          // Google Red
			case 'projects': return { icon: Cpu, color: 'text-amber-500' };     // Google Yellow (Amber for visibility)
			case 'lab': return { icon: FlaskConical, color: 'text-green-500' }; // Google Green
			case 'about': return { icon: User, color: 'text-sky-500' };         // Light Blue
			default: return { icon: Terminal, color: 'text-primary' };
		}
	}
	
	// 背景图片配置参数 (暂时注释)
	/*
	const backgroundConfig = {
		image: '/mc_fb.png',
		opacity: 0.6,
		positionX: '0%',    // 水平位置: 0%=左, 50%=中, 100%=右
		positionY: '27%',   // 垂直位置: 0%=上, 50%=中, 100%=下
		
		// 视觉效果配置
		blur: '0px',        // 模糊程度: 0px=无模糊, 2px=轻微, 5px=中等, 10px=强烈
		brightness: 1.0,    // 亮度: 0.5=暗, 1=正常, 1.5=亮
		contrast: 1.0,      // 对比度: 0.5=低, 1=正常, 1.5=高
		saturate: 1.0,      // 饱和度: 0=灰度, 1=正常, 1.5=鲜艳
		hueRotate: '0deg'   // 色相旋转: 0deg=原色, 180deg=反色
	};
	*/
</script>

<nav
	class="fixed top-0 left-0 right-0 z-[100] w-full border-b border-transparent bg-transparent backdrop-blur-[1px] hidden md:block transition-all duration-300"
>
	<!-- 背景图片 (暂时注释) -->
	<!--
	<div 
		class="absolute inset-0 bg-cover bg-no-repeat transition-all duration-300 pointer-events-none"
		style="background-image: url('/mc_fb.png'); 
			   background-position: 0% 27%; 
			   opacity: 0.6;"
	></div>
	-->

	<div class="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto relative z-10 drop-shadow-md">
		<!-- Logo & Status Area -->
		<div class="flex items-center gap-6">
			<!-- Tech Logo -->
			<a
				href="/"
				class="group flex items-center gap-2 font-mono text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
			>
				<div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
					<Terminal size={18} />
				</div>
				<span class="text-foreground">
					<span class="text-primary">~/</span>camille
				</span>
			</a>

			<!-- Status Badge -->
			{#if openToWork}
				<div class="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-600 dark:text-green-400">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
					</span>
					<span>Open to work</span>
				</div>
			{/if}
		</div>

		<!-- Navigation & Actions -->
		<div class="flex items-center gap-6">
			<ul class="flex items-center gap-2">
				{#each routes as route}
					{@const isActive = $page.url.pathname.startsWith(route.link)}
					{@const config = getIconConfig(route.name)}
					<li>
						<a
							href={route.link}
							class={cn(
								"relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group hover:bg-accent/50",
								isActive ? "bg-accent/50 text-foreground" : "text-muted-foreground"
							)}
						>
							<span class={cn(
								"mr-2 transition-all duration-200",
								config.color,
								isActive ? "scale-110" : "opacity-70 group-hover:opacity-100 group-hover:scale-110"
							)}>
								<svelte:component this={config.icon} size={18} />
							</span>
							
							<span class={cn("transition-colors", isActive ? "font-semibold" : "")}>
								{route.name}
							</span>
						</a>
					</li>
				{/each}
			</ul>

			<div class="pl-6 border-l border-border/50">
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav>
