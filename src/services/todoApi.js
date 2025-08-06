// TodoList API 服务层
// 负责与 Node.js 中间层通信

const API_BASE_URL = 'http://localhost:3001/api';
//这是 Node.js 提供的 API 接口地址
//Node.js 会把这些请求进一步 转发 给 Java 后端
class TodoApiService {
  // sign up
  async signup(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }
  // 用户登录
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // 获取所有 todos
  async getTodos(date) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/todos?userId=${userId}&date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  }

  // 创建新的 todo
  async createTodo(todoText, date) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: todoText,
          done: false,
          userId: parseInt(userId),
          date: date
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  // 更新 todo
  async updateTodo(todoId, updates) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          userId: parseInt(userId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  // 删除 todo
  async deleteTodo(todoId) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`${API_BASE_URL}/todos/${todoId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // 切换 todo 完成状态
  async toggleTodo(todoId, currentStatus) {
    return this.updateTodo(todoId, { done: !currentStatus }); //内部调用 updateTodo() 方法
  }
}

// 导出单例实例
export const todoApiService = new TodoApiService();
export default todoApiService;
