let mode = "kanji";
let tempMode = null;
let index = 0;

let isDragging = false;

/* =========================
   ⭐ 상태 저장 / 불러오기
========================= */

function saveState(){
    localStorage.setItem("kanjiState", JSON.stringify({
        index,
        mode,
        tempMode,
        grade: document.getElementById("grade").value,
        showMeaning: document.getElementById("showMeaningChk").checked
    }));
}

function loadState(){
    const data = JSON.parse(localStorage.getItem("kanjiState"));
    if(!data) return;

    index = data.index ?? 0;
    mode = data.mode ?? "kanji";
    tempMode = data.tempMode ?? null;

    document.getElementById("grade").value = data.grade ?? "1";
    document.getElementById("showMeaningChk").checked = data.showMeaning ?? false;
}

/* ========================= */

function toHiragana(str){
    if(!str) return "";
    return str.replace(/[\u30a1-\u30f6]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
}

function toggleMode(){
    mode = (mode === "kanji") ? "reading" : "kanji";
    tempMode = null;
    update();
}

/* ⭐ 충돌 없는 버튼 로직 */

function showMeaning(){
    if(mode === "kanji"){
        tempMode = (tempMode === "meaning") ? null : "meaning";
    } else {
        tempMode = (tempMode === "kanji") ? null : "kanji";
    }
    update();
}

function showReading(){
    tempMode = (tempMode === "reading") ? null : "reading";
    update();
}

function showWords(){
    tempMode = (tempMode === "words") ? null : "words";
    update();
}

function nextKanji(){
    let list = kanjiData[document.getElementById("grade").value];
    index = (index + 1) % list.length;
    tempMode = null;
    update();
}

function prevKanji(){
    let list = kanjiData[document.getElementById("grade").value];
    index = (index - 1 + list.length) % list.length;
    tempMode = null;
    update();
}

function update(){
    let list = kanjiData[document.getElementById("grade").value];
    let display = document.getElementById("display");
    let sliderThumb = document.getElementById("sliderThumb");

    let btnMeaning = document.getElementById("btnMeaning");
    let btnReading = document.getElementById("btnReading");
    let btnWords = document.getElementById("btnWords");

    let showMeaningChk = document.getElementById("showMeaningChk").checked;

    if(!list || list.length === 0){
        display.innerText = "데이터 없음";
        return;
    }

    let item = list[index];

    /* ⭐ 렌더 초기화 (핵심 버그 해결) */
    display.innerHTML = "";
    display.innerText = "";

    /* ⭐ 슬라이더 */
    const percent = index / (list.length - 1);
    sliderThumb.style.left = (percent * 100) + "%";

    /* ⭐ 버튼 초기화 */
    btnMeaning.classList.remove("active");
    btnReading.classList.remove("active");
    btnWords.classList.remove("active");

    btnMeaning.innerText = (mode === "kanji") ? "뜻" : "한자";

    /* ===== 출력 ===== */

    if(tempMode === "meaning"){
        display.innerText = item.r;
        display.className = "display reading";
        btnMeaning.classList.add("active");
    }
    else if(tempMode === "kanji"){
        display.innerText = item.k;
        display.className = "display kanji";
        btnMeaning.classList.add("active");
    }
    else if(tempMode === "reading"){
        display.innerText =
            toHiragana(item.on) + "\n" + toHiragana(item.kun);
        display.className = "display reading";
        btnReading.classList.add("active");
    }
    else if(tempMode === "words"){
        display.innerHTML = `
            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                column-gap:2em;
                row-gap:0em;
                text-align:center;
                font-size:1.2em;
            ">
                <div style="font-size:1em; font-weight:bold;">
                    ${item.words[0].w}
                </div>
                <div style="font-size:1em; font-weight:bold;">
                    ${item.words[1].w}
                </div>

                <div style="font-size:0.5em; color:#aaa;">
                    (${item.words[0].y})
                </div>
                <div style="font-size:0.5em; color:#aaa;">
                    (${item.words[1].y})
                </div>

                <div style="font-size:0.7em;">
                    ${item.words[0].m}
                </div>
                <div style="font-size:0.7em;">
                    ${item.words[1].m}
                </div>
            </div>
        `;
        display.className = "display reading";
        btnWords.classList.add("active");
    }
    else if(showMeaningChk){
        display.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:14vw; font-weight:bold;">
                    ${item.k}
                </div>
                <div style="font-size:5vw; color:#aaa;">
                    ${item.r}
                </div>
            </div>
        `;
        display.className = "display";
    }
    else {
        if(mode === "kanji"){
            display.innerText = item.k;
            display.className = "display kanji";
        } else {
            display.innerText = item.r;
            display.className = "display reading";
        }
    }

    /* ⭐ 카운터 */
    document.getElementById("counter").innerText =
        (index + 1) + " / " + list.length;

    /* ⭐ 상태 저장 */
    saveState();
}

/* =========================
   ⭐ 슬라이더 + 초기화
========================= */

window.onload = () => {

    loadState();

    const wrap = document.getElementById("sliderWrap");
    const thumb = document.getElementById("sliderThumb");

    function move(clientX){
        const rect = wrap.getBoundingClientRect();

        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percent = x / rect.width;

        let list = kanjiData[document.getElementById("grade").value];
        index = Math.round(percent * (list.length - 1));

        tempMode = null;
        update();
    }

    /* PC */
    thumb.addEventListener("mousedown", () => isDragging = true);

    document.addEventListener("mousemove", (e) => {
        if(!isDragging) return;
        move(e.clientX);
    });

    document.addEventListener("mouseup", () => isDragging = false);

    /* 모바일 */
    thumb.addEventListener("touchstart", () => isDragging = true);

    document.addEventListener("touchmove", (e) => {
        if(!isDragging) return;
        move(e.touches[0].clientX);
    });

    document.addEventListener("touchend", () => isDragging = false);

    document.getElementById("showMeaningChk")
        .addEventListener("change", update);

    document.getElementById("grade")
        .addEventListener("change", () => {
            index = 0;
            tempMode = null;
            update();
        });

    update();
};
