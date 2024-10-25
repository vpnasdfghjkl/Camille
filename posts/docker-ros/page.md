---
title: Docker
description: docker use
date: '2024-8-16'
tags:
  - Docker
image: '/posts/docker-ros/image.png'
draft: false
---
docker pull ros:noetic
docker run -it --rm --privileged --name ros_container --network host --device /dev/video0:/dev/video0  -v C:\Users\20998\Desktop\docker\ros:/app ros:noetic

## docker octo install tip
1. docker install 
```sh
  export DOWNLOAD_URL="https://mirrors.tuna.tsinghua.edu.cn/docker-ce"
  #如您使用 curl
  curl -fsSL https://raw.githubusercontent.com/docker/docker-install/master/install.sh | sh
  #如您使用 wget
  wget -O- https://raw.githubusercontent.com/docker/docker-install/master/install.sh | sh
```

2. NVIDIA Container Toolkit install 
  follow the install guidance:   
  https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html

3. docker pull nvidia/cuda:12.2
```sh
  sudo docker pull nvidia/cuda:12.2.2-cudnn8-devel-ubuntu20.04
```
  验证是否正常运行:
```sh
nvidia-smi
nvcc -V
```

4. docker run
```
  sudo docker run --gpus all --network host -it --rm nvidia/cuda:12.2.2-cudnn8-devel-ubuntu20.04 /bin/bash
```  
  进入docker后，apt-get update后安装miniconda:
```sh
	# in docker terminal
  mkdir -p ~/miniconda3
	wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
	bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
	rm ~/miniconda3/miniconda.sh
  ~/miniconda3/bin/conda init bash
```

5. follow the octo Installation:   
    https://github.com/octo-models/octo


## error experience
1. docker使用宿主显示器
xhost +local:docker