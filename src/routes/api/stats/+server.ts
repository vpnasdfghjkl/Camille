import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';
import type { ContributionDay, FocusArea } from '$lib/types/contribution';
import type { CalendarState, CheckinStats, ApiResponse } from '$lib/types/checkin';
import { loadFocusTasksConfig } from '$lib/config/focus-tasks-universal';

// 内存缓存
const cache = new Map<string, { data: CalendarState; timestamp: number; }>();
const CACHE_TTL = 30 * 1000; // 30 秒缓存

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
		
		console.log(`📊 查询完成，耗时: ${Date.now() - startTime}ms，获得 ${rawCheckins?.length || 0} 条记录`);
		
		// 加载任务配置
		const focusTasksConfig = await loadFocusTasksConfig();
		const totalFocusTasks = focusTasksConfig.length || 6;
		
		// 内存中快速处理数据
		const checkinMap = new Map();
		const validCheckins = rawCheckins || [];
		
		// 转换数据格式并建立索引
		validCheckins.forEach(record => {
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
			
			const completedTasks = checkin?.focusTasksCompleted || 0;
			const isAllCompleted = completedTasks >= totalFocusTasks;
			
			const contribution: ContributionDay = {
				date: dateStr,
				level: completedTasks,
				count: completedTasks,
				hasCheckin: !!checkin,
				isAllCompleted: isAllCompleted, // 🎯 正确的完美日判断
				wakeUpTime: checkin?.wakeUpTime,
				workStartTime: checkin?.workStartTime,
				workPlan: checkin?.workPlan,
				notes: checkin?.notes
			};
			
			contributions.push(contribution);
			currentDate.setDate(currentDate.getDate() + 1);
		}
		
		// 计算统计信息
		const stats: CheckinStats = {
			totalDays: contributions.length,
			checkedInDays: validCheckins.filter(c => (c.focus_tasks_completed || 0) > 0).length,
			totalTasks: validCheckins.reduce((sum, c) => sum + (c.focus_tasks_completed || 0), 0),
			avgTasksPerDay: 0,
			currentStreak: 0,
			longestStreak: 0,
			completionRate: 0
		};
		
		stats.avgTasksPerDay = stats.totalDays > 0 ? 
			Math.round((stats.totalTasks / stats.totalDays) * 10) / 10 : 0;
		stats.completionRate = stats.totalDays > 0 ? 
			Math.round((stats.checkedInDays / stats.totalDays) * 100) : 0;
		
		// 计算连续打卡
		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
		
		// 从最新日期开始计算
		for (let i = contributions.length - 1; i >= 0; i--) {
			const contribution = contributions[i];
			if (contribution.hasCheckin && contribution.count > 0) {
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
		const focusAreas: FocusArea[] = focusTasksConfig.map(task => ({
			name: task.name,
			icon: task.icon,
			count: 0,
			percentage: 0
		}));
		
		validCheckins.forEach(checkin => {
			const tasks = Array.isArray(checkin.focus_tasks) ? checkin.focus_tasks : [];
			tasks.forEach((task: { name?: string; isCompleted?: boolean }) => {
				if (task.isCompleted && typeof task.name === 'string') {
					const area = focusAreas.find(a => a.name === task.name);
					if (area && typeof area.count === 'number') {
						area.count++;
					}
				}
			});
		});
		
		// 计算百分比
		const totalFocusCount = focusAreas.reduce((sum, area) => sum + (area.count || 0), 0);
		focusAreas.forEach(area => {
			const count = area.count || 0;
			area.percentage = totalFocusCount > 0 ? 
				Math.round((count / totalFocusCount) * 100) : 0;
		});
		
		const calendarState: CalendarState = {
			contributions,
			stats,
			focusAreas: focusAreas
				.filter(area => (area.count || 0) > 0)
				.sort((a, b) => (b.count || 0) - (a.count || 0)),
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
		console.log(`📈 统计概览: ${stats.checkedInDays}/${stats.totalDays} 天打卡，${stats.totalTasks} 个任务完成`);
		
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