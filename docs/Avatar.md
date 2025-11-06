# Avatar 组件

## 概述

`Avatar` 是一个高度可定制的头像组件，提供了丰富的动画效果和交互体验，支持多种尺寸和配置选项。

## 特性

- ✅ **多种尺寸** - 支持 small、medium、large 三种预设尺寸
- 🎨 **动画效果** - 旋转环、虚线环、光环等多层动画
- 🖼️ **悬停切换** - 支持悬停时切换不同图片
- 🌓 **暗色模式** - 自动适配主题切换
- ⚙️ **高度可配置** - 所有效果都可以独立开启/关闭
- 🎯 **TypeScript** - 完整的类型定义支持
- ♿ **可访问性** - 符合无障碍标准

## 基础用法

```svelte
<script>
  import { Avatar } from '$lib/components/site';
</script>

<Avatar 
  profileImage="/profile.jpg"
  hoverImage="/profile-hover.jpg"
  alt="用户头像"
/>
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `profileImage` | `string` | **必需** | 主要头像图片路径 |
| `hoverImage` | `string` | `''` | 悬停时显示的图片路径 |
| `alt` | `string` | `'Profile Picture'` | 图片替代文本 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 头像尺寸 |
| `enableHover` | `boolean` | `true` | 是否启用悬停效果 |
| `enableAnimations` | `boolean` | `true` | 是否启用动画效果 |

## 尺寸规格

### Small (小尺寸)
- 移动端：`128px × 128px` 
- 桌面端：`160px × 160px`
- 适用场景：侧边栏、评论区、用户列表

### Medium (中尺寸) - 默认
- 移动端：`208px × 208px`
- 桌面端：`256px × 256px` 
- 适用场景：个人资料页、首页展示

### Large (大尺寸)
- 移动端：`288px × 288px`
- 桌面端：`320px × 320px`
- 适用场景：关于页面、团队介绍

## 使用示例

### 基础头像

```svelte
<Avatar 
  profileImage="/images/profile.jpg"
  alt="John Doe"
/>
```

### 带悬停效果的头像

```svelte
<Avatar 
  profileImage="/images/profile.jpg"
  hoverImage="/images/profile-fun.jpg"
  alt="John Doe"
  enableHover={true}
/>
```

### 不同尺寸

```svelte
<!-- 小尺寸 -->
<Avatar 
  profileImage="/images/profile.jpg"
  size="small"
  alt="Small Avatar"
/>

<!-- 中尺寸 -->
<Avatar 
  profileImage="/images/profile.jpg"
  size="medium"
  alt="Medium Avatar"
/>

<!-- 大尺寸 -->
<Avatar 
  profileImage="/images/profile.jpg"
  size="large"
  alt="Large Avatar"
/>
```

### 静态头像（无动画）

```svelte
<Avatar 
  profileImage="/images/profile.jpg"
  enableAnimations={false}
  enableHover={false}
  alt="Static Avatar"
/>
```

### 完整配置示例

```svelte
<script>
  import { Avatar } from '$lib/components/site';
  
  // 头像配置
  const avatarConfig = {
    profileImage: '/images/camille-default.png',
    hoverImage: '/images/camille-fun.png',
    alt: 'Camille - Software Developer',
    size: 'large',
    enableHover: true,
    enableAnimations: true
  };
</script>

<Avatar {...avatarConfig} />
```

## 动画效果

### 外层旋转环
- 顺时针旋转动画
- 悬停时切换为脉冲效果
- 蓝色渐变色彩

### 中层虚线环  
- 逆时针旋转动画
- 悬停时颜色加深
- 虚线边框样式

### 内层光环
- 脉冲动画效果
- 悬停时透明度增加
- 蓝紫色渐变

### 主头像
- 悬停时缩放 + 轻微旋转
- 阴影增强效果
- 光环扩散
- 亮度/对比度调节

## 样式定制

### CSS变量支持

组件使用 Tailwind CSS 类，可以通过CSS变量进行进一步定制：

```css
.avatar-custom {
  --avatar-primary-color: theme(colors.blue.500);
  --avatar-secondary-color: theme(colors.purple.500);
  --avatar-shadow-color: theme(colors.blue.500/20%);
}
```

### 自定义尺寸

如果预设尺寸不满足需求，可以创建自定义配置：

```svelte
<script>
  // 自定义超大尺寸的头像
  const customSize = 'w-96 h-96';
</script>

<div class="{customSize}">
  <Avatar 
    profileImage="/images/profile.jpg"
    size="large"
    alt="Custom Size Avatar"
  />
</div>
```

## 无障碍访问

- ✅ 提供有意义的 `alt` 文本
- ✅ 支持键盘导航（当启用悬停时）
- ✅ 高对比度模式兼容
- ✅ 屏幕阅读器友好

## 性能优化

- 图片懒加载支持
- 动画使用 CSS transform 优化性能
- 条件渲染减少不必要的DOM元素

## 最佳实践

1. **图片优化**：使用适当尺寸和格式的图片
2. **无障碍性**：始终提供描述性的 alt 文本
3. **性能考虑**：在移动设备上考虑禁用复杂动画
4. **一致性**：在同一应用中保持头像尺寸的一致性

```svelte
<!-- 推荐的使用方式 -->
<Avatar 
  profileImage="/optimized/profile-256.webp"
  hoverImage="/optimized/profile-hover-256.webp"
  alt="Camille Chen - Full Stack Developer"
  size="medium"
  enableHover={true}
  enableAnimations={!isMobile}
/>
```