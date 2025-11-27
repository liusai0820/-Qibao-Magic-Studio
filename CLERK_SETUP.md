# Clerk + Prisma + Supabase 快速启动

## ✅ 已完成的集成

- ✓ `middleware.ts` - 使用 `clerkMiddleware()` 保护路由
- ✓ `app/layout.tsx` - 包装 `<ClerkProvider>`
- ✓ `components/Header.tsx` - 登录/用户按钮
- ✓ `app/api/images/route.ts` - 数据库 API
- ✓ `prisma/schema.prisma` - 数据模型

## 🚀 3 步快速启动

### 1️⃣ 配置 Clerk

1. 访问 https://dashboard.clerk.com/apps
2. 创建新应用
3. 复制 **Publishable Key** 和 **Secret Key**
4. 更新 `.env.local`：

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### 2️⃣ 配置 Supabase

1. 访问 https://supabase.com/dashboard
2. 创建新项目
3. 进入 **Settings → Database → Connection string**
4. 复制连接字符串到 `.env.local`：

```bash
DATABASE_URL=postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres
```

### 3️⃣ 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

## 📊 数据流

```
用户登录 (Clerk)
    ↓
生成图片 (AI API)
    ↓
保存到 R2 (Cloudflare)
    ↓
记录到数据库 (Supabase)
    ↓
页面刷新时自动加载
```

## 🔑 环境变量检查清单

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `.env.local` 已添加到 `.gitignore`

## 📝 API 端点

| 方法 | 路由 | 功能 |
|------|------|------|
| GET | `/api/images` | 获取用户所有图片 |
| POST | `/api/images` | 保存新图片 |
| DELETE | `/api/images?id=xxx` | 删除图片 |

所有端点都需要 Clerk 认证。

## 🐛 常见问题

**Q: 登录后页面显示空白？**
A: 检查 Clerk 环境变量是否正确设置

**Q: 数据库连接失败？**
A: 确保 `DATABASE_URL` 和 `DIRECT_URL` 都已设置

**Q: 图片保存失败？**
A: 检查用户是否已登录，以及 Prisma 是否已初始化
