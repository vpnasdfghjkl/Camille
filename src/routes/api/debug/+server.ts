import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		// 收集环境信息用于调试
		const envInfo = {
			nodeVersion: process.version,
			platform: process.platform,
			isVercel: !!process.env.VERCEL,
			isNetlify: !!process.env.NETLIFY,
			hasFilesystem: typeof process.cwd === 'function',
			cwd: process.cwd?.(),
			envVars: {
				NODE_ENV: process.env.NODE_ENV,
				VERCEL: process.env.VERCEL,
				NETLIFY: process.env.NETLIFY,
				FOCUS_TASKS_CONFIG: process.env.FOCUS_TASKS_CONFIG ? 'Set' : 'Not Set'
			},
			timestamp: new Date().toISOString()
		};

		console.log('🔍 环境调试信息:', JSON.stringify(envInfo, null, 2));

		return json({
			success: true,
			data: envInfo
		});
	} catch (error) {
		console.error('❌ 获取调试信息失败:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : '获取调试信息失败'
		}, { status: 500 });
	}
};