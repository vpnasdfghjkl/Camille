import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadFocusTasksConfig } from '$lib/config/focus-tasks-universal';

export const GET: RequestHandler = async () => {
	try {
		// 使用通用配置加载器
		const focusTasks = await loadFocusTasksConfig();
		
		return json({
			success: true,
			data: focusTasks
		});
	} catch (error) {
		console.error('Failed to load focus tasks config:', error);
		
		// 返回默认配置
		const defaultTasks = [
			{
				id: 'graduation-project',
				name: 'Graduation Project',
				icon: '🎓',
				description: '毕业设计项目相关工作'
			},
			{
				id: 'coding-logical',
				name: 'Coding/Logical',
				icon: '💻',
				description: '编程和逻辑思维训练'
			},
			{
				id: 'running',
				name: 'Running',
				icon: '🏃',
				description: '跑步锻炼，保持健康'
			},
			{
				id: 'reading-learning',
				name: 'Reading/Learning',
				icon: '📚',
				description: '阅读学习新知识'
			},
			{
				id: 'communication',
				name: 'Communication',
				icon: '💬',
				description: '团队沟通协作'
			},
			{
				id: 'other-tasks',
				name: 'Other Tasks',
				icon: '📝',
				description: '其他重要任务'
			}
		];
		
		return json({
			success: true,
			data: defaultTasks
		});
	}
};