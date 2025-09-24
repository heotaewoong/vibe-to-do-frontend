import { useEffect, useState } from 'react'

// API base 결정 로직
// 우선순위: VITE_API_BASE > VITE_API_URL > localhost 개발용 > '/api/todos' (프로덕션 상대경로)
// (스크린샷에선 VITE_API_URL을 사용하고 있어 둘 다 지원합니다)
const rawEnv = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/todos"

function normalizeBase(b) {
  if (!b) return b
  return b.replace(/\/+$/, '')
}
let API_BASE = null
if (rawEnv) API_BASE = normalizeBase(rawEnv)
else if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
  API_BASE = 'http://localhost:5000/api/todos'
} else {
  API_BASE = '/api/todos'
}

// 디버깅용: 브라우저 콘솔에서 실제 사용중인 값을 확인하세요
console.info('API base resolved to:', API_BASE, '(VITE_API_BASE=', rawEnv, ')')

export default function TodoApp() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Load todos on mount
  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        referrerPolicy: 'no-referrer'
      })
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      } else {
        console.error('Failed to load todos:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Error loading todos (check if backend is running):', error)
    } finally {
      setLoading(false)
    }
  }

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault()
    const text = newTodo.trim()
    if (!text) return

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ text })
      })
      
      if (response.ok) {
        const newItem = await response.json()
        setTodos(prev => [newItem, ...prev])
        setNewTodo('')
      } else {
        const errorText = await response.text()
        console.error('Failed to add todo:', response.status, errorText)
        alert('할일 추가에 실패했습니다. 백엔드 서버 상태를 확인하세요.')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('네트워크 오류입니다. 백엔드 서버가 실행 중인지 확인하세요.')
    }
  }

  // Toggle todo done status
  const toggleTodo = async (id, currentDone) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ done: !currentDone })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setTodos(prev => prev.map(todo => 
          todo._id === id ? updated : todo
        ))
      } else {
        console.error('Failed to toggle todo:', response.status)
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  // Start editing
  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditText(todo.text)
  }

  // Save edit
  const saveEdit = async (id) => {
    const text = editText.trim()
    if (!text) return

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ text })
      })
      
      if (response.ok) {
        const updated = await response.json()
        setTodos(prev => prev.map(todo => 
          todo._id === id ? updated : todo
        ))
        setEditingId(null)
        setEditText('')
      } else {
        console.error('Failed to save edit:', response.status)
      }
    } catch (error) {
      console.error('Error saving edit:', error)
    }
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  // Delete todo
  const deleteTodo = async (id) => {
    if (!confirm('이 할일을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        referrerPolicy: 'no-referrer'
      })
      
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo._id !== id))
      } else {
        console.error('Failed to delete todo:', response.status)
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  // Handle edit form submit
  const handleEditSubmit = (e, id) => {
    e.preventDefault()
    saveEdit(id)
  }

  if (loading) {
    return <div className="loading">할일을 불러오는 중...</div>
  }

  return (
    <div className="todo-app">
      <h1>할일 관리</h1>
      
      {/* Add new todo form */}
      <form onSubmit={addTodo} className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="새로운 할일을 입력하세요..."
          className="todo-input"
        />
        <button type="submit" className="add-btn">추가</button>
      </form>

      {/* Todo list */}
      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="empty-state">할일이 없습니다.</div>
        ) : (
          todos.map(todo => (
            <div key={todo._id} className={`todo-item ${todo.done ? 'done' : ''}`}>
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo._id, todo.done)}
                  className="todo-checkbox"
                />
                
                {editingId === todo._id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, todo._id)} className="edit-form">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button type="submit" className="save-btn">저장</button>
                      <button type="button" onClick={cancelEdit} className="cancel-btn">취소</button>
                    </div>
                  </form>
                ) : (
                  <span 
                    className="todo-text"
                    onDoubleClick={() => startEdit(todo)}
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              
              {editingId !== todo._id && (
                <div className="todo-actions">
                  <button 
                    onClick={() => startEdit(todo)}
                    className="edit-btn"
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => deleteTodo(todo._id)}
                    className="delete-btn"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}