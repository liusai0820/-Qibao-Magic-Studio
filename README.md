# 🎨 奇妙黏土世界 | Qibao Magic Studio

为 2-5 岁宝宝定制的 AI 双语认知海报生成器。

## ✨ 功能特点

- 🎨 **AI 智能创作** - 输入主题，自动生成精美黏土风格海报
- 🌍 **双语认知** - 中英文 + 拼音标注，助力语言启蒙
- ✨ **黏土风格** - 可爱治愈的 3D 黏土艺术风格
- 🪄 **魔法修改** - 支持对生成的图片进行二次编辑

## 🚀 快速开始

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
在 `.env.local` 中设置你的 Gemini API Key：
```
GEMINI_API_KEY=your_api_key_here
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🛠 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **AI**: Google Gemini API
- **语言**: TypeScript

## 📁 项目结构

```
├── app/
│   ├── api/          # API 路由
│   ├── globals.css   # 全局样式
│   ├── layout.tsx    # 根布局
│   └── page.tsx      # 首页
├── components/
│   ├── ui/           # 基础 UI 组件
│   └── ...           # 业务组件
└── lib/
    ├── constants.ts  # 常量配置
    └── types.ts      # 类型定义
```

## 📝 License

MIT
