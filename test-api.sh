#!/bin/bash

# TodoList API 测试脚本
# 测试前端到后端的完整通信链路

echo "🧪 TodoList API 通信测试"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    
    echo -n "测试 $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$url")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ 成功 ($http_code)${NC}"
        if [ ! -z "$body" ] && [ "$body" != "null" ]; then
            echo "   响应: ${body:0:100}..."
        fi
    else
        echo -e "${RED}❌ 失败 ($http_code)${NC}"
        if [ ! -z "$body" ]; then
            echo "   错误: $body"
        fi
    fi
    echo ""
}

echo "1. 测试 Java 后端 (localhost:8080)"
echo "--------------------------------"
test_endpoint "获取所有 todos" "http://localhost:8080/api/v1/todos"
test_endpoint "创建新 todo" "http://localhost:8080/api/v1/todos" "POST" '{"text":"测试 todo","done":false}'

echo "2. 测试 Node.js 中间层 (localhost:3001)"
echo "------------------------------------"
test_endpoint "健康检查" "http://localhost:3001/health"
test_endpoint "获取所有 todos" "http://localhost:3001/api/todos"
test_endpoint "创建新 todo" "http://localhost:3001/api/todos" "POST" '{"text":"通过中间层创建的 todo","done":false}'

echo "3. 测试前端服务 (localhost:5173)"
echo "------------------------------"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务运行正常${NC}"
else
    echo -e "${RED}❌ 前端服务无法访问${NC}"
fi

echo ""
echo "🔍 服务状态检查"
echo "==============="

# 检查各个服务是否运行
check_service() {
    local name="$1"
    local port="$2"
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "$name: ${GREEN}✅ 运行中 (端口 $port)${NC}"
    else
        echo -e "$name: ${RED}❌ 未运行 (端口 $port)${NC}"
    fi
}

check_service "Java 后端" "8080"
check_service "Node.js 中间层" "3001"
check_service "React 前端" "5173"
check_service "MySQL 数据库" "3306"

echo ""
echo "💡 提示:"
echo "- 如果某个服务未运行，请先启动对应服务"
echo "- Java 后端: cd backend && ./compile-and-run.sh"
echo "- Node.js 中间层: cd server && npm start"
echo "- React 前端: npm run dev"
echo "- 或使用一键启动: ./start-all.sh"
