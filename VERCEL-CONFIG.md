# Vercel 环境变量配置指南

为了在 Vercel 部署时正确加载任务配置，需要在 Vercel 项目设置中添加以下环境变量：

## 方案1: 环境变量配置

在 Vercel Dashboard 项目设置的 Environment Variables 中添加：

**变量名**: `FOCUS_TASKS_CONFIG`

**变量值**:
```json
[{"id":"graduation-project","name":"Graduation Project","icon":"🎓","description":"毕业设计项目相关工作","category":"academic","priority":1},{"id":"coding-logical","name":"Coding/Logical","icon":"💻","description":"编程和逻辑思维训练","category":"technical","priority":2},{"id":"running","name":"Running","icon":"🏃","description":"跑步锻炼，保持健康","category":"health","priority":3},{"id":"reading-learning","name":"Reading/Learning","icon":"📚","description":"阅读学习新知识","category":"learning","priority":4},{"id":"communication","name":"Communication","icon":"💬","description":"团队沟通协作","category":"social","priority":5}]
```

## 方案2: 内联配置

或者，如果你希望快速测试，可以先使用以下内联配置，然后再设置环境变量。

## 测试步骤

1. 设置环境变量后，重新部署
2. 检查 Vercel Function Logs 中的控制台输出
3. 确认看到 "✅ 从环境变量加载焦点任务配置" 的日志

## 注意事项

- 环境变量值必须是有效的 JSON 格式
- 确保在 Vercel 项目的所有环境（Production, Preview, Development）中都设置此变量
- 重新部署后配置才会生效