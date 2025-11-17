import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async () => {
	// 检查环境变量是否存在（不返回实际值，只检查是否配置）
	const hasSupabaseUrl = !!env.SUPABASE_URL;
	const hasSupabaseKey = !!env.SUPABASE_ANON_KEY;
	
	return json({
		environment: process.env.NODE_ENV || 'development',
		supabase_configured: hasSupabaseUrl && hasSupabaseKey,
		supabase_url_exists: hasSupabaseUrl,
		supabase_key_exists: hasSupabaseKey,
		timestamp: new Date().toISOString()
	});
};