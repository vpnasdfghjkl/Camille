<script lang="ts">
	import type { AvatarSize, AvatarSizeConfig } from '$lib/types/avatar';

	// Props 配置
	export let profileImage: string;
	export let hoverImage: string = '';
	export let alt: string = 'Profile Picture';
	export let size: AvatarSize = 'medium';
	export let enableHover: boolean = true;
	export let enableAnimations: boolean = false;

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
	$: animationClasses = enableAnimations
		? 'animate-spin group-hover:animate-pulse transition-all duration-700'
		: '';
	$: reverseAnimationClasses = enableAnimations
		? 'animate-reverse-spin group-hover:border-slate-400/60 dark:group-hover:border-slate-500/60 transition-all duration-500'
		: '';
	$: glowAnimationClasses = enableAnimations
		? 'animate-ping group-hover:animate-pulse opacity-40 group-hover:opacity-70 transition-opacity duration-300'
		: '';
</script>

<!-- 响应式头像组件 -->
<div class="relative group {enableHover ? 'cursor-pointer' : ''} {currentSize.container}">
	<!-- 外层旋转环 -->
	<div
		class="absolute inset-0 rounded-full bg-gradient-to-r from-slate-300 via-slate-400 to-stone-400 p-1 {animationClasses}"
	>
		<div class="rounded-full bg-white dark:bg-slate-900 p-1.5 md:p-2">
			<div
				class="{currentSize.innerBg} rounded-full bg-gradient-to-br
						from-slate-50 to-stone-100 dark:from-slate-950 dark:to-slate-800"
			/>
		</div>
	</div>

	<!-- 中层虚线环 -->
	<div
		class="absolute inset-2 rounded-full border-2 border-dashed
				border-slate-300/50 dark:border-slate-600/50 {reverseAnimationClasses}"
	/>

	<!-- 内层光环 -->
	<div
		class="absolute inset-3 rounded-full bg-gradient-to-r from-slate-300/30 to-stone-400/30 {glowAnimationClasses}"
	/>

	<!-- 主头像 -->
	<div
		class="relative z-10 {currentSize.avatar} rounded-full overflow-hidden
				{currentSize.border} border-white dark:border-slate-800
				shadow-xl md:shadow-2xl shadow-slate-500/15 dark:shadow-slate-400/20
				{enableHover
			? 'group-hover:shadow-2xl md:group-hover:shadow-3xl group-hover:shadow-slate-500/25 dark:group-hover:shadow-slate-400/30'
			: ''}
				{enableAnimations ? 'transition-all duration-700 ease-out' : ''}
				{enableHover && enableAnimations
			? 'group-hover:scale-110 group-hover:-rotate-3 md:group-hover:-rotate-6'
			: ''}
				ring-2 ring-slate-200/70 dark:ring-slate-800/70
				{enableHover
			? 'group-hover:ring-6 md:group-hover:ring-8 group-hover:ring-slate-300/70 dark:group-hover:ring-slate-600/70'
			: ''}
				{enableHover ? 'group-hover:brightness-110 group-hover:contrast-110' : ''}"
	>
		<!-- 默认头像 -->
		<img
			src={profileImage}
			{alt}
			class="absolute inset-0 w-full h-full object-cover
				   {enableHover && hoverImage
				? 'transition-opacity duration-500 ease-in-out group-hover:opacity-0'
				: ''}"
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

<style>
	@keyframes reverse-spin {
		from {
			transform: rotate(360deg);
		}
		to {
			transform: rotate(0deg);
		}
	}

	.animate-reverse-spin {
		animation: reverse-spin 3s linear infinite;
	}
</style>
