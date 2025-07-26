import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [openMenuIndex, setOpenMenuIndex] = useState(-1);

  const AddTodos = () => {
    if(input.trim() === '') return;
    setTodos([...todos, { text: input, done: false}]);
    setInput('');
  }

  const handleToggle = (index) => {
    if(editIndex !== -1) return;
    const newTodos = [...todos];
    newTodos[index].done = !newTodos[index].done;
    setTodos(newTodos);
  }

  const handleDelete = (index) => {
    if(editIndex === index){
      setEditIndex(-1);
      setEditText('');
    }
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  }

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditText(todos[index].text);
  }

  const handleSave = () =>{
    const newTodos = [...todos];
    newTodos[editIndex].text = editText;
    setTodos(newTodos);
    setEditIndex(-1);
    setEditText('');
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
      <div className="input-todo">
        <textarea
          className="todo-input"
          placeholder="Add a todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <button className="add-todo" onClick={AddTodos}>Add</button>
      </div>
      <div className="todo-list">
        <ul>
          {todos.map((todo, index) => (
            <li key={index} className={openMenuIndex === index ? 'menu-active' : ''}>
              {editIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button onClick={handleSave}>Save</button>
                  <button onClick={handleCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggle(index)}
                  />
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