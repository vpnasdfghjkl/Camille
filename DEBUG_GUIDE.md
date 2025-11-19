# 🔍 贡献图数据交互调试指南

## 📚 目录
1. [如何打开调试工具](#如何打开调试工具)
2. [数据流动过程](#数据流动过程)
3. [关键断点位置](#关键断点位置)
4. [常见调试场景](#常见调试场景)
5. [数据结构详解](#数据结构详解)

---

## 🛠️ 如何打开调试工具

### Chrome/Edge 浏览器
1. 打开网站
2. 按 `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`)
3. 切换到 **Console** 标签查看日志
4. 切换到 **Network** 标签查看网络请求

### 调试面板说明
- **Console**: 查看所有 `console.log()` 输出
- **Network**: 查看 API 请求和响应
- **Application**: 查看缓存和本地存储
- **Sources**: 设置断点，逐行调试代码

---

## 🔄 数据流动过程

### 完整流程图
```
1. 页面加载
   ↓
2. onMount() 执行
   ↓
3. loadRealData() 被调用
   ↓
4. fetch('/api/stats?days=365')
   ↓
5. 后端 API 处理请求
   ↓
6. 查询 Supabase 数据库
   ↓
7. 返回 JSON 数据
   ↓
8. processCalendarData() 处理数据
   ↓
9. 渲染贡献图
```

### 日志标记说明
- 🔵 `[前端]` - 前端组件日志
- 🔄 `[前端-数据处理]` - 数据转换处理
- 🖱️ - 用户交互
- 🌐 - 网络请求
- 📡 - 网络响应
- 📦 - 数据包
- ✅ - 成功
- ❌ - 错误
- ⚠️ - 警告

---

## 🎯 关键断点位置

### 在 Chrome DevTools 中设置断点

#### 1. 前端组件断点
文件：`src/lib/components/site/interactive-contribution-graph.svelte`

**关键函数：**
```typescript
// 第 48 行 - 数据加载入口
async function loadRealData(forceRefresh = false)

// 第 169 行 - 数据处理
function processCalendarData()

// 第 295 行 - 点击日期方块
async function handleDayClick(day: ContributionDay)
```

**如何设置断点：**
1. 在 DevTools 中打开 **Sources** 标签
2. 找到对应文件
3. 点击行号左侧设置断点（蓝色标记）
4. 刷新页面，代码会在断点处暂停

#### 2. API 路由断点
文件：`src/routes/api/stats/+server.ts`

**关键位置：**
```typescript
// 第 19 行 - API 入口
export const GET: RequestHandler = async ({ url })

// 第 42 行 - 数据库查询
const { data: rawCheckins, error } = await supabase...

// 第 142 行 - 返回数据
return json(response);
```

---

## 🔬 常见调试场景

### 场景1: 查看页面加载时的完整数据流

**步骤：**
1. 打开 Console
2. 刷新页面 (`Ctrl+R` 或 `Cmd+R`)
3. 查找以下日志：

```javascript
🔵 [前端] 开始加载数据...
📋 [前端] 参数: { forceRefresh: false, days: 365 }
🌐 [前端] API URL: /api/stats?days=365
📡 [前端] Response 状态: 200 OK
📦 [前端] 原始返回数据: { success: true, data: {...}, cached: true }
✅ [前端] API 调用成功
📊 [前端] 数据概览: {
  contributions数量: 365,
  stats: { totalDays: 365, checkedInDays: 180, ... },
  focusAreas: [...],
  dateRange: { start: "2024-11-18", end: "2025-11-18" },
  是否缓存: true
}
```

**关键变量解读：**
- `contributions数量: 365` - 包含365天的数据
- `stats.checkedInDays: 180` - 有打卡记录的天数
- `stats.currentStreak: 7` - 当前连续打卡天数
- `是否缓存: true` - 数据来自缓存（30秒内）

---

### 场景2: 查看点击日期方块的数据

**步骤：**
1. 打开 Console
2. 点击贡献图中的任意日期方块
3. 查找日志：

```javascript
🖱️ [前端] 用户点击日期方块
📅 [前端] 点击的日期数据: {
  date: "2024-11-18",
  level: 3,
  count: 3,
  hasCheckin: true,
  isAllCompleted: false,
  workPlan: "完成项目文档"
}
🌐 [前端] 请求单日数据 URL: /api/checkin?date=2024-11-18
📡 [前端] Response 状态: 200
📦 [前端] 单日数据返回: {
  success: true,
  data: {
    id: "checkin_xxx",
    date: "2024-11-18",
    workPlan: "完成项目文档",
    focusTasks: [...],
    focusTasksCompleted: 3,
    ...
  }
}
✅ [前端] 找到打卡记录
🪟 [前端] 打开模态框
```

---

### 场景3: 使用 Network 面板查看 API 请求

**步骤：**
1. 打开 DevTools 的 **Network** 标签
2. 刷新页面
3. 找到 `stats?days=365` 请求
4. 点击查看详情

**可以看到：**
- **Headers**: 请求头信息
- **Preview**: 格式化的响应数据
- **Response**: 原始响应
- **Timing**: 请求耗时

**示例响应数据：**
```json
{
  "success": true,
  "data": {
    "contributions": [
      {
        "date": "2024-11-18",
        "level": 3,
        "count": 3,
        "hasCheckin": true,
        "isAllCompleted": false,
        "workPlan": "完成项目文档"
      },
      // ... 更多数据
    ],
    "stats": {
      "totalDays": 365,
      "checkedInDays": 180,
      "totalTasks": 540,
      "avgTasksPerDay": 1.5,
      "currentStreak": 7,
      "longestStreak": 23,
      "completionRate": 49
    },
    "focusAreas": [
      {
        "name": "Graduation Project",
        "icon": "🎓",
        "count": 120,
        "percentage": 40
      },
      // ... 更多领域
    ],
    "dateRange": {
      "start": "2024-11-18",
      "end": "2025-11-18"
    }
  },
  "cached": true
}
```

---

## 📋 数据结构详解

### 1. ContributionDay (单日贡献数据)
```typescript
interface ContributionDay {
  date: string;              // "2024-11-18" - 日期
  level: number;             // 0-6 - 完成任务数量级别
  count: number;             // 实际完成的任务数
  hasCheckin: boolean;       // 是否有打卡记录
  isAllCompleted?: boolean;  // 是否完成所有任务（完美日）
  isToday?: boolean;         // 是否是今天
  workPlan?: string;         // 工作计划
  wakeUpTime?: string;       // 起床时间
  workStartTime?: string;    // 开始工作时间
  notes?: string;            // 备注
}
```

**示例：**
```javascript
{
  date: "2024-11-18",
  level: 5,                  // 完成了5个任务
  count: 5,
  hasCheckin: true,          // 有打卡
  isAllCompleted: false,     // 未完成所有（总共6个任务）
  isToday: true,
  workPlan: "完成前端调试文档"
}
```

---

### 2. CalendarState (日历状态)
```typescript
interface CalendarState {
  contributions: ContributionDay[];  // 所有日期的贡献数据
  stats: CheckinStats;               // 统计信息
  focusAreas: FocusArea[];           // 关注领域统计
  dateRange: {
    start: string;
    end: string;
  };
}
```

---

### 3. CheckinStats (统计数据)
```typescript
interface CheckinStats {
  totalDays: number;        // 总天数 (365)
  checkedInDays: number;    // 打卡天数
  totalTasks: number;       // 总完成任务数
  avgTasksPerDay: number;   // 平均每天任务数
  currentStreak: number;    // 当前连续打卡天数
  longestStreak: number;    // 最长连续打卡天数
  completionRate: number;   // 打卡率 (%)
}
```

**示例：**
```javascript
{
  totalDays: 365,
  checkedInDays: 180,       // 打卡了180天
  totalTasks: 540,          // 完成了540个任务
  avgTasksPerDay: 1.5,      // 平均每天1.5个
  currentStreak: 7,         // 目前连续7天
  longestStreak: 23,        // 最长连续23天
  completionRate: 49        // 打卡率49%
}
```

---

## 🔧 高级调试技巧

### 1. 在 Console 中直接访问组件变量

打开 Console，输入：
```javascript
// 查看当前所有贡献周数据
$0  // 选中贡献图元素后，$0 指向该元素

// 在组件脚本中添加 window 暴露
window.debugData = { calendarState, contributionWeeks, stats }
// 然后在 Console 中访问
console.log(window.debugData)
```

### 2. 监听特定变量变化

在代码中添加：
```typescript
$: {
  console.log('📊 [响应式] calendarState 变化:', calendarState);
}

$: {
  console.log('📈 [响应式] contributionWeeks 变化:', contributionWeeks);
}
```

### 3. 使用 console.table() 美化输出

```typescript
console.table(contributions.slice(0, 10));  // 表格形式显示前10条数据
console.table(focusAreas);                  // 表格显示关注领域
```

---

## 🎨 调试建议

### 最佳实践
1. **先看 Console，再看 Network** - Console 有完整的流程日志
2. **使用过滤器** - 在 Console 中搜索关键字如 `[前端]`、`✅`、`❌`
3. **保留日志** - 勾选 Console 的 "Preserve log" 避免页面刷新丢失日志
4. **时间戳** - Console 左侧会显示每条日志的时间
5. **展开对象** - 点击对象左侧的三角形查看完整内容

### 常见问题排查
- **数据为空**: 检查 API 返回的 `result.success` 和 `result.data`
- **渲染不正确**: 检查 `processCalendarData()` 的输出
- **缓存问题**: 添加 `&refresh=true` 参数强制刷新
- **日期错误**: 检查时区转换，所有日期应为 ISO 格式字符串

---

## 📞 需要帮助？

如果在调试过程中遇到问题：
1. 截图完整的 Console 输出
2. 记录复现步骤
3. 查看 Network 面板的请求详情
4. 检查浏览器版本是否最新

Happy Debugging! 🎉
