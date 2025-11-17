import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseCheckinService } from '$lib/server/supabase-checkin-service';
import type { DailyCheckin, ApiResponse } from '$lib/types/checkin';

// 生成ID
function generateId(): string {
	return `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET - 获取打卡记录
export const GET: RequestHandler = async ({ url }) => {
	try {
		const date = url.searchParams.get('date');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		if (date) {
			// 获取指定日期的打卡记录
			const checkin = await supabaseCheckinService.getCheckin(date);
			const response: ApiResponse<DailyCheckin | null> = {
				success: true,
				data: checkin
			};
			return json(response);
		}

		if (startDate && endDate) {
			// 获取日期范围内的打卡记录
			const rangeCheckins = await supabaseCheckinService.getCheckinsInRange(startDate, endDate);
			const response: ApiResponse<DailyCheckin[]> = {
				success: true,
				data: rangeCheckins
			};
			return json(response);
		}

		// 获取所有打卡记录
		const allCheckins = await supabaseCheckinService.getAllCheckins();
			
		const allResponse: ApiResponse<DailyCheckin[]> = {
			success: true,
			data: allCheckins
		};
		return json(allResponse);

	} catch (error) {
		console.error('❌ API 获取数据失败:', error);
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '获取打卡记录失败'
		};
		return json(errorResponse, { status: 500 });
	}
};

// POST - 创建或更新打卡记录
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { date, wakeUpTime, workStartTime, workPlan, focusTasks, focusTasksCompleted, notes } = body;

		// 验证必需字段
		if (!date || !workPlan) {
			const errorResponse: ApiResponse = {
				success: false,
				error: '日期和工作计划是必需字段'
			};
			return json(errorResponse, { status: 400 });
		}

		// 验证日期格式
		const dateObj = new Date(date);
		if (isNaN(dateObj.getTime())) {
			const errorResponse: ApiResponse = {
				success: false,
				error: '无效的日期格式'
			};
			return json(errorResponse, { status: 400 });
		}

		const formattedDate = dateObj.toISOString().split('T')[0];
		const now = new Date().toISOString();

		// 检查是否已存在记录
		const existingCheckin = await supabaseCheckinService.getCheckin(formattedDate);
		
		if (existingCheckin) {
			// 更新现有记录
			const updatedCheckin: DailyCheckin = {
				...existingCheckin,
				wakeUpTime,
				workStartTime,
				workPlan,
				focusTasks: focusTasks || [],
				focusTasksCompleted: Math.max(0, Math.min(6, focusTasksCompleted || 0)),
				notes,
				updatedAt: now
			};
			
			const result = await supabaseCheckinService.saveCheckin(updatedCheckin);
			
			const response: ApiResponse<DailyCheckin> = {
				success: true,
				data: result,
				message: '打卡记录已更新'
			};
			return json(response);
		} else {
			// 创建新记录
			const newCheckin: DailyCheckin = {
				id: generateId(),
				date: formattedDate,
				wakeUpTime,
				workStartTime,
				workPlan,
				focusTasks: focusTasks || [],
				focusTasksCompleted: Math.max(0, Math.min(6, focusTasksCompleted || 0)),
				notes,
				createdAt: now,
				updatedAt: now
			};
			
			const result = await supabaseCheckinService.saveCheckin(newCheckin);
			
			const response: ApiResponse<DailyCheckin> = {
				success: true,
				data: result,
				message: '打卡记录已创建'
			};
			return json(response);
		}

	} catch (error) {
		console.error('❌ 保存打卡记录时发生错误:', error);
		
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '保存打卡记录失败'
		};
		return json(errorResponse, { status: 500 });
	}
};

// DELETE - 删除打卡记录
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const date = url.searchParams.get('date');
		
		if (!date) {
			const errorResponse: ApiResponse = {
				success: false,
				error: '日期参数是必需的'
			};
			return json(errorResponse, { status: 400 });
		}

		const deleted = await supabaseCheckinService.deleteCheckin(date);
		
		if (deleted) {
			const successResponse: ApiResponse = {
				success: true,
				message: '打卡记录已删除'
			};
			return json(successResponse);
		} else {
			const errorResponse: ApiResponse = {
				success: false,
				error: '未找到指定日期的打卡记录'
			};
			return json(errorResponse, { status: 404 });
		}

	} catch (error) {
		console.error('❌ 删除打卡记录失败:', error);
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '删除打卡记录失败'
		};
		return json(errorResponse, { status: 500 });
	}
};