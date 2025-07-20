---
title: "MyServer"
description: remote access tricks(ssh, port transfer)
date: '2025-04-16'
image: /series/mystyle/blog_to_server.png
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

## 服务器自启动配置过程(局域网server：A(用户是tongyuan2)， 公网server：B(camille0811.com)， 其他机器： C)
好的，完全没问题。我们一步一步来，就像之前配置第一个用户那样，为 `tongyuan2` 用户建立一个稳定独立的 SSH 反向隧道。

这个过程将确保 `tongyuan2` 的隧道在**服务器 B 的 `2252` 端口**上监听，并且完全独立于 `tongyuan1` 的隧道。

---

### 准备工作：确认用户存在

首先，请确保内网**服务器 A** 上已经有 `tongyuan2` 这个用户。如果没有，请创建它：

```bash
# 在服务器 A 上执行
sudo useradd -m -s /bin/bash tongyuan2
# (可选)为该用户设置一个密码，以便他自己能登录服务器A
# sudo passwd tongyuan2
```

---

### 第一步：在【服务器 A (内-网)】上为 `tongyuan2` 配置免密登录到服务器 B

这一步是让 `tongyuan2` 账户能够自动、无需密码地连接到**服务器 B**。这是 `autossh` 自动重连的基础。

1.  **切换到 `tongyuan2` 用户**：
    为了保证所有密钥和配置都属于 `tongyuan2`，我们直接以他的身份操作。
    ```bash
    # 在服务器 A 上执行
    sudo su - tongyuan2
    ```
    现在你的命令行提示符应该变成了 `tongyuan2@...`。

2.  **生成 SSH 密钥**（如果 `tongyuan2` 还没有的话）：
    ```bash
    # 作为 tongyuan2 用户执行
    ssh-keygen -t ed25519
    ```
    一路按回车，使用默认设置，不要设置密码。这会在 `/home/tongyuan2/.ssh/id_ed25519.pub` 生成公钥。

3.  **将 `tongyuan2` 的公钥复制到服务器 B**：
    ```bash
    # 仍然作为 tongyuan2 用户执行
    # 注意：这里我们使用 root@camille0811.com，因为隧道的另一端是由B服务器的root进程管理的
    ssh-copy-id root@camille0811.com
    ```
    系统会提示你输入 `root@camille0811.com` 的密码。**输入一次密码**后，免密登录就为 `tongyuan2` 设置好了。

4.  **验证免密登录**：
    试一下是否能直接登录，如果不需要输密码就成功了。
    ```bash
    # 仍然作为 tongyuan2 用户执行
    ssh root@camille0811.com
    # 登录成功后输入 exit 退出，回到服务器 A
    exit
    ```

5.  **返回 root 或你的管理员账户**：
    完成 `tongyuan2` 的配置后，可以退回到你原来的账户了。
    ```bash
    exit
    ```

---

### 第二步：在【服务器 A (内网)】上为 `tongyuan2` 创建 `systemd` 隧道服务

现在我们创建一个新的 `systemd` 服务文件，专门用于管理 `tongyuan2` 的隧道。文件名要和之前的区分开。

1.  **创建新的服务文件**：
    ```bash
    # 在服务器 A 上以 root/sudo 权限执行
    sudo nano /etc/systemd/system/reverse-tunnel-tongyuan2.service
    ```

2.  **粘贴服务配置内容**：
    将以下内容完整复制并粘贴到文件中。注意 `User`、`Description` 和端口号 `2252` 都是为 `tongyuan2` 量身定制的。

    ```ini
    [Unit]
    # 描述清晰地指明是为 tongyuan2 服务的
    Description=AutoSSH Reverse Tunnel for tongyuan2 to port 2252
    Wants=network-online.target
    After=network-online.target

    [Service]
    # 重要：使用 tongyuan2 用户来运行这个服务
    User=tongyuan2
  
    # 核心命令，映射端口 2252
    ExecStart=/usr/bin/autossh -M 0 -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" -o "ExitOnForwardFailure=yes" -NR 2252:localhost:22 root@camille0811.com
  
    Restart=always
    RestartSec=15

    [Install]
    WantedBy=multi-user.target
    ```

3.  **保存并关闭文件** (`Ctrl+X`, `Y`, `Enter`)。

---

### 第三步：在【服务器 B (公网)】上为新端口配置防火墙

`tongyuan1` 的 `2250` 端口应该已经打开了，现在我们还需要为 `tongyuan2` 打开 `2252` 端口。

1.  **登录到服务器 B**：
    ```bash
    ssh root@camille0811.com
    ```

2.  **开放 `2252` 端口**：
    ```bash
    # 假设你使用 ufw
    sudo ufw allow 2252/tcp
    sudo ufw reload

    # 如果是 firewalld (CentOS/RHEL)
    # sudo firewall-cmd --permanent --add-port=2252/tcp
    # sudo firewall-cmd --reload
    ```
    > **提示**: `GatewayPorts yes` 这个配置是全局的，之前为 `tongyuan1` 设置过一次后，对 `tongyuan2` 的隧道同样生效，无需重复配置。

---

### 第四步：启动并验证 `tongyuan2` 的隧道服务

回到**服务器 A**，启动我们刚刚创建的新服务。

1.  **重载 `systemd`，启用并启动新服务**：
    ```bash
    # 在服务器 A 上执行
    sudo systemctl daemon-reload
    sudo systemctl enable reverse-tunnel-tongyuan2.service  # 设置开机自启
    sudo systemctl start reverse-tunnel-tongyuan2.service   # 立即启动
    ```

2.  **检查服务状态**：
    ```bash
    sudo systemctl status reverse-tunnel-tongyuan2.service
    ```
    你应该能看到 `active (running)` 的绿色状态，并且日志中显示 `autossh` 进程已启动。

---

### 第五步：在【设备 C (你的PC)】上测试连接

一切就绪！现在，从你的个人电脑上测试连接到服务器 A 的 `tongyuan2` 账户。

1.  **执行 SSH 命令**：
    ```bash
    ssh -p 2252 tongyuan2@camille0811.com
    ```
    *   `-p 2252`: 连接的是**服务器 B** 上的 `2252` 端口。
    *   `tongyuan2`: 用户名是**服务器 A** 上的 `tongyuan2`。
    *   `camille0811.com`: 地址是**服务器 B** 的地址。

2.  **（推荐）更新 `~/.ssh/config` 文件**：
    在你 PC 的 `~/.ssh/config` 文件中追加 `tongyuan2` 的配置：
    ```
    Host company-t2
        HostName camille0811.com
        User tongyuan2
        Port 2252
    ```
    现在你可以用 `ssh company-t2` 来快速连接了。

至此，你已经成功地为 `tongyuan2` 用户手动配置了一套完全独立且稳定的反向隧道。两个用户的隧道互不干扰，各自有自己的服务进程和端口。


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