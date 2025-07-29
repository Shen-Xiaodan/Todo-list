// TodoList API 服务层
// 负责与 Node.js 中间层通信

const API_BASE_URL = 'http://localhost:3001/api';

class TodoApiService {
  // 获取所有 todos
  async getTodos() {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
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
  async createTodo(todoText) {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: todoText,
          done: false
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
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
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
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
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
    return this.updateTodo(todoId, { done: !currentStatus });
  }
}

// 导出单例实例
export const todoApiService = new TodoApiService();
export default todoApiService;
