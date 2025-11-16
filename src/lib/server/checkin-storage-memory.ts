import type { DailyCheckin } from '$lib/types/checkin';

// 模拟数据存储，在实际部署中应该使用数据库
const checkinsStore = new Map<string, DailyCheckin>();

// 获取单个打卡记录
export async function getCheckin(date: string): Promise<DailyCheckin | null> {
	return checkinsStore.get(date) || null;
}

// 保存单个打卡记录
export async function saveCheckin(checkin: DailyCheckin): Promise<void> {
	checkinsStore.set(checkin.date, checkin);
	console.log(`已保存打卡记录: ${checkin.date}`);
}

// 删除单个打卡记录
export async function deleteCheckin(date: string): Promise<boolean> {
	const deleted = checkinsStore.delete(date);
	console.log(deleted ? `已删除打卡记录: ${date}` : `未找到打卡记录: ${date}`);
	return deleted;
}

// 获取日期范围内的打卡记录
export async function getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
	const result: DailyCheckin[] = [];
	const start = new Date(startDate);
	const end = new Date(endDate);
	
	for (const [dateKey, checkin] of checkinsStore) {
		const checkinDate = new Date(dateKey);
		if (checkinDate >= start && checkinDate <= end) {
			result.push(checkin);
		}
	}
	
	return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 获取所有打卡记录
export async function getAllCheckins(): Promise<DailyCheckin[]> {
	return Array.from(checkinsStore.values())
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}