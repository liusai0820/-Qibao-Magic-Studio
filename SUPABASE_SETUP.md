# Supabase 数据库配置

## 获取连接字符串

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Settings → Database → Connection string**
4. 选择 **URI** 标签页
5. 复制连接字符串

## 更新 .env 文件

你的 `.env` 文件中有占位符 `[YOUR-PASSWORD]`，需要替换为实际的数据库密码。

### 方式 1：直接编辑 .env

打开 `.env` 文件，将：
```
postgresql://postgres.gruumybhwdgtanjfvnrj:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

替换为你从 Supabase 复制的完整连接字符串。

### 方式 2：使用命令行

```bash
# 替换 DATABASE_URL 中的密码
sed -i '' 's/\[YOUR-PASSWORD\]/your_actual_password/g' .env

# 替换 DIRECT_URL 中的密码  
sed -i '' 's/\[YOUR-PASSWORD\]/your_actual_password/g' .env
```

## 验证连接

```bash
# 测试数据库连接
npx prisma db execute --stdin < /dev/null

# 或者直接推送 schema
npx prisma db push
```

## 常见错误

**Error: P1012 - Environment variable not found**
- 确保 `.env` 文件中的 `DIRECT_URL` 已正确设置
- 检查密码中是否有特殊字符（需要 URL 编码）

**Error: P1000 - Authentication failed**
- 检查用户名和密码是否正确
- 确保 IP 地址已添加到 Supabase 防火墙白名单

## 下一步

配置完成后，运行：
```bash
npx prisma generate
npx prisma db push
npm run dev
```
