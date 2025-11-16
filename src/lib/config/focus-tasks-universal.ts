import type { FocusTaskConfig } from './focus-tasks';

// 默认任务配置
const DEFAULT_FOCUS_TASKS: FocusTaskConfig[] = [
	{
		id: 'graduation-project',
		name: 'Graduation Project',
		icon: '🎓',
		description: '毕业设计项目相关工作',
		category: 'academic',
		priority: 1
	},
	{
		id: 'coding-logical',
		name: 'Coding/Logical',
		icon: '💻',
		description: '编程和逻辑思维训练',
		category: 'development',
		priority: 2
	},
	{
		id: 'running',
		name: 'Running',
		icon: '🏃',
		description: '跑步锻炼，保持健康',
		category: 'health',
		priority: 3
	},
	{
		id: 'reading-learning',
		name: 'Reading/Learning',
		icon: '📚',
		description: '阅读学习新知识',
		category: 'learning',
		priority: 4
	},
	{
		id: 'communication',
		name: 'Communication',
		icon: '💬',
		description: '团队沟通协作',
		category: 'social',
		priority: 5
	}
];

// 检查文件系统是否可用
function isFileSystemAvailable(): boolean {
	try {
		// 在 Vercel 和 Netlify 等 serverless 环境中禁用文件系统访问
		if (process.env.VERCEL || process.env.NETLIFY) {
			return false;
		}
		
		return typeof process !== 'undefined' && 
		       typeof process.cwd === 'function';
	} catch {
		return false;
	}
}

/**
 * 通用配置加载器
 * 支持多种配置源，按优先级顺序尝试：
 * 1. API 调用 (浏览器环境)
 * 2. 本地文件系统 (服务器环境)
 * 3. 环境变量
 * 4. 默认配置
 */
export async function loadFocusTasksConfig(): Promise<FocusTaskConfig[]> {
	try {
		// 1. 浏览器环境，尝试从 API 加载
		if (typeof window !== 'undefined') {
			try {
				const response = await fetch('/api/focus-tasks');
				if (response.ok) {
					const result = await response.json();
					if (result.success && result.data && Array.isArray(result.data)) {
						console.log(`✅ 从 API 加载任务配置: ${result.data.length} 个任务`);
						return result.data;
					}
				}
			} catch (error) {
				console.log('⚠️ 从 API 加载配置失败:', error);
			}
		}

		// 2. 服务器环境，尝试从文件系统加载
		if (typeof process !== 'undefined' && isFileSystemAvailable()) {
			try {
				const { promises: fs } = await import('fs');
				const { join } = await import('path');
				
				const configPath = join(process.cwd(), 'static', 'config', 'focus-tasks.json');
				const configFile = await fs.readFile(configPath, 'utf-8');
				const config = JSON.parse(configFile);
				
				if (config.focusTasks && Array.isArray(config.focusTasks)) {
					console.log(`✅ 从文件加载任务配置: ${config.focusTasks.length} 个任务`);
					return config.focusTasks;
				}
			} catch (error) {
				console.log(`⚠️ 从文件加载配置失败: ${error instanceof Error ? error.message : String(error)}`);
			}
		}

		// 3. 尝试从环境变量加载
		if (typeof process !== 'undefined' && process.env.FOCUS_TASKS_CONFIG) {
			try {
				const config = JSON.parse(process.env.FOCUS_TASKS_CONFIG);
				if (Array.isArray(config)) {
					console.log('✅ 从环境变量加载焦点任务配置');
					return config;
				}
			} catch (error) {
				console.log('❌ 环境变量配置格式错误');
			}
		}

		// 4. 使用默认配置
		console.log('📝 使用默认焦点任务配置');
		return DEFAULT_FOCUS_TASKS;
	} catch (error) {
		console.error('❌ 加载焦点任务配置时出错:', error);
		return DEFAULT_FOCUS_TASKS;
	}
}