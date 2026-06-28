/**
 * 日程管理和打卡系统的类型定义
 */

/** 单日打卡记录 */
export interface DailyCheckin {
	id: string;
	date: string; // YYYY-MM-DD 格式
	wakeUpTime?: string; // legacy optional time field
	workStartTime?: string; // legacy optional time field
	workPlan: string; // 当天工作计划
	focusTasks: FocusTask[]; // direction 标记情况
	focusTasksCompleted: number; // 标记的 direction 数量
	notes?: string; // 额外备注
	createdAt: string; // ISO时间戳
	updatedAt: string; // ISO时间戳
}

/** Direction tag type */
export interface FocusTask {
	id: string;
	name: string;
	icon: string;
	description?: string;
	isCompleted: boolean; // 是否完成
}

/** 日历交互状态 */
export interface CalendarState {
	selectedDate?: string | null;
	isModalOpen?: boolean;
	currentCheckin?: DailyCheckin | null;
	contributions: ContributionDay[];
	stats: CheckinStats;
	focusAreas: FocusArea[];
	dateRange: {
		start: string;
		end: string;
	};
}

/** 统计信息 */
export interface CheckinStats {
	totalDays: number;
	checkedInDays: number;
	totalTasks: number;
	avgTasksPerDay: number;
	currentStreak: number;
	longestStreak: number;
	completionRate: number;
}

/** API响应类型 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// 重新导出原有的贡献图类型
export type { ContributionDay, MonthLabel, FocusArea } from './contribution';

// 导入类型用于接口定义
import type { ContributionDay, FocusArea } from './contribution';

/** 贡献图数据（包含打卡信息） */
export interface ContributionData {
	date: Date;
	level: number;
	isAllCompleted: boolean;
	count: number;
	isToday: boolean;
	month: number;
	day: number;
	checkin?: DailyCheckin;
	hasCheckin: boolean;
}
