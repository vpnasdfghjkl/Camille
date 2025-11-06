/**
 * 贡献图相关类型定义
 */

/** 单日贡献数据 */
export interface ContributionDay {
	/** 日期 */
	date: Date;
	/** 贡献级别 (0-4) */
	level: number;
	/** 是否为完美日 (level === 4) */
	isAllCompleted: boolean;
	/** 贡献数量 */
	count: number;
	/** 是否为今天 */
	isToday: boolean;
	/** 月份 (0-11) */
	month: number;
	/** 日期 (1-31) */
	day: number;
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
	icon: string;
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