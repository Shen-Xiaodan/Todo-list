import { useState, useEffect } from 'react'
import './App.css'
import todoApiService from './services/todoApi'

export default function App() {
  const [login, setLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  //const [date, setDate] = useState('');
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [openMenuIndex, setOpenMenuIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoApiService.signup(username, password);
      console.log(response);

      // 注册成功后保存用户信息
      if (response.success && response.user) {
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('userId', response.user.id.toString());
        localStorage.setItem('isLoggedIn', 'true');
        setLogin(true);
        loadTodos();
        setUsername('');
        setPassword('');
      } else {
        setError('Signup failed: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Failed to signup: ' + err.message);
      console.error('Error signing up:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await todoApiService.login(username, password);
      console.log(response);

      // 检查登录是否成功
      if (response.success && response.user) {
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('userId', response.user.id.toString());
        localStorage.setItem('isLoggedIn', 'true');
        setLogin(true);
        loadTodos();
        setUsername('');
        setPassword('');
      } else {
        setError('Login failed: Invalid username or password');
      }
    } catch (err) {
      setError('Failed to login: ' + err.message);
      console.error('Error logging in:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    setLogin(false);
    setTodos([]);
  }

  // 加载所有 todos
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const todosData = await todoApiService.getTodos();
      setTodos(todosData);
    } catch (err) {
      setError('Failed to load todos: ' + err.message);
      console.error('Error loading todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时检查登录状态并加载数据
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUsername = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId');

    if (isLoggedIn === 'true' && savedUsername && savedUserId) {
      setLogin(true);
      setUsername(savedUsername);
      loadTodos();
    }
  }, []);

  const AddTodos = async () => {
    if(input.trim() === '') return;

    try {
      setLoading(true);
      setError(null);
      const newTodo = await todoApiService.createTodo(input.trim());
      setTodos([...todos, newTodo]);
      setInput('');
    } catch (err) {
      setError('Failed to add todo: ' + err.message);
      console.error('Error adding todo:', err);
    } finally {
      setLoading(false);
    }
  }

  const sortedTodos = () => {
    return todos.sort((a, b) => {
      if(a.done === b.done) {
        // 按创建时间排序，新的在前
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA;
      } else if(a.done) {
        return 1;
      } else {
        return -1;
      }
    })
  }

  const handleToggle = async (index) => {
    if(editIndex !== -1) return;

    const todo = todos[index];
    try {
      setLoading(true);
      setError(null);
      const updatedTodo = await todoApiService.toggleTodo(todo.id, todo.done);
      const newTodos = [...todos];
      newTodos[index] = updatedTodo;
      setTodos(newTodos);
    } catch (err) {
      setError('Failed to update todo: ' + err.message);
      console.error('Error updating todo:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (index) => {
    if(editIndex === index){
      setEditIndex(-1);
      setEditText('');
    }

    const todo = todos[index];
    try {
      setLoading(true);
      setError(null);
      await todoApiService.deleteTodo(todo.id);
      const newTodos = todos.filter((_, i) => i !== index);
      setTodos(newTodos);
    } catch (err) {
      setError('Failed to delete todo: ' + err.message);
      console.error('Error deleting todo:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditText(todos[index].text);
  }

  const handleSave = async () =>{
    try {
      setLoading(true);
      setError(null);
      const todo = todos[editIndex];
      const updatedTodo = await todoApiService.updateTodo(todo.id, { text: editText });
      const newTodos = [...todos];
      newTodos[editIndex] = updatedTodo;
      setTodos(newTodos);
      setEditIndex(-1);
      setEditText('');
    } catch (err) {
      setError('Failed to save todo: ' + err.message);
      console.error('Error saving todo:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    setEditIndex(-1);
    setEditText('');
  }

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? -1 : index);
  }

  const handleMenuEdit = (index) => {
    handleEdit(index);
    setOpenMenuIndex(-1);
  }

  const handleMenuDelete = (index) => {
    handleDelete(index);
    setOpenMenuIndex(-1);
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuIndex(-1);
      }
    };

    if (openMenuIndex !== -1) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuIndex]);

  return (
    <>
      <h1>My Todo List</h1>

      {!login && (
        <div className='login-form'>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="signup-button"
            onClick={handleSignup}>Sign Up</button>
          <button
            className="login-button"
            onClick={handleLogin}>Login</button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="error-message" style={{color: 'red', margin: '10px 0'}}>
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="loading-message" style={{color: 'blue', margin: '10px 0'}}>
          Loading...
        </div>
      )}

      {login && (
        <>
          <div className="user-info" style={{margin: '10px 0', textAlign: 'right'}}>
            <span>Welcome, {localStorage.getItem('username')}!</span>
            <button
              onClick={handleLogout}
              style={{marginLeft: '10px', padding: '5px 10px'}}
            >
              Logout
            </button>
          </div>
          <div className="input-todo">
          <textarea
            className="todo-input"
            placeholder="What need to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          ></textarea>
          <button
            className="add-todo"
            onClick={AddTodos}
            disabled={loading || input.trim() === ''}
          >
            Add
          </button>
        </div><div className="todo-list">
            <ul>
              {sortedTodos().map((todo, index) => (
                <li key={index} className={openMenuIndex === index ? 'menu-active' : ''}>
                  {editIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)} />
                      <button onClick={handleSave}>Save</button>
                      <button onClick={handleCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handleToggle(index)} />
                      <span className={todo.done ? 'done' : ''}>{todo.text}</span>
                      <div className={`menu-container ${openMenuIndex === index ? 'menu-open' : ''}`}>
                        <button
                          className={`menu-button ${openMenuIndex === index ? 'active' : ''}`}
                          onClick={() => toggleMenu(index)}
                        >
                          ⋯
                        </button>
                        {openMenuIndex === index && (
                          <div className="dropdown-menu">
                            <button
                              className="menu-item"
                              onClick={() => handleMenuEdit(index)}
                            >
                              Edit
                            </button>
                            <button
                              className="menu-item"
                              onClick={() => handleMenuDelete(index)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )
      }
    </>
  )
}