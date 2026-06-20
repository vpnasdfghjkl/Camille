---
title: 'FRP Reverse Proxy'
description: 'Use frp stcp to access a private GPU server through a public VPS without exposing the SSH port.'
date: '2025-04-16'
image: /series_mystyle__blog_to_server.png
order: 2
tags:
  - FRP
  - Reverse Proxy
  - Server
draft: false
---

这篇只记录 `frp` 相关的反向代理方案。目标是：

- GPU 服务器不直接暴露 SSH 端口。
- 公网 VPS 只暴露 frp 服务端口。
- 本地电脑通过 visitor 连接到 GPU 服务器的 SSH。
- 认证同时依赖 frp token、STCP secret key 和 SSH key。

## Topology

```text
Local Mac / PC
  -> frpc visitor
  -> Public VPS: frps
  -> Private GPU server: frpc stcp
  -> 127.0.0.1:22
```

这里使用 `stcp`，而不是直接把 GPU 服务器的 SSH 映射到公网端口。这样公网只能看到 VPS 上的 `frps` 端口，看不到 GPU 服务器的 SSH 服务。

## Shared Parameters

三端配置需要保持一致：

```text
VPS address: your_vps_ip
frps bind port: 7000
auth token: your_auth_token
stcp secret key: your_secret_key
local visitor port: 6000
```

`auth.token` 用于 frpc/frps 之间认证，`secretKey` 用于 STCP visitor 和 server proxy 匹配。二者不要复用同一个值。

## VPS: frps

在公网 VPS 上运行 `frps`。

`frps.toml`:

```toml
bindPort = 7000

auth.method = "token"
auth.token = "your_auth_token"
```

启动：

```bash
./frps -c frps.toml
```

云厂商安全组或防火墙只需要放行 `7000/tcp`：

```bash
sudo ufw allow 7000/tcp
```

## GPU Server: frpc STCP Server

在内网 GPU 服务器上运行 `frpc`，把本机 SSH 暴露给 STCP 隧道。

`frpc.toml`:

```toml
serverAddr = "your_vps_ip"
serverPort = 7000

auth.method = "token"
auth.token = "your_auth_token"

[[proxies]]
name = "gpu_ssh"
type = "stcp"
secretKey = "your_secret_key"
localIP = "127.0.0.1"
localPort = 22
```

启动：

```bash
./frpc -c frpc.toml
```

## Local Machine: frpc Visitor

在本地 Mac/PC 上运行 visitor，把 STCP 隧道绑定到本地端口。

`frpc-visitor.toml`:

```toml
serverAddr = "your_vps_ip"
serverPort = 7000

auth.method = "token"
auth.token = "your_auth_token"

[[visitors]]
name = "gpu_ssh_visitor"
type = "stcp"
serverName = "gpu_ssh"
secretKey = "your_secret_key"
bindAddr = "127.0.0.1"
bindPort = 6000
```

启动：

```bash
./frpc -c frpc-visitor.toml
```

连接 GPU 服务器：

```bash
ssh -p 6000 your_username@127.0.0.1
```

## SSH Hardening

frp 只解决网络可达性，不替代 SSH 安全配置。GPU 服务器建议只允许密钥登录。

在本地生成专用密钥：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_gpu_ed25519
```

visitor 启动后，把公钥复制到 GPU 服务器：

```bash
ssh-copy-id -i ~/.ssh/id_gpu_ed25519.pub -p 6000 your_username@127.0.0.1
```

修改 GPU 服务器 `/etc/ssh/sshd_config`：

```text
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

重启 SSH：

```bash
sudo systemctl restart ssh
```

之后用密钥连接：

```bash
ssh -p 6000 -i ~/.ssh/id_gpu_ed25519 your_username@127.0.0.1
```

## Run In Tmux

调试阶段推荐先用 `tmux` 跑三端进程，方便随时查看日志。

```bash
tmux new -s frp
./frps -c frps.toml
```

后台挂起：

```text
Ctrl+b, d
```

恢复：

```bash
tmux attach -t frp
```

确认稳定后，再考虑把 `frps` 和 `frpc` 写成 systemd service。

## Troubleshooting

| Symptom                         | Common cause                                  | Check                                        |
| ------------------------------- | --------------------------------------------- | -------------------------------------------- |
| `nc -vz your_vps_ip 7000` fails | VPS firewall or security group blocks traffic | Open `7000/tcp`                              |
| `token doesn't match`           | `auth.token` differs between frps and frpc    | Compare all config files                     |
| visitor connects but SSH fails  | `serverName` or `secretKey` mismatch          | Match visitor `serverName` with proxy `name` |
| `session shutdown`              | frp versions differ or system time is off     | Use same frp version and sync time           |
| macOS says binary is blocked    | Gatekeeper quarantine                         | `xattr -d com.apple.quarantine ./frpc`       |

## Minimal Checklist

1. VPS runs `frps` and exposes only `7000/tcp`.
2. GPU server runs `frpc` with `type = "stcp"` and `localPort = 22`.
3. Local machine runs `frpc` visitor and binds `127.0.0.1:6000`.
4. SSH connects through `ssh -p 6000 your_username@127.0.0.1`.
5. GPU server disables password login after SSH key login is confirmed.
