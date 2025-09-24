const API_KEY = "6e7d6014165d4984d13f162993cce3f3"; // provided by user
const API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1&region=KR`;
const IMG = (path, size = "w500") => `https://image.tmdb.org/t/p/${size}${path}`;

const grid = document.getElementById("grid");
const statusBox = document.getElementById("status");

function setStatus(msg){ statusBox.textContent = msg || ""; }

function cardSkeleton(count=10){
  grid.innerHTML = new Array(count).fill(0).map(() => (
    `<div class="card"><div class="poster skeleton"></div><h3 class="title skeleton" style="height:42px"></h3></div>`
  )).join("");
}

async function load(){
  try{
    setStatus("로딩 중…");
    cardSkeleton(12);
    const res = await fetch(API_URL);
    if(!res.ok){ throw new Error(`API 오류 ${res.status}`); }
    const data = await res.json();
    const movies = (data.results || []).filter(m => m.poster_path);
    if(movies.length === 0){
      grid.innerHTML = "<p>표시할 영화가 없습니다.</p>";
      setStatus("");
      return;
    }
    grid.innerHTML = movies.map(m => (
      `<article class="card" title="${escapeHtml(m.title)}">
        <img class="poster" src="${IMG(m.poster_path)}" alt="${escapeHtml(m.title)} 포스터" loading="lazy" />
        <h3 class="title">${escapeHtml(m.title)}</h3>
      </article>`
    )).join("");
    setStatus("");
  }catch(err){
    console.error(err);
    setStatus("불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
    grid.innerHTML = "";
  }
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",
    ">":"&gt;","\"":"&quot;","'":"&#39;"}[s]));
}

load();
