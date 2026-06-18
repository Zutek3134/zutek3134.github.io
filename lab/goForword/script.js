let AW, CWS, PUZZLES;
let sw, tw, Par, TMax, T, H = [];
let dtS, todayDtS, tID, lsState, archivePicker;
let D = !1, freePlay = !1, isGameLoaded = !1, isModalClosed = !0, W_state = !1, isLanding = !0;

const Sync = {
    // s: [Played, Wins, Speeders, Purists, Encores]
    // k: [Current, State, ProbWins, WindowEnd, LastWin]
    data: { s: [0, 0, 0, 0, 0], k: [0, 1, 0, "", ""] },

    saveLocal: function () {
        localStorage.setItem('gfw_stats', btoa(JSON.stringify(this.data)));
    },

    migrateOldData: function () {
        let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
        let dates = Object.keys(db).filter(k => k.match(/^\d{4}-\d{2}-\d{2}-\d$/)).sort();

        let played = 0, wins = 0, trophies = 0, purists = 0, encores = 0;
        let winDates = new Set();

        dates.forEach(d => {
            let dateStr = d.substring(0, 10);
            if (dateStr < "2026-05-28") return;

            let pts = db[d].split('|');
            if (pts[1] === '1') played++;
            if (pts[2] === '1') {
                wins++;
                if (d.endsWith('-2')) encores++;
                if (d.endsWith('-1')) winDates.add(dateStr);

                let oldH = pts[0].split(',');
                let isPurist = oldH.every(w => CWS.has(w));
                let puzzleData = PUZZLES[d];
                let isTrophy = puzzleData && ((oldH.length - 1) <= puzzleData[2]);

                if (isTrophy) trophies++;
                if (isPurist) purists++;
            }
        });

        let currentS = 0, state = 1, probWins = 0, windowEnd = "", lastW = "";

        if (winDates.size > 0) {
            let sortedWins = Array.from(winDates).sort();
            let firstPts = sortedWins[0].split('-');
            let currD = new Date(firstPts[0], firstPts[1] - 1, firstPts[2]);
            let lastPts = sortedWins[sortedWins.length - 1].split('-');
            let lastDate = new Date(lastPts[0], lastPts[1] - 1, lastPts[2]);

            while (currD <= lastDate) {
                let dtStr = currD.getFullYear() + '-' + String(currD.getMonth() + 1).padStart(2, '0') + '-' + String(currD.getDate()).padStart(2, '0');
                let wonToday = winDates.has(dtStr);

                if (state === 1) {
                    if (wonToday) {
                        if (!lastW) currentS = 0; else currentS++;
                        lastW = dtStr;
                    } else {
                        state = 2;
                        let windowDays = Math.max(3, Math.floor(currentS / 10));
                        let endD = new Date(currD);
                        endD.setDate(endD.getDate() + windowDays);
                        windowEnd = endD.getFullYear() + '-' + String(endD.getMonth() + 1).padStart(2, '0') + '-' + String(endD.getDate()).padStart(2, '0');
                        probWins = 0;
                    }
                } else if (state === 2) {
                    if (dtStr > windowEnd) {
                        currentS = 0; state = 1;
                        if (wonToday) lastW = dtStr; else lastW = "";
                    } else {
                        if (wonToday) {
                            probWins++;
                            if (probWins >= 3) {
                                state = 1; currentS++; lastW = dtStr; probWins = 0;
                            }
                        } else {
                            probWins = 0;
                        }
                    }
                }
                currD.setDate(currD.getDate() + 1);
            }
        }

        this.data = { s: [played, wins, trophies, purists, encores], k: [currentS, state, probWins, windowEnd, lastW] };
        this.saveLocal();
    },

    evalStreak: function () {
        try {
            let local = localStorage.getItem('gfw_stats');
            if (local) {
                let parsed = local.startsWith('{') ? JSON.parse(local) : JSON.parse(atob(local));
                this.data = parsed;
                this.saveLocal();
            } else {
                this.migrateOldData();
            }

            if (!this.data.k[4] || !todayDtS) return;

            let lastWin = new Date(this.data.k[4]);
            let today = new Date(todayDtS);
            let diff = Math.floor((today - lastWin) / 86400000);

            if (this.data.k[1] === 1 && diff >= 2) {
                this.data.k[1] = 2;
                let windowDays = Math.max(3, Math.floor(this.data.k[0] / 10));
                let endD = new Date(today);
                endD.setDate(endD.getDate() + windowDays);
                this.data.k[3] = endD.toISOString().split('T')[0];
                this.data.k[2] = 0;
            } else if (this.data.k[1] === 2) {
                if (todayDtS > this.data.k[3]) {
                    this.data.k[0] = 0; this.data.k[1] = 1;
                } else if (diff >= 2) {
                    this.data.k[2] = 0;
                }
            }
            this.saveLocal();
        } catch (e) {
            console.error("Streak Eval Error:", e);
            this.migrateOldData();
        }
    },

    pushToCloud: function () {
        try {
            if (typeof PlayFabClientSDK === 'undefined' || typeof LZString === 'undefined') return;
            if (!PlayFabClientSDK.IsClientLoggedIn()) return;

            let db = localStorage.getItem('gfw_db') || '{}';
            let payload = JSON.stringify({ stats: this.data, db: JSON.parse(db) });
            let compressed = LZString.compressToBase64(payload);

            PlayFabClientSDK.UpdateUserData({ Data: { "GameData": compressed } }, (result, error) => {
                if (result) {
                    msg("Progress synced to cloud.");
                }
            });
        } catch (e) { console.warn("Cloud push skipped"); }
    },

    track: function (endState, winState, currentMask) {
        try {
            let oldMask = currentMask || 0;
            let isPurist = H.every(w => CWS.has(w));
            let mask = 0;

            if (endState) mask |= 1;
            if (winState) mask |= 2;
            if (winState && (TMax - T) <= Par) mask |= 4;
            if (winState && isPurist) mask |= 8;

            let baseDate = dtS.substring(0, 10);
            if (baseDate < "2026-05-28") return mask | oldMask;

            let newBits = mask & ~oldMask;

            if (newBits > 0) {
                if (newBits & 1) this.data.s[0]++;
                if (newBits & 2) {
                    this.data.s[1]++;

                    if (!this.data.k[4]) {
                        this.data.k[0] = 0;
                    } else if (this.data.k[1] === 1 && this.data.k[4] !== todayDtS) {
                        this.data.k[0]++;
                    } else if (this.data.k[1] === 2 && this.data.k[4] !== todayDtS) {
                        this.data.k[2]++;
                        if (this.data.k[2] >= 3) { this.data.k[1] = 1; this.data.k[0]++; }
                    }
                    this.data.k[4] = todayDtS;
                    if (dtS.endsWith('-2')) this.data.s[4]++;
                }
                if (newBits & 4) this.data.s[2]++;
                if (newBits & 8) this.data.s[3]++;

                this.saveLocal();
                this.pushToCloud();
            }
            return mask | oldMask;
        } catch (e) { return currentMask || 0; }
    }
};

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
    let pts = db[dtS] ? db[dtS].split('|') : [];
    let oldEnd = pts[1] === '1';
    let oldMask = pts[3] ? parseInt(pts[3]) : 0;

    let newMask = Sync.track(endState, winState, oldMask);

    if (freePlay && newMask === oldMask) return;

    let finalH = oldEnd ? pts[0] : H.join(',');
    let finalEnd = oldEnd ? 1 : (endState ? 1 : 0);
    let finalWin = oldEnd ? pts[2] : (winState ? 1 : 0);

    db[dtS] = `${finalH}|${finalEnd}|${finalWin}|${newMask}`;
    localStorage.setItem('gfw_db', JSON.stringify(db));

    if (archivePicker && typeof archivePicker.redraw === 'function') {
        try { archivePicker.redraw(); } catch (e) { }
    }
};

const checkArchiveUnlock = () => {
    if (!todayDtS) return;
    let db = JSON.parse(localStorage.getItem('gfw_db') || '{}');
    let tData = db[todayDtS + '-1'];

    if (tData && tData.split('|')[1] === '1') {
        let effectiveStreak = Sync.data.k[1] === 2 ? 0 : (Sync.data.k[0] * 2);

        let minD = new Date(todayDtS.replace(/-/g, '/'));
        minD.setDate(minD.getDate() - effectiveStreak);

        let minDateStr = minD.getFullYear() + '-' + String(minD.getMonth() + 1).padStart(2, '0') + '-' + String(minD.getDate()).padStart(2, '0');

        if (minDateStr < '2026-05-28') minDateStr = '2026-05-28';

        let statusTxt = q('#archive-status-text');
        if (statusTxt) {
            if (Sync.data.k[1] === 2) {
                statusTxt.innerText = "Archive locked when there is no streak. Requires signing in to save.";
            } else if (effectiveStreak === 0) {
                statusTxt.innerText = "Build a streak to unlock past puzzles. Requires signing in to save.";
            } else {
                statusTxt.innerText = `Past ${effectiveStreak} puzzles unlocked.`;
            }
        }

        if (archivePicker) {
            archivePicker.set('minDate', minDateStr);
            archivePicker.setDate(dtS.substring(0, 10));
        } else {
            let dIn = q('#archive-date');
            if (dIn) {
                dIn.min = minDateStr;
                dIn.max = todayDtS;
                if (!dIn.value) dIn.value = dtS.substring(0, 10);
            }
        }
    }
};

const renderLanding = () => {
    q('#loader').style.display = 'none';

    let gb = q('#game-board');
    gb.classList.add('display-none');

    let lp = q('#landing-page');
    lp.classList.remove('display-none');

    let lDate = q('#landing-date');
    if (lDate) lDate.innerText = convertDateFormat(dtS.substring(0, 10));

    let statusTxt = "";
    let btnTxt = "";

    if (H.length === 1) {
        statusTxt = "Ready to Play";
        btnTxt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="twemoji">
                            <path d="M8 5.14v14l11-7z" />
                        </svg>
                        <span>Play Puzzle</span>`;
    } else if (!D) {
        statusTxt = "In Progress";
        btnTxt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="twemoji">
                            <path d="M8 5.14v14l11-7z" />
                        </svg>
                        <span>Continue Playing</span>`;
    } else if (W_state) {
        statusTxt = "Solved";
        btnTxt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="twemoji">
        <path d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
        </svg>
        <span>Admire Result</span>`;
        q('#btn-landing-archive').classList.remove('display-none');
    } else {
        statusTxt = "Failed";
        btnTxt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="twemoji">
        <path d="M12 9a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5 5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/>
        </svg>
        <span>View Result</span>`;
        q('#btn-landing-archive').classList.remove('display-none');
    }

    // let lStatus = q('#landing-status');
    // if (lStatus) lStatus.innerText = statusTxt;

    let bPlay = q('#btn-play-main');
    if (bPlay) {
        bPlay.innerHTML = btnTxt;
        bPlay.onclick = () => {
            isLanding = !1;
            lp.classList.add('display-none');
            gb.classList.remove('display-none');
            renderGame();
        };
    }

    checkArchiveUnlock();
};

const renderGame = () => {
    if (isLanding) {
        renderLanding();
        return;
    }

    q('#loader').style.display = 'none';
    q('#landing-page').classList.add('display-none');
    q('#game-board').classList.remove('display-none');
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
    r.innerHTML = `<div class="step">${idx}</div><div class="word-diff">${idx ? DH(p, w) : w}</div><span class="twemoji">${CWS.has(w) ? '' : '<svg title="Uncommon" class="mar-r-0" viewBox="0 0 24 24"><path d="M18 22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-6v7L9.5 7.5 7 9V2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" /></svg></span>'}`;
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
    q('#post-end-area').classList.add('display-none');

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
    q('#landing-diff').innerText = diff_label;

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
            T = TMax - (H.length - 1);
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
    window.scrollToTop();

    D = !0;
    W_state = W;

    if (!freePlay) saveGame(!0, W);
    checkArchiveUnlock();

    q('h1').scrollIntoView({ behavior: 'smooth', block: 'end' });
    q('#ig').style.display = 'none';
    q('#end-panel').style.display = 'flex';
    q('#post-end-area').classList.remove('display-none');

    let et = q('#end-title');
    let isCompleted = H[H.length - 1] === tw;
    let wonTries = TMax - T;
    let winMethod = 0, winText = 'For the word is gone...', winEmoji = ' 💀';

    if (W) {
        if (wonTries <= Par) { winMethod = 1; winText = 'You’ve gone for the word!'; winEmoji = ' ⏱️'; }
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

    let noUncommonEmoji = H.every(w => CWS.has(w)) ? ' 🗣️' : '';

    et.innerText = winText + winEmoji + noUncommonEmoji;
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
        cBtn.style.textDecoration = 'underline 0.5px solid';
        cBtn.style.marginTop = '1em';
        cBtn.style.fontSize = '0.9em';
        cBtn.style.opacity = '0.5';
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

            let currentDtS = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
            if (currentDtS !== todayDtS) {
                todayDtS = currentDtS;
                if (archivePicker && typeof archivePicker.set === 'function') {
                    archivePicker.set('maxDate', todayDtS);
                }
                msg("The new daily puzzle is available.");

                if (D && !freePlay) {
                    setTimeout(() => { loadPuzzle(todayDtS, 1); }, 2000);
                }
            }
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

    Sync.evalStreak();

    let aDateIn = q('#archive-date');
    if (aDateIn) {
        if (typeof flatpickr !== 'undefined') {
            archivePicker = flatpickr(aDateIn, {
                inline: true,
                minDate: "2026-05-20",
                maxDate: todayDtS,
                disableMobile: true,
                dateFormat: "Y-m-d",
                onChange: function (selectedDates, dateStr, instance) {
                    if (dateStr && dateStr <= todayDtS && dateStr >= '2026-05-20') {
                        isLanding = !1;
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

                if (sel && sel <= todayDtS && sel >= '2026-05-20') {
                    isLanding = !1;
                    loadPuzzle(sel, 1);
                }
                else msg("Invalid date!");
            });
        }
    }

    loadPuzzle(todayDtS, 1);
};

const showStats = () => {
    let d = Sync.data;
    q('#st-played').innerText = d.s[0];
    q('#st-winpct').innerText = d.s[0] > 0 ? Math.round((d.s[1] / d.s[0]) * 100) : '0';

    let streakElem = q('#st-streak');
    streakElem.innerText = d.k[0];

    q('#probation-banner').classList.toggle('display-none', !(d.k[1] === 2));
    if (d.k[1] === 2) {
        // Revive
        for (let index = 1; index <= 3; index++) {
            q('#step-node-' + index).classList.toggle('filled', index <= d.k[2]);
        }
    } else {
        // Normal
    }

    q('#cab-recommendedSteps').innerText = d.s[2];
    q('#cab-allCommon').innerText = d.s[3];
    q('#cab-encoresCha').innerText = d.s[4];

    openModal('stats');
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
            saveGame(!0, W_state);
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

window.scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.scrollToTop();

if (window.DiscordPlayFabAuth) {
    window.DiscordPlayFabAuth.init();
} else {
    console.error("CRITICAL: window.DiscordPlayFabAuth is undefined!");
}

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

q('#btn-generate-snapshot').onclick = async () => {
    const captureTarget = q("#capture-snapshot");
    msg("Generating snapshot...");

    htmlToImage.toPng(captureTarget, {
        pixelRatio: 2,
        skipLogging: true,
        backgroundColor: getComputedStyle(document.body).getPropertyValue('background-color').trim(),
        width: captureTarget.offsetWidth + 40,
        height: captureTarget.offsetHeight + 20,
        style: {
            padding: '15px 20px 0 20px',
            margin: '0'
        }
    })
        .then((imgData) => {
            q('#shareImg').src = imgData;
            q('#shareImg').parentElement.href = imgData;
            openModal('snapshot');
            msg("Snapshot generated.");
        })
        .catch((e) => {
            console.error(e);
            msg("Snapshot generation failed.");
        });
};

window.addEventListener("DiscordAuthSuccess", (e) => {
    const landingSigninBtn = q('#btn-landing-discord-sign-in');
    const ingameSigninBtn = q('#btn-discord-login');

    landingSigninBtn.classList.add('disabled');
    landingSigninBtn.querySelector('span').innerText = "Signed In";
    landingSigninBtn.removeAttribute('onclick');
    landingSigninBtn.disabled = true;

    ingameSigninBtn.innerText = e.detail.unique_username;
    ingameSigninBtn.onclick = showStats;

    msg('Signed in as ' + e.detail.global_name + '.');

    q('#stats-globalName').innerText = e.detail.global_name;
    q('#stats-uniqueUsername').innerText = '@' + e.detail.unique_username;

    if (typeof PlayFabClientSDK !== 'undefined') {
        PlayFabClientSDK.GetUserData({}, (result) => {
            if (result && result.data && result.data.Data && result.data.Data.GameData) {
                try {
                    let cloudStr = LZString.decompressFromBase64(result.data.Data.GameData.Value);
                    let cloudData = JSON.parse(cloudStr);

                    let localDb = JSON.parse(localStorage.getItem('gfw_db') || '{}');
                    let localStatsStr = localStorage.getItem('gfw_stats');
                    let localStats = localStatsStr ? (localStatsStr.startsWith('{') ? JSON.parse(localStatsStr) : JSON.parse(atob(localStatsStr))) : null;

                    let needsCloudPush = !1;

                    if (cloudData.db) {
                        for (let key in cloudData.db) {
                            if (!localDb[key]) {
                                localDb[key] = cloudData.db[key];
                            } else {
                                let localMask = parseInt(localDb[key].split('|')[3] || 0);
                                let cloudMask = parseInt(cloudData.db[key].split('|')[3] || 0);
                                if (cloudMask > localMask) localDb[key] = cloudData.db[key];
                                else if (localMask > cloudMask) needsCloudPush = !0;
                            }
                        }
                        localStorage.setItem('gfw_db', JSON.stringify(localDb));
                    }

                    if (cloudData.stats) {
                        if (!localStats || cloudData.stats.s[0] > localStats.s[0]) {
                            Sync.data = cloudData.stats;
                            Sync.saveLocal();
                        } else if (localStats && localStats.s[0] > cloudData.stats.s[0]) {
                            needsCloudPush = !0;
                        }
                    }

                    if (needsCloudPush) {
                        Sync.pushToCloud();
                    }

                    if (typeof dtS !== 'undefined' && dtS) {
                        const parts = dtS.split('-');
                        loadPuzzle(parts[0] + '-' + parts[1] + '-' + parts[2], parseInt(parts[3]));
                    }

                    let sModal = document.querySelector('#stats-modal');
                    if (sModal && !sModal.classList.contains('display-none') && typeof showStats === 'function') {
                        showStats();
                    }
                } catch (e) { }
            }
        });
    }
});