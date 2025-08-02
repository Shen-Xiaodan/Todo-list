#!/bin/bash

# Java Todo API 测试脚本

echo "🧪 测试 Java Todo API..."

BASE_URL="http://localhost:8080/api/v1"

echo ""
echo "1. 测试用户注册..."
curl -X POST "$BASE_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "2. 测试用户登录..."
curl -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "3. 测试创建 Todo (需要 userId)..."
curl -X POST "$BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"text": "测试任务", "done": false, "userId": 1}' \
  -w "\nStatus: %{http_code}\n\n"

echo "4. 测试获取 Todos (需要 userId 参数)..."
curl -X GET "$BASE_URL/todos?userId=1" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "5. 测试更新 Todo (需要 userId)..."
curl -X PUT "$BASE_URL/todos/1" \
  -H "Content-Type: application/json" \
  -d '{"text": "更新的任务", "done": true, "userId": 1}' \
  -w "\nStatus: %{http_code}\n\n"

echo "6. 测试删除 Todo (需要 userId 参数)..."
curl -X DELETE "$BASE_URL/todos/1?userId=1" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ 测试完成!"
