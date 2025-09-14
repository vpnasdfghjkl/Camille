<script lang="ts">
	import { Hero, LatestPost, FeaturedProjects } from '$lib/components/site';
	import { 
		FullPageScrollController, 
		FullPageNavigator, 
		SectionDividerVariant, 
		GeometricBackground 
	} from '$lib/components/ui';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// 全屏滚动状态
	let heroSection: HTMLElement;
	let latestPostSection: HTMLElement;
	let featuredProjectsSection: HTMLElement;
	let currentSection = 0;
	let isScrolling = false;
	
	const sections = ['hero', 'latestPost', 'featuredProjects'];
	const sectionNames = ['首页', '最新文章', '精选项目'];
	
	// 滚动到指定区域
	const scrollToSection = (index: number) => {
		isScrolling = true;
		currentSection = index;
		
		let targetElement: HTMLElement;
		switch (index) {
			case 0:
				targetElement = heroSection;
				break;
			case 1:
				targetElement = latestPostSection;
				break;
			case 2:
				targetElement = featuredProjectsSection;
				break;
			default:
				return;
		}
		
		targetElement.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
		
		// 大幅减少滚动锁定时间，提高响应速度
		setTimeout(() => {
			isScrolling = false;
		}, 400); // 从600ms减少到400ms
	};
	
	// 处理区域变更
	const handleSectionChange = (index: number) => {
		scrollToSection(index);
	};
</script>

<!-- 主页背景容器 -->
<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950 relative overflow-hidden">
	<!-- 几何装饰背景组件 -->
	<GeometricBackground />
	
	<!-- 全屏滚动控制器 -->
	<FullPageScrollController 
		{sections}
		{currentSection}
		{isScrolling}
		onSectionChange={handleSectionChange}
	/>
	
	<!-- 内容区域 -->
	<div class="relative z-10 max-w-7xl mx-auto">
		<!-- Hero 部分 -->
		<section bind:this={heroSection} class="px-6 py-16 md:py-24 min-h-screen flex items-center">
			<div class="w-full">
				<Hero />
			</div>
		</section>
		
		<!-- 分隔线 - 蓝色主题 -->
		<SectionDividerVariant variant="blue" />
		
		<!-- Latest Post 部分 -->
		<section bind:this={latestPostSection} class="px-6 py-12 md:py-16 min-h-screen flex items-center">
			<div class="w-full">
				<LatestPost {data} />
			</div>
		</section>
		
		<!-- 分隔线 - 粉色主题 -->
		<SectionDividerVariant variant="pink" />
		
		<!-- Featured Projects 部分 -->
		<section bind:this={featuredProjectsSection} class="px-6 py-12 md:py-16 pb-24 min-h-screen flex items-center">
			<div class="w-full">
				<FeaturedProjects />
			</div>
		</section>
	</div>
	
	<!-- 导航指示器组件 -->
	<FullPageNavigator 
		{sections}
		{sectionNames}
		{currentSection}
		{isScrolling}
		onSectionChange={handleSectionChange}
	/>
</div>
