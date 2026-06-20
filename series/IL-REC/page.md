---
title: Robotic Imitation Learning Methods
description: IL series tech.
date: '2023-12-16'
tags:
  - Robotics
  - Imitation Learning
image: /imitation.png
draft: false
---

## data

### action space

#### xyzrpy

#### joint

### data collect

#### absolute

state + action(VR/BackDriving)

#### relative traj

##### state + action(VR/BackDriving)

1. training dataloader should deal with the relative action by minus all chunk size actions by current state
2. action chunk(Cartesian/Joint) output is delta(relative to the input state)

##### UMI

1. every eposide is just one traj relative to the first frame
2. input is t=-1(-2,-3...) state relative to current(t=0) state or more history window by a obs queue
3. output is delta action relative to current state(t=0)

## policy

### train

#### pure transformer + latent z => Action Chunk Transformer

#### diffusion(U-Net/Transformer) => Diffusion Policy

#### flow-matching(Transformer) => PI series

### infer

#### Temporal Ensemble

#### Simple Async Infer

#### RTC/TTC for multiple steps denoise method
