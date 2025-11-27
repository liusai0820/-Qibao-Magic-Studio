#!/bin/bash

echo "🔧 Supabase 数据库配置向导"
echo "================================"
echo ""
echo "请从 Supabase Dashboard 获取以下信息："
echo "1. 进入 https://supabase.com/dashboard"
echo "2. 选择你的项目"
echo "3. 进入 Settings → Database → Connection string"
echo "4. 复制 URI 连接字符串"
echo ""
read -p "请粘贴完整的 DATABASE_URL (包含密码): " DATABASE_URL
read -p "请粘贴完整的 DIRECT_URL (包含密码): " DIRECT_URL

# 更新 .env 文件
cat > .env << EOF
# Supabase PostgreSQL (Prisma)
# Connect to Supabase via connection pooling
DATABASE_URL="$DATABASE_URL"

# Direct connection to the database. Used for migrations
DIRECT_URL="$DIRECT_URL"
EOF

echo ""
echo "✅ .env 文件已更新"
echo ""
echo "现在运行以下命令初始化数据库："
echo "  npx prisma db push"
echo "  npm run dev"
