import { useEffect, useRef, useState } from 'react'

// Simple local-state chat UI (no backend yet)
export default function Chat(){
  const [messages, setMessages] = useState([
    { id: 1, role: 'system', text: '안녕하세요! 간단한 채팅 데모입니다.' },
  ])
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    // auto scroll to bottom when new message
    if(listRef.current){
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const send = () => {
    const text = input.trim()
    if(!text) return
    const userMsg = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Fake bot reply
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: `답변: ${text}` }])
    }, 400)
  }

  const onKeyDown = (e) => {
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat">
      <div className="chat__list" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`chat__msg chat__msg--${m.role}`}>
            <div className="chat__bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chat__input">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="메시지를 입력하고 Enter로 보내기 (Shift+Enter 줄바꿈)"
          rows={2}
        />
        <button onClick={send}>보내기</button>
      </div>
    </div>
  )
}
