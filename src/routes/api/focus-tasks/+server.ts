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
				id: 'familiar-domain',
				name: 'familiar domain',
				icon: '🛠️',
				description: '熟悉领域内的持续推进'
			},
			{
				id: 'new-exploration',
				name: 'new exploration',
				icon: '🧭',
				description: '对新领域的探索和试验'
			},
			{
				id: 'running',
				name: 'running',
				icon: '🏃',
				description: '跑步锻炼，保持健康'
			},
			{
				id: 'reading',
				name: 'reading',
				icon: '📚',
				description: '阅读学习新知识'
			},
			{
				id: 'communication',
				name: 'communication',
				icon: '💬',
				description: '沟通协作'
			}
		];

		return json({
			success: true,
			data: defaultTasks
		});
	}
};
