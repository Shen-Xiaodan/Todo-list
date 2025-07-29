-- TodoList 数据库初始化脚本

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS TodoList 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE TodoList;

-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE
);

-- 插入一些示例数据（可选）
INSERT INTO todos (content, done) VALUES 
('学习 React', false),
('完成 Todo 应用', false),
('测试前后端通信', false)
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- 显示表结构
DESCRIBE todos;

-- 显示现有数据
SELECT * FROM todos;
