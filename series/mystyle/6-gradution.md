# 毕业论文编写与记录

## 12.11 第一次指导记录 (First Guidance Note)

### 1. 题目
- **问题**: 题目宽泛，存在语法问题。

### 2. 内容架构
- **当前思路**: 感知 - 决策 - 系统
- **可选思路**: 感知 - 机制 - 决策 - 系统

### 3. 创新点
- **感知 (Perception)**:
    - 侧重数据侧。
    - 方法: 异构注意力机制 + 数据增强 -> 提升鲁棒性。
    - *案例*: 黄色胶带过渡到 Vision-Language (VL) 模型。
- **机制 (Mechanism)**:
    - 方法: 时空上下文编码 -> 解决非马尔可夫依赖 (Non-Markovian dependencies)。
    - *案例*: 拧螺丝，拿三个杯子，按开关体现记忆能力。
- **决策 (Decision)**:
    - 方法: 推理去噪加速 (DDPM, DDIM, Flow-matching...) -> 实现高频率控制。
    - 关键: 输出头设计。
- **系统 (System)**:
    - 目标: 数据-算法-评估一体化系统 -> 工程实现。
    - 技术栈: Web端 (SvelteKit + TS + TailwindCSS + Python + Database)。
    - 特性: 异步推理，双系统架构。

---
