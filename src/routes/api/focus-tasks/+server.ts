import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const GET: RequestHandler = async () => {
	try {
		// 从 static 目录读取配置文件
		const configPath = join(process.cwd(), 'static/config/focus-tasks.json');
		const configContent = await readFile(configPath, 'utf-8');
		const config = JSON.parse(configContent);
		
		return json({
			success: true,
			data: config.focusTasks || []
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