/**
 * 焦点任务配置
 * 可以通过修改这个文件来调整可用的焦点任务
 */

export interface FocusTaskConfig {
	id: string;
	name: string;
	icon: string;
	description: string;
	category?: string;
	priority?: number;
}

/**
 * 默认焦点任务配置
 * 可以根据需要修改、添加或删除任务
 */
export const DEFAULT_FOCUS_TASKS: FocusTaskConfig[] = [
	{
		id: 'familiar-domain',
		name: 'familiar domain',
		icon: '🛠️',
		description: '熟悉领域内的持续推进',
		category: 'work',
		priority: 1
	},
	{
		id: 'new-exploration',
		name: 'new exploration',
		icon: '🧭',
		description: '对新领域的探索和试验',
		category: 'exploration',
		priority: 2
	},
	{
		id: 'running',
		name: 'running',
		icon: '🏃',
		description: '跑步锻炼，保持健康',
		category: 'health',
		priority: 3
	},
	{
		id: 'reading',
		name: 'reading',
		icon: '📚',
		description: '阅读学习新知识',
		category: 'learning',
		priority: 4
	},
	{
		id: 'communication',
		name: 'communication',
		icon: '💬',
		description: '沟通协作',
		category: 'social',
		priority: 5
	}
];

/**
 * 获取焦点任务配置
 * 可以从环境变量、配置文件或其他来源加载
 */
export function getFocusTasksConfig(): FocusTaskConfig[] {
	// 在浏览器环境中，可以从 static 目录加载配置文件
	// 在服务端环境中，直接返回默认配置
	// 实际项目中可以实现异步加载逻辑

	return DEFAULT_FOCUS_TASKS;
}

/**
 * 异步获取焦点任务配置（用于在客户端加载外部配置）
 */
export async function getFocusTasksConfigAsync(): Promise<FocusTaskConfig[]> {
	try {
		const response = await fetch('/api/focus-tasks');
		if (response.ok) {
			const result = await response.json();
			if (result.success && result.data) {
				return result.data;
			}
		}
	} catch (error) {
		console.warn('Failed to load focus tasks config from API, using default:', error);
	}

	return DEFAULT_FOCUS_TASKS;
}

/**
 * 将焦点任务配置转换为贡献图的 FocusArea 格式
 */
export function convertToFocusAreas(tasks: FocusTaskConfig[]): Array<{
	name: string;
	icon: string;
	count?: number;
	percentage?: number;
}> {
	return tasks.map((task) => ({
		name: task.name,
		icon: task.icon,
		count: 0, // 初始值，实际使用时会从统计数据中计算
		percentage: 0
	}));
}

/**
 * 将焦点任务配置转换为打卡模态框的 FocusTask 格式
 */
export function convertToFocusTasks(tasks: FocusTaskConfig[]): Array<{
	id: string;
	name: string;
	icon: string;
	description: string;
	isCompleted: boolean;
}> {
	return tasks.map((task) => ({
		id: task.id,
		name: task.name,
		icon: task.icon,
		description: task.description,
		isCompleted: false
	}));
}
