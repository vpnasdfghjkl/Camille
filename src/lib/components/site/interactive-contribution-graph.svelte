<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { ContributionDay, MonthLabel, FocusArea } from '$lib/types/contribution';
	import type { CalendarState, DailyCheckin } from '$lib/types/checkin';
	import CheckinModal from './checkin-modal.svelte';
	import { loadFocusTasksConfig } from '$lib/config/focus-tasks-universal';
	import type { FocusTaskConfig } from '$lib/config/focus-tasks';

	// Props
	export let title = '年度工作打卡图';
	export let showFocusAreas = true;
	export let useRealData = true; // 是否使用真实数据

	// 派发事件
	const dispatch = createEventDispatcher<{
		dayClick: { date: string; checkin?: DailyCheckin };
		dataUpdate: CalendarState;
	}>();

	// 状态
	let calendarState: CalendarState | null = null;
	let contributionWeeks: ContributionDay[][] = [];
	let monthLabels: MonthLabel[] = [];
	let isLoading = true;
	let error = '';
	
	// 模态框状态
	let showModal = false;
	let selectedDate: string | null = null;
	let selectedCheckin: DailyCheckin | null = null;

	// 统计信息
	let totalContributions = 0;
	let currentYear = new Date().getFullYear();

	onMount(async () => {
		// 首先加载焦点任务配置
		focusTasksConfig = await loadFocusTasksConfig();
		console.log('✅ 加载焦点任务配置:', focusTasksConfig);
		
		if (useRealData) {
			await loadRealData();
		} else {
			loadMockData();
		}
	});

	// 加载真实数据
	async function loadRealData() {
		try {
			isLoading = true;
			error = '';
			
			const response = await fetch('/api/stats?days=365');
			const result = await response.json();
			
			if (result.success) {
				calendarState = result.data;
				processCalendarData();
				if (calendarState) {
					dispatch('dataUpdate', calendarState);
				}
			} else {
				throw new Error(result.error || '获取数据失败');
			}
		} catch (err) {
			console.error('加载贡献图数据失败:', err);
			error = err instanceof Error ? err.message : '加载数据失败';
			// 降级到模拟数据
			loadMockData();
		} finally {
			isLoading = false;
		}
	}

	// 生成模拟数据
	function loadMockData() {
		const contributions = generateMockContributionData();
		calendarState = {
			contributions,
			stats: {
				totalDays: 365,
				checkedInDays: 180,
				totalTasks: 450,
				avgTasksPerDay: 1.2,
				currentStreak: 7,
				longestStreak: 23,
				completionRate: 49
			},
			focusAreas: focusTasksConfig.map((task, index) => ({
				name: task.name,
				icon: task.icon,
				count: [120, 90, 60, 30, 20, 10][index] || 10, // 模拟数据
				percentage: [40, 30, 20, 10, 5, 5][index] || 5
			})),
			dateRange: {
				start: new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				end: new Date().toISOString().split('T')[0]
			}
		};
		processCalendarData();
		isLoading = false;
	}

	// 生成过去一年的模拟贡献数据
	function generateMockContributionData(): ContributionDay[] {
		const contributions: ContributionDay[] = [];
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364);

		for (let i = 0; i < 365; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);

			// 获取焦点任务总数
			const totalFocusTasks = getTotalFocusTasks();
			
			// 模拟数据：随机生成贡献级别 (0到totalFocusTasks个任务)
			const level = Math.random() > 0.3 ? Math.floor(Math.random() * (totalFocusTasks + 1)) : 0;
			const count = level;
			const hasCheckin = level > 0;

			const dateStr = currentDate.toISOString().split('T')[0];
			
			contributions.push({
				date: dateStr,
				level,
				count,
				isAllCompleted: level >= totalFocusTasks, // 所有任务完成才是完美日
				isToday: dateStr === today.toISOString().split('T')[0],
				month: currentDate.getMonth(),
				day: currentDate.getDate(),
				hasCheckin,
				workPlan: hasCheckin ? `模拟工作计划 ${i + 1}` : undefined,
				wakeUpTime: hasCheckin && Math.random() > 0.5 ? '07:00' : undefined,
				workStartTime: hasCheckin && Math.random() > 0.5 ? '09:00' : undefined,
				notes: hasCheckin && Math.random() > 0.7 ? '模拟备注' : undefined
			});
		}

		return contributions;
	}

	// 处理日历数据，转换为周格式
	function processCalendarData() {
		if (!calendarState?.contributions) return;

		const contributions = calendarState.contributions;
		
		// 确保从周日开始排列
		const weeks: ContributionDay[][] = [];
		let currentWeek: ContributionDay[] = [];
		
		// 找到第一个日期并确保从周日开始
		const firstDate = typeof contributions[0]?.date === 'string' 
			? new Date(contributions[0].date) 
			: contributions[0]?.date || new Date();
		
		const firstDayOfWeek = firstDate.getDay(); // 0=周日
		
		// 如果不是从周日开始，前面补空白
		for (let i = 0; i < firstDayOfWeek; i++) {
			const emptyDate = new Date(firstDate);
			emptyDate.setDate(firstDate.getDate() - (firstDayOfWeek - i));
			currentWeek.push({
				date: emptyDate.toISOString().split('T')[0],
				level: 0,
				count: 0,
				hasCheckin: false
			});
		}

		// 添加实际数据
		contributions.forEach((day) => {
			// 确保日期为字符串格式
			const dayData: ContributionDay = {
				...day,
				date: typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0]
			};
			
			currentWeek.push(dayData);

			if (currentWeek.length === 7) {
				weeks.push([...currentWeek]);
				currentWeek = [];
			}
		});

		// 补齐最后一周
		while (currentWeek.length > 0 && currentWeek.length < 7) {
			const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
			lastDate.setDate(lastDate.getDate() + 1);
			currentWeek.push({
				date: lastDate.toISOString().split('T')[0],
				level: 0,
				count: 0,
				hasCheckin: false
			});
		}
		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
		}

		contributionWeeks = weeks;
		totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
		monthLabels = generateMonthLabels();
	}

	// 生成月份标签
	function generateMonthLabels(): MonthLabel[] {
		const labels: MonthLabel[] = [];
		const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
		                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		
		let currentMonth = -1;
		
		contributionWeeks.forEach((week, weekIndex) => {
			const firstDay = week[0];
			if (firstDay) {
				const date = new Date(firstDay.date);
				const monthIndex = date.getMonth();
				
				if (monthIndex !== currentMonth && weekIndex % 4 === 0) {
					currentMonth = monthIndex;
					labels.push({
						month: monthNames[monthIndex],
						week: weekIndex
					});
				}
			}
		});

		return labels;
	}

	// 焦点任务配置（动态加载）
	let focusTasksConfig: FocusTaskConfig[] = [];
	
	// 获取焦点任务总数的工具函数
	function getTotalFocusTasks(): number {
		return focusTasksConfig.length || 6; // 默认6个任务
	}

	// 获取级别对应的CSS类 (保持原有蓝色系设计)
	function getContributionClass(level: number, isAllCompleted?: boolean): string {
		if (isAllCompleted) {
			return 'bg-gradient-to-br from-yellow-300 to-yellow-400 border-yellow-400 shadow-md';
		}
		
		const maxLevel = getTotalFocusTasks();
		switch(level) {
			case 0: return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
			case 1: return 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800';
			case 2: return 'bg-blue-200 dark:bg-blue-800/60 border-blue-300 dark:border-blue-700';
			case 3: return 'bg-blue-300 dark:bg-blue-700/80 border-blue-400 dark:border-blue-600';
			case 4: return 'bg-blue-400 dark:bg-blue-600 border-blue-500 dark:border-blue-500';
			case 5: return 'bg-blue-500 dark:bg-blue-500 border-blue-600 dark:border-blue-400';
			default: 
				if (level >= maxLevel) {
					return 'bg-blue-600 dark:bg-blue-400 border-blue-700 dark:border-blue-300';
				}
				return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
		}
	}

	// 处理日期点击
	async function handleDayClick(day: ContributionDay) {
		const dateStr = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0];
		selectedDate = dateStr;
		
		// 从API获取完整的打卡数据
		try {
			const response = await fetch(`/api/checkin?date=${dateStr}`);
			const result = await response.json();
			
			if (result.success && result.data) {
				selectedCheckin = result.data;
			} else {
				// 如果没有数据，创建空的记录
				selectedCheckin = null;
			}
		} catch (error) {
			console.error('获取打卡数据失败:', error);
			selectedCheckin = null;
		}
		
		showModal = true;
		
		dispatch('dayClick', { 
			date: dateStr, 
			checkin: selectedCheckin || undefined 
		});
	}

	// 处理模态框事件
	function handleModalClose() {
		showModal = false;
		selectedDate = null;
		selectedCheckin = null;
	}

	async function handleModalSave(event: CustomEvent<DailyCheckin>) {
		const checkin = event.detail;
		
		// 如果使用真实数据，重新加载
		if (useRealData) {
			await loadRealData();
		} else {
			// 更新模拟数据
			const dateStr = checkin.date;
			const contributions = calendarState?.contributions || [];
			const existingIndex = contributions.findIndex(c => {
				const cDate = typeof c.date === 'string' ? c.date : c.date.toISOString().split('T')[0];
				return cDate === dateStr;
			});

			if (existingIndex >= 0) {
				// 动态获取任务总数
				const totalFocusTasks = checkin.focusTasks?.length || 6;
				
				contributions[existingIndex] = {
					...contributions[existingIndex],
					level: checkin.focusTasksCompleted,
					count: checkin.focusTasksCompleted,
					isAllCompleted: checkin.focusTasksCompleted >= totalFocusTasks, // 动态判断完美日
					hasCheckin: true,
					workPlan: checkin.workPlan,
					wakeUpTime: checkin.wakeUpTime,
					workStartTime: checkin.workStartTime,
					notes: checkin.notes
				};
			}

			if (calendarState) {
				calendarState.contributions = contributions;
				processCalendarData();
			}
		}
		
		handleModalClose();
	}

	async function handleModalDelete(event: CustomEvent<string>) {
		const date = event.detail;
		
		// 如果使用真实数据，重新加载
		if (useRealData) {
			await loadRealData();
		} else {
			// 更新模拟数据
			const contributions = calendarState?.contributions || [];
			const existingIndex = contributions.findIndex(c => {
				const cDate = typeof c.date === 'string' ? c.date : c.date.toISOString().split('T')[0];
				return cDate === date;
			});

			if (existingIndex >= 0) {
				contributions[existingIndex] = {
					...contributions[existingIndex],
					level: 0,
					count: 0,
					hasCheckin: false,
					workPlan: undefined,
					wakeUpTime: undefined,
					workStartTime: undefined,
					notes: undefined
				};
			}

			if (calendarState) {
				calendarState.contributions = contributions;
				processCalendarData();
			}
		}
		
		handleModalClose();
	}

	// 格式化提示信息
	function getTooltipText(day: ContributionDay): string {
		const dateStr = typeof day.date === 'string' ? day.date : day.date.toLocaleDateString('zh-CN');
		
		if (day.hasCheckin) {
			return `${dateStr}\n完成 ${day.count} 个Focus任务${day.workPlan ? '\n计划: ' + day.workPlan : ''}`;
		}
		
		return `${dateStr}\n点击添加打卡记录`;
	}

	// 响应式数据
	$: focusAreas = calendarState?.focusAreas || [];
	$: stats = calendarState?.stats;
</script>

<!-- 交互式贡献图 -->
<div class="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg p-5 w-full
			shadow-lg shadow-orange-500/20 dark:shadow-blue-500/30
			ring-1 ring-orange-200/50 dark:ring-blue-400/30
			hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-blue-500/40
			hover:ring-orange-300/60 dark:hover:ring-blue-400/50
			transition-all duration-300">
	
	<!-- 标题和关注领域 -->
	<div class="flex items-center gap-4 mb-5">
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
						{#if area.count !== undefined}
							<span class="text-blue-600 dark:text-blue-400">({area.count})</span>
						{/if}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			<span class="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<p class="text-red-600 dark:text-red-400 mb-4">{error}</p>
			<button 
				on:click={loadRealData}
				class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
			>
				重试
			</button>
		</div>
	{:else}
		<!-- 贡献图和右侧信息的容器 -->
		<div class="flex gap-8">
			<!-- 贡献图容器 -->
			<div class="contribution-graph flex-1">
				<!-- 月份标签 -->
				<div class="relative flex mb-1 text-xs text-gray-500 dark:text-gray-400 ml-8 h-3">
					{#each monthLabels as label}
						<span class="absolute" style="left: {label.week * 16}px;">
							{label.month}
						</span>
					{/each}
				</div>
				
				<div class="flex">
					<!-- 星期标签 -->
					<div class="flex flex-col text-xs text-gray-500 dark:text-gray-400 pr-2">
						<div class="h-3 mb-1 flex items-center justify-end" aria-label="Sunday"></div>
						<div class="h-3 mb-1 flex items-center justify-end">Mon</div>
						<div class="h-3 mb-1 flex items-center justify-end" aria-label="Tuesday"></div>
						<div class="h-3 mb-1 flex items-center justify-end">Wed</div>
						<div class="h-3 mb-1 flex items-center justify-end" aria-label="Thursday"></div>
						<div class="h-3 mb-1 flex items-center justify-end">Fri</div>
						<div class="h-3 flex items-center justify-end" aria-label="Saturday"></div>
					</div>

					<!-- 贡献方格网格 -->
					<div class="flex gap-1">
						{#each contributionWeeks as week}
							<div class="flex flex-col gap-0.5">
								{#each week as day}
									<div class="relative group">
										<button 
											class="w-3 h-3 {getContributionClass(day.level, day.isAllCompleted)} 
												   rounded-sm border transition-all duration-200 
												   hover:ring-2 hover:ring-blue-300 hover:ring-offset-1
												   hover:scale-125 cursor-pointer
												   {day.isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' : ''}"
											title={getTooltipText(day)}
											on:click={() => handleDayClick(day)}
											aria-label="打卡记录 {day.date} - 级别 {day.level}"
										>
											{#if day.isAllCompleted}
												<div class="absolute inset-0 flex items-center justify-center">
													<span class="text-white text-[6px]" aria-hidden="true">★</span>
												</div>
											{/if}
										</button>
										
										<!-- 悬停提示 -->
										<div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 
													bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 
													rounded shadow-lg opacity-0 group-hover:opacity-100 
													transition-opacity duration-200 pointer-events-none 
													whitespace-nowrap z-50 max-w-48">
											<div class="font-medium">{day.count || 0} contributions</div>
											<div class="text-gray-300">{typeof day.date === 'string' ? new Date(day.date).toLocaleDateString() : day.date.toLocaleDateString()}</div>
											{#if day.hasCheckin && day.workPlan}
												<div class="text-blue-300 truncate">{day.workPlan}</div>
											{/if}
											{#if !day.hasCheckin}
												<div class="text-green-300">点击添加打卡</div>
											{/if}
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
			<div class="flex flex-col justify-between min-w-[200px] space-y-2">
				<!-- 贡献统计和年份 -->
				<div class="space-y-1.5">
					<h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
						{totalContributions} contributions in the last year
					</h4>
					<div class="text-xs text-gray-500 dark:text-gray-400">{currentYear}</div>
					{#if stats}
						<div class="text-xs text-gray-500 dark:text-gray-400 space-y-0.5 pt-1.5">
							<div>连续打卡: {stats.currentStreak} 天</div>
							<div>最长连续: {stats.longestStreak} 天</div>
							<div>完成率: {stats.completionRate}%</div>
						</div>
					{/if}
				</div>

				<!-- 图例 -->
				<div class="space-y-1.5">
					<div class="text-xs text-gray-500 dark:text-gray-400">
						Learn how we count contributions
					</div>
					<div class="flex items-center gap-2">
						<span class="text-xs text-gray-500 dark:text-gray-400">Less</span>
						<div class="flex gap-1" aria-label="Contribution levels">
							<div class="w-3 h-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm" 
								 title="无任务" aria-label="Level 0"></div>
							<div class="w-3 h-3 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-sm" 
								 title="1个任务" aria-label="Level 1"></div>
							<div class="w-3 h-3 bg-blue-200 dark:bg-blue-800/60 border border-blue-300 dark:border-blue-700 rounded-sm" 
								 title="2个任务" aria-label="Level 2"></div>
							<div class="w-3 h-3 bg-blue-300 dark:bg-blue-700/80 border border-blue-400 dark:border-blue-600 rounded-sm" 
								 title="3个任务" aria-label="Level 3"></div>
							<div class="w-3 h-3 bg-blue-400 dark:bg-blue-600 border border-blue-500 dark:border-blue-500 rounded-sm" 
								 title="4个任务" aria-label="Level 4"></div>
							<div class="w-3 h-3 bg-blue-500 dark:bg-blue-500 border border-blue-600 dark:border-blue-400 rounded-sm" 
								 title="5个任务" aria-label="Level 5"></div>
							<div class="w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-400 border border-yellow-400 rounded-sm" 
								 title="完美一天 (所有任务)" aria-label="Perfect day"></div>
						</div>
						<span class="text-xs text-gray-500 dark:text-gray-400">More</span>
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400 pt-0.5">
						点击方格进行打卡
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- 打卡模态框 -->
<CheckinModal
	bind:isOpen={showModal}
	bind:selectedDate
	bind:existingCheckin={selectedCheckin}
	focusTasksConfig={focusTasksConfig}
	on:close={handleModalClose}
	on:save={handleModalSave}
	on:delete={handleModalDelete}
/>