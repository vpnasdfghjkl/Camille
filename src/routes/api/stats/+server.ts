import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import type { ContributionDay, ContributionTask, FocusArea } from '$lib/types/contribution';
import type { CalendarState, CheckinStats, ApiResponse } from '$lib/types/checkin';
import { loadFocusTasksConfig } from '$lib/config/focus-tasks-universal';

// 内存缓存
const cache = new Map<string, { data: CalendarState; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 秒缓存

const FOCUS_AREA_ALIASES: Record<string, string> = {
	'graduation-project': 'familiar domain',
	'Graduation Project': 'familiar domain',
	'coding-logical': 'familiar domain',
	'Coding/Logical': 'familiar domain',
	paper: 'familiar domain',
	Paper: 'familiar domain',
	'work-project': 'familiar domain',
	'work project': 'familiar domain',
	'Work Project': 'familiar domain',
	'familiar-domain': 'familiar domain',
	'familiar domain': 'familiar domain',
	'familiar Domain': 'familiar domain',
	'new-exploration': 'new exploration',
	'new exploration': 'new exploration',
	'New Exploration': 'new exploration',
	running: 'running',
	Running: 'running',
	'reading-learning': 'reading',
	'Reading/Learning': 'reading',
	communication: 'communication',
	Communication: 'communication'
};

function parseWorkPlan(plan: string): ContributionTask[] {
	if (!plan) return [];

	return plan.split('\n').reduce<ContributionTask[]>((tasks, line, index) => {
		const trimmed = line.trim();
		if (!trimmed) return tasks;

		const checkboxMatch = trimmed.match(/^- \[([ xX])\]\s+(.*)$/);
		if (!checkboxMatch) {
			tasks.push({
				id: `task-${index}`,
				text: trimmed,
				completed: false
			});
			return tasks;
		}

		let content = checkboxMatch[2].trim();
		let startTime: string | undefined;
		let duration: number | undefined;
		const timeMatch = content.match(/^\[(\d{1,2}:\d{2})\]\s*(?:\[(\d+)m\])?\s*(.*)$/);

		if (timeMatch) {
			startTime = timeMatch[1];
			duration = timeMatch[2] ? Number(timeMatch[2]) : undefined;
			content = timeMatch[3]?.trim() || content;
		}

		tasks.push({
			id: `task-${index}`,
			text: content,
			completed: checkboxMatch[1].toLowerCase() === 'x',
			startTime,
			duration
		});

		return tasks;
	}, []);
}

function rateToLevel(completionRate: number): number {
	if (completionRate <= 0) return 0;
	if (completionRate < 25) return 1;
	if (completionRate < 50) return 2;
	if (completionRate < 75) return 3;
	if (completionRate < 100) return 4;
	return 5;
}

/**
 * 优化的统计数据获取 - 解决速度慢的问题
 * 使用单次查询 + 内存计算 + 缓存策略
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
		const daysBack = parseInt(url.searchParams.get('days') || '365');
		const forceRefresh = url.searchParams.get('refresh') === 'true';

		// 缓存键
		const cacheKey = `stats_${endDate}_${daysBack}`;

		// 检查缓存（除非强制刷新）
		if (!forceRefresh && cache.has(cacheKey)) {
			const cached = cache.get(cacheKey)!;
			if (Date.now() - cached.timestamp < CACHE_TTL) {
				console.log('📋 返回缓存的统计数据');
				return json({ success: true, data: cached.data, cached: true });
			}
		}

		const startTime = Date.now();
		console.log('🚀 开始获取统计数据...');

		// 计算日期范围
		const end = new Date(endDate);
		const start = new Date(end);
		start.setDate(start.getDate() - daysBack + 1);
		const startDateStr = start.toISOString().split('T')[0];

		// 🔥 单次查询获取所有需要的数据
		const { data: rawCheckins, error } = await supabase
			.from('daily_checkins')
			.select('*')
			.gte('date', startDateStr)
			.lte('date', endDate)
			.order('date', { ascending: true });

		if (error) {
			throw new Error(`数据库查询失败: ${error.message}`);
		}

		console.log(
			`📊 查询完成，耗时: ${Date.now() - startTime}ms，获得 ${rawCheckins?.length || 0} 条记录`
		);

		// 加载任务配置
		const focusTasksConfig = await loadFocusTasksConfig();

		// 内存中快速处理数据
		const checkinMap = new Map();
		const validCheckins = rawCheckins || [];

		// 转换数据格式并建立索引
		validCheckins.forEach((record) => {
			const checkin = {
				id: record.id,
				date: record.date,
				wakeUpTime: record.wake_up_time || undefined,
				workStartTime: record.work_start_time || undefined,
				workPlan: record.work_plan || '',
				focusTasks: Array.isArray(record.focus_tasks) ? record.focus_tasks : [],
				focusTasksCompleted: Number(record.focus_tasks_completed || 0),
				notes: record.notes || undefined,
				createdAt: record.created_at,
				updatedAt: record.updated_at
			};
			checkinMap.set(record.date, checkin);
		});

		// 生成贡献图数据
		const contributions: ContributionDay[] = [];
		const currentDate = new Date(start);

		while (currentDate <= end) {
			const dateStr = currentDate.toISOString().split('T')[0];
			const checkin = checkinMap.get(dateStr);

			const taskList = parseWorkPlan(checkin?.workPlan || '');
			const totalTasks = taskList.length;
			const completedTasks = taskList.filter((task) => task.completed).length;
			const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
			const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;

			const contribution: ContributionDay = {
				date: dateStr,
				level: rateToLevel(completionRate),
				count: completedTasks,
				hasCheckin: !!checkin,
				isAllCompleted,
				completedTasks,
				totalTasks,
				completionRate,
				taskList,
				wakeUpTime: checkin?.wakeUpTime,
				workStartTime: checkin?.workStartTime,
				workPlan: checkin?.workPlan,
				notes: checkin?.notes
			};

			contributions.push(contribution);
			currentDate.setDate(currentDate.getDate() + 1);
		}

		const daysWithTasks = contributions.filter((day) => (day.totalTasks || 0) > 0);
		const completedTaskTotal = contributions.reduce(
			(sum, day) => sum + (day.completedTasks || 0),
			0
		);
		const plannedTaskTotal = contributions.reduce((sum, day) => sum + (day.totalTasks || 0), 0);

		// 计算统计信息
		const stats: CheckinStats = {
			totalDays: contributions.length,
			checkedInDays: daysWithTasks.length,
			totalTasks: completedTaskTotal,
			avgTasksPerDay: 0,
			currentStreak: 0,
			longestStreak: 0,
			completionRate: 0
		};

		stats.avgTasksPerDay =
			stats.totalDays > 0 ? Math.round((stats.totalTasks / stats.totalDays) * 10) / 10 : 0;
		stats.completionRate =
			plannedTaskTotal > 0 ? Math.round((completedTaskTotal / plannedTaskTotal) * 100) : 0;

		// 计算连续打卡
		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;

		// 从最新日期开始计算
		for (let i = contributions.length - 1; i >= 0; i--) {
			const contribution = contributions[i];
			if ((contribution.totalTasks || 0) > 0 && (contribution.completionRate || 0) > 0) {
				tempStreak++;
				if (i === contributions.length - 1) {
					currentStreak = tempStreak; // 当前连续
				}
			} else {
				longestStreak = Math.max(longestStreak, tempStreak);
				if (currentStreak === 0) currentStreak = tempStreak;
				tempStreak = 0;
			}
		}

		stats.currentStreak = currentStreak;
		stats.longestStreak = Math.max(longestStreak, tempStreak);

		// 分析专注领域
		const focusAreas: FocusArea[] = focusTasksConfig.map((task) => ({
			name: task.name,
			icon: task.icon,
			count: 0,
			percentage: 0
		}));

		validCheckins.forEach((checkin) => {
			const tasks = Array.isArray(checkin.focus_tasks) ? checkin.focus_tasks : [];
			tasks.forEach((task: { id?: string; name?: string; isCompleted?: boolean }) => {
				if (task.isCompleted && typeof task.name === 'string') {
					const canonicalName =
						(task.id && FOCUS_AREA_ALIASES[task.id]) || FOCUS_AREA_ALIASES[task.name] || task.name;
					const area = focusAreas.find((a) => a.name === canonicalName);
					if (area && typeof area.count === 'number') {
						area.count++;
					}
				}
			});
		});

		// 计算百分比
		const totalFocusCount = focusAreas.reduce((sum, area) => sum + (area.count || 0), 0);
		focusAreas.forEach((area) => {
			const count = area.count || 0;
			area.percentage = totalFocusCount > 0 ? Math.round((count / totalFocusCount) * 100) : 0;
		});

		const calendarState: CalendarState = {
			contributions,
			stats,
			focusAreas: focusAreas.sort((a, b) => (b.count || 0) - (a.count || 0)),
			dateRange: {
				start: startDateStr,
				end: endDate
			}
		};

		// 缓存结果
		cache.set(cacheKey, {
			data: calendarState,
			timestamp: Date.now()
		});

		console.log(`✅ 统计数据生成完成，总耗时: ${Date.now() - startTime}ms`);
		console.log(
			`📈 统计概览: ${stats.checkedInDays}/${stats.totalDays} 天有计划，${stats.totalTasks} 个任务完成`
		);

		const response: ApiResponse<CalendarState> = {
			success: true,
			data: calendarState
		};

		return json(response);
	} catch (error) {
		console.error('❌ 获取统计数据失败:', error);
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '获取统计数据失败'
		};
		return json(errorResponse, { status: 500 });
	}
};

// 清除缓存的辅助端点
export const DELETE: RequestHandler = async () => {
	cache.clear();
	console.log('🧹 统计数据缓存已清除');
	return json({ success: true, message: '缓存已清除' });
};
