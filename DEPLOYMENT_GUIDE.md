# Vercel Free 计划部署指南

## 架构说明

本项目采用**直接生成 API** 的架构，完全兼容 Vercel Free 计划。

### 工作原理

所有生成任务都是**同步直接处理**：

```
用户提交 → API 直接调用 OpenRouter → 返回结果
```

**优点**：
- 简单直接，无需复杂的任务队列
- 用户体验好，实时反馈
- 完全免费

**缺点**：
- 如果生成时间超过 Vercel 函数超时时间（10秒），会失败
- 但通常 OpenRouter 生成在 30-120 秒内完成

## 部署步骤

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-...
BRAINSTORM_MODEL=google/gemini-3-pro-preview
IMAGE_MODEL=google/gemini-3-pro-image-preview

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=qibao
R2_ENDPOINT=https://...r2.cloudflarestorage.com
NEXT_PUBLIC_R2_DOMAIN=https://pub-...r2.dev

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# App Config
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. 部署

```bash
git push  # 推送到连接的Git仓库
# Vercel 会自动部署
```

## 工作流程

### 认知海报生成

1. **用户提交表单** → `/api/generate/direct`
2. **后端处理**（30-120 秒）
   - 调用 OpenRouter API 进行构思
   - 调用 OpenRouter API 生成图片
   - 上传到 R2 存储
   - 保存到数据库
3. **返回结果** → 显示生成的图片

### 绘本故事生成

1. **用户提交表单** → `/api/storybook/generate-story`
   - 快速返回故事文本结构（10-30 秒）
2. **前端逐页生成** → `/api/storybook/generate-image`
   - 为每一页调用生成 API（30-120 秒/页）
   - 生成一页显示一页
   - 用户可以实时看到进度

## 超时问题处理

### 问题

Vercel Free 计划的函数超时时间为 10 秒，但 AI 生成通常需要 30-120 秒。

### 解决方案

#### 方案 A：接受超时风险（当前方案）

如果生成时间通常在 30-60 秒内，可以：
1. 增加前端超时时间
2. 添加重试机制
3. 显示友好的超时提示

**优点**：完全免费，无需额外服务
**缺点**：可能偶尔超时

#### 方案 B：使用外部任务队列（推荐升级方案）

使用免费的任务队列服务，如：
- **Upstash Redis**（免费额度充足）
- **AWS SQS**（免费额度）
- **Google Cloud Tasks**（免费额度）

**实现步骤**：

1. 创建任务队列服务账户
2. 修改 `/api/generate/direct` 为：
   ```typescript
   // 1. 创建任务到队列
   await queue.enqueue({ theme, style })
   // 2. 立即返回 jobId
   return { jobId, status: 'pending' }
   ```
3. 创建 `/api/webhook/process-queue` 处理队列任务
4. 配置队列服务的 webhook 回调

#### 方案 C：升级到 Vercel Pro

Vercel Pro 计划（$20/月）提供：
- 更长的函数超时时间（60 秒）
- Cron 任务支持
- 更好的性能

## 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000`

## 成本优化

- **OpenRouter API**：按调用次数计费，建议设置配额限制
- **Cloudflare R2**：免费额度 10GB/月
- **Vercel**：Free 计划完全免费
- **Supabase**：免费计划足够小规模使用

## 推荐升级方案

当用户量增加或超时问题频繁时，建议：

1. **升级到 Vercel Pro**（$20/月）
   - 支持 Cron 任务
   - 更长的函数超时时间
   - 更好的性能

2. **使用 Upstash Redis**（免费 + 按需付费）
   - 可靠的任务队列
   - 支持 webhook 回调
   - 成本低廉

3. **使用 Supabase 付费计划**
   - 更高的数据库配额
   - 更好的支持

## 故障排查

### 生成超时

**症状**：请求返回 504 Gateway Timeout

**解决**：
1. 检查 OpenRouter API 是否正常
2. 尝试使用更快的模型
3. 考虑升级到 Vercel Pro 或使用任务队列

### 图片上传失败

**症状**：生成成功但图片不显示

**解决**：
1. 检查 R2 凭证
2. 检查 R2 bucket 权限
3. 查看浏览器控制台错误

### 数据库连接失败

**症状**：保存图片时出错

**解决**：
1. 检查 DATABASE_URL 是否正确
2. 检查数据库是否在线
3. 检查网络连接

## API 端点

### 认知海报

- `POST /api/generate/direct` - 生成认知海报
- `GET /api/images` - 获取用户的所有图片

### 绘本故事

- `POST /api/storybook/generate-story` - 生成故事文本
- `POST /api/storybook/generate-image` - 生成故事页面图片
- `POST /api/storybook/save` - 保存故事
- `GET /api/storybook/list` - 获取用户的所有故事
- `POST /api/storybook/upload-reference` - 上传参考图

## 监控

### 查看日志

在 Vercel Dashboard：
1. 进入项目 → Functions
2. 查看各个 API 路由的执行日志

### 常见错误

- `401 Unauthorized` - 检查 Clerk 配置
- `403 Forbidden` - 检查用户权限
- `500 Internal Server Error` - 查看详细日志
- `504 Gateway Timeout` - 生成超时，见上文解决方案
