---
title: env config about pyenv/conda/ros/etc
description: coding env set
date: '2025-4-20'
tags:
  - pyenv
  - conda
  - direnv
  - ros
order: 3
image: 
draft: false
---

## pyenv

## direnv

⸻

🧪 direnv 使用手册：为每个项目自动激活环境

管理 Python 虚拟环境 / Conda 环境 / 自定义变量的神器
✅ 进入目录自动激活 ✅ 离开自动还原 ✅ 不污染全局

⸻

🌱 为什么用 direnv？

开发中我们经常：
	•	忘记激活虚拟环境（venv / conda）
	•	不小心使用了错误版本的 python 或依赖
	•	需要为不同项目设置不同的环境变量（如 API_KEY、DEBUG 等）

🎯 direnv 可以帮你在进入目录时自动做这些事！

⸻

⚙️ 安装

macOS (推荐 Homebrew)

```bash
brew install direnv
```

Linux

```bash
sudo apt install direnv   # 或 pacman / yum 等
```

Windows (WSL 用户可用 Linux 安装方式)

⸻

🧩 shell 配置

在你的 shell 配置文件里加入以下内容：

Zsh 用户（macOS 默认）

```bash
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc
```

Bash 用户

```bash
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```



⸻

🚀 快速开始

步骤 1：在项目目录创建 .envrc

```bash
echo 'export FOO="hello_direnv"' > .envrc
```

步骤 2：允许 direnv 加载该文件

```bash
direnv allow .
```

步骤 3：进入该目录

```bash
cd ~/your_project
echo $FOO   # 输出 hello_direnv
```



⸻

🐍 Python 虚拟环境自动激活示例

```bash
# .envrc
source ~/.virtualenvs/your_env/bin/activate
```

或者用 direnv 的 layout 机制：

```bash
# .envrc
layout python ~/.virtualenvs/your_env/bin/python
```



⸻

🧬 Conda 环境自动激活

```bash
# .envrc
use conda your_env
```

⚠️ 需要先安装 direnv-stdlib 或手动配置 conda 初始化路径。

⸻

🪄 示例：完整的 .envrc

```bash
# 自动激活 Python venv
source ~/.virtualenvs/pylab/bin/activate

# 设置项目变量
export DEBUG=true
export API_KEY=sk-xxxx

# 自动设置 PATH（可选）
export PATH="./scripts:$PATH"
```



⸻

🧼 禁用或重载 .envrc
	•	拒绝当前目录的 .envrc：

```bash
direnv deny .
```

	•	重新加载（当你修改了 .envrc）：

```bash
direnv allow .
```

	•	清除缓存并退出当前目录的环境：

```bash
direnv reload
```



⸻

💡 常见技巧

需求	.envrc 示例
自动激活 venv	source .venv/bin/activate
自动激活 conda 环境	use conda my_env（需配置）
设置环境变量	export DEBUG=true
添加到 PATH	export PATH="./bin:$PATH"
多个配置一起用	混合上面所有写法



⸻

🔒 安全提示
	•	direnv 会拒绝加载任何未明确 allow 的 .envrc；
	•	所有的 .envrc 文件都需要手动 direnv allow .；
	•	修改 .envrc 后需要重新 allow。

⸻

✅ 总结一句话

进入项目目录自动设置环境，离开目录自动清除——一劳永逸！

⸻

