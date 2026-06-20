<script lang="ts">
	import { page } from '$app/stores';
	import { routes } from '$lib/config';
	import { cn } from '$lib/utils';
	import { ThemeToggle } from '$lib/components/site';
	import { Terminal, Sparkles, Hash, Cpu, FlaskConical, User } from 'lucide-svelte';

	// 映射路由到图标和颜色
	function getIconConfig(name: string) {
		switch (name.toLowerCase()) {
			case 'blog':
				return { icon: Sparkles, color: 'text-slate-500 dark:text-slate-400' };
			case 'tags':
				return { icon: Hash, color: 'text-zinc-500 dark:text-zinc-400' };
			case 'projects':
				return { icon: Cpu, color: 'text-stone-500 dark:text-stone-400' };
			case 'lab':
				return { icon: FlaskConical, color: 'text-neutral-500 dark:text-neutral-400' };
			case 'about':
				return { icon: User, color: 'text-slate-500 dark:text-slate-400' };
			default:
				return { icon: Terminal, color: 'text-primary' };
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

<nav class="fixed top-0 left-0 right-0 z-[100] w-full hidden md:block transition-all duration-300">
	<!-- 背景图片 (暂时注释) -->
	<!--
	<div 
		class="absolute inset-0 bg-cover bg-no-repeat transition-all duration-300 pointer-events-none"
		style="background-image: url('/mc_fb.png'); 
			   background-position: 0% 27%; 
			   opacity: 0.6;"
	></div>
	-->

	<div class="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto relative z-10">
		<!-- Logo & Status Area -->
		<div class="flex items-center gap-6">
			<!-- Tech Logo -->
			<a
				href="/"
				class="group flex items-center gap-2 rounded-xl px-2.5 py-1.5 font-mono text-lg font-bold tracking-tight bg-white/25 dark:bg-slate-950/25 backdrop-blur-xl shadow-sm shadow-slate-900/5 hover:bg-white/40 dark:hover:bg-slate-900/40 transition-colors"
			>
				<div
					class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/35 text-slate-600 dark:bg-white/10 dark:text-slate-300 group-hover:bg-white/55 dark:group-hover:bg-white/15 transition-colors"
				>
					<Terminal size={18} />
				</div>
				<span class="text-foreground">
					<span class="text-muted-foreground">~/</span>camille
				</span>
			</a>
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
								'relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group backdrop-blur-xl shadow-sm shadow-slate-900/5',
								isActive
									? 'bg-white/40 dark:bg-slate-900/40 text-foreground'
									: 'bg-white/20 dark:bg-slate-950/20 text-muted-foreground hover:bg-white/35 dark:hover:bg-slate-900/35 hover:text-foreground'
							)}
						>
							<span
								class={cn(
									'mr-2 transition-all duration-200',
									config.color,
									isActive
										? 'scale-110'
										: 'opacity-70 group-hover:opacity-100 group-hover:scale-110'
								)}
							>
								<svelte:component this={config.icon} size={18} />
							</span>

							<span class={cn('transition-colors', isActive ? 'font-semibold' : '')}>
								{route.name}
							</span>
						</a>
					</li>
				{/each}
			</ul>

			<div class="pl-4">
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav>
