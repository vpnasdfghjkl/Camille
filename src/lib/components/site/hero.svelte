<script>
	import ProfilePicture from '$lib/assets/camille4.png';
	import { SocialButtons } from '$lib/components/site';
	import { whatsNew } from '$lib/config';
	import { Mailbox } from 'lucide-svelte';
	import { TypewriterText } from '$lib/components/ui';

	// 头像图片路径
	const hoverImage = '/SongJia.png';

	// 打字机文本配置
	const heroTexts = [
		'PROGRAM CAMILLE',
		'ROBOTICS LEARNING',
		'TECHNICAL BLOGGER'
	];
</script>

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

<div class="md:container">
	<div class="items-center justify-between mt-5 md:mt-12 md:flex md:flex-row">
		<!-- Image for mobile devices -->
		<div class="block mx-auto md:hidden relative w-52 h-52 mb-6 group cursor-pointer">
			<!-- 旋转的外层装饰环 -->
			<div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-1 
						animate-spin group-hover:animate-pulse transition-all duration-700">
				<div class="rounded-full bg-white dark:bg-slate-900 p-1.5">
					<div class="h-48 w-48 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-800"></div>
				</div>
			</div>
			
			<!-- 反向旋转的中层装饰环 -->
			<div class="absolute inset-2 rounded-full border-2 border-dashed border-blue-300/40 dark:border-blue-600/40
						animate-reverse-spin group-hover:border-blue-400/60 dark:group-hover:border-blue-500/60
						transition-all duration-500"></div>
			
			<!-- 呼吸效果的内层光环 -->
			<div class="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30
						animate-ping group-hover:animate-pulse opacity-40 group-hover:opacity-70
						transition-opacity duration-300"></div>
			
			<!-- 主头像容器 -->
			<div class="relative z-10 w-52 h-52 rounded-full overflow-hidden
						border-3 border-white dark:border-slate-800
						shadow-xl shadow-blue-500/20 dark:shadow-blue-400/30
						group-hover:shadow-2xl group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-400/60
						transition-all duration-700 ease-out
						group-hover:scale-110 group-hover:-rotate-3
						ring-2 ring-blue-200/50 dark:ring-blue-800/50
						group-hover:ring-6 group-hover:ring-blue-300/80 dark:group-hover:ring-blue-600/80
						filter group-hover:brightness-110 group-hover:contrast-110">
				
				<!-- 默认头像 -->
				<img
					src={ProfilePicture}
					alt="Camille"
					class="absolute inset-0 w-full h-full object-cover
						   transition-opacity duration-500 ease-in-out
						   group-hover:opacity-0"
				/>
				
				<!-- 悬停时显示的头像 -->
				<img
					src={hoverImage}
					alt="Camille - Hover"
					class="absolute inset-0 w-full h-full object-cover
						   transition-opacity duration-500 ease-in-out
						   opacity-0 group-hover:opacity-100"
				/>
			</div>
			
			<!-- 多层光晕效果 -->
			<div class="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 
						blur-lg opacity-60 group-hover:opacity-100 group-hover:scale-110
						transition-all duration-700"></div>
			
			<!-- 外层脉冲光晕 -->
			<div class="absolute -inset-5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-600/10 
						blur-xl opacity-0 group-hover:opacity-80 group-hover:animate-pulse
						transition-all duration-500"></div>
			
			<!-- 悬浮粒子效果 -->
			<div class="absolute top-3 right-3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 
						group-hover:opacity-100 group-hover:animate-bounce
						transition-all duration-300 delay-100"></div>
			<div class="absolute bottom-4 left-4 w-1 h-1 bg-purple-400 rounded-full opacity-0 
						group-hover:opacity-100 group-hover:animate-bounce
						transition-all duration-300 delay-200"></div>
		</div>

		<div class="space-y-3 md:w-3/5 md:mr-4">
			<div
				class="flex flex-col gap-4 border border-border p-2 bg-slate-100 dark:bg-zinc-900 rounded-xl mt-6 md:mt-0 text-primary"
			>
				<div class="flex items-center gap-4">
					<Mailbox />
					<h1 class="font-semibold">What's New?</h1>
				</div>

				<div>
					{@html whatsNew}
				</div>
			</div>

			<h1 class="font-bold md:text-xl">Hi, I'm</h1>
			<h1 class="text-2xl font-bold md:text-5xl bg-gradient-to-r from-blue-600 via-blue-500 to-pink-500 text-transparent bg-clip-text min-h-[3rem] md:min-h-[4rem] flex items-center">
				<TypewriterText 
					texts={heroTexts}
					typeSpeed={80}
					deleteSpeed={20}
					delayBetween={2000}
					cursorColor="text-blue-500"
					startDelay={1000}
				/>
			</h1>
			<p>
				a postgraduate student from China. I specialize in Robotics Learning. I want to be a full-stack
				developer. I’m currently seeking software developer roles to further my career. In my free time, I
				enjoy writing technical blogs and sharing my journey with others. If you'd like to get in touch, feel
				free to reach out to me.
			</p>
			<SocialButtons />
		</div>

		<div class="hidden md:block md:self-center md:mr-10 relative group cursor-pointer">
			<!-- 旋转的外层装饰环 -->
			<div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-1 
						animate-spin group-hover:animate-pulse transition-all duration-700">
				<div class="rounded-full bg-white dark:bg-slate-900 p-2">
					<div class="h-60 w-60 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-800"></div>
				</div>
			</div>
			
			<!-- 反向旋转的中层装饰环 -->
			<div class="absolute inset-2 rounded-full border-2 border-dashed border-blue-300/40 dark:border-blue-600/40
						animate-reverse-spin group-hover:border-blue-400/60 dark:group-hover:border-blue-500/60
						transition-all duration-500"></div>
			
			<!-- 呼吸效果的内层光环 -->
			<div class="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30
						animate-ping group-hover:animate-pulse opacity-40 group-hover:opacity-70
						transition-opacity duration-300"></div>
			
			<!-- 主头像容器 -->
			<div class="relative z-10 w-64 h-64 rounded-full overflow-hidden
						border-4 border-white dark:border-slate-800
						shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/30
						group-hover:shadow-3xl group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-400/60
						transition-all duration-700 ease-out
						group-hover:scale-110 group-hover:-rotate-6
						ring-2 ring-blue-200/50 dark:ring-blue-800/50
						group-hover:ring-8 group-hover:ring-blue-300/80 dark:group-hover:ring-blue-600/80
						filter group-hover:brightness-110 group-hover:contrast-110">
				
				<!-- 默认头像 -->
				<img 
					src={ProfilePicture}
					alt="Camille"
					class="absolute inset-0 w-full h-full object-cover
						   transition-opacity duration-500 ease-in-out
						   group-hover:opacity-0"
				/>
				
				<!-- 悬停时显示的头像 -->
				<img 
					src={hoverImage}
					alt="Camille - Hover"
					class="absolute inset-0 w-full h-full object-cover
						   transition-opacity duration-500 ease-in-out
						   opacity-0 group-hover:opacity-100"
				/>
			</div>
			
			<!-- 多层光晕效果 -->
			<div class="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/20 via-transparent to-blue-600/20 
						blur-xl opacity-60 group-hover:opacity-100 group-hover:scale-110
						transition-all duration-700"></div>
			
			<!-- 外层脉冲光晕 -->
			<div class="absolute -inset-6 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-600/10 
						blur-2xl opacity-0 group-hover:opacity-80 group-hover:animate-pulse
						transition-all duration-500"></div>
			
			<!-- 悬浮粒子效果 -->
			<div class="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 
						group-hover:opacity-100 group-hover:animate-bounce
						transition-all duration-300 delay-100"></div>
			<div class="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 
						group-hover:opacity-100 group-hover:animate-bounce
						transition-all duration-300 delay-200"></div>
			<div class="absolute top-8 left-4 w-1 h-1 bg-blue-300 rounded-full opacity-0 
						group-hover:opacity-100 group-hover:animate-bounce
						transition-all duration-300 delay-300"></div>
		</div>
	</div>
</div>
