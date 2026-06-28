/**
 * 贡献图相关类型定义
 */

/** 单日贡献数据 */
export interface ContributionDay {
	/** 日期 */
	date: Date | string;
	/** 贡献级别 (0-5)，由当天任务清单完成率计算 */
	level: number;
	/** 是否完成当天全部任务 */
	isAllCompleted?: boolean;
	/** 贡献数量 */
	count: number;
	/** 当天任务清单完成数 */
	completedTasks?: number;
	/** 当天任务清单总数 */
	totalTasks?: number;
	/** 当天任务清单完成率 (0-100) */
	completionRate?: number;
	/** 当天任务清单 */
	taskList?: ContributionTask[];
	/** 是否为今天 */
	isToday?: boolean;
	/** 月份 (0-11) */
	month?: number;
	/** 日期 (1-31) */
	day?: number;
	/** 是否有打卡记录 */
	hasCheckin?: boolean;
	/** Legacy optional time field, no longer shown in the entry form */
	wakeUpTime?: string;
	/** Legacy optional time field, no longer shown in the entry form */
	workStartTime?: string;
	/** 工作计划 */
	workPlan?: string;
	/** 备注 */
	notes?: string;
}

/** 单日任务清单项 */
export interface ContributionTask {
	id?: string;
	text: string;
	completed: boolean;
	startTime?: string;
	duration?: number;
}

/** 月份标签 */
export interface MonthLabel {
	/** 月份缩写 */
	month: string;
	/** 所在周数 */
	week: number;
}

/** 关注领域 */
export interface FocusArea {
	/** 领域名称 */
	name: string;
	/** 图标 emoji */
	icon?: string;
	/** 数量统计 */
	count?: number;
	/** 百分比 */
	percentage?: number;
}

/** 贡献图配置选项 */
export interface ContributionGraphOptions {
	/** 是否显示关注领域标签 */
	showFocusAreas?: boolean;
	/** 自定义标题 */
	title?: string;
	/** 关注领域列表 */
	focusAreas?: FocusArea[];
}
