import { supabase, TABLES } from '$lib/supabase';
import type { DailyCheckin } from '$lib/types/checkin';

/**
 * Supabase 打卡数据服务
 * 
 * 提供完整的打卡记录 CRUD 操作，包括：
 * - 单条记录的获取、保存、删除
 * - 批量数据获取和日期范围查询
 * - 自动数据格式转换和错误处理
 */
export class SupabaseCheckinService {
  
  /**
   * 获取指定日期的打卡记录
   */
  async getCheckin(date: string): Promise<DailyCheckin | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHECKINS)
        .select('*')
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录不存在，返回 null
          return null;
        }
        throw error;
      }

      return this.transformFromDatabase(data);
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      return null;
    }
  }

  /**
   * 保存打卡记录
   */
  async saveCheckin(checkin: DailyCheckin): Promise<DailyCheckin> {
    try {
      const dbData = this.transformToDatabase(checkin);
      
      const { data, error } = await supabase
        .from(TABLES.CHECKINS)
        .upsert(dbData, { 
          onConflict: 'date',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ 数据已保存到 Supabase:', checkin.date);
      return this.transformFromDatabase(data);
    } catch (error) {
      console.error('保存打卡记录失败:', error);
      throw new Error('保存失败，请重试');
    }
  }

  /**
   * 删除打卡记录
   */
  async deleteCheckin(date: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.CHECKINS)
        .delete()
        .eq('date', date);

      if (error) {
        throw error;
      }

      console.log('✅ 数据已从 Supabase 删除:', date);
      return true;
    } catch (error) {
      console.error('删除打卡记录失败:', error);
      return false;
    }
  }

  /**
   * 获取日期范围内的打卡记录
   */
  async getCheckinsInRange(startDate: string, endDate: string): Promise<DailyCheckin[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHECKINS)
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(item => this.transformFromDatabase(item));
    } catch (error) {
      console.error('获取范围打卡记录失败:', error);
      return [];
    }
  }

  /**
   * 获取所有打卡记录
   */
  async getAllCheckins(): Promise<DailyCheckin[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CHECKINS)
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(item => this.transformFromDatabase(item));
    } catch (error) {
      console.error('获取所有打卡记录失败:', error);
      return [];
    }
  }

  /**
   * 转换为数据库格式
   */
  private transformToDatabase(checkin: DailyCheckin) {
    return {
      id: checkin.id,
      date: checkin.date,
      wake_up_time: checkin.wakeUpTime || null,
      work_start_time: checkin.workStartTime || null,
      work_plan: checkin.workPlan || null,
      focus_tasks: checkin.focusTasks || [],
      focus_tasks_completed: checkin.focusTasksCompleted || 0,
      notes: checkin.notes || null,
      created_at: checkin.createdAt || new Date().toISOString(),
      updated_at: checkin.updatedAt || new Date().toISOString()
    };
  }

  /**
   * 从数据库格式转换
   */
  private transformFromDatabase(dbData: Record<string, unknown>): DailyCheckin {
    return {
      id: String(dbData.id || ''),
      date: String(dbData.date || ''),
      wakeUpTime: dbData.wake_up_time ? String(dbData.wake_up_time) : undefined,
      workStartTime: dbData.work_start_time ? String(dbData.work_start_time) : undefined,
      workPlan: String(dbData.work_plan || ''),
      focusTasks: Array.isArray(dbData.focus_tasks) ? dbData.focus_tasks : [],
      focusTasksCompleted: Number(dbData.focus_tasks_completed || 0),
      notes: dbData.notes ? String(dbData.notes) : undefined,
      createdAt: String(dbData.created_at || ''),
      updatedAt: String(dbData.updated_at || '')
    };
  }

  /**
   * 测试数据库连接
   */
  async testConnection(): Promise<{ connected: boolean; error?: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const { error } = await supabase
        .from(TABLES.CHECKINS)
        .select('count', { count: 'exact', head: true });
      
      const latency = Date.now() - startTime;
      
      if (error) {
        return {
          connected: false,
          error: error.message,
          latency
        };
      }
      
      return {
        connected: true,
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error('数据库连接测试失败:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : '未知连接错误',
        latency
      };
    }
  }
}

// 单例实例
export const supabaseCheckinService = new SupabaseCheckinService();