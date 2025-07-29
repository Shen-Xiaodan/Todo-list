#!/bin/bash

# Java 后端编译和运行脚本

echo "🔧 编译 Java 后端..."

# 检查是否存在必要的 JAR 文件
if [ ! -f "mysql-connector-j-9.4.0.jar" ]; then
    echo "❌ 错误: mysql-connector-j-9.4.0.jar 文件不存在"
    echo "请确保 MySQL 连接器 JAR 文件在当前目录中"
    exit 1
fi

# 下载 Spark Java 框架（如果不存在）
if [ ! -f "spark-core-2.9.4.jar" ]; then
    echo "📥 下载 Spark Java 框架..."
    curl -L -o spark-core-2.9.4.jar "https://repo1.maven.org/maven2/com/sparkjava/spark-core/2.9.4/spark-core-2.9.4.jar"
fi

# 下载 Gson 库（如果不存在）
if [ ! -f "gson-2.10.1.jar" ]; then
    echo "📥 下载 Gson 库..."
    curl -L -o gson-2.10.1.jar "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar"
fi

# 下载 SLF4J 核心库（Spark 依赖）
if [ ! -f "slf4j-api-1.7.36.jar" ]; then
    echo "📥 下载 SLF4J API 库..."
    curl -L -o slf4j-api-1.7.36.jar "https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar"
fi

# 下载 SLF4J Simple 实现
if [ ! -f "slf4j-simple-1.7.36.jar" ]; then
    echo "📥 下载 SLF4J Simple 库..."
    curl -L -o slf4j-simple-1.7.36.jar "https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/1.7.36/slf4j-simple-1.7.36.jar"
fi

# 下载 Servlet API（Spark 依赖）
if [ ! -f "javax.servlet-api-4.0.1.jar" ]; then
    echo "📥 下载 Servlet API 库..."
    curl -L -o javax.servlet-api-4.0.1.jar "https://repo1.maven.org/maven2/javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar"
fi

# 下载 Jetty 服务器依赖（Spark 依赖）
if [ ! -f "jetty-server-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty Server 库..."
    curl -L -o jetty-server-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-server/9.4.48.v20220622/jetty-server-9.4.48.v20220622.jar"
fi

# 下载 Jetty Servlet 依赖
if [ ! -f "jetty-servlet-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty Servlet 库..."
    curl -L -o jetty-servlet-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-servlet/9.4.48.v20220622/jetty-servlet-9.4.48.v20220622.jar"
fi

# 下载 Jetty Webapp 依赖
if [ ! -f "jetty-webapp-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty Webapp 库..."
    curl -L -o jetty-webapp-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-webapp/9.4.48.v20220622/jetty-webapp-9.4.48.v20220622.jar"
fi

# 下载 Jetty HTTP 依赖
if [ ! -f "jetty-http-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty HTTP 库..."
    curl -L -o jetty-http-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-http/9.4.48.v20220622/jetty-http-9.4.48.v20220622.jar"
fi

# 下载 Jetty IO 依赖
if [ ! -f "jetty-io-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty IO 库..."
    curl -L -o jetty-io-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-io/9.4.48.v20220622/jetty-io-9.4.48.v20220622.jar"
fi

# 下载 Jetty Util 依赖
if [ ! -f "jetty-util-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty Util 库..."
    curl -L -o jetty-util-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-util/9.4.48.v20220622/jetty-util-9.4.48.v20220622.jar"
fi

# 下载 Jetty Security 依赖
if [ ! -f "jetty-security-9.4.48.v20220622.jar" ]; then
    echo "📥 下载 Jetty Security 库..."
    curl -L -o jetty-security-9.4.48.v20220622.jar "https://repo1.maven.org/maven2/org/eclipse/jetty/jetty-security/9.4.48.v20220622/jetty-security-9.4.48.v20220622.jar"
fi

# 构建完整的 classpath
CLASSPATH=".:mysql-connector-j-9.4.0.jar:spark-core-2.9.4.jar:gson-2.10.1.jar:slf4j-api-1.7.36.jar:slf4j-simple-1.7.36.jar:javax.servlet-api-4.0.1.jar:jetty-server-9.4.48.v20220622.jar:jetty-servlet-9.4.48.v20220622.jar:jetty-webapp-9.4.48.v20220622.jar:jetty-http-9.4.48.v20220622.jar:jetty-io-9.4.48.v20220622.jar:jetty-util-9.4.48.v20220622.jar:jetty-security-9.4.48.v20220622.jar"

# 编译 Java 文件
echo "🔨 编译 JavaTodoAPI.java..."
javac -cp "$CLASSPATH" JavaTodoAPI.java

if [ $? -eq 0 ]; then
    echo "✅ 编译成功!"
    echo "🚀 启动 Java 后端服务器..."
    java -cp "$CLASSPATH" JavaTodoAPI
else
    echo "❌ 编译失败!"
    exit 1
fi
