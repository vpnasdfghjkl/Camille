---
title: "MyServer"
description: remote access tricks(ssh, port transfer)
date: '2025-04-16'
image: /series_mystyle__blog_to_server.png
order: 2
tags: 
    - RemoteSSh
    - Server
    - Aliyun
draft: false
---

## ssh反向代理
*[我有一个公网服务器root@camille0811.com, 我有两台主机A macos，B linux。我希望A可以持续稳定的访问B?](https://chat.deepseek.com/a/chat/s/ea1b7191-841c-4e3f-80a0-3d9e7d500d51)*
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

## ssh 反向代理(autossh + systemd, 有风险, 易被黑)
`A(mac/daily) ---> B(camille0811.com) ---> C(GPU server / Target server)`

``note``: before below code, need setup ssh key between A to B, B to C

```sh
# 设置从C到B的免密ssh登陆
ssh-keygen -t rsa -b 4096 -C "1362150003@qq.com"
ssh-copy-id -p 2222 root@camille0811.com
```


```sh
# 在B服务器上创建systemd服务文件
sudo nano /etc/systemd/system/autossh-reverse-tunnel.service
```

```sh
# /etc/systemd/system/autossh-reverse-tunnel.service
[Unit]
Description=AutoSSH Reverse Tunnel between mac and GPU server by camille0811.com
Wants=network-online.target
After=network-online.target
[Service]
User=TARGET_USER_NAME_ON_GPU_SERVER  # replace with the user name on GPU server
# map port 2280 on camille0811.com to port 22 on GPU server, 2222 is the ssh port of camille0811.com, if GPU server ssh port is not 22, change localhost:YOUR_SSH_PORT accordingly
ExecStart=/usr/bin/autossh -M 0 -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" -o "ExitOnForwardFailure=yes" -NR 2280:localhost:22 -p 2222 root@camille0811.com
Restart=always
RestartSec=15
[Install]
WantedBy=multi-user.target
```

## 同一台机器多个用户分别设置反向代理是脱裤子放屁
[开路与用路:chat with gemini](https://gemini.google.com/share/7ed38c5d2702)


## FRP + STCP 极速安全访问 / REVERSE PROXY 
这是针对 H100 高算力设备构建的 **FRP + STCP 极速安全访问方案**。该方案通过隐藏公网端口并结合 SSH 密钥，彻底杜绝了导致你之前 CPU 被占满的暴力破解风险。

**1. 核心配置参数 (三端必须统一)**

为了让整套方案顺利工作，你需要在 **公网VPS**、**H100服务器** 和 **本地访问电脑** 这三端的配置文件中设置一些参数。请确保在所有文件中，对应的参数值都是完全一样的。在下面的配置示例中，你需要将 `your_vps_ip`、`your_auth_token` 和 `your_secret_key` 等示例值替换为你自己设定的值。

**2. 节点配置规范**

### ---

**A. 公网 VPS (服务端 - frps)**

**文件：frps.toml**

```toml
bindPort = 7000

auth.method = "token"
# 请替换为你的自定义认证令牌，例如 "your_secure_token_here"
auth.token = "your_auth_token"
```

**运行命令：**

```bash
./frps -c frps.toml
```

### ---

**B. H100 服务器 (被控端 - frpc)**

**文件：frpc.toml**

```toml
# 请替换为你的公网VPS的IP地址
serverAddr = "your_vps_ip"
serverPort = 7000

auth.method = "token"
# 这里的令牌必须与服务端 frps.toml 中设置的完全一致
auth.token = "your_auth_token"

[[proxies]]
name = "h100_secret_ssh"
type = "stcp"
# 请替换为你的自定义STCP隧道加密密钥
secretKey = "your_secret_key"
localIP = "127.0.0.1"
localPort = 22
```

**运行命令：**

```bash
./frpc -c frpc.toml
```

### ---
**C. 本地 Mac/PC (访问端 - visitor)**

**文件：frpc-visitor.toml**

```toml
# 请替换为你的公网VPS的IP地址
serverAddr = "your_vps_ip"
serverPort = 7000

auth.method = "token"
# 这里的令牌必须与服务端 frps.toml 中设置的完全一致
auth.token = "your_auth_token"

[[visitors]]
name = "h100_visitor"
type = "stcp"
serverName = "h100_secret_ssh"
# 这里的密钥必须与H100服务器 frpc.toml 中设置的完全一致
secretKey = "your_secret_key"
bindAddr = "127.0.0.1"
bindPort = 6000
```

**运行命令：**

```bash
./frpc -c frpc-visitor.toml
```

### ---

**3\. SSH 安全加固规范 (核心防线)**

在 H100 成功接入后，必须修改系统 SSH 配置以免疫一切暴力破解。

1. 生成 Ed25519 密钥（Mac 端执行）：  
   ssh-keygen \-t ed25519 \-f \~/.ssh/id\_h100\_ed25519  
2. 推送公钥：  
   ssh-copy-id \-i \~/.ssh/id\_h100\_ed25519.pub \-p 6000 user@127.0.0.1  
3. **修改 H100 /etc/ssh/sshd\_config**：  
   * PasswordAuthentication no (禁用密码)  
   * PubkeyAuthentication yes (启用密钥)  
   * PermitRootLogin prohibit-password (禁止 Root 密码登录)  
4. 连接指令：  
   ssh \-p 6000 \-i \~/.ssh/id\_h100\_ed25519 your_username@127.0.0.1

### ---

**4\. 排错要点总结 (快速核对)**

| 现象 | 原因 | 对策 |
| :---- | :---- | :---- |
| nc \-vz 失败 | 云防火墙未开 | 在控制台放行 TCP 7000 |
| token doesn't match | `your_auth_token` 不一致 | 检查特殊字符转义或重启 frps |
| session shutdown | 版本/时间不一致 | 统一 frp 版本；同步系统时间 |
| killed (Mac) | 架构不对或 Gatekeeper | 确认下载 arm64 版；运行 xattr \-d |

### ---

**5\. 长期稳定运行建议**

既然不建议使用后台指令，推荐使用 **screen** 或 **tmux**。

* **优点**：进程在后台不中断，但你随时可以“切回”前台查看实时日志。  
* **命令**：  
  * 新建：screen \-S frp \-\> 运行 ./frp... \-\> 按 Ctrl+A, D 挂起。  
  * 查看：screen \-r frp 即可回到实时日志界面。

你需要我为你提供一份自动化安装 frp 并配置为 systemd 服务的脚本吗？（虽然它在后台，但你可以通过 journalctl \-f 随时滚动查看实时错误日志）。


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

## uv
```sh
# 安装 uv (一次性)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 新建环境 (指定 Python 版本)
uv venv --python 3.11 ~/.virtualenvs/pylab

# 激活
source ~/.virtualenvs/pylab/bin/activate
```