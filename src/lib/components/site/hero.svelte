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

	// 关注领域数据
	const focusAreas = [
		{ name: 'Graduation Project', icon: '📚' },
		{ name: 'Artificial Intelligence', icon: '🤖' },
		{ name: 'Programming for Logics', icon: '💻' },
		{ name: 'Running', icon: '🏃‍♂️' }
	];

	// 生成完整一年的贡献数据 (52周 x 7天 = 364天)
	function generateContributionData() {
		const data = [];
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364); // 一年前
		
		// 确保从周日开始
		const dayOfWeek = startDate.getDay();
		startDate.setDate(startDate.getDate() - dayOfWeek);
		
		const weeks = [];
		let currentWeek = [];
		
		for (let i = 0; i < 371; i++) { // 53周的数据确保覆盖完整
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			
			// 模拟贡献数据
			const contributionLevel = Math.floor(Math.random() * 5); // 0-4
			const isAllCompleted = contributionLevel === 4;
			
			const dayData = {
				date: date,
				level: contributionLevel,
				isAllCompleted: isAllCompleted,
				count: contributionLevel === 0 ? 0 : contributionLevel,
				isToday: date.toDateString() === today.toDateString(),
				month: date.getMonth(),
				day: date.getDate()
			};
			
			currentWeek.push(dayData);
			
			// 每7天创建一个新周
			if (currentWeek.length === 7) {
				weeks.push([...currentWeek]);
				currentWeek = [];
			}
		}
		
		return weeks.slice(0, 53); // 确保正好53周
	}

	const contributionWeeks = generateContributionData();

	// 获取月份标签
	function getMonthLabels() {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const labels = [];
		const today = new Date();
		
		// 基于实际贡献数据生成月份标签
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364);
		startDate.setDate(startDate.getDate() - startDate.getDay()); // 确保从周日开始
		
		let currentMonth = -1;
		const monthPositions = [];
		
		// 遍历53周，找出每个月第一次出现的位置
		for (let week = 0; week < 53; week++) {
			const weekStartDate = new Date(startDate);
			weekStartDate.setDate(startDate.getDate() + week * 7);
			
			const month = weekStartDate.getMonth();
			if (month !== currentMonth) {
				monthPositions.push({
					month: months[month],
					week: week
				});
				currentMonth = month;
			}
		}
		
		return monthPositions;
	}

	const monthLabels = getMonthLabels();

	// 获取贡献级别的CSS类
	function getContributionClass(level, isAllCompleted) {
		if (isAllCompleted) {
			return 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-400'; // 金色特殊标记
		}
		
		switch(level) {
			case 0: return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
			case 1: return 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800';
			case 2: return 'bg-blue-200 dark:bg-blue-800/60 border-blue-300 dark:border-blue-700';
			case 3: return 'bg-blue-300 dark:bg-blue-700/80 border-blue-400 dark:border-blue-600';
			case 4: return 'bg-blue-400 dark:bg-blue-600 border-blue-500 dark:border-blue-500';
			default: return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
		}
	}

	// 计算总贡献数
	const totalContributions = contributionWeeks.flat().reduce((sum, day) => sum + day.count, 0);
	const currentYear = new Date().getFullYear();
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

<div class="md:container">
	<div class="items-center justify-between mt-5 md:mt-12 md:flex md:flex-row">
		<!-- 响应式头像组件 - 统一的头像，只有尺寸不同 -->
		<div class="mx-auto md:mx-0 md:self-center md:mr-10 relative group cursor-pointer 
					w-52 h-52 md:w-64 md:h-64 mb-6 md:mb-0 order-1 md:order-2">
			
			<!-- 外层旋转环 -->
			<div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 p-1 
						animate-spin group-hover:animate-pulse transition-all duration-700">
				<div class="rounded-full bg-white dark:bg-slate-900 p-1.5 md:p-2">
					<div class="h-48 w-48 md:h-60 md:w-60 rounded-full bg-gradient-to-br 
								from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-800"></div>
				</div>
			</div>
			
			<!-- 中层虚线环 -->
			<div class="absolute inset-2 rounded-full border-2 border-dashed 
						border-blue-300/40 dark:border-blue-600/40 animate-reverse-spin 
						group-hover:border-blue-400/60 dark:group-hover:border-blue-500/60
						transition-all duration-500"></div>
			
			<!-- 内层光环 -->
			<div class="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-500/30
						animate-ping group-hover:animate-pulse opacity-40 group-hover:opacity-70
						transition-opacity duration-300"></div>
			
			<!-- 主头像 -->
			<div class="relative z-10 w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden
						border-3 md:border-4 border-white dark:border-slate-800
						shadow-xl md:shadow-2xl shadow-blue-500/20 dark:shadow-blue-400/30
						group-hover:shadow-2xl md:group-hover:shadow-3xl 
						group-hover:shadow-blue-500/50 dark:group-hover:shadow-blue-400/60
						transition-all duration-700 ease-out
						group-hover:scale-110 group-hover:-rotate-3 md:group-hover:-rotate-6
						ring-2 ring-blue-200/50 dark:ring-blue-800/50
						group-hover:ring-6 md:group-hover:ring-8 
						group-hover:ring-blue-300/80 dark:group-hover:ring-blue-600/80
						filter group-hover:brightness-110 group-hover:contrast-110">
				
				<img src={ProfilePicture} alt="Camille" 
					 class="absolute inset-0 w-full h-full object-cover 
					 		transition-opacity duration-500 ease-in-out group-hover:opacity-0" />
				<img src={hoverImage} alt="Camille - Hover" 
					 class="absolute inset-0 w-full h-full object-cover 
					 		transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100" />
			</div>
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
	<!-- Recent Focus - GitHub风格贡献图 -->
	<div class="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mt-8 w-full
				shadow-lg shadow-orange-500/20 dark:shadow-blue-500/30
				ring-1 ring-orange-200/50 dark:ring-blue-400/30
				hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-blue-500/40
				hover:ring-orange-300/60 dark:hover:ring-blue-400/50
				transition-all duration-300">
		<div class="flex items-center gap-4 mb-6">
			<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
				🎯 Recent-Focus 
			</h3>
			
			<!-- 项目列表 -->
			<div class="flex flex-wrap gap-2">
				{#each focusAreas as area}
					<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 
					text-blue-700 dark:text-blue-300 text-xs font-medium rounded-sm border border-blue-200 dark:border-blue-700">
						{area.icon} {area.name}
					</span>
				{/each}
			</div>
		</div>

		<!-- 贡献图和右侧信息的容器 -->
		<div class="flex gap-8">
			<!-- 贡献图容器 -->
			<div class="contribution-graph flex-1">
				<!-- 月份标签 -->
				<div class="relative flex mb-1 text-xs text-gray-500 dark:text-gray-400 ml-8 h-4">
					{#each monthLabels as label}
					<span class="absolute" style="left: {label.week * 16}px;">
							{label.month}
						</span>
						{/each}
				</div>
				
				<div class="flex">
					<!-- 星期标签 -->
					<div class="flex flex-col text-xs text-gray-500 dark:text-gray-400 pr-2 gap-1">
						<div class="h-3 flex items-center justify-end"></div> <!-- 空行对应周日 -->
						<div class="h-3 flex items-center justify-end">Mon</div>
						<div class="h-3 flex items-center justify-end"></div> <!-- 空行对应周二 -->
						<div class="h-3 flex items-center justify-end">Wed</div>
						<div class="h-3 flex items-center justify-end"></div> <!-- 空行对应周四 -->
						<div class="h-3 flex items-center justify-end">Fri</div>
						<div class="h-3 flex items-center justify-end"></div> <!-- 空行对应周六 -->
					</div>

					<!-- 贡献方格网格 -->
					<div class="flex gap-1">
						{#each contributionWeeks as week}
							<div class="flex flex-col gap-1">
								{#each week as day}
									<div class="relative group">
										<div class="w-3 h-3 {getContributionClass(day.level, day.isAllCompleted)} 
											rounded-sm border transition-all duration-200 hover:ring-2 hover:ring-blue-300 hover:ring-offset-1
											{day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' : ''}"
											title="{day.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {day.count} contributions">
											{#if day.isAllCompleted}
												<div class="absolute inset-0 flex items-center justify-center">
													<span class="text-white text-[6px]">★</span>
												</div>
											{/if}
										</div>
										<!-- 悬停提示 -->
										<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 
											text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 
											transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
											<div class="font-medium">{day.count} contributions</div>
											<div class="text-gray-300">{day.date.toLocaleDateString()}</div>
											{#if day.isAllCompleted}
												<div class="text-yellow-300">🎉 Perfect day!</div>
											{/if}
											<!-- 小箭头 -->
											<div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
										</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- 右侧信息区域 -->
			<div class="flex flex-col justify-between min-w-[200px] space-y-4">
				<!-- 贡献统计和年份 -->
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
						{totalContributions} contributions in the last year
					</h4>
					<div class="text-xs text-gray-500 dark:text-gray-400">{currentYear}</div>
				</div>

				<!-- 图例 -->
				<div class="space-y-2">
					<div class="text-xs text-gray-500 dark:text-gray-400">Learn how we count contributions</div>
					<div class="flex items-center gap-2">
						<span class="text-xs text-gray-500 dark:text-gray-400">Less</span>
						<div class="flex gap-1">
							<div class="w-3 h-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm"></div>
							<div class="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-sm"></div>
							<div class="w-3 h-3 bg-blue-200 dark:bg-blue-800/60 border border-blue-300 dark:border-blue-700 rounded-sm"></div>
							<div class="w-3 h-3 bg-blue-300 dark:bg-blue-700/80 border border-blue-400 dark:border-blue-600 rounded-sm"></div>
							<div class="w-3 h-3 bg-blue-400 dark:bg-blue-600 border border-blue-500 dark:border-blue-500 rounded-sm"></div>
							<div class="w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-400 border border-yellow-400 rounded-sm"></div>
						</div>
						<span class="text-xs text-gray-500 dark:text-gray-400">More</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- 社交按钮 -->
	<SocialButtons />
</div>