import { useState } from 'react'
import TodoApp from './components/TodoApp.jsx'

export default function App(){
  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: 16 }}>
      <TodoApp />
    </div>
  )
}
