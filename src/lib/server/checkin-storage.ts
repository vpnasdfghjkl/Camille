import fs from 'fs/promises';
import path from 'path';
import type { DailyCheckin } from '$lib/types/checkin';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const CHECKINS_FILE = path.join(DATA_DIR, 'checkins.json');

// 确保数据目录存在
async function ensureDataDir() {
	try {
		await fs.access(DATA_DIR);
	} catch {
		await fs.mkdir(DATA_DIR, { recursive: true });
	}
}

// 读取所有打卡数据
export async function loadCheckins(): Promise<Map<string, DailyCheckin>> {
	try {
		await ensureDataDir();
		const data = await fs.readFile(CHECKINS_FILE, 'utf-8');
		const checkinsArray: DailyCheckin[] = JSON.parse(data);
		const checkinsMap = new Map<string, DailyCheckin>();
		
		checkinsArray.forEach(checkin => {
			checkinsMap.set(checkin.date, checkin);
		});
		
		return checkinsMap;
	} catch (error) {
		// 文件不存在或读取失败，返回空Map
		console.log('初始化空的打卡数据库');
		return new Map<string, DailyCheckin>();
	}
}

// 保存所有打卡数据
export async function saveCheckins(checkins: Map<string, DailyCheckin>): Promise<void> {
	try {
		await ensureDataDir();
		const checkinsArray = Array.from(checkins.values());
		await fs.writeFile(CHECKINS_FILE, JSON.stringify(checkinsArray, null, 2), 'utf-8');
		console.log(`已保存 ${checkinsArray.length} 条打卡记录到 ${CHECKINS_FILE}`);
	} catch (error) {
		console.error('保存打卡数据失败:', error);
		throw new Error('数据保存失败');
	}
}

// 获取单个打卡记录
export async function getCheckin(date: string): Promise<DailyCheckin | null> {
	const checkins = await loadCheckins();
	return checkins.get(date) || null;
}

// 保存单个打卡记录
export async function saveCheckin(checkin: DailyCheckin): Promise<void> {
	const checkins = await loadCheckins();
	checkins.set(checkin.date, checkin);
	await saveCheckins(checkins);
}

// 删除单个打卡记录
export async function deleteCheckin(date: string): Promise<boolean> {
	const checkins = await loadCheckins();
	const deleted = checkins.delete(date);
	if (deleted) {
		await saveCheckins(checkins);
	}
	return deleted;
}

// 获取日期范围内的打卡记录
export async function getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
	const checkins = await loadCheckins();
	const result: DailyCheckin[] = [];
	const start = new Date(startDate);
	const end = new Date(endDate);
	
	for (const [dateKey, checkin] of checkins) {
		const checkinDate = new Date(dateKey);
		if (checkinDate >= start && checkinDate <= end) {
			result.push(checkin);
		}
	}
	
	return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 获取所有打卡记录
export async function getAllCheckins(): Promise<DailyCheckin[]> {
	const checkins = await loadCheckins();
	return Array.from(checkins.values())
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}