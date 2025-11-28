# 图片下载功能修复说明

## 问题

浏览器直接从 R2 下载图片时出现 CORS 错误：
```
Failed to fetch
```

这是因为 R2 的 CORS 配置可能没有允许浏览器直接访问。

## 解决方案

创建了一个后端代理 API `/api/download`，所有下载请求都通过后端转发。

### 工作原理

```
用户点击下载
    ↓
前端调用 /api/download?url=xxx
    ↓
后端从 R2 获取图片
    ↓
后端返回图片给浏览器
    ↓
浏览器下载文件
```

### 优势

1. **解决 CORS 问题** - 后端请求不受浏览器 CORS 限制
2. **本地开发可用** - 在 localhost 上也能正常下载
3. **Vercel 部署可用** - 在 Vercel 上也能正常工作
4. **支持 Base64** - 同时支持 Base64 和 URL 格式的图片

### API 端点

**GET /api/download**

参数：
- `url` (必填) - 图片 URL 或 Base64 数据

返回：
- 图片文件（带 Content-Disposition 头，触发下载）

### 使用示例

```typescript
// 前端调用
const downloadUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`
const link = document.createElement('a')
link.href = downloadUrl
link.download = 'image.png'
link.click()
```

### 支持的格式

1. **R2 URL**
   ```
   https://pub-xxx.r2.dev/images/xxx.png
   ```

2. **Base64 数据 URL**
   ```
   data:image/png;base64,iVBORw0KGgo...
   ```

## 测试

1. 生成一张图片
2. 点击"下载"按钮
3. 图片应该自动下载到本地

## 部署到 Vercel

这个解决方案在 Vercel 上也能正常工作，因为：
- Vercel 的 API 路由可以访问 R2
- 后端请求不受浏览器 CORS 限制
- 文件下载通过后端转发

无需额外配置。

## 如果还是不行

如果下载仍然失败，可以检查：

1. **R2 CORS 配置** - 在 R2 设置中添加 CORS 规则
2. **R2 权限** - 确保 R2 bucket 允许公开读取
3. **API 日志** - 检查 `/api/download` 的服务器日志

## 相关文件

- `app/api/download/route.ts` - 下载代理 API
- `components/Gallery.tsx` - 前端下载处理
