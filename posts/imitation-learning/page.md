---
title: Octo based on JAX
description: imitation learning
date: '2024-8-2'
tags:
  - Imitation Learning
  - octo
  - JAX
image: '/posts/imitation-learning/octo.png'
draft: false
---

## pretrain
   1. BERT:
      1. BERT的训练理解为使用两种做题的方法让编码器理解句子，一种是MLM(完形填空,多分类),另一种是NSP(续写句子,二分类)，使用的loss都是交叉熵损失函数
   2. 图像的作用：
      1. 类比人类在做出绝大多数动作前都会有视觉信息的输入，否则就是睡觉。而有少部分是需要人类的经验，另一部分则是对自身的操作(如闻到气味捂鼻，睡觉起身等等，但这些对机器人来说不需要)
      2. 由于octo单独使用图片输入甚至有更好效果，所有对于不在视野范围的“抬手”，需要“**非图像的本体感知**”来实现。或者使用**多摄像头**，这可能需要提高相机流的时间统一性。
      3. 
## jax
## module