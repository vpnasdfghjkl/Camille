---
title: 'How many VRAM should you need of your Neural Network ?'
description: estimate the graphic memory needed for your neural network according to the model parameters, the middle variables and the batch size.
date: '2024-10-30'
image: '/template__vgg16_total_mem.png'
tags: 
    - Deep Learning
    - Graphical Memory
draft: false
---

## 估算 
```math
\text{VRAM} = \text{model.parameters()} + \text{middle\_variables} \times \text{batch\_size}
```
![( https://www.slideshare.net/slideshow/cs231n-2017-lecture9-cnn-architecture/83282815#34 )](/posts/template/vgg16_total_mem.png)

以float32精度为例， 一个VGG16模型的参数量为138M，中间变量的大小为96M/image，batch size为32，那么一个batch的VRAM需求为

```math
(0.138 * 4 + 0.096 * 2 * 32) * 4 = 6.4GB
```

## 代码测试 
### torchsummary
```python
import torch
import torch.nn as nn
import torchvision.models as models
from torchsummary import summary

# 定义一个简单的模型（这里以 ResNet18 为例）
model = models.resnet18().cuda()  # 将模型移动到 GPU

# 查看模型的概要信息
summary(model, (3, 256, 256))  # 输入尺寸为 256x256 的 RGB 图像

# 计算显存占用
def get_memory_usage():
    allocated_memory = torch.cuda.memory_allocated()  # 已分配的显存
    reserved_memory = torch.cuda.memory_reserved()    # 保留的显存
    return allocated_memory, reserved_memory

# 进行一次前向传播以查看中间变量的显存占用
input_tensor = torch.randn(1, 3, 256, 256).cuda()  # 生成一个随机输入
allocated_before = get_memory_usage()[0]  # 前向传播前的显存占用
output = model(input_tensor)  # 前向传播
allocated_after = get_memory_usage()[0]  # 前向传播后的显存占用

print(f"前向传播前显存占用: {allocated_before / (1024 ** 2):.2f} MB")
print(f"前向传播后显存占用: {allocated_after / (1024 ** 2):.2f} MB")
print(f"前向传播占用显存: {(allocated_after - allocated_before) / (1024 ** 2):.2f} MB")
```

### torchinfo 
    
```python
from torchinfo import summary
model = models.resnet18().cuda()
summary(model, input_size=(1, 3, 256, 256))
```

- next day 
- leetcode * 2 
- 评估zarr与hdf5，手写dataloador，重点是预处理的代码，包括随机化
    - 弄清楚sampler， replay buffer的代码
- 看看灵巧手的文章
    - 想想人形的模型改进方案，和技巧
- 把这个文章写完
