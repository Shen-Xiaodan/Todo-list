#!/bin/bash

# TodoList 三层架构停止脚本
# 停止所有运行的服务

echo "🛑 Stopping TodoList Three-Tier Architecture..."
echo "==============================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 停止进程函数
stop_process() {
    local name="$1"
    local pid_file="$2"
    local port="$3"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -n "停止 $name (PID: $pid)... "
            kill $pid
            sleep 2
            
            # 检查进程是否已停止
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${YELLOW}强制停止...${NC}"
                kill -9 $pid
                sleep 1
            fi
            
            if ! ps -p $pid > /dev/null 2>&1; then
                echo -e "${GREEN}✅ 已停止${NC}"
            else
                echo -e "${RED}❌ 停止失败${NC}"
            fi
        else
            echo -e "$name: ${YELLOW}进程不存在${NC}"
        fi
        rm -f "$pid_file"
    else
        # 尝试通过端口查找并停止进程
        if [ ! -z "$port" ]; then
            local pid=$(lsof -ti:$port 2>/dev/null)
            if [ ! -z "$pid" ]; then
                echo -n "停止 $name (端口 $port, PID: $pid)... "
                kill $pid 2>/dev/null
                sleep 2
                
                # 检查是否还在运行
                if lsof -ti:$port > /dev/null 2>&1; then
                    echo -e "${YELLOW}强制停止...${NC}"
                    kill -9 $pid 2>/dev/null
                fi
                
                if ! lsof -ti:$port > /dev/null 2>&1; then
                    echo -e "${GREEN}✅ 已停止${NC}"
                else
                    echo -e "${RED}❌ 停止失败${NC}"
                fi
            else
                echo -e "$name: ${YELLOW}未运行${NC}"
            fi
        else
            echo -e "$name: ${YELLOW}PID 文件不存在${NC}"
        fi
    fi
}

# 停止所有服务
echo "🔄 停止所有服务..."

# 1. 停止 React 前端
stop_process "React 前端" "logs/react.pid" "5173"

# 2. 停止 Node.js 中间层
stop_process "Node.js 中间层" "logs/node.pid" "3001"

# 3. 停止 Java 后端
stop_process "Java 后端" "logs/java.pid" "8080"

echo ""
echo "🧹 清理临时文件..."

# 清理 PID 文件
rm -f logs/*.pid

# 清理日志文件（可选）
read -p "是否清理日志文件? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f logs/*.log
    echo "✅ 日志文件已清理"
fi

echo ""
echo "✅ 所有服务已停止!"
echo "==============================================="

# 最终检查
echo "🔍 最终状态检查:"
check_port() {
    local name="$1"
    local port="$2"
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "$name (端口 $port): ${RED}仍在运行${NC}"
    else
        echo -e "$name (端口 $port): ${GREEN}已停止${NC}"
    fi
}

check_port "React 前端" "5173"
check_port "Node.js 中间层" "3001"
check_port "Java 后端" "8080"

echo ""
echo "💡 如需重新启动，请运行: ./start-all.sh"
