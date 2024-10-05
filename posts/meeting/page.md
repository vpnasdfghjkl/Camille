---
title: Meeting
description: weekly meeting report, monthly meeting report, etc.
date: '2024-09-21'
image: 
    - ""
tags: 
    - Meeting
draft: True

---

```markdown
1. 周例会内容要点格式(文档形式)
- 上周工作计划
- 本周工作完成情况
- 本周工作主要内容(详细介绍)
- 遇到的问题及解决方法
- 下周工作计划安排


2. 月例会内容要点格式(PPT汇报形式)
- 上月工作计划
- 本月工作完成情况
- 本月工作主要内容(详细介绍)
- 遇到的问题及解决方法
- 下月工作计划安排

1.例会以研发计划表作为驱动，根据实际情况调整方案与内容；
2.为方便实验室数据、文件、视频等大容量存档需求，实验室会搭建NAS服务器，周报、月报、课题室电子文件等统一用NAS进行存档，方便大家存档与调用；
3.代码的开发与存档统一用公司的私有git服务器lejuhub进行管理，方便与公司研发进行代码对接。
```

## 2024-09-22, weekly meeting report
- 上周工作计划
  - [X] 阅读diffusion代码, 在老数据集跑通训练。
  - [X] 添加fake_touch模态(low_dim), 训练。
  - [ ] 3d diffusion论文，代码。
- 本周工作主要内容(详细介绍)
  - rosbag->zarr数据集转换代码
  - 修改diffusion代码，添加fake_touch维度 ![alt text](<Screenshot from 2024-09-21 22-27-37.png>)
  
- 遇到的问题及解决方法
  - 暂时没大问题，主要是一些环境配置问题，已解决。
  - 没有机器人 -> 学习仿真环境
  
- 下周工作计划安排
  - 将diffusion policy部署demo，测试通信
    - docker + ros
  - 研究深度和触觉的编码设计
    - RGBD or Pointcloud 
    - touch : low dim or encoder 
  - 3d diffusion论文，代码

## 2024-09-27， monthly meeting report
框架技术路线，ppt
- 上月工作计划
  - [X] 阅读diffusion代码, 在老数据集跑通训练。
  - [X] 添加fake_touch模态(low_dim), 跑通训练。
  - [X] diffusion部署
  - [ ] diffusion测试
  - [ ] 3d diffusion论文，代码
- 本月工作主要内容(详细介绍)
  - 数据集格式转换
  - 修改diffusion代码，添加fake_touch维度
  - 编写部署的代码，docker打包
  - 使用离线数据集验证4080训练diffusion 10h的结果，至少离线(仿真)比octo的好![alt text](image.png)
  
- 遇到的问题及解决方法
  - docker占用空间->'docker run --rm' or 'docker system prune'
  - 
- 下月工作计划安排
  - 解决部署过程中的问题并优化部署代码
  - 3d diffusion论文，代码

- meeting rec
  - 对标什么改进