import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

// 🔒 安全的 Supabase 配置 - 仅从环境变量读取
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

// 验证必需的环境变量
if (!supabaseUrl || !supabaseKey) {
	throw new Error(
		`
🚨 Supabase 配置缺失！
请在 .env 文件中设置以下环境变量：
- SUPABASE_URL=your_project_url
- SUPABASE_ANON_KEY=your_anon_key

从 https://supabase.com/dashboard 获取这些值
	`.trim()
	);
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 数据库表名
export const TABLES = {
	CHECKINS: 'daily_checkins',
	HEART_RATE: 'heart_rate_readings',
	SLEEP: 'sleep_readings'
} as const;
