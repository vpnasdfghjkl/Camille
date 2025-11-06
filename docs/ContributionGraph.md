# ContributionGraph 组件

## 概述

`ContributionGraph` 是一个独立的 GitHub 风格贡献图组件，提供了可视化展示日常活动完成情况的功能。

## 特性

- ✅ **TypeScript 支持** - 完整的类型定义
- 🎨 **响应式设计** - 适配不同屏幕尺寸
- 🌓 **暗色模式** - 自动适配主题切换
- ♿ **可访问性** - 符合 ARIA 标准
- 🎯 **可定制** - 支持自定义标题和关注领域
- ⭐ **特殊标记** - 完美日显示金色星标

## 基础用法

```svelte
<script>
  import { ContributionGraph } from '$lib/components/site';
  
  const focusAreas = [
    { name: 'Programming', icon: '💻' },
    { name: 'Learning', icon: '📚' }
  ];
</script>

<ContributionGraph {focusAreas} />
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `focusAreas` | `FocusArea[]` | `[]` | 关注领域列表 |
| `title` | `string` | `"🎯 Recent-Focus"` | 组件标题 |
| `showFocusAreas` | `boolean` | `true` | 是否显示关注领域标签 |

## 类型定义

```typescript
interface FocusArea {
  name: string;    // 领域名称
  icon: string;    // 图标 emoji
}

interface ContributionDay {
  date: Date;           // 日期
  level: number;        // 贡献级别 (0-4)
  isAllCompleted: boolean; // 是否为完美日
  count: number;        // 贡献数量
  isToday: boolean;     // 是否为今天
  month: number;        // 月份 (0-11)
  day: number;          // 日期 (1-31)
}
```

## 高级用法

### 自定义标题

```svelte
<ContributionGraph 
  title="📊 My Activity" 
  {focusAreas} 
/>
```

### 仅显示图表

```svelte
<ContributionGraph 
  showFocusAreas={false}
  title="📈 Contributions" 
/>
```

### 完整配置

```svelte
<script>
  const myFocusAreas = [
    { name: 'React Development', icon: '⚛️' },
    { name: 'Machine Learning', icon: '🤖' },
    { name: 'Writing', icon: '✍️' },
    { name: 'Exercise', icon: '🏃‍♂️' }
  ];
</script>

<ContributionGraph 
  focusAreas={myFocusAreas}
  title="🎯 My 2024 Journey"
  showFocusAreas={true}
/>
```

## 样式说明

### 贡献级别颜色

- **Level 0**: 灰色 - 无贡献
- **Level 1**: 浅蓝色 - 1-2 个贡献  
- **Level 2**: 中蓝色 - 3-4 个贡献
- **Level 3**: 深蓝色 - 5-6 个贡献
- **Level 4**: 最深蓝色 - 7+ 个贡献
- **完美日**: 金色渐变 + ⭐ - 特殊成就

### 响应式断点

- 桌面端：完整布局，8px 间距
- 移动端：紧凑布局，自动适配

## 可访问性

- ✅ ARIA 标签支持
- ✅ 键盘导航友好
- ✅ 屏幕阅读器优化
- ✅ 高对比度支持

## 集成示例

在 Hero 组件中的使用：

```svelte
<!-- hero.svelte -->
<script>
  import { ContributionGraph } from '$lib/components/site';
  
  const focusAreas = [
    { name: 'Graduation Project', icon: '📚' },
    { name: 'Artificial Intelligence', icon: '🤖' },
    { name: 'Programming for Logics', icon: '💻' },
    { name: 'Running', icon: '🏃‍♂️' }
  ];
</script>

<div class="mt-8">
  <ContributionGraph {focusAreas} />
</div>
```