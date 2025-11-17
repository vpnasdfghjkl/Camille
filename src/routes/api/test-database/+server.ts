import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabase';

export const GET: RequestHandler = async () => {
	try {
		console.log('🧪 开始数据库连接测试...');
		
		// 测试 1: 基本连接 - 获取表信息
		const { error: tableError } = await supabase
			.from('daily_checkins')
			.select('count(*)', { count: 'exact', head: true });
		
		if (tableError) {
			throw new Error(`表连接失败: ${tableError.message}`);
		}
		
		// 测试 2: 读取现有数据
		const { data: existingData, error: readError } = await supabase
			.from('daily_checkins')
			.select('*')
			.limit(5);
		
		if (readError) {
			throw new Error(`数据读取失败: ${readError.message}`);
		}
		
		// 测试 3: 写入测试数据
		const testRecord = {
			id: `api_test_${Date.now()}`,
			date: new Date().toISOString().split('T')[0],
			work_plan: '🧪 API 测试记录 - 可以安全删除',
			focus_tasks: [
				{ name: '测试 API 连接', isCompleted: true },
				{ name: '验证数据持久性', isCompleted: true }
			],
			focus_tasks_completed: 2,
			notes: `测试时间: ${new Date().toLocaleString()}`
		};
		
		const { data: insertData, error: insertError } = await supabase
			.from('daily_checkins')
			.insert([testRecord])
			.select();
		
		if (insertError) {
			throw new Error(`数据写入失败: ${insertError.message}`);
		}
		
		// 测试 4: 更新刚插入的数据
		const { data: updateData, error: updateError } = await supabase
			.from('daily_checkins')
			.update({ 
				notes: `✅ 测试完成 - ${new Date().toLocaleString()}`,
				focus_tasks_completed: 3
			})
			.eq('id', testRecord.id)
			.select();
		
		if (updateError) {
			throw new Error(`数据更新失败: ${updateError.message}`);
		}
		
		// 测试 5: 验证更新结果
		const { data: verifyData, error: verifyError } = await supabase
			.from('daily_checkins')
			.select('*')
			.eq('id', testRecord.id)
			.single();
		
		if (verifyError) {
			throw new Error(`数据验证失败: ${verifyError.message}`);
		}
		
		// 返回测试结果
		return json({
			success: true,
			message: '🎉 数据库连接测试通过！',
			timestamp: new Date().toISOString(),
			tests: {
				connection: '✅ 连接成功',
				read: `✅ 读取成功 (${existingData.length} 条现有记录)`,
				write: `✅ 写入成功 (ID: ${insertData[0].id})`,
				update: `✅ 更新成功 (updated_at: ${updateData[0].updated_at})`,
				verify: `✅ 验证成功 (focus_tasks_completed: ${verifyData.focus_tasks_completed})`
			},
			database_status: {
				total_records: existingData.length + 1,
				latest_record: verifyData,
				test_record_id: testRecord.id
			},
			cleanup_info: {
				message: '测试记录已创建，您可以通过以下方式清理:',
				api_endpoint: `/api/test-database?cleanup=${testRecord.id}`,
				manual_delete: `DELETE FROM daily_checkins WHERE id = '${testRecord.id}';`
			}
		});
		
	} catch (error) {
		console.error('❌ 数据库测试失败:', error);
		
		return json({
			success: false,
			error: error instanceof Error ? error.message : '数据库测试失败',
			timestamp: new Date().toISOString(),
			troubleshooting: {
				check_env: '检查 .env 文件是否包含 SUPABASE_URL 和 SUPABASE_ANON_KEY',
				check_table: '确认数据表 daily_checkins 已正确创建',
				check_permissions: '验证 API Key 是否有正确的读写权限',
				supabase_dashboard: 'https://supabase.com/dashboard'
			}
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const cleanupId = url.searchParams.get('cleanup');
	
	if (!cleanupId) {
		return json({ error: '需要提供 cleanup 参数' }, { status: 400 });
	}
	
	try {
		const { error } = await supabase
			.from('daily_checkins')
			.delete()
			.eq('id', cleanupId);
		
		if (error) {
			throw new Error(`清理失败: ${error.message}`);
		}
		
		return json({
			success: true,
			message: `✅ 测试记录 ${cleanupId} 已清理完成`,
			timestamp: new Date().toISOString()
		});
		
	} catch (error) {
		return json({
			success: false,
			error: error instanceof Error ? error.message : '清理失败'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async () => {
	try {
		console.log('🚀 快速测试数据库表是否存在...');

		// 简单的存在性测试
		const testData = {
			id: 'quick_test_' + Date.now(),
			date: new Date().toISOString().split('T')[0],
			work_plan: '快速存在性测试',
			focus_tasks: [],
			focus_tasks_completed: 0
		};

		const { error } = await supabase
			.from('daily_checkins')
			.insert(testData)
			.select()
			.single();

		if (error) {
			console.log('插入失败，说明表可能不存在:', error.message);
			
			return json({
				success: false,
				error: '表不存在，需要手动创建',
				message: '请在 Supabase Dashboard 中运行建表脚本',
				instructions: [
					'1. 打开 Supabase Dashboard SQL Editor',
					'2. 复制并运行 simple-create-table.sql 中的脚本',
					'3. 点击 RUN 执行',
					'4. 刷新页面重试'
				],
				sql_file: 'simple-create-table.sql'
			});
		}

		// 如果成功，立即删除测试数据
		await supabase
			.from('daily_checkins')
			.delete()
			.eq('id', testData.id);

		return json({
			success: true,
			message: '✅ daily_checkins 表已存在且工作正常！',
			recommendation: '使用 GET 请求进行完整的功能测试'
		});

	} catch (error) {
		console.error('❌ 设置失败:', error);
		
		return json({
			success: false,
			error: error instanceof Error ? error.message : '设置失败',
			solution: '请手动在 Supabase Dashboard 中创建表'
		}, { status: 500 });
	}
};