<script lang="ts">
	import { page } from '$app/stores';
	import { routes } from '$lib/config';
	import { cn } from '$lib/utils';
	import { ThemeToggle } from '$lib/components/site';

	let openToWork = true;
	
	// 背景图片配置参数
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
</script>

<nav
	class="z-[100] top-0 left-0 right-0 h-14 md:h-[4.1rem] fixed w-full bg-white dark:bg-slate-900 hidden md:block shadow-sm relative overflow-hidden"
	style="position: fixed !important; z-index: 100 !important;"
>
	<!-- 背景图片 -->
	<div 
		class="absolute inset-0 bg-cover bg-no-repeat transition-all duration-300"
		style="background-image: url('{backgroundConfig.image}'); 
			   background-position: {backgroundConfig.positionX} {backgroundConfig.positionY}; 
			   opacity: {backgroundConfig.opacity};
			   filter: blur({backgroundConfig.blur}) 
					   brightness({backgroundConfig.brightness}) 
					   contrast({backgroundConfig.contrast}) 
					   saturate({backgroundConfig.saturate}) 
					   hue-rotate({backgroundConfig.hueRotate});"
	></div>
	
	<!-- 可选：渐变遮罩层，增加深度效果 -->
	<div class="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 dark:from-slate-900/20 dark:via-transparent dark:to-slate-900/20"></div>
	
	<!-- 柔和的渐变过渡，替代硬边框 -->
	<!-- <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200/30 dark:via-blue-700/30 to-transparent"></div> -->
	<div class="relative z-[101] flex items-center justify-between h-full p-4 max-w-[95rem] mx-auto">
		<div class="flex items-center gap-4">
			<!-- 字体选项 1: 优雅手写体 (当前) -->
			<a
				href="/"
				class="text-3xl font-semibold tracking-wider md:text-4xl"
				style="font-family: 'Fuggles', cursive;"
			>
				<span
					class="text-5xl text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-pink-500 bg-clip-text md:text-6xl font-bold"
					>C</span
				><span class="text-transparent bg-gradient-to-r from-blue-600 via-blue-500 to-pink-500 bg-clip-text">amilla HX	</span>
			</a>


			{#if openToWork}
				<div class="flex items-center border border-border rounded-xl px-2 gap-3">
					<span class="relative flex h-3 w-3">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
						/>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-sky-500" />
					</span>
					<a href="mailto:1362150003@qq.com">Open to work</a>
				</div>
			{/if}
		</div>
		<div class="hidden md:block">
			<div class="flex space-x-4">
				<ul class="flex items-center space-x-2">
					{#each routes as route}
						<li>
							<a
								href={route.link}
								class="relative inline-flex items-center px-4 py-2 text-sm font-medium tracking-wider rounded-full transition-all duration-200 group hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:text-primary hover:shadow-sm hover:scale-105"
							>
								<!-- 活跃状态指示器 -->
								<span
									class={cn(
										'absolute inset-0 rounded-full border-2 border-transparent transition-all duration-200',
										$page.url.pathname.startsWith(route.link) ? 'border-primary/30 bg-primary/5' : ''
									)}
								/>
								
								<!-- 导航文字 -->
								<span class="relative z-10 flex items-center space-x-2">
									<!-- 可以为每个导航项添加图标 -->
									{#if route.name === 'Blog'}
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
										</svg>
									{:else if route.name === 'Tags'}
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V3a1 1 0 011-1h7c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
										</svg>
									{:else if route.name === 'Projects'}
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
										</svg>
									{:else if route.name === 'About'}
										<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd" />
										</svg>
									{/if}
									<span>{route.name}</span>
								</span>
								
								<!-- 悬浮效果点 -->
								<span
									class={cn(
										'absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 transition-all duration-200',
										$page.url.pathname.startsWith(route.link) ? 'opacity-100 w-8 h-1' : '',
										'group-hover:opacity-100 group-hover:w-6'
									)}
								/>
							</a>
						</li>
					{/each}
				</ul>
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav>
