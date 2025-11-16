import type { DailyCheckin } from '$lib/types/checkin';

// 存储接口定义
export interface StorageAdapter {
	getCheckin(date: string): Promise<DailyCheckin | null>;
	saveCheckin(checkin: DailyCheckin): Promise<void>;
	deleteCheckin(date: string): Promise<boolean>;
	getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]>;
	getAllCheckins(): Promise<DailyCheckin[]>;
}

// 文件系统存储适配器（本地开发用）
class FileSystemAdapter implements StorageAdapter {
	private fs: typeof import('fs/promises') | null = null;
	private path: typeof import('path') | null = null;
	private DATA_DIR: string | null = null;
	private CHECKINS_FILE: string | null = null;
	private initialized = false;

	constructor() {
		// 动态初始化，避免在浏览器环境报错
		this.initializeAsync();
	}

	private async initializeAsync() {
		try {
			this.fs = await import('fs/promises');
			this.path = await import('path');
			this.DATA_DIR = this.path.join(process.cwd(), 'data');
			this.CHECKINS_FILE = this.path.join(this.DATA_DIR, 'checkins.json');
			this.initialized = true;
		} catch (error) {
			console.log('无法初始化文件系统适配器:', error);
		}
	}

	private async ensureDataDir() {
		if (!this.fs || !this.DATA_DIR || !this.initialized) return;
		try {
			await this.fs.access(this.DATA_DIR);
		} catch {
			await this.fs.mkdir(this.DATA_DIR, { recursive: true });
		}
	}

	private async loadCheckins(): Promise<Map<string, DailyCheckin>> {
		try {
			if (!this.fs || !this.CHECKINS_FILE || !this.initialized) return new Map();
			await this.ensureDataDir();
			const data = await this.fs.readFile(this.CHECKINS_FILE, 'utf-8');
			const checkinsArray: DailyCheckin[] = JSON.parse(data);
			const checkinsMap = new Map<string, DailyCheckin>();
			
			checkinsArray.forEach(checkin => {
				checkinsMap.set(checkin.date, checkin);
			});
			
			return checkinsMap;
		} catch (error) {
			return new Map<string, DailyCheckin>();
		}
	}

	private async saveCheckins(checkins: Map<string, DailyCheckin>): Promise<void> {
		try {
			if (!this.fs || !this.CHECKINS_FILE || !this.initialized) return;
			await this.ensureDataDir();
			const checkinsArray = Array.from(checkins.values());
			await this.fs.writeFile(this.CHECKINS_FILE, JSON.stringify(checkinsArray, null, 2), 'utf-8');
			console.log(`已保存 ${checkinsArray.length} 条打卡记录到文件系统`);
		} catch (error) {
			console.error('文件系统保存失败:', error);
			throw new Error('数据保存失败');
		}
	}

	async getCheckin(date: string): Promise<DailyCheckin | null> {
		const checkins = await this.loadCheckins();
		return checkins.get(date) || null;
	}

	async saveCheckin(checkin: DailyCheckin): Promise<void> {
		const checkins = await this.loadCheckins();
		checkins.set(checkin.date, checkin);
		await this.saveCheckins(checkins);
	}

	async deleteCheckin(date: string): Promise<boolean> {
		const checkins = await this.loadCheckins();
		const deleted = checkins.delete(date);
		if (deleted) {
			await this.saveCheckins(checkins);
		}
		return deleted;
	}

	async getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
		const checkins = await this.loadCheckins();
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

	async getAllCheckins(): Promise<DailyCheckin[]> {
		const checkins = await this.loadCheckins();
		return Array.from(checkins.values())
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}
}

// 内存存储适配器（云服务用）
class MemoryAdapter implements StorageAdapter {
	private checkinsStore = new Map<string, DailyCheckin>();

	async getCheckin(date: string): Promise<DailyCheckin | null> {
		return this.checkinsStore.get(date) || null;
	}

	async saveCheckin(checkin: DailyCheckin): Promise<void> {
		this.checkinsStore.set(checkin.date, checkin);
		console.log(`✅ 已保存打卡记录到内存: ${checkin.date}`);
		console.log(`📊 内存中总记录数: ${this.checkinsStore.size}`);
		console.log(`📝 保存的数据:`, JSON.stringify(checkin, null, 2));
	}

	async deleteCheckin(date: string): Promise<boolean> {
		const deleted = this.checkinsStore.delete(date);
		console.log(deleted ? `已从内存删除打卡记录: ${date}` : `未找到打卡记录: ${date}`);
		return deleted;
	}

	async getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
		const result: DailyCheckin[] = [];
		const start = new Date(startDate);
		const end = new Date(endDate);
		
		for (const [dateKey, checkin] of this.checkinsStore) {
			const checkinDate = new Date(dateKey);
			if (checkinDate >= start && checkinDate <= end) {
				result.push(checkin);
			}
		}
		
		return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
	}

	async getAllCheckins(): Promise<DailyCheckin[]> {
		return Array.from(this.checkinsStore.values())
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}
}

// LocalStorage 适配器（客户端持久化）
class LocalStorageAdapter implements StorageAdapter {
	private STORAGE_KEY = 'checkins-data';

	private getStorageData(): Map<string, DailyCheckin> {
		try {
			if (typeof localStorage === 'undefined') return new Map();
			const data = localStorage.getItem(this.STORAGE_KEY);
			if (!data) return new Map();
			
			const checkinsArray: DailyCheckin[] = JSON.parse(data);
			const checkinsMap = new Map<string, DailyCheckin>();
			
			checkinsArray.forEach(checkin => {
				checkinsMap.set(checkin.date, checkin);
			});
			
			return checkinsMap;
		} catch (error) {
			console.error('LocalStorage 读取失败:', error);
			return new Map();
		}
	}

	private saveStorageData(checkins: Map<string, DailyCheckin>): void {
		try {
			if (typeof localStorage === 'undefined') return;
			const checkinsArray = Array.from(checkins.values());
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checkinsArray));
			console.log(`已保存 ${checkinsArray.length} 条打卡记录到 LocalStorage`);
		} catch (error) {
			console.error('LocalStorage 保存失败:', error);
		}
	}

	async getCheckin(date: string): Promise<DailyCheckin | null> {
		const checkins = this.getStorageData();
		return checkins.get(date) || null;
	}

	async saveCheckin(checkin: DailyCheckin): Promise<void> {
		const checkins = this.getStorageData();
		checkins.set(checkin.date, checkin);
		this.saveStorageData(checkins);
	}

	async deleteCheckin(date: string): Promise<boolean> {
		const checkins = this.getStorageData();
		const deleted = checkins.delete(date);
		if (deleted) {
			this.saveStorageData(checkins);
		}
		return deleted;
	}

	async getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
		const checkins = this.getStorageData();
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

	async getAllCheckins(): Promise<DailyCheckin[]> {
		const checkins = this.getStorageData();
		return Array.from(checkins.values())
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}
}

// 智能存储适配器选择器
class StorageSelector {
	private adapter: StorageAdapter | null = null;

	async getAdapter(): Promise<StorageAdapter> {
		if (this.adapter) return this.adapter;

		// 检测环境并选择最佳适配器
		console.log('检测存储环境...');
		
		// 1. 检测无服务器环境（Vercel, Netlify 等）
		if (process.env.VERCEL || process.env.NETLIFY) {
			console.log('检测到无服务器环境 (Vercel/Netlify)，使用内存存储');
			this.adapter = new MemoryAdapter();
			return this.adapter;
		}
		
		// 2. 开发环境或传统服务器环境，尝试使用文件系统
		if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
			console.log('尝试使用文件系统存储...');
			try {
				const fsAdapter = new FileSystemAdapter();
				// 测试文件系统是否可用
				await fsAdapter.getAllCheckins();
				this.adapter = fsAdapter;
				console.log('✅ 使用文件系统存储');
				return this.adapter;
			} catch (error) {
				console.log('❌ 文件系统不可用，降级到内存存储:', error);
			}
		}

		// 3. 降级到内存存储
		console.log('使用内存存储（注意：重启后数据会丢失）');
		console.log('💡 建议：生产环境请配置数据库存储');
		this.adapter = new MemoryAdapter();
		return this.adapter;
	}
}

// 单例模式
const storageSelector = new StorageSelector();

// 导出统一接口
export async function getStorageAdapter(): Promise<StorageAdapter> {
	return await storageSelector.getAdapter();
}

// 便捷函数导出
export async function getCheckin(date: string): Promise<DailyCheckin | null> {
	const adapter = await getStorageAdapter();
	return await adapter.getCheckin(date);
}

export async function saveCheckin(checkin: DailyCheckin): Promise<void> {
	const adapter = await getStorageAdapter();
	return await adapter.saveCheckin(checkin);
}

export async function deleteCheckin(date: string): Promise<boolean> {
	const adapter = await getStorageAdapter();
	return await adapter.deleteCheckin(date);
}

export async function getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
	const adapter = await getStorageAdapter();
	return await adapter.getCheckinsInRange(startDate, endDate);
}

export async function getAllCheckins(): Promise<DailyCheckin[]> {
	const adapter = await getStorageAdapter();
	return await adapter.getAllCheckins();
}