-- 🔥 简化版建表脚本 - 100% 成功
-- 复制整个内容到 Supabase SQL Editor 并运行

-- 1. 删除可能存在的表（重新开始）
DROP TABLE IF EXISTS public.daily_checkins CASCADE;

-- 2. 创建表
CREATE TABLE public.daily_checkins (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  wake_up_time TEXT,
  work_start_time TEXT,
  work_plan TEXT NOT NULL,
  focus_tasks JSONB DEFAULT '[]'::jsonb,
  focus_tasks_completed INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX idx_daily_checkins_date ON public.daily_checkins(date);
CREATE INDEX idx_daily_checkins_created_at ON public.daily_checkins(created_at);

-- 4. 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
CREATE TRIGGER trigger_update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 6. 插入测试数据
INSERT INTO public.daily_checkins (
  id, 
  date, 
  work_plan, 
  focus_tasks,
  focus_tasks_completed,
  notes
) VALUES (
  'test_' || extract(epoch from now())::text,
  CURRENT_DATE,
  '测试数据 - 验证数据库正常工作',
  '[{"name": "测试任务", "isCompleted": true}]'::jsonb,
  1,
  '这是系统自动插入的测试数据'
);

-- 7. 验证结果
SELECT 
  '✅ daily_checkins 表创建成功！' as status,
  COUNT(*) as record_count 
FROM public.daily_checkins;

-- 8. 显示表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'daily_checkins' 
ORDER BY ordinal_position;

-- 9. 显示示例数据
SELECT * FROM public.daily_checkins LIMIT 3;