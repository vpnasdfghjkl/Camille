---
title: style config about zsh | bash | tmux
description: A guide on how to use this sveltekit + markdown blog.
date: '2023-12-16'
tags:
  - SvelteKit
  - MDsveX
order: 1
image: /series_mystyle__colored.png
draft: false
---

## 1. from termcolor import colored
🎨 用 `termcolor` 给终端输出加点颜色！

在日常写脚本或调试程序时，想不想让你的终端输出更醒目、更有层次感？termcolor 是一个轻量又实用的 Python 库，可以轻松为终端文字加上颜色、高亮、下划线、背景色等效果。

本篇展示了 termcolor.colored 的几个经典用法，包括：
	•	✅ 基本颜色输出
	•	✨ 加粗、下划线、反显等文本属性
	•	🌈 前景 + 背景颜色搭配
	•	⚠ 状态信息彩色提示（成功/失败/警告）
	•	🔁 带颜色的进度循环演示

只需几行代码，就能让你的 CLI 输出瞬间焕然一新！
```python
from termcolor import colored
import sys, time
def demo_basic_colors():
    print(colored("This is red text", "red"))
    print(colored("This is green text", "green"))
    print(colored("This is yellow text", "yellow"))
    print(colored("This is blue text", "blue"))
    print(colored("This is magenta text", "magenta"))
    print(colored("This is cyan text", "cyan"))

def demo_text_attributes():
    print(colored("Bold text", "white", attrs=["bold"]))
    print(colored("Underlined text", "cyan", attrs=["underline"]))
    print(colored("Reversed text", "yellow", attrs=["reverse"]))
    print(colored("Dark text", "magenta", attrs=["dark"]))

def demo_background_colors():
    print(colored("White on red", "white", "on_red"))
    print(colored("Blue on yellow", "blue", "on_yellow"))
    print(colored("Green on magenta", "green", "on_magenta"))

def status_msg(msg, status):
    color = {
        "success": "green",
        "error": "red",
        "warning": "yellow",
        "info": "cyan"
    }.get(status, "white")
    return colored(msg, color, attrs=["bold"])

def demo_status_messages():
    print(status_msg("✓ Operation completed successfully!", "success"))
    print(status_msg("⚠ Warning: Disk almost full!", "warning"))
    print(status_msg("✖ Error: Failed to connect!", "error"))
    print(status_msg("ℹ Info: Update available.", "info"))

def demo_loop_with_colors():
    for i in range(1, 6):
        print(colored(f"Step {i}/5", "cyan"), colored("✔", "green", attrs=["bold"]))

def color_progress_bar(progress, total, bar_length=30):
    percent = float(progress) / total
    filled_len = int(round(bar_length * percent))
    
    bar = colored("█" * filled_len, "green") + colored("-" * (bar_length - filled_len), "white")
    percent_text = colored(f"{int(percent * 100)}%", "cyan", attrs=["bold"])
    
    sys.stdout.write(f"\r[{bar}] {percent_text}")
    sys.stdout.flush()

def demo_progress():
    total = 50
    for i in range(total + 1):
        color_progress_bar(i, total)
        time.sleep(0.05)
    print()  # 换行
if __name__ == "__main__":
    print(colored("=== Basic Colors ===", "white", attrs=["bold", "underline"]))
    demo_basic_colors()
    print()

    print(colored("=== Text Attributes ===", "white", attrs=["bold", "underline"]))
    demo_text_attributes()
    print()

    print(colored("=== Background Colors ===", "white", attrs=["bold", "underline"]))
    demo_background_colors()
    print()

    print(colored("=== Status Messages ===", "white", attrs=["bold", "underline"]))
    demo_status_messages()
    print()

    print(colored("=== Loop with Colored Steps ===", "white", attrs=["bold", "underline"]))
    demo_loop_with_colors()

    print(colored("=== Colored Progress Bar Demo ===", "white", attrs=["bold", "underline"]))
    demo_progress()
```

## git 
1. commit规范

## 运行和调试
1. 多进程调试突然出现跳步，是由于其他进程比如dataloader开启了多线程load数据