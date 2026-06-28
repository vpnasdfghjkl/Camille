<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { ContributionDay, MonthLabel, FocusArea } from '$lib/types/contribution';
	import type { CalendarState, DailyCheckin } from '$lib/types/checkin';
	import CheckinModal from './checkin-modal.svelte';
	import LoadingAnimation from '$lib/components/ui/loading-animation.svelte';
	import { getFocusTasksConfigAsync, type FocusTaskConfig } from '$lib/config/focus-tasks';
	import { Activity, CheckCircle2 } from 'lucide-svelte';

	// Props
	export let title = 'Activity Log';
	export let showFocusAreas = true;
	export let useRealData = true;
	export let privacyMode = false;

	// 派发事件
	const dispatch = createEventDispatcher<{
		dayClick: { date: string; checkin?: DailyCheckin };
		dataUpdate: CalendarState;
	}>();

	// 状态
	let calendarState: CalendarState | null = null;
	let isAuthenticated = false;
	let contributionWeeks: ContributionDay[][] = [];
	let monthLabels: MonthLabel[] = [];
	let isLoading = true;
	let error = '';

	// 认证模态框状态
	let showAuthModal = false;
	let authPassword = '';
	let authError = '';
	let pendingDay: ContributionDay | null = null;

	// 模态框状态
	let showModal = false;
	let selectedDate: string | null = null;
	let selectedCheckin: DailyCheckin | null = null;

	// 统计信息
	let totalContributions = 0;
	let currentYear = new Date().getFullYear();

	// Direction tag config
	let focusTasksConfig: FocusTaskConfig[] = [];

	// Focus action
	function focus(element: HTMLElement) {
		element.focus();
	}

	// 获取本地时间字符串 (YYYY-MM-DD)
	function getLocalDateStr(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	onMount(async () => {
		focusTasksConfig = await getFocusTasksConfigAsync();
		console.log('✅ 加载 direction 配置:', focusTasksConfig);

		if (useRealData) {
			await loadRealData();
		} else {
			loadMockData();
		}
	});

	async function loadRealData(forceRefresh = false) {
		try {
			isLoading = true;
			error = '';
			const refreshParam = forceRefresh ? '&refresh=true' : '';
			const apiUrl = `/api/stats?days=365${refreshParam}`;
			const response = await fetch(apiUrl);
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
			console.error('❌ [前端] 加载贡献图数据失败:', err);
			error = err instanceof Error ? err.message : '加载数据失败';
			loadMockData();
		} finally {
			isLoading = false;
		}
	}

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
				count: [35, 34, 24, 13, 6][index] || 0,
				percentage: [31, 30, 21, 12, 6][index] || 0
			})),
			dateRange: {
				start: getLocalDateStr(new Date(Date.now() - 364 * 24 * 60 * 60 * 1000)),
				end: getLocalDateStr(new Date())
			}
		};
		processCalendarData();
		isLoading = false;
	}

	function generateMockContributionData(): ContributionDay[] {
		const contributions: ContributionDay[] = [];
		const today = new Date();
		const todayStr = getLocalDateStr(today);
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - 364);

		for (let i = 0; i < 365; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);
			const totalTasks = Math.random() > 0.3 ? Math.floor(Math.random() * 6) + 1 : 0;
			const completedTasks = totalTasks > 0 ? Math.floor(Math.random() * (totalTasks + 1)) : 0;
			const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
			const level = getLevelFromCompletionRate(completionRate);
			const hasCheckin = totalTasks > 0;
			const dateStr = getLocalDateStr(currentDate);
			const taskList = Array.from({ length: totalTasks }, (_, taskIndex) => ({
				id: `mock-${i}-${taskIndex}`,
				text: `Task ${taskIndex + 1}`,
				completed: taskIndex < completedTasks
			}));

			contributions.push({
				date: dateStr,
				level,
				count: completedTasks,
				completedTasks,
				totalTasks,
				completionRate,
				taskList,
				isAllCompleted: totalTasks > 0 && completedTasks === totalTasks,
				isToday: dateStr === todayStr,
				month: currentDate.getMonth(),
				day: currentDate.getDate(),
				hasCheckin,
				workPlan: hasCheckin ? `模拟工作计划 ${i + 1}` : undefined,
				notes: hasCheckin && Math.random() > 0.7 ? '模拟备注' : undefined
			});
		}
		return contributions;
	}

	function processCalendarData() {
		if (!calendarState?.contributions) return;
		const contributions = calendarState.contributions;
		const weeks: ContributionDay[][] = [];
		let currentWeek: ContributionDay[] = [];

		// 获取本地时间的"今天" (YYYY-MM-DD)
		const now = new Date();
		const todayStr = getLocalDateStr(now);
		console.log('📅 Local Today:', todayStr);

		const firstDate =
			typeof contributions[0]?.date === 'string'
				? new Date(contributions[0].date)
				: contributions[0]?.date || new Date();
		const firstDayOfWeek = firstDate.getDay();

		for (let i = 0; i < firstDayOfWeek; i++) {
			const emptyDate = new Date(firstDate);
			emptyDate.setDate(firstDate.getDate() - (firstDayOfWeek - i));
			currentWeek.push({
				date: getLocalDateStr(emptyDate),
				level: 0,
				count: 0,
				hasCheckin: false
			});
		}

		contributions.forEach((day) => {
			// 处理日期字符串，确保正确比较
			let dateStr: string;
			if (typeof day.date === 'string') {
				dateStr = day.date;
			} else {
				// 如果是Date对象，转换为本地日期字符串而不是UTC
				dateStr = getLocalDateStr(day.date);
			}

			const dayData: ContributionDay = {
				...day,
				date: dateStr,
				// 强制使用本地时间重新计算 isToday，确保时区正确
				isToday: dateStr === todayStr
			};
			currentWeek.push(dayData);
			if (currentWeek.length === 7) {
				weeks.push([...currentWeek]);
				currentWeek = [];
			}
		});

		// 检查是否包含今天，如果不包含则补全
		const lastContributedDate =
			contributions.length > 0
				? typeof contributions[contributions.length - 1].date === 'string'
					? contributions[contributions.length - 1].date
					: getLocalDateStr(contributions[contributions.length - 1].date as Date)
				: '';

		// 如果最后一个日期小于今天，我们需要填充直到今天
		if (lastContributedDate && lastContributedDate < todayStr) {
			// 计算相差天数
			const lastDateObj = new Date(lastContributedDate);
			const todayObj = new Date(todayStr);
			const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			for (let i = 1; i <= diffDays; i++) {
				const nextDate = new Date(lastDateObj);
				nextDate.setDate(lastDateObj.getDate() + i);
				const nextDateStr = getLocalDateStr(nextDate);

				const missingDay: ContributionDay = {
					date: nextDateStr,
					level: 0,
					count: 0,
					hasCheckin: false,
					isToday: nextDateStr === todayStr,
					month: nextDate.getMonth(),
					day: nextDate.getDate()
				};

				currentWeek.push(missingDay);
				if (currentWeek.length === 7) {
					weeks.push([...currentWeek]);
					currentWeek = [];
				}
			}
		}

		while (currentWeek.length > 0 && currentWeek.length < 7) {
			const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
			lastDate.setDate(lastDate.getDate() + 1);
			currentWeek.push({
				date: getLocalDateStr(lastDate),
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

	function generateMonthLabels(): MonthLabel[] {
		const labels: MonthLabel[] = [];
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		let currentMonth = -1;
		let lastLabelWeek = -1;

		contributionWeeks.forEach((week, weekIndex) => {
			const firstDay = week[0];
			if (firstDay) {
				const date = new Date(firstDay.date);
				const monthIndex = date.getMonth();
				if (monthIndex !== currentMonth && weekIndex - lastLabelWeek >= 3) {
					currentMonth = monthIndex;
					lastLabelWeek = weekIndex;
					labels.push({ month: monthNames[monthIndex], week: weekIndex });
				}
			}
		});
		return labels;
	}

	function getLevelFromCompletionRate(completionRate = 0): number {
		if (completionRate <= 0) return 0;
		if (completionRate < 25) return 1;
		if (completionRate < 50) return 2;
		if (completionRate < 75) return 3;
		if (completionRate < 100) return 4;
		return 5;
	}

	function getContributionClass(completionRate = 0, isAllCompleted?: boolean): string {
		if (isAllCompleted || completionRate >= 100) {
			return 'bg-stone-600 dark:bg-stone-300 ring-1 ring-stone-300/60 dark:ring-stone-500/60';
		}
		switch (getLevelFromCompletionRate(completionRate)) {
			case 0:
				return 'bg-slate-100 dark:bg-slate-900';
			case 1:
				return 'bg-slate-300 dark:bg-slate-800';
			case 2:
				return 'bg-slate-400 dark:bg-slate-700';
			case 3:
				return 'bg-slate-500 dark:bg-slate-600';
			case 4:
				return 'bg-slate-600 dark:bg-slate-500';
			case 5:
				return 'bg-slate-700 dark:bg-slate-400';
			default:
				return 'bg-slate-100 dark:bg-slate-900/80';
		}
	}

	async function handleDayClick(day: ContributionDay) {
		// 隐私模式校验
		if (privacyMode && !isAuthenticated) {
			pendingDay = day;
			authPassword = '';
			authError = '';
			showAuthModal = true;
			return;
		}

		const dateStr = typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0];
		selectedDate = dateStr;

		try {
			const apiUrl = `/api/checkin?date=${dateStr}`;
			const response = await fetch(apiUrl);
			const result = await response.json();

			if (result.success && result.data) {
				selectedCheckin = result.data;
			} else {
				selectedCheckin = null;
			}
		} catch (error) {
			console.error('❌ [前端] 获取打卡数据失败:', error);
			selectedCheckin = null;
		}

		showModal = true;
		dispatch('dayClick', { date: dateStr, checkin: selectedCheckin || undefined });
	}

	function handleAuthSubmit() {
		if (authPassword === '115813') {
			isAuthenticated = true;
			showAuthModal = false;
			if (pendingDay) {
				handleDayClick(pendingDay);
				pendingDay = null;
			}
		} else {
			authError = '密码错误';
		}
	}

	function handleAuthClose() {
		showAuthModal = false;
		authPassword = '';
		authError = '';
		pendingDay = null;
	}

	function handleModalClose() {
		showModal = false;
		selectedDate = null;
		selectedCheckin = null;
	}

	async function handleModalSave(event: CustomEvent<DailyCheckin>) {
		const checkin = event.detail;
		if (useRealData) {
			await loadRealData(true);
		} else {
			const dateStr = checkin.date;
			const contributions = calendarState?.contributions || [];
			const existingIndex = contributions.findIndex((c) => {
				const cDate = typeof c.date === 'string' ? c.date : c.date.toISOString().split('T')[0];
				return cDate === dateStr;
			});

			if (existingIndex >= 0) {
				const taskList = parseTaskList(checkin.workPlan);
				const totalTasks = taskList.length;
				const completedTasks = taskList.filter((task) => task.completed).length;
				const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
				const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;

				contributions[existingIndex] = {
					...contributions[existingIndex],
					level: getLevelFromCompletionRate(completionRate),
					count: completedTasks,
					completedTasks,
					totalTasks,
					completionRate,
					taskList,
					isAllCompleted,
					hasCheckin: true,
					workPlan: checkin.workPlan,
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
		if (useRealData) {
			await loadRealData();
		} else {
			const contributions = calendarState?.contributions || [];
			const existingIndex = contributions.findIndex((c) => {
				const cDate = typeof c.date === 'string' ? c.date : c.date.toISOString().split('T')[0];
				return cDate === date;
			});

			if (existingIndex >= 0) {
				contributions[existingIndex] = {
					...contributions[existingIndex],
					level: 0,
					count: 0,
					completedTasks: 0,
					totalTasks: 0,
					completionRate: 0,
					taskList: undefined,
					hasCheckin: false,
					workPlan: undefined,
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

	function getTooltipText(day: ContributionDay): string {
		const dateStr = typeof day.date === 'string' ? day.date : day.date.toLocaleDateString('zh-CN');
		if (day.hasCheckin) {
			return `${dateStr}\n完成 ${day.completedTasks || 0}/${day.totalTasks || 0} 个任务 (${
				day.completionRate || 0
			}%)`;
		}
		return `${dateStr}\n点击添加打卡记录`;
	}

	function parseTaskList(plan: string) {
		if (!plan) return [];
		return plan
			.split('\n')
			.map((line, index) => {
				const trimmed = line.trim();
				const match = trimmed.match(/^- \[([ xX])\]\s+(.*)$/);
				if (!match) return null;

				let text = match[2].trim();
				const timeMatch = text.match(/^\[(\d{1,2}:\d{2})\]\s*(?:\[(\d+)m\])?\s*(.*)$/);
				if (timeMatch) {
					text = timeMatch[3]?.trim() || text;
				}

				return {
					id: `task-${index}`,
					text,
					completed: match[1].toLowerCase() === 'x'
				};
			})
			.filter((task): task is { id: string; text: string; completed: boolean } => Boolean(task));
	}

	$: focusAreas = calendarState?.focusAreas || [];
	$: stats = calendarState?.stats;
</script>

<div class="relative group/graph w-fit">
	<div
		class="relative bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
	>
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<div
					class="p-2 rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800"
				>
					<Activity size={15} />
				</div>
				<div>
					<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
						{title}
					</h3>
					<p class="text-[8px] text-slate-500 font-mono mt-0.5">LAST 365 DAYS</p>
				</div>
			</div>

			{#if showFocusAreas && focusAreas.length > 0}
				<div class="hidden md:flex items-center gap-2">
					{#each focusAreas.slice(0, 6) as area}
						<div
							class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] transition-colors hover:border-slate-400 dark:hover:border-slate-600"
						>
							<span class="font-medium text-slate-700 dark:text-slate-300">{area.name}</span>
							{#if area.count !== undefined}
								<span
									class="text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-1.5"
									>{area.count}</span
								>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if isLoading}
			<div class="h-[140px] flex items-center justify-center">
				<LoadingAnimation type="grid" message="Syncing data..." />
			</div>
		{:else if error}
			<div class="text-center py-8">
				<p class="text-red-500 text-xs mb-2">{error}</p>
				<button
					on:click={() => loadRealData()}
					class="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-colors"
				>
					Retry
				</button>
			</div>
		{:else}
			<div class="contribution-graph select-none">
				<div class="flex-1">
					<div
						class="relative flex mb-2 text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-8 h-4"
					>
						{#each monthLabels as label}
							<span class="absolute" style="left: {label.week * 16}px;">
								{label.month}
							</span>
						{/each}
					</div>

					<div class="flex">
						<div
							class="flex flex-col text-[10px] font-medium text-slate-400 dark:text-slate-600 pr-3 leading-none gap-[4px]"
						>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Sun</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Mon</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Tue</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Wed</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Thu</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Fri</div>
							<div class="h-[14px] min-h-[14px] flex items-center justify-end">Sat</div>
						</div>

						<div class="flex gap-[4px]">
							{#each contributionWeeks as week}
								<div class="flex flex-col gap-[4px]">
									{#each week as day}
										<div class="relative group h-[14px] w-[12px]">
											<button
												class="block w-3 h-3 {getContributionClass(
													day.completionRate,
													day.isAllCompleted
												)} rounded-[3px] transition-all duration-200 relative hover:ring-2 hover:ring-slate-400/50 hover:scale-125 hover:z-20 cursor-pointer
													   {day.isToday
													? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 ring-stone-500 dark:ring-stone-300 z-20 scale-110'
													: ''}"
												on:click={() => handleDayClick(day)}
												aria-label={getTooltipText(day)}
											/>

											<div
												class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
														bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs p-3
														rounded-lg shadow-xl border border-slate-700/50
														opacity-0 group-hover:opacity-100
														transition-all duration-200 pointer-events-none
														whitespace-nowrap z-50 min-w-[140px]"
											>
												<div
													class="flex items-center justify-between gap-4 mb-2 border-b border-slate-700/50 pb-2"
												>
													<span class="text-slate-400 text-[10px] font-mono"
														>{typeof day.date === 'string'
															? day.date
															: day.date.toLocaleDateString()}</span
													>
													{#if day.isAllCompleted}
														<span
															class="text-[10px] text-stone-300 flex items-center gap-1 font-medium"
														>
															<CheckCircle2 size={10} />
															Complete
														</span>
													{/if}
												</div>

												<div class="font-medium mb-1 flex items-center gap-2">
													<span class="text-lg font-bold text-slate-300"
														>{day.completionRate || 0}%</span
													>
													<span class="text-slate-400 text-[10px] uppercase tracking-wider"
														>done</span
													>
												</div>

												{#if !privacyMode || isAuthenticated}
													{#if day.hasCheckin && day.taskList?.length}
														<div class="mt-2 space-y-1 max-w-[220px]">
															{#each day.taskList.slice(0, 4) as task}
																<div class="flex items-start gap-1.5 text-[10px] text-slate-300">
																	<span
																		class={task.completed ? 'text-stone-300' : 'text-slate-500'}
																	>
																		{task.completed ? '✓' : '○'}
																	</span>
																	<span
																		class="truncate {task.completed
																			? 'line-through text-slate-500'
																			: ''}"
																	>
																		{task.text}
																	</span>
																</div>
															{/each}
															{#if day.taskList.length > 4}
																<div class="text-[10px] text-slate-500">
																	+{day.taskList.length - 4} more
																</div>
															{/if}
														</div>
													{/if}
													{#if !day.hasCheckin}
														<div class="text-[10px] text-slate-500 italic">
															No activity recorded
														</div>
													{/if}
												{:else}
													<div class="text-[10px] text-slate-500 italic">Protected Content</div>
												{/if}

												<div
													class="absolute top-full left-1/2 transform -translate-x-1/2
															w-0 h-0 border-l-4 border-r-4 border-t-4
															border-transparent border-t-slate-900/95 dark:border-t-slate-950/95"
												/>
											</div>
										</div>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div
					class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]"
				>
					<div class="flex items-center gap-3">
						<span class="text-slate-400 uppercase tracking-wider font-semibold text-[10px]"
							>Completion</span
						>
						<div class="flex gap-[3px]">
							<div
								class="w-[12px] h-[12px] bg-slate-100 dark:bg-slate-900 rounded-[2px] ring-1 ring-inset ring-slate-900/5 dark:ring-white/5"
							/>
							<div class="w-[12px] h-[12px] bg-slate-300 dark:bg-slate-800 rounded-[2px]" />
							<div class="w-[12px] h-[12px] bg-slate-400 dark:bg-slate-700 rounded-[2px]" />
							<div class="w-[12px] h-[12px] bg-slate-500 dark:bg-slate-600 rounded-[2px]" />
							<div class="w-[12px] h-[12px] bg-slate-600 dark:bg-slate-500 rounded-[2px]" />
							<div class="w-[12px] h-[12px] bg-slate-700 dark:bg-slate-400 rounded-[2px]" />
						</div>
					</div>

					<div class="flex items-center gap-4 text-slate-500 dark:text-slate-400">
						<div class="flex items-center gap-1">
							<span>Done</span>
							<span class="font-mono font-bold text-slate-900 dark:text-white"
								>{totalContributions}</span
							>
						</div>

						{#if stats}
							<div class="flex items-center gap-1">
								<span>Active</span>
								<span class="font-mono font-bold text-slate-700 dark:text-slate-300"
									>{stats.checkedInDays}</span
								>
							</div>
							<div class="flex items-center gap-1">
								<span>Streak</span>
								<span class="font-mono font-bold text-stone-700 dark:text-stone-300"
									>{stats.currentStreak}</span
								>
							</div>
							<div class="flex items-center gap-1">
								<span>Rate</span>
								<span class="font-mono font-bold text-stone-700 dark:text-stone-300"
									>{stats.completionRate}%</span
								>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if showAuthModal}
	<div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
		<!-- 背景遮罩 -->
		<div
			class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer"
			on:click={handleAuthClose}
			on:keydown={(e) => e.key === 'Escape' && handleAuthClose()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		/>

		<!-- 模态框内容 -->
		<div
			class="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transform transition-all scale-100"
		>
			<div class="text-center mb-6">
				<div
					class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-4"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="lucide lucide-lock"
						><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
							d="M7 11V7a5 5 0 0 1 10 0v4"
						/></svg
					>
				</div>
				<h3 class="text-lg font-bold text-slate-900 dark:text-white">访问受限</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400 mt-2">请输入密码以查看详细内容</p>
			</div>

			<div class="space-y-4">
				<div>
					<input
						type="password"
						bind:value={authPassword}
						placeholder="输入密码"
						class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400"
						on:keydown={(e) => e.key === 'Enter' && handleAuthSubmit()}
						use:focus
					/>
					{#if authError}
						<p class="text-red-500 text-xs mt-2 text-center">{authError}</p>
					{/if}
				</div>

				<div class="flex gap-3">
					<button
						class="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
						on:click={handleAuthClose}
					>
						取消
					</button>
					<button
						class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 rounded-lg shadow-lg shadow-slate-900/10 transition-colors"
						on:click={handleAuthSubmit}
					>
						解锁
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<CheckinModal
	bind:isOpen={showModal}
	bind:selectedDate
	bind:existingCheckin={selectedCheckin}
	{focusTasksConfig}
	on:close={handleModalClose}
	on:save={handleModalSave}
	on:delete={handleModalDelete}
/>
