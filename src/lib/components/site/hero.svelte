<script lang="ts">
	import ProfilePicture from '$lib/assets/camille4.png';
	import { SocialButtons } from '$lib/components/site';
	import InteractiveContributionGraph from '$lib/components/site/interactive-contribution-graph.svelte';
	import Avatar from '$lib/components/site/avatar.svelte';
	import { whatsNew } from '$lib/config';
	import { Mailbox } from 'lucide-svelte';
	import { TypewriterText } from '$lib/components/ui';
	import type { CalendarState, DailyCheckin } from '$lib/types/checkin';

	// 头像配置
	const hoverImage = '/SongJia.png';

	// 打字机文本配置
	const heroTexts: string[] = [
		'PROGRAM CAMILLE',
		'ROBOTICS LEARNING', 
		'TECHNICAL BLOGGER'
	];

	// 处理贡献图交互
	function handleDayClick(event: CustomEvent<{ date: string; checkin?: DailyCheckin }>) {
		const { date, checkin } = event.detail;
		console.log('点击了日期:', date, '已有记录:', checkin ? '是' : '否');
	}

	function handleDataUpdate(event: CustomEvent<CalendarState>) {
		const calendarState = event.detail;
		console.log('贡献图数据更新:', calendarState.stats);
	}
</script>

<!-- Hero Section Container -->
<div class="w-full">
	<!-- Profile and Content Wrapper -->
	<div class="w-full max-w-[1920px] mx-auto px-4 md:px-6">
		<div class="grid grid-cols-1 lg:grid-cols-6 gap-2 mt-2 md:mt-2 mb-12">
		<!-- Text Content Section -->
		<div class="lg:col-span-4 space-y-3 order-2 lg:order-1">
			<h1 class="font-bold md:text-xl">Hi, I'm</h1>
			
			<h1 class="text-2xl font-bold md:text-5xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 
					   text-transparent bg-clip-text min-h-[3rem] md:min-h-[4rem] flex items-center">
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
				A postgraduate student from China. I specialize in Robotics Learning. I want to be a full-stack
				developer. I'm currently seeking software developer roles to further my career. In my free time, I
				enjoy writing technical blogs and sharing my journey with others. If you'd like to get in touch, feel
				free to reach out to me.
			</p>

			<div class="pt-2">
				<SocialButtons />
			</div>
		</div>

		<!-- Avatar Section -->
		<div class="lg:col-span-2 flex items-center justify-center lg:justify-end order-1 lg:order-2 mb-6 lg:mb-0">
			<Avatar 
				profileImage={ProfilePicture}
				{hoverImage}
				alt="Camille"
				size="medium"
				enableHover={true}
				enableAnimations={true}
			/>
		</div>
	</div>
	</div>
	
	<!-- Dashboard Grid Section -->
	<div class="w-full max-w-[1920px] mx-auto px-4 md:px-6">
		<div class="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-8 items-stretch">
		<!-- What's New Widget -->
		<div class="lg:col-span-1">
			<div class="h-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
				<div class="flex items-center gap-3 mb-4">
					<div class="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/20">
						<Mailbox size={18} />
					</div>
					<div>
						<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
							What's New
						</h3>
						<p class="text-[10px] text-slate-500 font-mono mt-0.5">LATEST UPDATES</p>
					</div>
				</div>
				<div class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
					{@html whatsNew}
				</div>
			</div>
		</div>

		<!-- Contribution Graph Widget -->
		<div class="lg:col-span-4">
			<InteractiveContributionGraph 
				title="Activity Log"
				showFocusAreas={true}
				useRealData={true}
				on:dayClick={handleDayClick}
				on:dataUpdate={handleDataUpdate}
			/>
		</div>
		
	</div>
	</div>
</div>