---
title: Docker ROS
description: ros:noetic
date: '2024-8-16'
tags:
  - Docker
  - ros
image: '/posts/docker-ros/image.png'
draft: false
---
docker pull ros:noetic
docker run -it --rm --privileged --name ros_container --network host --device /dev/video0:/dev/video0  -v C:\Users\20998\Desktop\docker\ros:/app ros:noetic
