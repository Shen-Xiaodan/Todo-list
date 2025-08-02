-- TodoList 数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS TodoList 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE TodoList;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入一些示例用户数据（可选）
INSERT INTO users (username, password) VALUES
('admin', 'admin123'),
('testuser', 'test123')
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- 插入一些示例todos数据（可选）
INSERT INTO todos (content, done, user_id) VALUES
('学习 React', false, 1),
('完成 Todo 应用', false, 1),
('测试前后端通信', false, 1)
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- 显示表结构
DESCRIBE users;
DESCRIBE todos;

-- 显示现有数据
SELECT * FROM users;
SELECT * FROM todos;
