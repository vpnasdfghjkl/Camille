---
title: "Intership"
description: record intership preparation and intership experience
date: '2025-04-14'
image: '/posts/Intership/ChatGPT Image 2025年4月16日 16_28_27.png'
tags: 
    - Robot
    - Imitation Learning
    - Manipulation
draft: true
---

## 1. first week with jetson nx and zed-mini, build the basic environment for robot manipulation research


---

# Jetson NX + ZED Mini 开发调试工作记录 

### 1. 硬件连接与基础环境

* **硬件平台**：NVIDIA Jetson NX (Orin 架构)
* **传感器**：ZED Mini
* **物理连接**：
* **USB 接口**：必须插入 NX **左上角** 的 USB 口。
* **验证**：使用 `lsusb` 确认设备已被检测到。


* **软件版本要求**：
* **JetPack**：6.1 / 6.2 (L4T 36.4)
* **ZED SDK**：5.1 (配合 CUDA 12.6, Jetson Orin)
* **ROS 2 Wrapper**：GitHub `zed-ros2-wrapper`



---

### 2. ZED 本地采集调优 (解决丢帧/Corrupted Frame)

在 30fps 启动时若出现 `[WARN] ... Grab status degraded: CORRUPTED FRAME`，需进行以下两步调整。

#### A. 系统内核 USB 带宽解锁

解决 USB 带宽限制导致的丢帧。

```bash
# 临时修改 (重启失效)
sudo sh -c 'echo 1000 > /sys/module/usbcore/parameters/usbfs_memory_mb'

# 验证 (应显示 1000)
cat /sys/module/usbcore/parameters/usbfs_memory_mb

```

#### B. ROS 2 参数裁剪 (YAML 配置)

修改 `zed_wrapper` 配置文件（如 `common.yaml`），关闭深度计算以降低负载，仅保留视频流。

```yaml
# --- 采集端 (Grab) ---
grab_resolution: 'HD720'      # 原生采集分辨率 (推荐 HD720, 可选 HD1080/HD2K/VGA)
grab_frame_rate: 60           # SDK 内部采集帧率

# --- 发布端 (Pub) ---
pub_resolution: 'CUSTOM'
pub_downscale_factor: 2.0     # 2倍降采样 (关键优化点)
pub_frame_rate: 30.0          # 最终输出帧率

# --- 功能裁剪 (Off) ---
pos_tracking_enabled: false   # 关闭位置追踪
depth_mode: 'NONE'            # 关闭深度图
# 注意: 设置为 NONE 会默认禁用所有依赖深度的模块 (Obj Detection, Mapping 等)

```

> **待办事项**：检查图像是否倒置。如倒置，需调整 `camera_flip` 参数或物理安装方向。

---

### 3. 多机通讯与中间件配置 (ROS 2 Middleware)

#### 方案 A：Cyclone DDS (推荐/当前使用脚本)

使用脚本一键配置环境，强制绑定有线网卡并隔离 Domain ID。

**脚本文件：`zed_link.sh` (部署在 x86 接收端)**

```bash
#!/bin/bash
# ZED 专用有线连接环境 (x86 接收/录制端)

echo "🔌 正在激活 ZED 有线网络环境..."

# 1. 切换中间件为 Cyclone DDS
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp

# 2. 绑定网卡 eno1
# XML配置直接写入环境变量，强制指定有线网卡 name="eno1"
export CYCLONEDDS_URI='<CycloneDDS><Domain><General><Interfaces><NetworkInterface name="eno1"/></Interfaces></General></Domain></CycloneDDS>'

# 3. 设置 Domain ID (避免与局域网其他机器人冲突)
export ROS_DOMAIN_ID=58

# 4. 刷新守护进程 (确保新配置生效)
ros2 daemon stop > /dev/null 2>&1
ros2 daemon start > /dev/null 2>&1

echo "✅ [x86] 环境已就绪!"
echo "   IP: $(ip -4 addr show eno1 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')"
echo "   Interface: eno1"
echo "   Domain: 58"

```

*注意：NX 端也需要配置相应的 `ROS_DOMAIN_ID=58` 和 `RMW_IMPLEMENTATION` 才能通讯。*

#### 方案 B：FastDDS (备选/旧配置)

如果不使用 Cyclone，可使用 XML 白名单方式隔离 WiFi 流量。

1. **配置文件**：`vim ~/fastdds_eth.xml`
2. **环境变量**：`export FASTRTPS_DEFAULT_PROFILES_FILE=~/fastdds_eth.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<profiles xmlns="http://www.eprosima.com/XMLSchemas/fastRTPS_Profiles">
    <transport_descriptors>
        <transport_descriptor>
            <transport_id>CustomUDPTransport</transport_id>
            <type>UDPv4</type>
            <interfaceWhiteList>
                <address>192.168.123.10</address> <address>127.0.0.1</address>      </interfaceWhiteList>
        </transport_descriptor>
    </transport_descriptors>

    <participant profile_name="CustomParticipant" is_default_profile="true">
        <rtps>
            <userTransports>
                <transport_id>CustomUDPTransport</transport_id>
            </userTransports>
            <useBuiltinTransports>false</useBuiltinTransports>
        </rtps>
    </participant>
</profiles>

```

---

### 4. 网络带宽与稳定性测试

#### A. 流量监控

* **工具**：`nload device`
* **标准**：确保 WiFi 网卡无流量，数据完全通过有线网卡传输。

#### B. 带宽压力测试 (iPerf3)

测试链路物理极限。

```bash
sudo apt update && sudo apt install iperf3

# --- x86 接收端 ---
iperf3 -s

# --- NX 发送端 ---
# 测试 10 秒
iperf3 -c 192.168.123.20 -t 10

```

*常用测试分辨率参考：*

* 1920 * 1080
* 1280 * 720
* 672 * 376

*更多调优参考：[Stereolabs DDS and Network Tuning*](https://www.stereolabs.com/docs/ros2/dds_and_network_tuning)

---

### 5. 常用工具与依赖安装

#### A. Rosbag 录制插件 (Mcap)

Mcap 格式写入性能更好，适合高带宽视频录制。

```bash
sudo apt install ros-humble-rosbag2-storage-mcap

```

#### B. LeRobot 数据集视频预览依赖 (FFmpeg)

解决数据集视频无法预览或缺少解码器的问题。

```bash
sudo apt-get update
sudo apt-get install -y \
  ffmpeg \
  libavdevice58 \
  libavfilter7 \
  libswscale5 \
  libswresample3 \
  libpostproc55

# 更新动态链接库缓存
sudo ldconfig

```