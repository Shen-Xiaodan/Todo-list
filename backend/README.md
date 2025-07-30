# Java Todo API 后端配置说明

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
```bash
javac -cp ".:gson-2.8.9.jar:mysql-connector-java-8.0.33.jar:spark-core-2.9.4.jar:spark-jetty-9.4.48.v20220622.jar:jetty-server-9.4.48.v20220622.jar:jetty-webapp-9.4.48.v20220622.jar:jetty-servlet-9.4.48.v20220622.jar:slf4j-simple-1.7.36.jar" JavaTodoAPI.java
java -cp ".:gson-2.8.9.jar:mysql-connector-java-8.0.33.jar:spark-core-2.9.4.jar:spark-jetty-9.4.48.v20220622.jar:jetty-server-9.4.48.v20220622.jar:jetty-webapp-9.4.48.v20220622.jar:jetty-servlet-9.4.48.v20220622.jar:slf4j-simple-1.7.36.jar" JavaTodoAPI
```

### 5. 故障排除
如果配置文件读取失败，应用会：
1. 显示错误信息
2. 使用默认配置值继续运行
3. 在控制台输出相关日志信息
