---
title: diffusion rec
description: diffusion policy.
date: '2024-9-10'
order: 1
tags:
  - IL
  - diffusion
  - generator model
draft: false
---
## data

### command and state
![kuavo_traj_q_v_tua](/posts/imitation-learning/pick_up_something_2024-08-13-15-11-01.png)

## policy


## module

## robot env

## Chat with HW
### experience
### 事务


## Idea
1. 图像的归一化能否和state一样在图像之间归一化，而不是自己归一化？


- what matters in robot imitation learning ?  
  
- diffuision scheduler and predict_net is 解耦

- directly use data or use latent of data

- some acknowledges about nn.parameters()

- a model archtecture picture about diffusion policy

- details about imitation learning data flow in training

- naive bayes 在对两个高斯分布时，naive bayes 是logistic回归的特殊情况

- 什么是自归回

- nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding), nn.Conv2d, nn.Linear(),

- Conditional Denoise: $P(x_{t-1}|x_t)= ||{\epsilon} - f_{\theta}(x_t, t, condition)|| , condition \in \{\text{text}, \text{CLIP}, \text{classifier}, \text{image}\} $

- VAE IL, DIFFUSION IL, BC_RNN IL , (octo IL)?