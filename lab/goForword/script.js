openModal("gameSettings");

let AW, CWS, PUZZLES;
let sw, tw, Par, TMax, T, H = [];
let dtS, todayDtS, tID, lsState, archivePicker;
let D = !1, freePlay = !1, isGameLoaded = !1, isModalClosed = !1, W_state = !1;

const L = 'abcdefghijklmnopqrstuvwxyz';
const diff_define = { 3: 'Easy', 4: 'Medium', 5: 'Hard', 6: 'Advanced', 7: 'Scholar' };
const q = s => document.querySelector(s);
const iElem = q('#i');
const bElem = q('#b');
const undoElem = q('#btn-undo');

const O = (a, b) => {
    let l = a.length, m = b.length, i = 0, j = 0, e = 0;
    if (Math.abs(l - m) > 1) return !1;
    while (i < l && j < m) {
        if (a[i] !== b[j]) {
            if (++e > 1) return !1;
            l > m ? i++ : l < m ? j++ : (i++, j++);
        } else {
            i++; j++;
        }
    }
    return e + (l - i) + (m - j) === 1;
};

const msg = x => { showSnackbar(x); };

const err = x => {
    msg(x);
    iElem.classList.remove('shake');
    void iElem.offsetWidth;
    iElem.classList.add('shake');
};

const DH = (a, b) => {
    let l = a.length, m = b.length, i = 0;
    while (i < l && i < m && a[i] === b[i]) i++;
    if (m > l) return b.slice(0, i) + '<span class="add diff-char">' + b[i] + '</span>' + b.slice(i + 1);
    if (l > m) return b.slice(0, i) + '<span class="del diff-char">-</span>' + b.slice(i);
    return b.slice(0, i) + '<span class="sub diff-char">' + b[i] + '</span>' + b.slice(i + 1);
};

const saveGame = (endState, winState) => {
    let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
    db[dtS] = `${H.join(',')}|${endState ? 1 : 0}|${winState ? 1 : 0}`;
    localStorage.setItem('gfw_db', JSON.stringify(db));

    if (archivePicker) archivePicker.redraw();
};

const checkArchiveUnlock = () => {
    if (!todayDtS) return;
    let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
    let tData = db[todayDtS + '-1'];

    if (tData && tData.split('|')[1] === '1') {
        if (q('#archive-lock-msg')) q('#archive-lock-msg').style.display = 'none';
        if (q('#archive-controls')) q('#archive-controls').style.display = 'block';

        if (archivePicker) {
            archivePicker.setDate(dtS.substring(0, 10));
        } else {
            let dIn = q('#archive-date');
            if (dIn) {
                dIn.min = '2026-05-20';
                dIn.max = todayDtS;
                if (!dIn.value) dIn.value = dtS.substring(0, 10);
            }
        }
    }
};

const renderGame = () => {
    q('#loader').style.display = 'none';
    q('#app').style.display = 'flex';
    q('#tw').innerText = tw;
    iElem.placeholder = "→ " + tw;
    q('#end-panel').style.display = 'none';
    if (q('#ig')) q('#ig').style.display = 'flex';
    drwAll();

    if (D) end(W_state, !0);
    else iElem.focus();

    q('h1').scrollIntoView({ behavior: 'smooth', block: 'end' });
    checkArchiveUnlock();
};

q('#history').addEventListener("transitionend", () => {
    q('#history').style.height = "auto";
    iElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
});

const drwDots = () => {
    let container = q('#dots');
    if (container.children.length !== TMax) {
        container.innerHTML = Array.from({ length: TMax }, () => `<div class="dot"></div>`).join('');
    }
    Array.from(container.children).forEach((dot, idx) => {
        dot.classList.toggle('bonus', idx < Par);
        dot.classList.toggle('used', idx < (TMax - T));

        if (idx >= H.length - 1) return;

        const cur = H[idx + 1].length, prev = H[idx].length;
        const method = cur > prev ? 1 : cur < prev ? -1 : 0;

        dot.classList.toggle('add', method === 1);
        dot.classList.toggle('sub', method === 0);
        dot.classList.toggle('del', method === -1);
        dot.classList.toggle('uncommon', !CWS.has(H[idx + 1]));
    });
    q('#recommended_steps').classList.toggle("off", !(H.length - 1 <= Par));
};

const addW = (w, idx, p) => {
    let h = q('#history');
    let r = document.createElement('div');
    r.className = 'word-row';
    r.innerHTML = `<div class="step">${idx}</div><div class="word-diff">${idx ? DH(p, w) : w}</div><span class="twemoji">${CWS.has(w) ? '' : '<svg title="Uncommon" class="mar-r-0"><use href="#emoji-dictionary"></use></svg></span>'}`;
    h.appendChild(r);

    h.style.height = h.scrollHeight + "px";
    requestAnimationFrame(() => h.style.height = h.scrollHeight + "px");
};

const drwAll = () => {
    q('#all_common').classList.toggle("off", !H.every(w => CWS.has(w)));
    drwDots();
    let h = q('#history');
    h.innerHTML = '';
    H.forEach((w, idx) => addW(w, idx, H[idx - 1]));
};

function gameSettingsModalCloseEvent() {
    if (isModalClosed === !0) return;
    isModalClosed = !0;
    if (isGameLoaded) renderGame();
}

const loadPuzzle = (targetDate, part = 1) => {
    let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');

    if (part === 2) {
        let p1Data = db[targetDate + '-1'];
        if (!p1Data || p1Data.split('|')[1] !== '1') {
            msg("Complete Part 1 first!");
            return loadPuzzle(targetDate, 1);
        }
    }

    q('#loader').style.display = 'flex';
    q('#app').style.display = 'none';

    const dateArr = convertDateFormat(targetDate).split('/');
    q('#date').innerText = convertDateFormat(targetDate);
    q('#styled-date-yyyy').innerText = dateArr[0];
    q('#styled-date-m').innerText = dateArr[1];
    q('#styled-date-dd').innerText = dateArr[2];
    q('#puzzle-part').classList.toggle("display-none", !(PUZZLES[targetDate + '-2'] !== undefined));
    q('#puzzle-part').innerHTML = 'p' + part;
    q("#diff-label").innerText = "Difficulty";
    q('#end-panel').style.display = 'none';
    if (q('#till-next')) q('#till-next').style.display = 'none';

    isGameLoaded = !1; D = !1; W_state = !1; freePlay = !1;
    dtS = targetDate + '-' + part;

    let pData = PUZZLES[dtS];
    if (!pData) {
        dtS = targetDate + '-1';
        pData = PUZZLES[dtS] || ["errored", "pls refresh page", 1, 1];
    }

    if (part === 1) {
        if (PUZZLES[dtS.substring(0, 10) + '-2'] !== undefined) {
            q('#second-stage-access').classList.add("display-none");
            q('#second-stage-back').classList.add("display-none");
            q('#second-stage-locked').classList.remove("display-none");
            q('#no-second-stage').classList.add("display-none");
        } else {
            q('#second-stage-access').classList.add("display-none");
            q('#second-stage-back').classList.add("display-none");
            q('#second-stage-locked').classList.add("display-none");
            q('#no-second-stage').classList.remove("display-none");
        }
    } else {
        q('#second-stage-access').classList.add("display-none");
        q('#second-stage-back').classList.remove("display-none");
    }

    sw = pData[0]; tw = pData[1]; Par = pData[2]; TMax = pData[3];

    diff_label = diff_define[Par] || "";
    q("#diff-label").innerText = diff_label;

    if (diff_label != "") q('#difficulty-roadmap-container').querySelectorAll('li').forEach(element => {
        element.classList.toggle("current", element.id.replace('m-d-', '') === diff_label);
        element.classList.remove("unlocked");
    });

    if (db[dtS]) {
        let pts = db[dtS].split('|');
        let savedH = pts[0].split(',');

        if (savedH[0] !== sw) {
            delete db[dtS];
            localStorage.setItem('gfw_db', JSON.stringify(db));
            H = [sw]; T = TMax;
        } else {
            H = savedH;
            D = pts[1] === '1';
            W_state = pts[2] === '1';
            T = pts.length > 3 ? TMax - parseInt(pts[3]) : TMax - (H.length - 1);
        }
    } else {
        H = [sw]; T = TMax;
    }

    isGameLoaded = !0;
    if (isModalClosed) renderGame();

    q('#no-navigatorShare').classList.toggle("display-none", navigator.share != undefined);
    q('#yes-navigatorShare').classList.toggle("display-none", navigator.share === undefined);
};

const end = (W, isRestore = false) => {
    D = !0;
    W_state = W;

    if (!freePlay) saveGame(!0, W);
    checkArchiveUnlock();

    q('h1').scrollIntoView({ behavior: 'smooth', block: 'end' });
    q('#ig').style.display = 'none';
    q('#end-panel').style.display = 'flex';
    if (q('#till-next')) q('#till-next').style.display = 'flex';

    let et = q('#end-title');
    let isCompleted = H[H.length - 1] === tw;
    let wonTries = TMax - T;
    let winMethod = 0, winText = 'For the word is gone 💀', winEmoji = ' 💀';

    if (W) {
        if (wonTries <= Par) { winMethod = 1; winText = 'You’ve gone for the word!'; winEmoji = ' 🏆'; }
        else if (wonTries < TMax) { winMethod = 2; winText = 'The transformation is done.'; winEmoji = ''; }
        else { winMethod = 3; winText = 'That was close...'; winEmoji = ''; }
    } else if (isCompleted) {
        winMethod = 0;
        winText = 'You managed to make it!';
        winEmoji = ' 🛠️';
    }

    if (!isRestore && typeof loadConfetti === 'function') loadConfetti(winMethod);

    let canUnlockPart2 = dtS.endsWith('-1') && PUZZLES[dtS.substring(0, 10) + '-2'] !== undefined;
    if (canUnlockPart2) {
        setTimeout(() => { openModal('difficulty'); }, 500);

        q('#m-d-' + diff_define[PUZZLES[dtS.substring(0, 10) + '-2'][2]]).classList.add('unlocked');

        q('#second-stage-access').classList.remove("display-none");
        q('#second-stage-locked').classList.add("display-none");
        q('#btn-nextHarderPuzzle').onclick = () => {
            loadPuzzle(dtS.substring(0, 10), 2);
            closeModal();
        }
        q('#btn-backEasierPuzzle').onclick = () => {
            loadPuzzle(dtS.substring(0, 10), 1);
            closeModal();
        }
    }

    et.innerText = winText;
    et.style.color = W ? 'var(--primary)' : (isCompleted ? 'var(--color)' : 'var(--del)');

    q('#btn-share').onclick = async () => {
        const emoji_map = {
            add: { c: '🟢', s: '🟩' },
            del: { c: '🔴', s: '🟥' },
            sub: { c: '🔵', s: '🟦' }
        };

        let ops = H.slice(1).map((w, k) => {
            const colour = w.length > H[k].length ? 'add' : w.length < H[k].length ? 'del' : 'sub';
            const shape = CWS.has(w) ? 's' : 'c';
            return emoji_map[colour][shape];
        }).join('');

        let noUncommonEmoji = H.every(w => CWS.has(w)) ? ' 🗣️' : '';

        let baseDate = dtS.substring(0, 10);
        let hasPart2 = PUZZLES[baseDate + '-2'] !== undefined;
        let stageStr = hasPart2 ? (dtS.endsWith('-2') ? ' p2' : ' p1') : '';

        let shareText = `Go Forword (${convertDateFormat(baseDate)}${stageStr}) - ${q('#diff-label').innerText}${winEmoji}${noUncommonEmoji}\n${W ? wonTries : 'X'}/${TMax} ${ops}`;

        if (navigator.share) {
            try { await navigator.share({ text: shareText }); return; }
            catch (err) { if (err.name === "AbortError") return; }
        }

        if (navigator.clipboard && window.isSecureContext) {
            try { await navigator.clipboard.writeText(shareText); return msg('Copied to clipboard'); }
            catch (err) { }
        }

        try {
            let textArea = document.createElement("textarea");
            textArea.value = shareText;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            textArea.remove();
            msg('Copied to clipboard!');
        } catch (err) {
            msg('Failed to copy share text.');
        }
    };

    let cBtn = q('#btn-continue');
    if (!cBtn) {
        cBtn = document.createElement('div');
        cBtn.id = 'btn-continue';
        cBtn.style.cursor = 'pointer';
        cBtn.style.textDecoration = 'underline';
        cBtn.style.marginTop = '15px';
        cBtn.style.fontSize = '0.9em';
        cBtn.style.opacity = '0.8';
        q('#end-panel').appendChild(cBtn);
    }

    cBtn.style.display = 'block';

    let baseDate = dtS.substring(0, 10);
    let hasPart2 = PUZZLES[baseDate + '-2'] !== undefined;
    let isPlayingPart1 = dtS.endsWith('-1');

    cBtn.innerText = isCompleted ? "Try an alternate solution." : "Keep going.";
    cBtn.style.fontWeight = "500";
    cBtn.onclick = () => {
        q('#end-panel').style.display = 'none';
        q('#ig').style.display = 'flex';
        D = !1;
        freePlay = !0;
        if (isCompleted) {
            H = [H[0]];
            T = TMax;
            drwAll();
        }
        q('#i').focus();

        if (isCompleted) {
            q('h1').scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            iElem.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    if (!window.timerInt) {
        window.timerInt = setInterval(() => {
            let n = new Date(), tm = new Date(n).setHours(24, 0, 0, 0) - n;
            let hh = String(Math.floor((tm / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            let mm = String(Math.floor((tm / 1000 / 60) % 60)).padStart(2, '0');
            let ss = String(Math.floor((tm / 1000) % 60)).padStart(2, '0');
            if (q('#timer')) q('#timer').innerText = `${hh}:${mm}:${ss}`;
        }, 1000);
    }
};

const initGame = async () => {
    let pText = document.createElement('div');
    pText.id = 'progress-text';
    pText.style.fontSize = '0.875em';
    pText.style.opacity = '0.8';
    pText.innerText = '';
    if (q('#loader')) q('#loader').appendChild(pText);

    try {
        let [c, a, pDat] = await Promise.all([
            fetch('wordList/cw.txt').then(r => r.text()),
            fetch('wordList/aw.txt').then(r => r.text()),
            fetch('puzzles.dat').then(r => r.text())
        ]);
        CWS = new Set(c.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w));
        AW = new Set(a.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w));

        const decoded = atob(pDat.trim());
        const raw = Array.from(decoded).map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
        PUZZLES = JSON.parse(raw);

    } catch (err) {
        pText.innerText = 'Error loading game files. Please check your connection.';
        return;
    }

    let sd = new Date();
    todayDtS = sd.getFullYear() + '-' + String(sd.getMonth() + 1).padStart(2, '0') + '-' + String(sd.getDate()).padStart(2, '0');

    let aDateIn = q('#archive-date');
    if (aDateIn) {
        if (typeof flatpickr !== 'undefined') {
            archivePicker = flatpickr(aDateIn, {
                minDate: "2026-05-20",
                maxDate: todayDtS,
                disableMobile: true,
                altInput: true,
                altFormat: "J M, Y",
                dateFormat: "Y-m-d",
                onChange: function (selectedDates, dateStr, instance) {
                    if (dateStr && dateStr <= todayDtS && dateStr >= '2026-05-20') {
                        loadPuzzle(dateStr, 1);
                        if (typeof closeModal === 'function') closeModal();
                    } else {
                        msg("Invalid date!");
                    }
                },
                onDayCreate: function (dObj, dStr, fp, dayElem) {
                    let d = dayElem.dateObj;
                    let dt = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                    if (dt < "2026-05-20" || dt > todayDtS || !PUZZLES) return;

                    let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
                    let parts = PUZZLES[dt + '-2'] ? 2 : 1;

                    let dotContainer = document.createElement('div');
                    dotContainer.style.position = 'absolute';
                    dotContainer.style.bottom = '2px';
                    dotContainer.style.left = '0';
                    dotContainer.style.right = '0';
                    dotContainer.style.display = 'flex';
                    dotContainer.style.justifyContent = 'center';
                    dotContainer.style.gap = '3px';

                    for (let p = 1; p <= parts; p++) {
                        let dot = document.createElement('span');
                        dot.style.width = '4px';
                        dot.style.height = '4px';
                        dot.style.borderRadius = '50%';
                        dot.style.backgroundColor = 'var(--border-half)';

                        let pData = db[dt + '-' + p];
                        if (pData) {
                            let pts = pData.split('|');
                            let endState = pts[1] === '1';
                            let winState = pts[2] === '1';

                            if (!endState) dot.style.backgroundColor = 'var(--secondary)';
                            else if (winState) dot.style.backgroundColor = 'var(--primary)';
                            else dot.style.backgroundColor = 'var(--danger)';
                        }

                        dotContainer.appendChild(dot);
                    }
                    if (dotContainer.children.length > 0) {
                        dayElem.appendChild(dotContainer);
                    }
                }
            });
        } else {
            aDateIn.addEventListener('change', (event) => {
                const sel = event.target.value;
                if (sel && sel <= todayDtS && sel >= '2026-05-20') loadPuzzle(sel, 1);
                else msg("Invalid date!");
            });
        }
    }

    loadPuzzle(todayDtS, 1);
};

const toggleButtons = () => {
    bElem.style.display = iElem.value.trim() === '' ? 'none' : 'block';
    undoElem.style.display = iElem.value.trim() === '' ? 'block' : 'none';
};

bElem.onclick = () => {
    iElem.focus();

    if (D) return;

    let v = iElem.value.toLowerCase().trim();

    if (!v) return;
    if (v === H[H.length - 1]) return err("Please make a change.");
    if (!AW.has(v) && !CWS.has(v)) return err("Not in the dictionary.");
    if (!O(H[H.length - 1], v)) return err("Only 1 change at a time.");

    if (!CWS.has(v)) q('#all_common').classList.add("off");

    let isCommonWord = CWS.has(v);

    iElem.value = '';
    iElem.dispatchEvent(new Event('input'));
    H.push(v);
    T--;

    let h = q('#history');
    h.style.height = h.scrollHeight + "px";

    drwDots();
    addW(v, H.length - 1, H[H.length - 2]);
    if (v === tw) {
        if (!freePlay) {
            end(1);
        } else {
            let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
            let savedData = db[dtS];

            if (savedData && !savedData.split('|')[0].endsWith(tw)) {
                saveGame(!0, W_state);
            }
            end(W_state, !0);
        }
    } else if (T === 0 && !freePlay) {
        end(0);
    } else {
        if (!freePlay) saveGame(!1, !1);
    }
};

undoElem.onclick = () => {
    iElem.focus();

    if (D || H.length <= 1) {
        msg("No steps to undo.");
        return;
    }

    H.pop();
    T++;

    let h = q('#history');
    if (h.lastElementChild) {
        h.removeChild(h.lastElementChild);
    }

    q('#all_common').classList.toggle("off", !H.every(w => CWS.has(w)));
    drwDots();

    if (!freePlay) saveGame(!1, !1);
};

iElem.addEventListener('input', toggleButtons);

if (iElem) {
    iElem.onkeydown = e => { if (e.key === 'Enter') bElem.click(); };
}
toggleButtons();

initGame();

function loadConfetti(winMethod) {
    if (winMethod === 1) {
        const end = Date.now() + 2000;
        (function frame() {
            confetti({ particleCount: 2, angle: randomInRange(50, 70), spread: randomInRange(50, 60), origin: { x: 0, y: randomInRange(0.4, 0.6) } });
            confetti({ particleCount: 2, angle: randomInRange(90, 180), spread: randomInRange(50, 60), origin: { x: 1, y: randomInRange(0.4, 0.6) } });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    } else if (winMethod === 2) {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        confetti(Object.assign({}, defaults, { particleCount: 50, origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.6, 0.8) } }));
        confetti(Object.assign({}, defaults, { particleCount: 50, origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.6, 0.8) } }));
        confetti(Object.assign({}, defaults, { particleCount: 100, origin: { x: randomInRange(0, 0.2), y: randomInRange(0.1, 0.3) } }));
        confetti(Object.assign({}, defaults, { particleCount: 100, origin: { x: randomInRange(0.8, 1), y: randomInRange(0.1, 0.3) } }));
    } else if (winMethod === 3) {
        confetti({ angle: 270, spread: 400, particleCount: 150, origin: { x: 0.5, y: 0 } });
    }
}

function convertDateFormat(dateStr) {
    return dateStr.replace(/-/g, '/').replace(/\/0(\d)\//, '/$1/');
}