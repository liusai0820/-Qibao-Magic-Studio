# Clerk + Prisma + Supabase 配置指南

## 1. Clerk 配置

1. 访问 [clerk.com](https://clerk.com) 创建账号
2. 创建新应用，选择登录方式（推荐：Email + Google）
3. 复制 API Keys 到 `.env.local`：
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   CLERK_SECRET_KEY=sk_test_xxx
   ```

## 2. Supabase 配置

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 进入 Settings → Database → Connection string
3. 复制连接字符串到 `.env.local`：
   ```
   DATABASE_URL=postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[密码]@db.[项目ID].supabase.co:5432/postgres
   ```

## 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push
```

## 4. 启动项目

```bash
npm run dev
```

## 数据模型

- `User`: 存储用户信息（关联 Clerk userId）
- `Image`: 存储图片记录（url, prompt, theme, style）

## API 端点

- `GET /api/images` - 获取当前用户的所有图片
- `POST /api/images` - 保存新图片
- `DELETE /api/images?id=xxx` - 删除图片
