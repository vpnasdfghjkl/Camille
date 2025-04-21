---
title: "MyServer"
description: remote access tricks(ssh, port transfer)
date: '2025-04-16'
image: '/series/mystyle/blog_to_server.png'
order: 2
tags: 
    - RemoteSSh
    - Server
    - Aliyun
draft: false
---
## ssh反向代理
```bash
sudo nano /etc/ssh/sshd_config
```
修改`GatewayPorts no`为`yes`允许外部访问

```bash
# 配置ssh端口映射，访问服务器的5173等于访问本地的5173
ssh -fNTR 5173:localhost:5173 root@120.55.169.67 &
```
### blog转发/本地应用转发
```bash
(base) ➜  Camille git:(main) ✗ npm run dev

> portfolio@0.0.1 dev
> vite dev


  VITE v5.4.5  ready in 501 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
可在浏览器访问`120.55.169.67:5173`查看blog

### vscode访问代码
在内网服务器配置ssh反向代理，使外部机器可以利用公网服务器作为跳板机访问内网服务器。
```bash
ssh -o ServerAliveInterval=60 -o ExitOnForwardFailure=yes -fNTR 2222:localhost:22 root@120.55.169.67
```

### 常用命令
```bash
# 查看占用5173端口的程序
sudo lsof -i :5173

# 允许5137的端口访问(或者使用aliyun控制台设置sg安全组)
sudo ufw allow 5173/tcpsudo ufw allow 5173/tcp

# 免密ssh
ssh-keygen -t rsa -b 4096 -C "1362150003@qq.com"
ssh-copy-id root@120.55.169.67


```
跳板机.ssh/config配置: 
```bash
Host mac2server2ubuntu_harbin
  HostName localhost  # 因为是通过跳板机连接，目标实际上是 localhost（对服务器而言）
  Port 2222 # 服务器上映射的端口
  User syp  # 你在 a（Linux）上的用户名
  ProxyJump root@120.55.169.67  # 先跳转到服务器
  # 如果服务器不是默认 22 端口，加一行：
  # ProxyJump root@120.55.169.67:SSH_PORT
```


## GPU
```bash
# 批量终止所有 GPU 2 的进程(包括显示器), 如果使用过多卡, 可能会终止其他的GPU。
sudo fuser -vk /dev/nvidia2
```

## 源
1. apt
```bash
# 1. 备份原有的 sources.list
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup

# 2. 使用 echo + sudo tee 覆盖 sources.list 内容
sudo tee /etc/apt/sources.list > /dev/null <<EOF
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-updates main restricted universe multiverse
deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse
# deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-backports main restricted universe multiverse

# 以下安全更新软件源包含了官方源与镜像站配置，如有需要可自行修改注释切换
deb http://ports.ubuntu.com/ubuntu-ports/ focal-security main restricted universe multiverse
# deb-src http://ports.ubuntu.com/ubuntu-ports/ focal-security main restricted universe multiverse

# 预发布软件源，不建议启用
# deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-proposed main restricted universe multiverse
# # deb-src https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ focal-proposed main restricted universe multiverse
EOF
```