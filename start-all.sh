#!/bin/bash

# TodoList 三层架构启动脚本
# 按顺序启动所有服务

echo "🚀 Starting TodoList Three-Tier Architecture..."
echo "================================================"

# 检查必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "📋 Checking prerequisites..."
check_command "mysql"
check_command "java"
check_command "node"
check_command "npm"

# 检查 MySQL 是否运行
echo "🔍 Checking MySQL service..."
if ! mysqladmin ping -h localhost --silent; then
    echo "❌ MySQL is not running. Please start MySQL service first."
    exit 1
fi

echo "✅ All prerequisites are met!"
echo ""

# 创建 logs 目录
mkdir -p logs

# 1. 初始化数据库提示
echo "📊 Database Setup..."
echo "请确保已经运行了数据库初始化脚本："
echo "mysql -u root -p < backend/init_database.sql"
echo ""

# 2. 启动 Java 后端
echo "☕ Starting Java backend service..."
cd backend

# 在后台启动 Java 服务
nohup ./compile-and-run.sh > ../logs/backend.log 2>&1 &
JAVA_PID=$!
echo "✅ Java backend started (PID: $JAVA_PID)"
echo "📝 Logs: logs/backend.log"
cd ..

# 等待 Java 服务启动
echo "⏳ Waiting for Java backend to start..."
sleep 15

# 检查 Java 服务是否启动成功
if curl -s http://localhost:8080/api/v1/todos > /dev/null; then
    echo "✅ Java backend is running!"
else
    echo "❌ Java backend failed to start. Check logs/backend.log"
    echo "💡 You may need to manually start the Java backend first"
fi
echo ""

# 3. 启动 Node.js 中间层
echo "🟢 Starting Node.js middleware service..."
cd server

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# 在后台启动 Node.js 服务
nohup npm start > ../logs/middleware.log 2>&1 &
NODE_PID=$!
echo "✅ Node.js middleware started (PID: $NODE_PID)"
echo "📝 Logs: logs/middleware.log"
cd ..

# 等待 Node.js 服务启动
echo "⏳ Waiting for Node.js middleware to start..."
sleep 5

# 检查 Node.js 服务是否启动成功
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Node.js middleware is running!"
else
    echo "❌ Node.js middleware failed to start. Check logs/middleware.log"
    exit 1
fi
echo ""

# 4. 启动 React 前端
echo "⚛️  Starting React frontend..."

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📦 Installing React dependencies..."
    npm install
fi

# 在后台启动 React 开发服务器
nohup npm run dev > logs/frontend.log 2>&1 &
REACT_PID=$!
echo "✅ React frontend started (PID: $REACT_PID)"
echo "📝 Logs: logs/frontend.log"

# 等待 React 服务启动
echo "⏳ Waiting for React frontend to start..."
sleep 5

echo ""
echo "🎉 All services started successfully!"
echo "================================================"
echo "📱 Frontend:    http://localhost:5173"
echo "🟢 Middleware:  http://localhost:3001"
echo "☕ Backend:     http://localhost:8080"
echo "📊 Database:    MySQL on localhost:3306"
echo ""
echo "📋 Process IDs:"
echo "   Java Backend: $JAVA_PID"
echo "   Node.js:      $NODE_PID"
echo "   React:        $REACT_PID"
echo ""
echo "🛑 To stop all services, run: ./stop-all.sh"
echo "📝 Check logs in the 'logs' directory"

# 保存 PID 到文件，方便停止服务
echo $JAVA_PID > logs/java.pid
echo $NODE_PID > logs/node.pid
echo $REACT_PID > logs/react.pid

echo ""
echo "✨ TodoList application is ready to use!"
