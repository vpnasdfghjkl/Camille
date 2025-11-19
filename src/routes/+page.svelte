<script lang="ts">
	import { Hero, LatestPost, FeaturedProjects } from '$lib/components/site';
	import { 
		SectionDividerVariant, 
		GeometricBackground 
	} from '$lib/components/ui';
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<!-- 主页背景容器 -->
<!-- h-screen + overflow-y-auto + snap-y 实现原生全屏滚动 -->
<div class="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-slate-50 dark:bg-slate-900 relative">
	
	<!-- 固定背景层 (不随滚动移动) -->
	<div class="fixed inset-0 z-0 pointer-events-none">
		<!-- Tech Grid Background -->
		<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
		<div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>

		<!-- 几何装饰背景组件 -->
		<div class="opacity-50">
			<GeometricBackground />
		</div>
	</div>
	
	<!-- 内容区域 -->
	<div class="relative z-10 max-w-7xl mx-auto pt-0">
		<!-- Hero 部分 -->
		<section class="snap-start px-6 py-16 md:py-24 min-h-screen flex items-center">
			<div class="w-full">
				<Hero />
			</div>
		</section>
		
		<!-- 分隔线 - 蓝色主题 -->
		<div class="snap-align-none">
			<SectionDividerVariant variant="blue" />
		</div>
		
		<!-- Latest Post 部分 -->
		<section class="snap-start px-6 pt-24 pb-12 md:pt-32 md:pb-16 min-h-screen flex items-center">
			<div class="w-full">
				<LatestPost {data} />
			</div>
		</section>
		
		<!-- 分隔线 - 粉色主题 -->
		<div class="snap-align-none">
			<SectionDividerVariant variant="pink" />
		</div>
		
		<!-- Featured Projects 部分 -->
		<section class="snap-start px-6 pt-24 pb-24 md:pt-32 md:pb-24 min-h-screen flex items-center">
			<div class="w-full">
				<FeaturedProjects />
			</div>
		</section>
	</div>
</div>
