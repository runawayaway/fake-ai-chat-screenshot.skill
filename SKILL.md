---
name: ai-chat-screenshot
description: Generate realistic fake AI chat conversation screenshots for use in presentations, homework, or articles. Supports ChatGPT, Claude, DeepSeek, Gemini, Grok, 豆包. Use when user asks for "AI对话截图", "fake chat screenshot", "AI聊天截图", or "generate chat screenshot". Also triggers when user says they want to write an article/tutorial/comparison that needs AI chat examples — automatically generate all needed screenshots without asking.
---

# AI Chat Screenshot Generator

Generates pixel-accurate fake AI chat screenshots using an HTML template + Playwright/Chromium.

## Supported Platforms

| Key        | Platform | Background   | Unique traits |
|------------|----------|--------------|---------------|
| `chatgpt`  | ChatGPT  | `#000` mobile | Status bar, input bar, no user bubble |
| `claude`   | Claude   | `#191919` desktop | Serif AI font, rust starburst icon |
| `deepseek` | DeepSeek | `#111318` desktop | Thinking card with atom icon |
| `gemini`   | Gemini   | `#0d0e12` desktop | Blue 4-star icon beside AI text |
| `grok`     | Grok     | `#000` desktop | Lightbulb thinking indicator |
| `doubao`   | 豆包     | `#fff` desktop light | Minimal, no action icons |

---

## Auto Mode — user gives a topic or scenario

**Trigger phrases** (do NOT ask for details, generate immediately):
- "我要写一份 X 相关的 AI 使用说明"
- "帮我做几张关于 X 的 AI 对话截图"
- "生成一套 X 主题的截图"
- User is writing an article/tutorial/comparison and needs chat examples

**Steps:**

1. **Design 6 conversations** — one per platform, all on the same topic but with different angles. No two platforms ask the same question. Each response must authentically match the platform's style (see Style Table below).

2. **Build the tasks JSON** — an array of 6 task objects.

3. **Write the Python script to a file, then run it** — never inline Python in a bash heredoc (JSON braces and backticks cause parse errors), and never hand-write the JSON file (unescaped `"quotes"` inside Chinese text will silently break it). Use the Write tool to create a `.py` file, then execute it:

```python
# Save this as e.g. C:\Users\18769\Desktop\gen_screenshots.py
import json, subprocess, os

tasks = [...]  # list of task dicts — Python handles all escaping automatically

outdir = r'C:\Users\18769\Desktop\<topic>_screenshots'
os.makedirs(outdir, exist_ok=True)

tmp = outdir + r'\tasks_tmp.json'
with open(tmp, 'w', encoding='utf-8') as f:
    json.dump(tasks, f, ensure_ascii=False)

subprocess.run(['node',
    r'C:\Users\18769\.claude\skills\ai-chat-screenshot\assets\generate.js',
    tmp, outdir], check=True)
os.unlink(tmp)
```

Then run:
```powershell
python "C:\Users\18769\Desktop\gen_screenshots.py"
```

4. **Report** the output folder and show each file path.

---

## Common Pitfalls

**① Never hand-write the JSON file**
Message `content` strings frequently contain ASCII double-quote characters — code comments like `# "label"`, Chinese quoted phrases like `"走错路"`, inline references like `r + 2`. Hand-written JSON requires these to be escaped as `\"`, which is easy to miss and hard to debug. Always let Python's `json.dump()` handle serialization.

**② Never inline the Python script in a bash heredoc**
A heredoc containing a Python script that itself contains JSON (curly braces, colons, brackets) triggers shell parse errors. Use the Write tool to save the script as a `.py` file, then run it with `python`.

**③ Backtick characters in content strings**
Markdown inline code like `` `r + 2` `` is fine inside Python string literals. Do not put the content string directly into a shell command or heredoc where backticks are treated as command substitution.

### Style Table (apply strictly when writing AI responses)

| Platform | Opening | Tone | Format habits | Signature |
|----------|---------|------|---------------|-----------|
| **ChatGPT** | "好的！" / "当然！" | Enthusiastic, thorough | `**Bold headers**` per method, bullet steps, ends with ✅ complexity summary | Covers ≥2 approaches |
| **Claude** | No greeting, cut straight to analysis | Calm, nuanced, elegant prose | Prose → code → 1-line complexity; uses "值得注意" "这里有个细节" "Note:" | Mentions edge cases / follow-up problems |
| **DeepSeek** | (no greeting) technical | Direct, terse | Short numbered list → compact code → 2-line summary | "时间 O(n)，空间 O(h)" style endings |
| **Gemini** | (no greeting) | Neutral, document-like | `**Small bold header**` → bullet logic → code → one-liner complexity | No personality, pure structure |
| **Grok** | Cultural reference or blunt statement | Informal, witty, opinionated | Code first or alongside commentary; ends with a personal remark | Uses "说实话", makes jokes, no fluff |
| **豆包** | "哈哈～" / "你好呀～" / "找到了～" | Warm, friendly, casual | Big-picture explanation first, code after; memory tricks; ends with encouragement | "～" endings, 🌟😄 emojis, no action icons |

### Tasks JSON format

```json
[
  {
    "platform":      "chatgpt",
    "messages":      [
      {"role": "user", "content": "..."},
      {"role": "ai",   "content": "..."}
    ],
    "filename":      "chatgpt.png",
    "thinking_time": "4",
    "time":          "9:41"
  }
]
```

- `thinking_time` — shown in DeepSeek/Grok thinking indicator (seconds string)
- `time` — clock time in ChatGPT status bar
- `filename` — defaults to `<platform>.png` if omitted
- Messages support `**bold**`, `` `inline code` ``, triple-backtick code blocks, newlines

---

## Manual Mode — user provides specific content

Ask for:
1. **Platform** (one or more)
2. **Conversation** — role + content for each message
3. **Thinking time** (DeepSeek/Grok), **Clock time** (ChatGPT) if needed

Then run `generate.js` with a single-item tasks array.

---

## Generator script

**Path:** `assets/generate.js`
**Runner:** Node.js with playwright from VS Code extension
**Chromium:** `C:/Users/18769/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe`

Quick single-platform call (write tasks.json first, then):

```powershell
node "C:\Users\18769\.claude\skills\ai-chat-screenshot\assets\generate.js" "C:\path\to\tasks.json" "C:\Users\18769\Desktop\test_shots"
```

`generate.js` accepts either a **file path** to a JSON file or an **inline JSON string** as first argument.

Output scale: 2× device pixel ratio → retina-quality PNG.  
Zero whitespace: screenshots capture only the `#phone` element.

---

## File structure

```
ai-chat-screenshot/
├── SKILL.md               ← this file
├── assets/
│   ├── template.html      ← HTML+CSS+JS for all 6 platforms
│   └── generate.js        ← Node.js screenshot runner (call this)
└── TheRealScreenshot/     ← reference screenshots for style matching
    ├── chatgpt_style.jpg
    ├── claude_style.png
    ├── deepseek_style.png
    ├── gemini_style.png
    ├── grok_style.png
    └── 豆包_style.png
```
