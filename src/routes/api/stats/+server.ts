import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { CalendarState, CheckinStats, ApiResponse, DailyCheckin } from '$lib/types/checkin';
import type { ContributionDay, FocusArea } from '$lib/types/contribution';
import { getCheckinsInRange } from '$lib/server/checkin-storage';
import { getFocusTasksConfig, convertToFocusAreas } from '$lib/config/focus-tasks';

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
function generateContributionData(checkins: DailyCheckin[], startDate: Date, endDate: Date): ContributionDay[] {
	const contributions: ContributionDay[] = [];
	const checkinMap = new Map(checkins.map(c => [c.date, c]));
	
	const currentDate = new Date(startDate);
	while (currentDate <= endDate) {
		const dateStr = currentDate.toISOString().split('T')[0];
		const checkin = checkinMap.get(dateStr);
		
		const level = checkin ? calculateFocusLevel(checkin.focusTasksCompleted || 0) : 0;
		// 动态获取任务总数 - 优先使用实际配置，其次使用记录中的数组长度
		const focusTasksConfig = getFocusTasksConfig();
		const totalFocusTasks = focusTasksConfig.length || checkin?.focusTasks?.length || 6;
		
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

// 分析专注领域
function analyzeFocusAreas(checkins: DailyCheckin[]): FocusArea[] {
	// 这里可以根据工作计划内容分析关键词
	// 简化版本，返回一些示例数据
	const areas: FocusArea[] = [
		{ name: '编程开发', count: 0, percentage: 0 },
		{ name: '学习研究', count: 0, percentage: 0 },
		{ name: '项目管理', count: 0, percentage: 0 },
		{ name: '文档写作', count: 0, percentage: 0 }
	];
	
	const keywords = {
		'编程开发': ['代码', '编程', '开发', '前端', '后端', 'bug', '功能'],
		'学习研究': ['学习', '研究', '教程', '文档', '笔记', '总结'],
		'项目管理': ['项目', '计划', '会议', '讨论', '评审', '管理'],
		'文档写作': ['文档', '写作', '博客', '记录', '整理', '总结']
	};
	
	checkins.forEach(checkin => {
		if (checkin.workPlan) {
			const plan = checkin.workPlan.toLowerCase();
			Object.entries(keywords).forEach(([area, words]) => {
				if (words.some(word => plan.includes(word))) {
					const areaObj = areas.find(a => a.name === area);
					if (areaObj && areaObj.count !== undefined) {
						areaObj.count++;
					}
				}
			});
		}
	});
	
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
		const contributions = generateContributionData(checkins, start, end);
		
		// 计算统计信息
		const stats = calculateStats(checkins);
		
		// 分析专注领域
		const focusAreas = analyzeFocusAreas(checkins);
		
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
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '获取统计数据失败'
		};
		return json(errorResponse, { status: 500 });
	}
};