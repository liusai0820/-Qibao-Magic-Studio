# DiceBear 头像生成器集成指南

## 功能介绍

项目现已集成 DiceBear 头像生成器，用于为用户自动生成独特的头像。相同的用户 ID 会生成相同的头像，无需用户上传头像文件。

## 工作原理

1. **自动生成** - 用户登录时，系统自动为其生成一个基于用户 ID 的独特头像
2. **一致性** - 同一用户每次登录都会看到相同的头像
3. **无需上传** - 用户无需上传头像文件，节省存储空间
4. **可选覆盖** - 用户可以在 Clerk 中上传自己的头像，系统会优先使用用户上传的头像

## 头像风格

支持多种 DiceBear 头像风格：

- **avataaars** (默认) - 卡通人物风格，友好可爱 ⭐ 当前使用
- **pixel-art** - 像素艺术风格，适合游戏和创意应用
- **lorelei** - 几何抽象风格，现代简洁
- **notionists** - 概念艺术风格，独特创意

## 使用示例

### 获取头像 URL

```typescript
import { getDiceBearAvatarUrl } from '@/lib/avatar'

// 获取用户头像
const avatarUrl = getDiceBearAvatarUrl(userId)

// 指定风格
const pixelArtAvatar = getDiceBearAvatarUrl(userId, 'pixel-art')
const cartoonAvatar = getDiceBearAvatarUrl(userId, 'avataaars')
```

### 在组件中使用

```typescript
import { UserMenu } from '@/components/UserMenu'

// UserMenu 组件会自动使用 DiceBear 生成头像
<UserMenu />
```

## 用户菜单功能

新的 `UserMenu` 组件提供以下功能：

- 📸 **头像显示** - 使用 DiceBear 生成的头像
- 👤 **用户信息** - 显示用户名和邮箱
- ⚙️ **账户设置** - 链接到账户设置页面
- 🚪 **退出登录** - 安全退出登录

## 头像 URL 格式

```
https://api.dicebear.com/9.x/{style}/svg?seed={userId}
```

示例：
```
https://api.dicebear.com/9.x/pixel-art/svg?seed=user123
https://api.dicebear.com/9.x/avataaars/svg?seed=user456
```

## 优势

✅ **无需存储** - 头像动态生成，无需存储在数据库或 CDN
✅ **一致性** - 同一用户始终获得相同的头像
✅ **多样性** - 支持多种风格选择
✅ **快速加载** - DiceBear API 响应快速
✅ **可定制** - 可轻松切换头像风格或添加其他参数

## 自定义选项

可以在 `getDiceBearAvatarUrl` 函数中添加更多参数：

```typescript
// 添加背景色
https://api.dicebear.com/9.x/pixel-art/svg?seed=user123&backgroundColor=random

// 添加其他参数
https://api.dicebear.com/9.x/pixel-art/svg?seed=user123&scale=80&radius=50
```

详见 [DiceBear 官方文档](https://www.dicebear.com/styles/pixel-art/)

## 迁移指南

如果之前使用了其他头像方案，可以通过以下方式迁移：

1. 保留用户上传的头像（Clerk 会自动使用）
2. 对于没有上传头像的用户，自动使用 DiceBear 生成
3. 无需修改数据库或迁移脚本

## 常见问题

**Q: 如何更改头像风格？**
A: 修改 `UserMenu.tsx` 中的 `getDiceBearAvatarUrl` 调用，改变第二个参数即可。

**Q: 用户可以上传自己的头像吗？**
A: 可以。用户在 Clerk 账户设置中上传头像后，系统会优先使用用户上传的头像。

**Q: 头像会缓存吗？**
A: DiceBear API 会返回 SVG，浏览器会缓存。如果需要更新，可以添加查询参数强制刷新。

**Q: 支持离线使用吗？**
A: 不支持。DiceBear 需要网络连接。如需离线支持，可以在用户首次登录时缓存头像。
