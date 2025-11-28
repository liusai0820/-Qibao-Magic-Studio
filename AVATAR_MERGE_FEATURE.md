# 用户头像合成功能指南

## 功能介绍

用户头像合成功能允许用户上传自己的照片，然后与卡通角色进行合成，生成皮克斯风格的3D动画合照。这是一个创新的功能，结合了真实照片和卡通艺术。

## 工作原理

### 技术架构

```
用户上传照片
    ↓
图片验证 & Base64 编码
    ↓
构建合成提示词
    ↓
调用 Gemini API（支持图片输入）
    ↓
生成合成图片
    ↓
上传到 R2 存储
    ↓
保存到数据库
    ↓
展示给用户
```

### 关键技术点

1. **图片输入支持** - Gemini 3 Pro 支持在请求中包含用户上传的图片
2. **Base64 编码** - 将用户图片转换为 Base64 格式传送给 API
3. **智能提示词** - 生成包含用户图片描述和卡通角色信息的提示词
4. **多模态处理** - 同时处理文本和图片输入

## 使用流程

### 1. 用户上传照片

```
- 点击上传区域或拖拽图片
- 支持格式：JPG、PNG、GIF、WebP
- 最大大小：20MB
- 系统会显示图片预览
```

### 2. 填写合成信息

```
【图片描述】（可选）
- 描述你的照片特征
- 例如：我穿着蓝色衣服，戴着眼镜

【卡通角色】（必填）
- 输入想要合成的卡通角色
- 例如：米奇、唐老鸭、白雪公主、三国英雄

【场景环境】（必填）
- 输入合成的场景
- 例如：迪士尼城堡、魔法森林、古风建筑
```

### 3. 生成合成图片

- 点击"生成合成图片"按钮
- 系统会调用 Gemini API 进行处理
- 显示进度条，预计需要 1-2 分钟
- 生成完成后自动保存到用户相册

## API 端点

### POST /api/generate-with-avatar

**请求格式：**
```
Content-Type: multipart/form-data

参数：
- userImage: File (必填) - 用户上传的图片
- userImageDescription: string (可选) - 图片描述
- cartoonCharacters: string (必填) - 卡通角色
- scene: string (必填) - 场景环境
- style: string (可选) - 风格，默认为 'pixar'
```

**响应格式：**
```json
{
  "id": "image_id",
  "url": "https://...",
  "prompt": "...",
  "theme": "卡通角色 - 用户头像合成",
  "timestamp": 1234567890
}
```

## 前端集成

### 使用 AvatarMergeForm 组件

```typescript
import { AvatarMergeForm } from '@/components/AvatarMergeForm'
import { AppState } from '@/lib/types'

export function MyPage() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE)

  const handleGenerate = async (formData: FormData) => {
    setAppState(AppState.BRAINSTORMING)
    try {
      const response = await fetch('/api/generate-with-avatar', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        // 处理生成的图片
      }
      setAppState(AppState.SUCCESS)
    } catch (error) {
      setAppState(AppState.ERROR)
    }
  }

  return <AvatarMergeForm onGenerate={handleGenerate} appState={appState} />
}
```

## 图片处理工具

### imageToBase64

将 File 对象转换为 Base64 字符串：

```typescript
import { imageToBase64 } from '@/lib/image-processing'

const base64 = await imageToBase64(file)
```

### validateImageFile

验证图片文件的格式和大小：

```typescript
import { validateImageFile } from '@/lib/image-processing'

const validation = validateImageFile(file)
if (!validation.valid) {
  console.error(validation.error)
}
```

### generateAvatarMergePrompt

生成合成提示词：

```typescript
import { generateAvatarMergePrompt } from '@/lib/image-processing'

const prompt = generateAvatarMergePrompt(
  '我穿着蓝色衣服',
  '米奇和唐老鸭',
  '迪士尼城堡'
)
```

## Gemini API 集成

### 支持的模型

- `gemini-2.0-flash-exp` - 支持图片输入和生成
- `gemini-3-pro-image-preview` - 专门的图片处理模型

### 请求格式

```json
{
  "model": "gemini-2.0-flash-exp",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "提示词..."
        },
        {
          "type": "image",
          "image": "base64_encoded_image",
          "media_type": "image/jpeg"
        }
      ]
    }
  ],
  "modalities": ["image", "text"],
  "image_config": {
    "aspect_ratio": "3:4",
    "image_size": "4K"
  }
}
```

## 使用示例

### 示例 1：用户与迪士尼角色合照

```
上传照片：用户的自拍照
图片描述：我穿着红色连衣裙，长黑发
卡通角色：米奇、唐老鸭、高飞
场景环境：迪士尼城堡前

结果：生成用户与迪士尼角色在城堡前的欢乐合照
```

### 示例 2：用户与三国英雄合照

```
上传照片：用户的照片
图片描述：我穿着现代服装
卡通角色：刘备、张飞、关羽
场景环境：古风建筑、桃花林

结果：生成用户与三国英雄在古风场景中的合照
```

## 常见问题

**Q: 支持哪些图片格式？**
A: 支持 JPEG、PNG、GIF、WebP 格式。

**Q: 图片大小有限制吗？**
A: 最大 20MB。建议使用 5MB 以下的图片以获得更快的处理速度。

**Q: 生成需要多长时间？**
A: 通常需要 1-2 分钟，取决于 API 响应速度。

**Q: 生成的图片会保存吗？**
A: 会。生成的图片会自动保存到用户的相册中。

**Q: 可以生成多少张图片？**
A: 没有限制，但受 API 配额限制。

**Q: 图片质量如何？**
A: 生成的图片为 4K 分辨率，质量很高。

## 隐私和安全

- 用户上传的图片只用于生成合成图片
- 图片会上传到 R2 存储，受到安全保护
- 用户可以随时删除生成的图片
- 所有操作都需要用户登录

## 未来改进

- [ ] 支持更多卡通风格
- [ ] 添加图片编辑功能（裁剪、调整）
- [ ] 支持批量生成
- [ ] 添加滤镜和效果
- [ ] 支持视频合成
