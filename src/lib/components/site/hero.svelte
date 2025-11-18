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

<div class="md:container">
	<div class="items-center justify-between mt-5 md:mt-6 md:flex md:flex-row">
		<!-- 响应式头像组件 -->
		<div class="mx-auto md:mx-0 md:self-center md:mr-10 mb-6 md:mb-0 order-1 md:order-2">
			<Avatar 
				profileImage={ProfilePicture}
				{hoverImage}
				alt="Camille"
				size="medium"
				enableHover={true}
				enableAnimations={true}
			/>
		</div>

		<!-- 内容区域 -->
		<div class="space-y-3 md:w-3/5 md:mr-4 order-2 md:order-1">
			<div class="flex flex-col gap-4 border border-border p-2 bg-slate-100 dark:bg-zinc-900 
						rounded-xl mt-6 md:mt-0 text-primary">
				<div class="flex items-center gap-4">
					<Mailbox />
					<h1 class="font-semibold">What's New?</h1>
				</div>
				<div>{@html whatsNew}</div>
			</div>

			<h1 class="font-bold md:text-xl">Hi, I'm</h1>
			
			<h1 class="text-2xl font-bold md:text-5xl bg-gradient-to-r from-blue-600 via-blue-500 to-pink-500 
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
		</div>
	</div>
	
	<!-- 交互式 Recent Focus 贡献图 -->
	<div class="mt-8">
		<InteractiveContributionGraph 
			title="Daily Focus Tracker"
			showFocusAreas={true}
			useRealData={true}
			on:dayClick={handleDayClick}
			on:dataUpdate={handleDataUpdate}
		/>
	</div>
	
	<!-- 社交按钮 -->
	<SocialButtons />
</div>