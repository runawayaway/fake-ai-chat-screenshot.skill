# AI Chat Screenshot Generator

用 Playwright 截取逼真的 AI 对话截图，支持 6 个主流平台，输出 2× 视网膜分辨率 PNG。

## 支持平台

| 平台 | 背景色 | 特色 |
|------|--------|------|
| ChatGPT | `#000` 移动端 | 状态栏 + 底部输入框，无用户气泡 |
| Claude | `#191919` 桌面端 | 衬线字体，锈红星爆图标 |
| DeepSeek | `#111318` 桌面端 | 原子图标思考卡片 |
| Gemini | `#0d0e12` 桌面端 | 蓝色四星图标 |
| Grok | `#000` 桌面端 | 灯泡思考指示器 |
| 豆包 | `#fff` 桌面端浅色 | 极简风格，无操作图标 |

## 文件结构

```
ai-chat-screenshot/
├── README.md
├── SKILL.md               ← Claude Code skill 定义（供 AI 使用）
├── assets/
│   ├── template.html      ← 所有平台的 HTML/CSS/JS 模板
│   └── generate.js        ← Node.js 截图主程序
└── TheRealScreenshot/     ← 各平台真实截图参考
```

## 快速使用

**第一步：** 创建任务脚本 `gen.py`

```python
import json, subprocess, os

tasks = [
    {
        "platform": "chatgpt",
        "time": "9:41",
        "filename": "chatgpt.png",
        "messages": [
            {"role": "user", "content": "什么是回溯法？"},
            {"role": "ai",   "content": "好的！回溯法是一种通过递归枚举所有可能解的算法……"}
        ]
    },
    {
        "platform": "claude",
        "filename": "claude.png",
        "messages": [
            {"role": "user", "content": "什么是回溯法？"},
            {"role": "ai",   "content": "回溯法本质上是对搜索树的深度优先遍历……"}
        ]
    }
]

outdir = r"C:\Users\18769\Desktop\output"
os.makedirs(outdir, exist_ok=True)

tmp = outdir + r"\tasks_tmp.json"
with open(tmp, "w", encoding="utf-8") as f:
    json.dump(tasks, f, ensure_ascii=False)

subprocess.run([
    "node",
    r"C:\Users\18769\.claude\skills\ai-chat-screenshot\assets\generate.js",
    tmp, outdir
], check=True)
os.unlink(tmp)
```

**第二步：** 运行

```powershell
python gen.py
```

## 任务字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `platform` | 是 | `chatgpt` / `claude` / `deepseek` / `gemini` / `grok` / `doubao` |
| `messages` | 是 | `[{"role": "user"\|"ai", "content": "..."}]` |
| `filename` | 否 | 输出文件名，默认 `<platform>.png` |
| `thinking_time` | 否 | DeepSeek / Grok 思考时间（秒），默认 `"4"` |
| `time` | 否 | ChatGPT 状态栏时间，默认 `"9:41"` |

`content` 支持 Markdown：`**粗体**`、`` `行内代码` ``、三反引号代码块、`\n` 换行。

## 注意事项

- **必须用 `json.dump()` 生成 JSON**，不要手写 JSON 文件。内容里的双引号（如中文引用 `"词语"`、代码注释）会破坏 JSON 字符串，`json.dump()` 自动处理转义。
- **不要在 bash heredoc 里内联 Python 脚本**，JSON 的花括号会触发 shell 解析错误。把脚本保存为 `.py` 文件再运行。
- 输出为 2× DPR 视网膜分辨率 PNG，只截取对话卡片区域，无多余空白。

## 依赖

- Node.js
- Playwright（通过 VS Code 插件 `oderwat.indent-rainbow` 引入）
- Chromium：`C:/Users/18769/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe`
