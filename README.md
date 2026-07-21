# 🦋 The Butterfly Lovers · 梁山伯与祝英台

> *A Tale of Two Souls, Eternal* · *双魂永恋*

An interactive retelling of the classic Chinese folktale **The Butterfly Lovers** (梁山伯与祝英台) — one of China's Four Great Folktales and a story often compared to Romeo and Juliet for its themes of love, sacrifice, and transcendence.

## ✨ Features

- **Bilingual storytelling** — Toggle between English and Chinese (中文) with a single click
- **Pinyin annotations** — Every Chinese character includes pinyin pronunciation guides using Ruby text
- **Dual narrations** — Each chapter is narrated in both languages:
  - 🇨🇳 Chinese: Xiaoxiao (female voice), slowed to 88% for clarity
  - 🇺🇸 English: Guy (male voice), natural pace
- **Autoplay** — Enable continuous narration across all 8 chapters
- **Classical illustrations** — AI-generated artwork in traditional Chinese ink-wash painting style (guohua)
- **Responsive design** — Beautiful on desktop, tablet, and mobile
- **Keyboard controls** — Space to play/pause, arrows to navigate chapters

## 📖 The Story

Set during the Eastern Jin dynasty, the tale follows **Zhu Yingtai** (祝英台), a young woman who disguises herself as a man to attend an academy, where she meets **Liang Shanbo** (梁山伯). Over three years of close friendship, love grows — but neither can speak it. When they part, Yingtai tries to confess through poetic hints, but Shanbo, a brilliant reader of books, cannot read her heart. By the time he understands, it is too late. On her wedding day to another, Yingtai's procession passes Shanbo's grave — the earth splits open, she throws herself in, and from the grave rise two butterflies, dancing together forever.

| # | Chinese | English |
|---|---------|---------|
| 1 | 女儿梦 | The Daughter's Dream |
| 2 | 易装远行 | Disguise and Journey |
| 3 | 学堂相识 | Meeting at School |
| 4 | 三年同窗 | Three Years of Brotherhood |
| 5 | 十八相送 | The Parting — Eighteen Miles |
| 6 | 痛承身世 | Tragic Discovery |
| 7 | 病亡逼嫁 | Death and Marriage |
| 8 | 化蝶 | Transformation into Butterflies |

## 🚀 Live Demo

**[View the live site →](https://pimplesonnose.github.io/butterfly-lovers/)**

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (zero dependencies)
- **Styling**: Custom CSS with classical Chinese aesthetic — rice paper textures, ink-wash palette, vermillion and jade accents
- **Typography**: Noto Serif SC, Ma Shan Zheng (Chinese) · Cormorant Garamond (English)
- **Audio**: Pre-generated MP3s via [Edge TTS](https://github.com/rany2/edge-tts)
- **Illustrations**: AI-generated using [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (FLUX model)
- **Deployment**: GitHub Pages via GitHub Actions

## 📁 Project Structure

```
butterfly-lovers/
├── index.html              # Main page
├── css/style.css           # Classical Chinese aesthetic
├── js/
│   ├── story-data.js       # Bilingual story text (EN + ZH)
│   ├── pinyin-data.js      # Auto-generated pinyin Ruby data
│   └── app.js              # UI controller
├── audio/
│   ├── zh/                 # Chinese narration (Xiaoxiao, -8% speed)
│   └── en/                 # English narration (Guy, normal speed)
├── images/                 # Classical ink-wash illustrations (.webp)
├── scripts/                # Content generation scripts
│   ├── generate-audio.py   # Edge TTS → MP3
│   ├── generate-images.py  # Cloudflare AI → illustration
│   └── generate-pinyin.py  # pypinyin → Ruby text data
└── .github/workflows/
    └── deploy.yml          # GitHub Pages CI/CD
```

## 🔧 Regenerating Content

All content was generated programmatically. To regenerate:

```bash
# Install dependencies
pip install edge-tts pypinyin

# Generate pinyin data
python scripts/generate-pinyin.py

# Generate narration audio (requires Edge TTS)
python scripts/generate-audio.py

# Generate illustrations (requires Cloudflare API keys in ~/.pi/agent/.env)
python scripts/generate-images.py --all
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause narration |
| `←` | Previous chapter |
| `→` | Next chapter |

## 📜 License

[MIT License](LICENSE)

## 🙏 Credits

- **[Pi](https://pi.dev)** — AI coding agent and project orchestrator. Pi designed the architecture, wrote the bilingual story, generated all audio and illustrations, and built the complete frontend.
- **[Z.AI](https://z.ai)** — AI research lab behind Pi's intelligence.

> *The Butterfly Lovers* (梁山伯与祝英台) is a traditional Chinese folktale with origins dating back over 1,600 years. This retelling is an original literary adaptation created for this project.
