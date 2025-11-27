# 数据库配置完整指南

## 当前状态

❌ 数据库表还未创建
- 错误: `The table 'public.User' does not exist`
- 原因: `.env` 中的密码还是占位符 `[YOUR-PASSWORD]`

## 解决步骤

### 第 1 步：获取 Supabase 连接字符串

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目 `gruumybhwdgtanjfvnrj`
3. 进入 **Settings** → **Database** → **Connection string**
4. 选择 **URI** 标签页
5. 复制完整的连接字符串（包含密码）

示例格式：
```
postgresql://postgres.gruumybhwdgtanjfvnrj:your_actual_password_here@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 第 2 步：更新 .env 文件

打开 `.env` 文件，替换两行：

**原来的：**
```
DATABASE_URL="postgresql://postgres.gruumybhwdgtanjfvnrj:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.gruumybhwdgtanjfvnrj:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

**替换为：**
```
DATABASE_URL="postgresql://postgres.gruumybhwdgtanjfvnrj:your_actual_password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.gruumybhwdgtanjfvnrj:your_actual_password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

⚠️ **重要：** 确保 `.env` 已添加到 `.gitignore`，不要提交密码到 Git！

### 第 3 步：创建数据库表

```bash
npx prisma db push
```

你会看到提示：
```
✔ Your database is now in sync with your Prisma schema.
```

### 第 4 步：启动应用

```bash
npm run dev
```

## 验证成功

1. 打开 http://localhost:3000
2. 点击"登录"按钮
3. 使用 Clerk 登录
4. 生成一张图片
5. 刷新页面 - 图片应该仍然存在！

## 常见问题

### Q: 密码中有特殊字符怎么办？

A: 特殊字符需要 URL 编码。例如：
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`

Supabase 通常会自动处理，但如果连接失败，尝试手动编码。

### Q: 如何重置数据库？

A: 运行以下命令删除所有表并重新创建：
```bash
npx prisma migrate reset
```

### Q: 如何查看数据库中的数据？

A: 使用 Prisma Studio：
```bash
npx prisma studio
```

这会打开一个 Web 界面，你可以查看和编辑数据库中的所有数据。

## 数据模型

```
User
├── id (主键)
├── clerkId (Clerk 用户 ID)
├── email
├── name
├── createdAt
├── updatedAt
└── images (关系)

Image
├── id (主键)
├── url (R2 图片 URL)
├── prompt (AI 提示词)
├── theme (主题)
├── style (风格)
├── createdAt
└── userId (外键)
```

## 下一步

配置完成后，你的应用将：
1. ✅ 用户登录时自动创建 User 记录
2. ✅ 生成图片时保存到 R2 和数据库
3. ✅ 页面刷新时从数据库加载图片
4. ✅ 支持删除图片
