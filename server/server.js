const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:8080';
const JAVA_API_PREFIX = process.env.JAVA_BACKEND_API_PREFIX || '/api/v1';

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // React 开发服务器
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TodoList Middleware Server'
  });
});

// 获取所有 todos
app.get('/api/todos', async (req, res) => {
  try {
    console.log('Forwarding GET /todos request to Java backend...');
    const response = await axios.get(`${JAVA_BACKEND_URL}${JAVA_API_PREFIX}/todos`);
    
    console.log('Received response from Java backend:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Java backend:', error.message);
    
    if (error.response) {
      // Java 后端返回了错误响应
      res.status(error.response.status).json({
        error: 'Backend service error',
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      // 请求发送了但没有收到响应
      res.status(503).json({
        error: 'Backend service unavailable',
        message: 'Unable to connect to Java backend service'
      });
    } else {
      // 其他错误
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// 创建新的 todo
app.post('/api/todos', async (req, res) => {
  try {
    console.log('Forwarding POST /todos request to Java backend...');
    console.log('Request body:', req.body);
    
    const response = await axios.post(`${JAVA_BACKEND_URL}${JAVA_API_PREFIX}/todos`, req.body);
    
    console.log('Received response from Java backend:', response.status);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Java backend:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Backend service error',
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Backend service unavailable',
        message: 'Unable to connect to Java backend service'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// 更新 todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    console.log(`Forwarding PUT /todos/${todoId} request to Java backend...`);
    console.log('Request body:', req.body);
    
    const response = await axios.put(`${JAVA_BACKEND_URL}${JAVA_API_PREFIX}/todos/${todoId}`, req.body);
    
    console.log('Received response from Java backend:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Java backend:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Backend service error',
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Backend service unavailable',
        message: 'Unable to connect to Java backend service'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// 删除 todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todoId = req.params.id;
    console.log(`Forwarding DELETE /todos/${todoId} request to Java backend...`);
    
    const response = await axios.delete(`${JAVA_BACKEND_URL}${JAVA_API_PREFIX}/todos/${todoId}`);
    
    console.log('Received response from Java backend:', response.status);
    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error forwarding request to Java backend:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Backend service error',
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      res.status(503).json({
        error: 'Backend service unavailable',
        message: 'Unable to connect to Java backend service'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 TodoList Middleware Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Java Backend URL: ${JAVA_BACKEND_URL}${JAVA_API_PREFIX}`);
  console.log(`📅 Started at: ${new Date().toISOString()}\n`);
});

// 关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
