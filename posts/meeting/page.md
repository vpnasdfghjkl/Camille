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

## 2025-6-20, weekly meeting report
### 本周工作内容
1. kuavo-il-opensource 
2. feature/yolo-mask
3. feature/dockerconvert
4. 异构编码、预测深度

## 2025-6-13, weekly meeting report
### 本周工作内容
1. 解决回退和chunk脱节的问题
<video controls src="smooth.mp4" title="Title"></video>
2. 大论文提纲基本定下来了
3. 工业场景的抓取视频




## 2025-6-6, weekly meeting report
### 本周工作内容
1. 拿到正解数据集, 下位机上直接算欧拉角是连续的
2. 使用transformer代替unet
3. 

## 2024-5-23, weekly meeting report
### 本周工作内容
1. 数据结果（10000 episodes，30个任务，工业场景，家庭场景）
2. 场景布置
2. 降帧率（实时帧率提高）,泛化性提高
3. delta joint正在训练
4. delta eef_pose






#### 全局规划（没有反馈），只有前进
  #### 数据层面
  2. 添加一维step，已经训练等待验证
  3. 处理模式，将语言和首末图片前置到任务开始，每次推理带上参考图片（正在写）

  ### 模型层面
  4. 用一个小模型做双系统的前置系统（做小型的vla）

#### 基本没有泛化能力
5. 预训练

6. 把这边的部署代码优化了一下，现在可以比较快的比较稳的抓取（包括时间戳对齐和）。但序列之间的抖动仍然存在。打算下周用相对角度优化






## 2024-5-16, weekly meeting report
### 本周工作内容
1. 整理了现在采集的数据集，打算把这个写到论文里。
#### 全局规划（没有反馈），只有前进
  #### 数据层面
  2. 添加一维step，已经训练等待验证
  3. 处理模式，将语言和首末图片前置到任务开始，每次推理带上参考图片（正在写）

  ### 模型层面
  4. 用一个小模型做双系统的前置系统（做小型的vla）

#### 基本没有泛化能力
5. 预训练

6. 把这边的部署代码优化了一下，现在可以比较快的比较稳的抓取（包括时间戳对齐和）。但序列之间的抖动仍然存在。打算下周用相对角度优化




-
-
-

-
-
-
-
-

-
-
-
-
-

-
-
-
-
-

-
-

### 下周计划










































## 2024-1-10, weekly meeting report
### 本周
1. lerobot training and deployment
  由于一些参数，编码器输出维度不同，模型更小300M，泛化性更差(相对dp1.5G), 另外，少量的训练epoch，dp，lerobot都可以收敛。
  只有全局信息，无关背景影响仍然有  
  5000steps:
  ![alt text](image-11.png)
  90000steps:
  ![alt text](image-12.png)
2. 工具链论文


## 2024-1-10, weekly meeting report
### 本周
1. lerobot training and deployment
  由于一些参数，编码器输出维度不同，模型更小300M，泛化性更差(相对dp1.5G), 另外，少量的训练epoch，dp，lerobot都可以收敛。
  只有全局信息，无关背景影响仍然有  
  5000steps:
  ![alt text](image-11.png)
  90000steps:
  ![alt text](image-12.png)
2. 工具链论文


### 下周
1. 年终
2. 点云
3. diffsuion代码整合到lerobot

## 2024-1-3, weekly meeting report
### 本周
1. 新模型训练和延迟测试，稳定了(分辨率)
<!-- <video controls src="KuavoToy_2024-12-31-21-18-57_speedx_latency0ms.mp4" title="Title">
  <track kind="captions" src="KuavoToy_2024-12-31-21-18-57_captions.vtt" srclang="en" label="English" default />
</video> -->
<video controls src="KuavoToy_2024-12-31-21-18-57_speedx_latency0ms.mp4">
  <track kind="captions" src="" label="None" />
</video>
2. lejuhub-lerobot
  ![alt text](image-10.png)

### 下周
1. dp3数据采集




## 2024-12-20, weekly meeting report
### 本周
1. 数据格式转换
![alt text](image-9.png)
2. 论文调研
3. 试了一下新出的仿真，确实很方便
### 下周
1. 数据训练测试
2. 工具链论文


## 2024-12-13, weekly meeting report
### 本周
1. 点云数据集
![alt text](<2024-12-11 13-55-23 的屏幕截图.png>)
![alt text](<2024-12-11 16-12-40 的屏幕截图.png>)
![alt text](<tmp/图片/2024-12-13 19-29-47 的屏幕截图.png>)
### 下周
1. 3d 数据集
2. lejuhub
3. 工具链论文



## 2024-11-29, weekly meeting report
### 上周工作计划
  - [X] 部署KuavoToy模型,
    - 也会空抓，但是不会没有东西也去抓，局部特征不明显或者分辨率不够。(零点位置，轮数不够)
    - <video controls src="KKKKuavo.mp4" title="Title">
        <track kind="captions" src="" label="None" />
      </video>

  - [X] 机器逆解更新
  - [X] 点云数据获取 
    - ![alt text](<2024-12-07 19-03-28 的屏幕截图.png>)

### suffer: 
  **对齐到机器人末端坐标系**， **头部相机线**， **头部定位**

### 下周计划:
  - [ ] 点云数据收集,
  - [ ] 3D算法代码实现
  - [ ] 读3d论文



- 调0点
- 背景，人干扰 - 测试
- 局部特征(分割编码)





点云，本体感知约束, 局部信息(硬件，软)  -> IL算法









## 2024-11-29, weekly meeting report
### 上周工作计划
  - [X] 部署KuavoToy模型：
  - [X] 3d转换点云
  - [ ] 接入新的逆解算法
  - [ ] 读论文


### 下周计划:
  - [ ] 采集3d数据
  - [ ] 训练3d模型，修改2d模型测试
  - [ ] 读论文

## 2024-11-29, weekly meeting report
### 上周工作计划
  - [X] 采集KuavoToy数据, 训练 > 
  - [X] kuavo manipulation README.md  
    ```Note: wrong cams order```
    ![alt text](image-5.png)
    ![alt text](image-6.png)
    ```Note:two cams order```
    

### 下周计划:
  - [ ] KuavoToy部署, 看下不同ckpt效果, 记录
  - [ ] 3D感知数据集(基准坐标系选择, 室内场景下固定相机点云)
  - [ ] 3D算法代码实现
  - [ ] 读3d论文

### suffer
  multi_cams,相机标定对齐




















## 2024-11-15, weekly meeting report
### 上周工作计划
  - [X] kuavo 环境配置，
  - [X] kuavo 上测试通信
  - [X] 读论文
  - [X] ppt

### 下周计划:
  - [ ] kuavo采数据
  - [ ] kuavo部署
  - [ ] https://binghao-huang.github.io/3D-ViTac/
        ![alt text](image-4.png)

## 2024-11-08, weekly meeting report
### 上周工作计划
  - [X] 修改diffusion policy, state_vec and low_dim MLP
  - [ ] kuavo 上测试通信
  - [X] 读论文

### 下周计划:
  - [ ] 读论文
  - [ ] kuavo采数据
  - [ ] kuavo部署

### paper reading
[3D Diffuser Actor: Policy Diffusion with 3D Scene Representations](https://3d-diffuser-actor.github.io/)
![alt text](image-3.png)



## 2024-11-01, monthly meeting report
### tools
1. cuda docker  
   1. docker安装：https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/
   2. nvidia container toolkit安装：https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
      - issue(no release version):https://github.com/NVIDIA/nvidia-container-toolkit/issues/89, https://blog.csdn.net/lyx_323/article/details/141168405
   3. cuda11.8 ubuntu20.04 cudnn8 docker hub: https://hub.docker.com/r/nvidia/cuda/tags?name=11.8
2. 哈深论文模板
   1. 哈深教务部学生培养：http://due.hitsz.edu.cn/xwgl/ssxwpy/ktyzj.htm
   2. 【通知】关于2023年春季学期硕士研究生学位论文中期检查及答辩工作安排的通知http://due.hitsz.edu.cn/info/1210/4794.htm
   3. e.g.:研究生中期模板：http://due.hitsz.edu.cn/system/_content/download.jsp?urltype=news.DownloadAttachUrl&owner=1481660265&wbfileid=11373754 
3. Zotero
   1. 翻译插件(pdf-translate)：https://zotero-chinese.com/user-guide/plugins/translate, https://blog.csdn.net/Rong_Gong/article/details/124385746
   2. google插件(Zotero Connector)：https://chromewebstore.google.com/detail/zotero-connector/ekhagklcjbdpajgpjgmbionohlpdbjgc?pli=1
   
## 2024-10-25, weekly meeting report
- leetcode daily + 2 top interview 150
- 写dataset loader
- brain practice
- 对于特征提取,如何把提取的特征放入模型训练,low_dim与非low_dim的处理

<!-- ### rdt
#### prev acknowledge
1. diffusion model 

#### points
1. diffsuion expressiveness, transformer scalability
2. To characterize the nonlinear dynamics, high-frequency changes and unstable numerical range inherent in robotic data,
3. Physically Interpretable Unified Action Space,
4. Finally, ablation studies show that diffusion modeling, large model size, and large data size all contribute to superior performance.
5. 包括aloha在内的方法都是task specified， 双手操作没有好办法
6. 直接使用大模型将动作离散的方法精度不行
7. 小模型和基于规则的方法都没有泛化性
8. 使用多种单臂的数据只是为了增强双臂的操作能力而不是给多个机器人用
#### Challenge
##### model
1. powerful architecture ->***RDT**
    - diffsuion **expressiveness**, transformer multimodal inputs **scalability**

2. 异质的机器人数据（heterogeneous data.）->proposing a **physically interpretable unified action space** to unify various robot action spaces
    - `之前要么找个像数据集的robot，要么筛跟robot一样的数据；`
    - 多模态输入：把low_dim, image, language三个obs 模态编码后cat起来作为diffsion model的输入
    - 多种类的机器人数据：做一个大的robot_state,对于特定机器人有就填，没有就pad
##### data
1. 大的robot_state
2. rewrite instruction with GPT4-Turbo -->

### meeting 

- 上周工作计划
  - [ ] 21楼机器部署diffusion policy
  - [ ] 修改diffusion policy代码，在仿真验证效果
  - [X] [RDT](https://github.com/thu-ml/RoboticsDiffusionTransformer?tab=readme-ov-file)

- 本周工作主要内容(详细介绍)
  - **train config**:  
    16batch, 200epoch, 4min/epoch, 150epochs/10h, 1500epochs/100h  
  - **dataset config**:   
    img_size(256,256,3), 2obs->16actions, 14000steps, 80episodes, 10hz, 
  - ![alt text](<2024-10-24 21-13-13 的屏幕截图.png>)

- suffer:
  1. 显卡不行 -> 租卡
  2. 采集的数据不是严格的30hz，帧差0.032-0.036不等 -> 先测试看效果, SongLing大白的相机

- 下周工作计划
  - 继续21楼机器部署
  - 看RDT代码




## 2024-10-18, weekly meeting report
- 上周工作计划
  - [X] 仿真平台验证diffusion policy![alt text](output.mp4)

- 本周工作主要内容(详细介绍)
  - 在公开的数据集上验证200个episode训练的diffusion policy，成功率有90%![alt text](image-2.png)

- 下周工作计划安排
  - 21楼机器部署diffusion policy
  - 修改diffusion policy代码，在仿真验证效果
  - [RDT](https://github.com/thu-ml/RoboticsDiffusionTransformer?tab=readme-ov-file)![alt text](image-1.png)


## 2024-10-16, with scir team


## 2024-10-11, weekly meeting report
- 上周工作计划
  - [ ] 实机docker部署diffusion policy -> 深圳没空余机器
  - [X] 仿真平台搭建和代码部署

- 本周工作主要内容(详细介绍)
  - docker部署diffusion policy, 
  - 使用离线数据集验证4080训练diffusion 10h的结果，至少离线(仿真)比octo的好![alt text](image.png)
  - 仿真平台(IL sim : robomimic, mimicgen(JD), robosuite)
    ![alt text](<Screenshot from 2024-10-11 17-17-20.png>)
  
- 遇到的问题及解决方法
  - 没有机器人 -> 仿真环境

- 下周工作计划安排
  - 将diffusion policy部署到仿真环境中

- meeting rec
  - 每周两篇论文，ppt分享一篇，每周来3天
  - 减少数据集试试diffusion policy
  - 看看论文为什么transformer+diffusion并不好，而纯diffusion policy好 
  - 使用力的导 -> 作为条件
  - 预处理图片使用语义condition的背景去噪









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
  <!-- - 使用离线数据集验证4080训练diffusion 10h的结果，至少离线(仿真)比octo的好![alt text](image.png) -->
  
- 遇到的问题及解决方法
  - docker占用空间->'docker run --rm' or 'docker system prune'
  - 
- 下月工作计划安排
  - 解决部署过程中的问题并优化部署代码
  - 3d diffusion论文，代码

- meeting rec
  - 对标什么改进


