---
title: "Jetson AGX Orin for DL"
description: Jetson AGX Orin for DL Inference
date: '2025-04-11'
image: /posts_JetsonAGX__image.png
tags: 
    - Robot
    - Imitation Learning
    - Manipulation
draft: false
---
## install 
```sh
sudo docker run --rm -it \
  --runtime nvidia \
  --network host \
  --ipc=host \
  --ulimit memlock=-1 \
  --ulimit stack=67108864 \
  nvcr.io/nvidia/l4t-pytorch:r35.5.0-pth2.1-py3

sudo usermod -aG docker $USER
```

```sh
pip install \
opencv-python \
dill  \
imageio \
numpy \
-i https://pypi.tuna.tsinghua.edu.cn/simple


## reference
- https://elinux.org/Jetson_Zoo
- https://catalog.ngc.nvidia.com/orgs/nvidia/containers/l4t-ml