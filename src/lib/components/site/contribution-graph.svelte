<script lang="ts">
	import type { ContributionDay, MonthLabel, FocusArea } from '$lib/types/contribution';

	export let focusAreas: FocusArea[] = [];
	export let title = "🎯 Recent-Focus";
	export let showFocusAreas = true;

	let contributionWeeks: ContributionDay[][] = [];
	let totalContributions = 0;
	let monthLabels: MonthLabel[] = [];
	let currentYear = new Date().getFullYear();

	// 生成贡献数据
	function generateContributionData(): ContributionDay[][] {
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364); // 一年前
		
		// 确保从周日开始
		const dayOfWeek = startDate.getDay();
		startDate.setDate(startDate.getDate() - dayOfWeek);
		
		const weeks: ContributionDay[][] = [];
		let currentWeek: ContributionDay[] = [];
		
		for (let i = 0; i < 371; i++) { // 53周的数据确保覆盖完整
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + i);
			
			// 模拟贡献数据
			const contributionLevel = Math.floor(Math.random() * 5); // 0-4
			const isAllCompleted = contributionLevel === 4;
			
			const dayData: ContributionDay = {
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

	// 获取月份标签
	function getMonthLabels(): MonthLabel[] {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const today = new Date();
		
		// 基于实际贡献数据生成月份标签
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364);
		startDate.setDate(startDate.getDate() - startDate.getDay()); // 确保从周日开始
		
		let currentMonth = -1;
		const monthPositions: MonthLabel[] = [];
		
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

	// 获取贡献级别的CSS类
	function getContributionClass(level: number, isAllCompleted: boolean): string {
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

	// 格式化日期显示
	function formatDateTitle(date: Date, count: number): string {
		const options: Intl.DateTimeFormatOptions = { 
			weekday: 'long', 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		};
		return `${date.toLocaleDateString('en-US', options)} - ${count} contributions`;
	}

	// 初始化数据
	function initializeData(): void {
		contributionWeeks = generateContributionData();
		totalContributions = contributionWeeks.flat().reduce((sum, day) => sum + day.count, 0);
		monthLabels = getMonthLabels();
	}

	// 组件挂载时初始化数据
	initializeData();
</script>

<!-- GitHub风格贡献图 -->
<div class="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg p-6 w-full
			shadow-lg shadow-orange-500/20 dark:shadow-blue-500/30
			ring-1 ring-orange-200/50 dark:ring-blue-400/30
			hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-blue-500/40
			hover:ring-orange-300/60 dark:hover:ring-blue-400/50
			transition-all duration-300">
	
	<!-- 标题和关注领域 -->
	<div class="flex items-center gap-4 mb-6">
		<h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
			{title}
		</h3>
		
		{#if showFocusAreas && focusAreas.length > 0}
			<!-- 项目列表 -->
			<div class="flex flex-wrap gap-2">
				{#each focusAreas as area}
					<span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 
								text-blue-700 dark:text-blue-300 text-xs font-medium rounded-sm 
								border border-blue-200 dark:border-blue-700">
						{area.icon} {area.name}
					</span>
				{/each}
			</div>
		{/if}
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
					<div class="h-3 flex items-center justify-end" aria-label="Sunday"></div>
					<div class="h-3 flex items-center justify-end">Mon</div>
					<div class="h-3 flex items-center justify-end" aria-label="Tuesday"></div>
					<div class="h-3 flex items-center justify-end">Wed</div>
					<div class="h-3 flex items-center justify-end" aria-label="Thursday"></div>
					<div class="h-3 flex items-center justify-end">Fri</div>
					<div class="h-3 flex items-center justify-end" aria-label="Saturday"></div>
				</div>

				<!-- 贡献方格网格 -->
				<div class="flex gap-1">
					{#each contributionWeeks as week}
						<div class="flex flex-col gap-1">
							{#each week as day}
								<div class="relative group">
									<div 
										class="w-3 h-3 {getContributionClass(day.level, day.isAllCompleted)} 
											   rounded-sm border transition-all duration-200 
											   hover:ring-2 hover:ring-blue-300 hover:ring-offset-1
											   {day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' : ''}"
										title={formatDateTitle(day.date, day.count)}
										role="gridcell"
										aria-label="Contribution level {day.level}"
									>
										{#if day.isAllCompleted}
											<div class="absolute inset-0 flex items-center justify-center">
												<span class="text-white text-[6px]" aria-hidden="true">★</span>
											</div>
										{/if}
									</div>
									
									<!-- 悬停提示 -->
									<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 
												bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 
												rounded shadow-lg opacity-0 group-hover:opacity-100 
												transition-opacity duration-200 pointer-events-none 
												whitespace-nowrap z-50">
										<div class="font-medium">{day.count} contributions</div>
										<div class="text-gray-300">{day.date.toLocaleDateString()}</div>
										{#if day.isAllCompleted}
											<div class="text-yellow-300">🎉 Perfect day!</div>
										{/if}
										<!-- 小箭头 -->
										<div class="absolute top-full left-1/2 transform -translate-x-1/2 
													w-0 h-0 border-l-2 border-r-2 border-t-2 
													border-transparent border-t-gray-900 dark:border-t-gray-700">
										</div>
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
				<div class="text-xs text-gray-500 dark:text-gray-400">
					Learn how we count contributions
				</div>
				<div class="flex items-center gap-2">
					<span class="text-xs text-gray-500 dark:text-gray-400">Less</span>
					<div class="flex gap-1" aria-label="Contribution levels">
						<div class="w-3 h-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm" 
							 title="No contributions" aria-label="Level 0"></div>
						<div class="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-sm" 
							 title="1-2 contributions" aria-label="Level 1"></div>
						<div class="w-3 h-3 bg-blue-200 dark:bg-blue-800/60 border border-blue-300 dark:border-blue-700 rounded-sm" 
							 title="3-4 contributions" aria-label="Level 2"></div>
						<div class="w-3 h-3 bg-blue-300 dark:bg-blue-700/80 border border-blue-400 dark:border-blue-600 rounded-sm" 
							 title="5-6 contributions" aria-label="Level 3"></div>
						<div class="w-3 h-3 bg-blue-400 dark:bg-blue-600 border border-blue-500 dark:border-blue-500 rounded-sm" 
							 title="7+ contributions" aria-label="Level 4"></div>
						<div class="w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-400 border border-yellow-400 rounded-sm" 
							 title="Perfect day" aria-label="Perfect day"></div>
					</div>
					<span class="text-xs text-gray-500 dark:text-gray-400">More</span>
				</div>
			</div>
		</div>
	</div>
</div>