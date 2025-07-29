# TodoList 前后端通信设置指南

## 项目架构
```
前端 (React) → Node.js 中间层 → Java 后端 → MySQL 数据库
    :5173         :3001           :8080        :3306
```

## 快速启动步骤

### 1. 数据库设置
```bash
# 启动 MySQL 服务
# 然后执行数据库初始化脚本
mysql -u root -p < backend/init_database.sql
```

### 2. 启动 Java 后端 (端口 8080)
```bash
cd backend
./compile-and-run.sh
```

### 3. 启动 Node.js 中间层 (端口 3001)
```bash
cd server
npm install  # 首次运行
npm start
```

### 4. 启动 React 前端 (端口 5173)
```bash
# 在项目根目录
npm install  # 首次运行
npm run dev
```

## 或者使用一键启动脚本
```bash
chmod +x start-all.sh
./start-all.sh
```

## API 端点测试

### 测试 Java 后端
```bash
curl http://localhost:8080/api/v1/todos
```

### 测试 Node.js 中间层
```bash
curl http://localhost:3001/api/todos
curl http://localhost:3001/health
```

### 测试前端
打开浏览器访问: http://localhost:5173

## 数据流向
1. **前端** → API 调用 → **Node.js 中间层** (localhost:3001/api/todos)
2. **Node.js** → 转发请求 → **Java 后端** (localhost:8080/api/v1/todos)
3. **Java 后端** → 数据库查询 → **MySQL** (localhost:3306/TodoList)
4. 响应按相反路径返回

## 故障排除

### Java 后端无法启动
- 检查 MySQL 是否运行
- 确认数据库连接配置正确
- 检查 JAR 依赖文件是否存在

### Node.js 中间层连接失败
- 确认 Java 后端已启动
- 检查 server/.env 配置文件
- 查看 logs/middleware.log

### 前端无法获取数据
- 确认 Node.js 中间层已启动
- 检查浏览器控制台错误
- 确认 API 端点 URL 正确

## 文件说明
- `src/services/todoApi.js` - 前端 API 服务层
- `server/server.js` - Node.js 中间层服务器
- `backend/javaTodoAPI.java` - Java 后端 API
- `backend/init_database.sql` - 数据库初始化脚本
