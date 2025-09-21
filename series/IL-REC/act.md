---
title: Act
description: Action Chunking with Transformer
date: '2025-8-25'
order: 5
tags:
  - IL
  - Action Chunking of Transformer
  - generative model
image: /act.svg
# image: /vae.png
draft: false
---

### 1. VAE在ACT算法中的作用到底是什么？如何理解？

### 2. 为什么假设一个分布，为什么假设正态分布？

### 3. 为什么从分布中采样？
1. 区别于传统bc，vae引入至少在训练阶段对于同样的输入状态，可以采样出不同的潜在变量z，对于同样目标的不同轨迹都可以学到，否则等价于传统bc，输入同样的状态，输出同样的编码，对于同样目标的不同轨迹会取平均。

### 4. references
- [VAE变分自编码机详解——原理篇](https://zhuanlan.zhihu.com/p/108262170)