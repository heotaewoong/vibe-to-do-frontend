// 백엔드 REST API 사용으로 전환 (localhost:5000)
const API_BASE = 'http://localhost:5000/api/todos';

const form = document.getElementById('form');
const input = document.getElementById('input');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const clearAll = document.getElementById('clearAll');
const tmpl = document.getElementById('item-template');

let todos = [];

// 초기 로드: 서버에서 읽기
init();

async function init(){
  try {
    const res = await fetch(API_BASE, { headers: { 'Accept': 'application/json' } });
    if(!res.ok) throw new Error(`list_failed: ${res.status}`);
    const data = await res.json();
    // 서버의 스키마 { _id, text, done, createdAt, updatedAt }
    todos = data.map(d => ({ id: d._id, text: d.text, done: !!d.done, ts: new Date(d.createdAt).getTime() || Date.now() }));
    render();
  } catch (err) {
    console.error('목록 조회 실패:', err);
  }
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ text })
    });
    if(!res.ok) throw new Error(`create_failed: ${res.status}`);
    const doc = await res.json();
    const newItem = { id: doc._id, text: doc.text, done: !!doc.done, ts: new Date(doc.createdAt).getTime() || Date.now() };
    todos.unshift(newItem); // 최신순으로 상단에
    input.value = '';
    render();
  } catch (err) {
    console.error('생성 실패:', err);
  }
});

clearAll.addEventListener('click', async()=>{
  if(!todos.length) return;
  if(!confirm('모든 할 일을 삭제할까요?')) return;
  // 서버 항목도 모두 삭제
  try {
    // 병렬 삭제
    await Promise.allSettled(todos.map(t => fetch(`${API_BASE}/${t.id}`, { method: 'DELETE' })));
    todos = [];
    render();
  } catch (err) {
    console.error('전체 삭제 중 오류:', err);
  }
});

function render(){
  list.innerHTML = '';
  if(!todos.length){ empty.hidden = false; return; }
  empty.hidden = true;
  for(const t of todos){ list.appendChild(renderItem(t)); }
}

function renderItem(todo){
  const node = tmpl.content.firstElementChild.cloneNode(true);
  const toggle = node.querySelector('.toggle');
  const text = node.querySelector('.text');
  const editBtn = node.querySelector('.edit');
  const saveBtn = node.querySelector('.save');
  const delBtn = node.querySelector('.delete');

  toggle.checked = !!todo.done;
  text.value = todo.text;
  if(todo.done) text.style.textDecoration = 'line-through';

  toggle.addEventListener('change', async ()=>{
    const nextDone = toggle.checked;
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ done: nextDone })
      });
      if(!res.ok) throw new Error(`update_failed: ${res.status}`);
      todo.done = nextDone;
      if(todo.done){ text.style.textDecoration = 'line-through'; }
      else { text.style.textDecoration = 'none'; }
    } catch (err) {
      // 실패 시 UI 복구
      toggle.checked = todo.done;
      console.error('완료 상태 변경 실패:', err);
    }
  });

  editBtn.addEventListener('click', ()=>{
    node.classList.add('editing');
    text.readOnly = false; text.focus(); text.selectionStart = text.value.length;
    editBtn.hidden = true; saveBtn.hidden = false;
  });

  text.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !text.readOnly){ e.preventDefault(); saveEdit(); }
    if(e.key === 'Escape' && !text.readOnly){ cancelEdit(); }
  });

  saveBtn.addEventListener('click', saveEdit);
  delBtn.addEventListener('click', async ()=>{
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, { method: 'DELETE' });
      if(res.status !== 204) throw new Error(`delete_failed: ${res.status}`);
      todos = todos.filter(x => x.id !== todo.id);
      render();
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  });

  async function saveEdit(){
    const newText = text.value.trim();
    if(!newText){ alert('내용을 입력하세요.'); return; }
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ text: newText })
      });
      if(!res.ok) throw new Error(`update_failed: ${res.status}`);
      const updated = await res.json();
      todo.text = updated.text;
      finish();
      render();
    } catch (err) {
      console.error('텍스트 업데이트 실패:', err);
    }
  }
  function cancelEdit(){ text.value = todo.text; finish(); }
  function finish(){
    node.classList.remove('editing');
    text.readOnly = true; editBtn.hidden = false; saveBtn.hidden = true;
  }

  return node;
}
