#!/bin/bash

# 本地测试 Cron 任务处理

echo "🔄 测试生成任务处理..."
curl -X POST http://localhost:3000/api/generate/process \
  -H "Authorization: Bearer dev-secret-key-for-local-testing" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq .

echo ""
echo "🔄 测试故事页面处理..."
curl -X POST http://localhost:3000/api/storybook/process \
  -H "Authorization: Bearer dev-secret-key-for-local-testing" \
  -H "Content-Type: application/json" \
  -d '{}' \
  | jq .

echo ""
echo "✅ 测试完成"
