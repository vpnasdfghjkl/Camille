import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CalendarState, CheckinStats, ApiResponse, DailyCheckin } from '$lib/types/checkin';
import type { ContributionDay, FocusArea } from '$lib/types/contribution';
import { getCheckinsInRange } from '$lib/server/checkin-storage-universal';
import { loadFocusTasksConfig } from '$lib/config/focus-tasks-universal';

// 从存储服务获取数据
async function fetchCheckinData(startDate: string, endDate: string): Promise<DailyCheckin[]> {
	try {
		return await getCheckinsInRange(startDate, endDate);
	} catch (error) {
		console.error('获取打卡数据失败:', error);
		return [];
	}
}

// 计算专注度等级（根据完成的专注任务数量）
function calculateFocusLevel(focusTasksCompleted: number): number {
	return Math.min(focusTasksCompleted, 6); // 直接返回任务数量，最大6
}

// 生成贡献图数据
async function generateContributionData(checkins: DailyCheckin[], startDate: Date, endDate: Date): Promise<ContributionDay[]> {
	const contributions: ContributionDay[] = [];
	const checkinMap = new Map(checkins.map(c => [c.date, c]));
	
	// 获取最新的任务配置
	const focusTasksConfig = await loadFocusTasksConfig();
	const totalFocusTasks = focusTasksConfig.length;
	
	const currentDate = new Date(startDate);
	while (currentDate <= endDate) {
		const dateStr = currentDate.toISOString().split('T')[0];
		const checkin = checkinMap.get(dateStr);
		
		const level = checkin ? calculateFocusLevel(checkin.focusTasksCompleted || 0) : 0;
		
		const contribution: ContributionDay = {
			date: dateStr,
			level,
			count: checkin ? checkin.focusTasksCompleted || 0 : 0,
			hasCheckin: !!checkin,
			isAllCompleted: level >= totalFocusTasks, // 所有任务完成才是完美日
			wakeUpTime: checkin?.wakeUpTime,
			workStartTime: checkin?.workStartTime,
			workPlan: checkin?.workPlan,
			notes: checkin?.notes
		};
		
		contributions.push(contribution);
		currentDate.setDate(currentDate.getDate() + 1);
	}
	
	return contributions;
}

// 计算统计信息
function calculateStats(checkins: DailyCheckin[]): CheckinStats {
	const totalDays = checkins.length;
	const checkedInDays = checkins.filter(c => c.focusTasksCompleted > 0).length;
	const totalTasks = checkins.reduce((sum, c) => sum + (c.focusTasksCompleted || 0), 0);
	const avgTasksPerDay = totalDays > 0 ? totalTasks / totalDays : 0;
	
	// 计算连续打卡天数
	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 0;
	
	const sortedCheckins = [...checkins].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	
	for (let i = 0; i < sortedCheckins.length; i++) {
		const checkin = sortedCheckins[i];
		if (checkin.focusTasksCompleted > 0) {
			tempStreak++;
			if (i === 0) currentStreak = tempStreak; // 最新的连续记录
		} else {
			longestStreak = Math.max(longestStreak, tempStreak);
			tempStreak = 0;
		}
	}
	
	longestStreak = Math.max(longestStreak, tempStreak);
	if (tempStreak > 0 && sortedCheckins[0]?.focusTasksCompleted > 0) {
		currentStreak = tempStreak;
	}
	
	return {
		totalDays,
		checkedInDays,
		totalTasks,
		avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
		currentStreak,
		longestStreak,
		completionRate: totalDays > 0 ? Math.round((checkedInDays / totalDays) * 100) : 0
	};
}

// 分析专注领域 - 基于实际的 focus tasks 配置
async function analyzeFocusAreas(checkins: DailyCheckin[]): Promise<FocusArea[]> {
	const focusTasksConfig = await loadFocusTasksConfig();
	
	// 基于实际配置创建统计数据
	const areas: FocusArea[] = focusTasksConfig.map(task => ({
		name: task.name,
		icon: task.icon,
		count: 0,
		percentage: 0
	}));
	
	// 统计每个任务在打卡记录中被完成的次数
	checkins.forEach(checkin => {
		if (checkin.focusTasks && Array.isArray(checkin.focusTasks)) {
			checkin.focusTasks.forEach(task => {
				if (task.isCompleted) {
					const areaObj = areas.find(a => a.name === task.name);
					if (areaObj) {
						areaObj.count = (areaObj.count || 0) + 1;
					}
				}
			});
		}
	});
	
	// 计算百分比
	const total = areas.reduce((sum, area) => sum + (area.count || 0), 0);
	areas.forEach(area => {
		area.percentage = total > 0 ? Math.round(((area.count || 0) / total) * 100) : 0;
	});
	
	return areas.filter(area => (area.count || 0) > 0).sort((a, b) => (b.count || 0) - (a.count || 0));
}

// GET - 获取贡献图和统计数据
export const GET: RequestHandler = async ({ url }) => {
	try {
		const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];
		const daysBack = parseInt(url.searchParams.get('days') || '365');
		
		const end = new Date(endDate);
		const start = new Date(end);
		start.setDate(start.getDate() - daysBack + 1);
		
		const startDateStr = start.toISOString().split('T')[0];
		const endDateStr = end.toISOString().split('T')[0];
		
		// 获取打卡数据
		const checkins = await fetchCheckinData(startDateStr, endDateStr);
		
		// 生成贡献图数据
		const contributions = await generateContributionData(checkins, start, end);
		
		// 计算统计信息
		const stats = calculateStats(checkins);
		
		// 分析专注领域
		const focusAreas = await analyzeFocusAreas(checkins);
		
		const calendarState: CalendarState = {
			contributions,
			stats,
			focusAreas,
			dateRange: {
				start: startDateStr,
				end: endDateStr
			}
		};
		
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