# Java Todo API 后端

## 🔧 最新修复

### 已修复的问题：
1. **编译错误** - 修复了 Todo 构造函数参数不匹配的问题
2. **用户ID筛选** - 现在所有 Todo 操作都会根据用户ID进行筛选和权限控制
3. **数据安全** - 用户只能访问和操作自己的 Todo 项目

### API 变更：
- `GET /api/v1/todos` 现在需要 `userId` 查询参数
- `POST /api/v1/todos` 现在需要在请求体中包含 `userId`
- `PUT /api/v1/todos/:id` 现在需要在请求体中包含 `userId` 进行权限验证
- `DELETE /api/v1/todos/:id` 现在需要 `userId` 查询参数进行权限验证

## 配置方式

应用支持多种配置方式，优先级为：**环境变量 > 配置文件 > 默认值**

### 方式1: 使用配置文件（推荐用于开发环境）

#### 1. 创建配置文件
复制示例配置文件并修改为实际配置：
```bash
cp config.properties.example config.properties
```

#### 2. 修改配置文件
编辑 `config.properties` 文件，设置正确的数据库连接信息：

```properties
# 数据库配置
db.url=jdbc:mysql://localhost:3306/TodoList?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
db.username=your_actual_username
db.password=your_actual_password

# 服务器配置
server.port=8080
```

### 方式2: 使用环境变量（推荐用于生产环境）

设置以下环境变量：
```bash
export DB_URL="jdbc:mysql://localhost:3306/TodoList?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC"
export DB_USER="your_actual_username"
export DB_PASSWORD="your_actual_password"
export SERVER_PORT="8080"
```

或者在运行时指定：
```bash
DB_URL="jdbc:mysql://..." DB_USER="username" DB_PASSWORD="password" java JavaTodoAPI
```

### 3. 安全注意事项
- ⚠️ **重要**: `config.properties` 文件包含敏感信息，已添加到 `.gitignore` 中
- 不要将包含真实密码的配置文件提交到版本控制系统
- 在生产环境中使用强密码
- 考虑使用环境变量或密钥管理服务

### 4. 运行应用
确保配置文件存在后，运行 Java 应用：

#### 使用编译脚本（推荐）：
```bash
./compile-and-run.sh
```

#### 手动编译和运行：
```bash
# 编译
javac -cp ".:mysql-connector-j-9.4.0.jar:spark-core-2.9.4.jar:gson-2.10.1.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar:javax.servlet-api-4.0.1.jar:jetty-server-9.4.48.v20220622.jar:jetty-servlet-9.4.48.v20220622.jar:jetty-webapp-9.4.48.v20220622.jar:jetty-http-9.4.48.v20220622.jar:jetty-io-9.4.48.v20220622.jar:jetty-util-9.4.48.v20220622.jar:jetty-security-9.4.48.v20220622.jar" JavaTodoAPI.java

# 运行
java -cp ".:mysql-connector-j-9.4.0.jar:spark-core-2.9.4.jar:gson-2.10.1.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar:javax.servlet-api-4.0.1.jar:jetty-server-9.4.48.v20220622.jar:jetty-servlet-9.4.48.v20220622.jar:jetty-webapp-9.4.48.v20220622.jar:jetty-http-9.4.48.v20220622.jar:jetty-io-9.4.48.v20220622.jar:jetty-util-9.4.48.v20220622.jar:jetty-security-9.4.48.v20220622.jar" JavaTodoAPI
```

## API 使用示例

### 用户注册
```bash
curl -X POST "http://localhost:8080/api/v1/signup" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
```

### 用户登录
```bash
curl -X POST "http://localhost:8080/api/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'
```


### 获取用户的 Todos（需要 userId 参数）
```bash
curl -X GET "http://localhost:8080/api/v1/todos?userId=1"
```

### 更新 Todo（需要 userId 进行权限验证）
```bash
curl -X PUT "http://localhost:8080/api/v1/todos/1" \
  -H "Content-Type: application/json" \
  -d '{"text": "学习 Java 完成", "done": true, "userId": 1}'
```

### 删除 Todo（需要 userId 参数进行权限验证）
```bash
curl -X DELETE "http://localhost:8080/api/v1/todos/1?userId=1"
```

### 5. 测试 API
运行测试脚本：
```bash
./test-api.sh
```

### 6. 故障排除
如果配置文件读取失败，应用会：
1. 显示错误信息
2. 使用默认配置值继续运行
3. 在控制台输出相关日志信息
