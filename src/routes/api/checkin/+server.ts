import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DailyCheckin, ApiResponse } from '$lib/types/checkin';
import { 
	getCheckin, 
	saveCheckin, 
	deleteCheckin, 
	getCheckinsInRange, 
	getAllCheckins 
} from '$lib/server/checkin-storage-universal';

// 生成ID
function generateId(): string {
	return `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
	return date.toISOString().split('T')[0];
}

// GET - 获取打卡记录
export const GET: RequestHandler = async ({ url }) => {
	try {
		const date = url.searchParams.get('date');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		if (date) {
			// 获取指定日期的打卡记录
			const checkin = await getCheckin(date);
			const response: ApiResponse<DailyCheckin | null> = {
				success: true,
				data: checkin
			};
			return json(response);
		}

		if (startDate && endDate) {
			// 获取日期范围内的打卡记录
			const rangeCheckins = await getCheckinsInRange(startDate, endDate);
			const response: ApiResponse<DailyCheckin[]> = {
				success: true,
				data: rangeCheckins
			};
			return json(response);
		}

		// 获取所有打卡记录
		const allCheckins = await getAllCheckins();
			
		const allResponse: ApiResponse<DailyCheckin[]> = {
			success: true,
			data: allCheckins
		};
		return json(allResponse);

	} catch (error) {
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

		const formattedDate = formatDate(dateObj);
		const now = new Date().toISOString();

		// 检查是否已存在记录
		const existingCheckin = await getCheckin(formattedDate);
		
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
			
			await saveCheckin(updatedCheckin);
			
			const response: ApiResponse<DailyCheckin> = {
				success: true,
				data: updatedCheckin,
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
			
			await saveCheckin(newCheckin);
			
			const response: ApiResponse<DailyCheckin> = {
				success: true,
				data: newCheckin,
				message: '打卡记录已创建'
			};
			return json(response);
		}

	} catch (error) {
		console.error('❌ 保存打卡记录时发生错误:', error);
		console.error('📍 错误堆栈:', error instanceof Error ? error.stack : 'No stack trace');
		
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

		const deleted = await deleteCheckin(date);
		
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
		const errorResponse: ApiResponse = {
			success: false,
			error: error instanceof Error ? error.message : '删除打卡记录失败'
		};
		return json(errorResponse, { status: 500 });
	}
};