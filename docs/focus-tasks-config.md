# 焦点任务配置系统

## 概述

现在焦点任务是可配置的，不再硬编码在代码中。您可以通过以下方式修改焦点任务：

## 配置方式

### 1. 修改配置文件（推荐）

编辑 `/static/config/focus-tasks.json` 文件：

```json
{
  "focusTasks": [
    {
      "id": "unique-task-id",
      "name": "任务显示名称",
      "icon": "🎯",
      "description": "任务详细描述",
      "category": "任务分类",
      "priority": 1
    }
  ]
}
```

### 2. 修改代码配置

编辑 `/src/lib/config/focus-tasks.ts` 中的 `DEFAULT_FOCUS_TASKS` 数组。

## 配置字段说明

- `id`: 唯一标识符，用于数据存储和匹配
- `name`: 显示在界面上的任务名称
- `icon`: 任务图标（emoji）
- `description`: 任务的详细描述
- `category`: 任务分类（可选）
- `priority`: 优先级（可选）

## 如何添加新任务

1. 打开 `/static/config/focus-tasks.json`
2. 在 `focusTasks` 数组中添加新的任务对象
3. 保存文件，刷新页面即可看到新任务

## 如何删除任务

1. 从 `/static/config/focus-tasks.json` 中删除对应的任务对象
2. 保存文件，刷新页面

## 注意事项

- 删除任务时，历史数据中对应的任务记录仍会保留
- 修改任务的 `id` 会导致历史数据无法匹配
- 建议只修改 `name`、`icon`、`description` 等显示字段
- Perfect Day 的判断会根据当前配置的任务总数动态调整

## 当前默认任务

1. 🎓 Graduation Project - 毕业设计项目相关工作
2. 💻 Coding/Logical - 编程和逻辑思维训练  
3. 🏃 Running - 跑步锻炼，保持健康
4. 📚 Reading/Learning - 阅读学习新知识
5. 💬 Communication - 团队沟通协作
6. 📝 Other Tasks - 其他重要任务

您可以根据自己的需求自由修改这些任务！