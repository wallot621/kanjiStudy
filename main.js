// ===== 데이터 합치기 =====
const list = [
  ...grade1,
  ...grade2,
  ...grade3,
  ...grade4,
  ...grade5,
  ...grade6
];

// ===== 상태 =====
let index = parseInt(localStorage.getItem("index")) || 0;
let mode = localStorage.getItem("mode") || "kanji";
let showReading = localStorage.getItem("reading") === "true";
let showWords = localStorage.getItem("words") !== "false";
let scrollEnabled = false;
let tempView = false;

// ===== 요소 =====
const display = document.getElementById("display");
const progress = document.getElementById("progress");
const counter = document.getElementById("counter");

// ===== 렌더 =====
function render() {
  const item = list[index];

  let html = "";

  // ===== 메인 =====
  if (mode === "kanji" && !tempView) {
    html += `<div class="main-kanji">${item.k}</div>`;
  } else {
    html += `<div class="main-meaning">${item.r}</div>`;
  }

  // ===== 음훈 =====
  if (showReading || tempView) {
    html += `
      <div class="reading-box">
        <div>${item.on}</div>
        <div>${item.kun}</div>
      </div>
    `;
  }

  // ===== 단어 =====
  if ((showWords || tempView) && item.words) {
    html += `
      <div class="words">
        ${renderWord(item.words[0])}
        ${renderWord(item.words[1])}
      </div>
    `;
  }

  display.innerHTML = html;

  // ===== 진행바 =====
  if (progress) {
    progress.style.width =
      ((index + 1) / list.length * 100) + "%";
  }

  // ===== 카운터 =====
  if (counter) {
    counter.textContent = `${index + 1} / ${list.length}`;
  }

  updateButtons();
  saveState();
}

// ===== 단어 =====
function renderWord(word) {
  return `
    <div class="word-box">
      <div class="word-kanji">${word.w}</div>
      <div class="word-reading">${word.y}</div>
      <div class="word-meaning">${word.m}</div>
    </div>
  `;
}

// ===== 이동 =====
function next() {
  index = (index + 1) % list.length;
  render();
}

function prev() {
  index = (index - 1 + list.length) % list.length;
  render();
}

// ===== 모드 =====
function toggleMode() {
  mode = mode === "kanji" ? "meaning" : "kanji";
  render();
}

// ===== 음훈 =====
function toggleReading() {
  showReading = !showReading;
  render();
}

// ===== 단어 =====
function toggleWords() {
  showWords = !showWords;
  render();
}

// ===== tempView (꾹 누르면 보기) =====
function tempOn() {
  tempView = true;
  render();
}

function tempOff() {
  tempView = false;
  render();
}

// ===== 스크롤 =====
const slider = document.getElementById("slider");

if (slider) {
  slider.addEventListener("input", (e) => {
    if (!scrollEnabled) return;
    index = parseInt(e.target.value);
    render();
  });
}

// ===== 스크롤 잠금 =====
function toggleScroll() {
  scrollEnabled = !scrollEnabled;
  updateButtons();
}

// ===== 버튼 상태 =====
function updateButtons() {
  const readingBtn = document.getElementById("btn-reading");
  const wordBtn = document.getElementById("btn-word");
  const scrollBtn = document.getElementById("btn-scroll");

  if (readingBtn) {
    readingBtn.classList.toggle("active", showReading);
  }

  if (wordBtn) {
    wordBtn.classList.toggle("active", showWords);
  }

  if (scrollBtn) {
    scrollBtn.classList.toggle("active", scrollEnabled);
  }
}

// ===== 상태 저장 =====
function saveState() {
  localStorage.setItem("index", index);
  localStorage.setItem("mode", mode);
  localStorage.setItem("reading", showReading);
  localStorage.setItem("words", showWords);
}

// ===== 키보드 =====
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

// ===== 초기화 =====
if (slider) {
  slider.max = list.length - 1;
  slider.value = index;
}

render();
