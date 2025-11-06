<script lang="ts">
	import type { AvatarSize, AvatarSizeConfig } from '$lib/types/avatar';

	// Props 配置
	export let profileImage: string;
	export let hoverImage: string = '';
	export let alt: string = 'Profile Picture';
	export let size: AvatarSize = 'medium';
	export let enableHover: boolean = true;
	export let enableAnimations: boolean = true;

	// 尺寸配置
	const sizeClasses: Record<AvatarSize, AvatarSizeConfig> = {
		small: {
			container: 'w-32 h-32 md:w-40 md:h-40',
			innerBg: 'h-28 w-28 md:h-36 md:w-36',
			avatar: 'w-32 h-32 md:w-40 md:h-40',
			border: 'border-2 md:border-3'
		},
		medium: {
			container: 'w-52 h-52 md:w-64 md:h-64',
			innerBg: 'h-48 w-48 md:h-60 md:w-60',
			avatar: 'w-52 h-52 md:w-64 md:h-64',
			border: 'border-3 md:border-4'
		},
		large: {
			container: 'w-72 h-72 md:w-80 md:h-80',
			innerBg: 'h-68 w-68 md:h-76 md:w-76',
			avatar: 'w-72 h-72 md:w-80 md:h-80',
			border: 'border-4 md:border-5'
		}
	};

	$: currentSize = sizeClasses[size];
	$: animationClasses = enableAnimations ? 'animate-spin group-hover:animate-pulse transition-all duration-700' : '';
	$: reverseAnimationClasses = enableAnimations ? 'animate-reverse-spin group-hover:border-blue-400/60 dark:group-hover:border-blue-500/60 transition-all duration-500' : '';
	$: glowAnimationClasses = enableAnimations ? 'animate-ping group-hover:animate-pulse opacity-40 group-hover:opacity-70 transition-opacity duration-300' : '';
</script>

<style>
	@keyframes reverse-spin {
		from { transform: rotate(360deg); }
		to { transform: rotate(0deg); }
	}
	
	.animate-reverse-spin {
		animation: reverse-spin 3s linear infinite;
	}
</style>

<!-- 响应式头像组件 -->
<div class="relative group {enableHover ? 'cursor-pointer' : ''} {currentSize.container}">
	
	<!-- 外层旋转环 -->
	<div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-1 {animationClasses}">
		<div class="rounded-full bg-white dark:bg-slate-900 p-1.5 md:p-2">
			<div class="{currentSize.innerBg} rounded-full bg-gradient-to-br 
						from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-800"></div>
		</div>
	</div>
	
	<!-- 中层虚线环 -->
	<div class="absolute inset-2 rounded-full border-2 border-dashed 
				border-blue-300/40 dark:border-blue-600/40 {reverseAnimationClasses}"></div>
	
	<!-- 内层光环 -->
	<div class="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30 {glowAnimationClasses}"></div>
	
	<!-- 主头像 -->
	<div class="relative z-10 {currentSize.avatar} rounded-full overflow-hidden
				{currentSize.border} border-white dark:border-slate-800
				shadow-xl md:shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/30
				{enableHover ? 'group-hover:shadow-2xl md:group-hover:shadow-3xl group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-400/60' : ''}
				{enableAnimations ? 'transition-all duration-700 ease-out' : ''}
				{enableHover && enableAnimations ? 'group-hover:scale-110 group-hover:-rotate-3 md:group-hover:-rotate-6' : ''}
				ring-2 ring-blue-200/50 dark:ring-blue-800/50
				{enableHover ? 'group-hover:ring-6 md:group-hover:ring-8 group-hover:ring-blue-300/80 dark:group-hover:ring-blue-600/80' : ''}
				{enableHover ? 'filter group-hover:brightness-110 group-hover:contrast-110' : ''}">
		
		<!-- 默认头像 -->
		<img 
			src={profileImage} 
			{alt}
			class="absolute inset-0 w-full h-full object-cover 
				   {enableHover && hoverImage ? 'transition-opacity duration-500 ease-in-out group-hover:opacity-0' : ''}" 
		/>
		
		<!-- 悬停头像 -->
		{#if enableHover && hoverImage}
			<img 
				src={hoverImage} 
				alt="{alt} - Hover" 
				class="absolute inset-0 w-full h-full object-cover 
					   transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100" 
			/>
		{/if}
	</div>
</div>