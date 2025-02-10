const userLang = navigator.language || navigator.userLanguage;

document.querySelectorAll(".reactions .item").forEach(item => {
    let countSpan = item.querySelector("span");
    let originalCount = parseInt(countSpan.textContent, 10);
    let currentCount = originalCount;
    let resetTimeout;

    item.addEventListener("click", function () {
        clearTimeout(resetTimeout);
        currentCount++;

        let tempSpan = document.createElement("span");
        tempSpan.textContent = currentCount;
        tempSpan.classList.add("count-up");
        countSpan.replaceWith(tempSpan);
        countSpan = tempSpan;

        item.classList.add("active");

        resetTimeout = setTimeout(() => {
            currentCount = originalCount;
            let resetSpan = document.createElement("span");
            resetSpan.textContent = originalCount;
            resetSpan.classList.add("count-down");
            countSpan.replaceWith(resetSpan);
            countSpan = resetSpan;
            item.classList.remove("active");
        }, 1000);
    });
});

document.querySelectorAll("[data-year]").forEach(element => {
    const year = element.getAttribute('data-year');
    if (userLang.startsWith("zh-TW")) {
        const rocYear = year - 1911;
        element.innerHTML = `<span class="hanLat hl-r">${rocYear}</span>年`;
    } else {
        element.textContent = year;
    }
})

let userDict = {};

if (sessionStorage.getItem('userDict')) {
    try {
        userDict = JSON.parse(sessionStorage.getItem('userDict'));
    } catch (e) {
        console.error('Failed to parse sessionStorage userDict:', e);
        userDict = {};
    }
}

let fetchInProgress = new Set();

function processUserProfile(element) {
    const uid = element.getAttribute('data-uid');
    if (!uid || fetchInProgress.has(uid)) return;

    if (userDict[uid]) {
        updateAllElementsWithProfile(uid, userDict[uid]);
    } else {
        fetchInProgress.add(uid);
        fetchDiscordProfile(uid)
            .then(fetchedProfile => {
                if (fetchedProfile && fetchedProfile.avatarUrl) {
                    userDict[uid] = fetchedProfile;
                    sessionStorage.setItem('userDict', JSON.stringify(userDict));
                    updateAllElementsWithProfile(uid, fetchedProfile);
                } else {
                    console.error('Invalid profile format:', fetchedProfile);
                    updateAllElementsWithProfile(uid, null);
                }
            })
            .catch(error => {
                console.error('Error fetching profile for UID', uid, error);
                updateAllElementsWithProfile(uid, null);
            })
            .finally(() => {
                fetchInProgress.delete(uid);
            });
    }
}

async function fetchDiscordProfile(uid) {
    const apiUrl = 'https://avatar-cyan.vercel.app/api/' + uid;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching the API data for UID:', uid, error);
        return null;
    }
}

function updateAllElementsWithProfile(uid, profile) {
    const dataName = `[data-uid="${uid}"]`;
    const elements = document.querySelectorAll('.message' + dataName);
    elements.forEach(element => {
        if (profile) {
            applyUserProfile(
                element,
                profile.display_name,
                profile.username,
                profile.avatarUrl
            );
        } else {
            applyUserProfile(element);
        }
    });
}

function applyUserProfile(element, username = null, usertag = null, pfp = "/discord/zsh/images/pfp/default.jpg") {
    const nameElement = element.querySelector('#name');
    nameElement.textContent = usertag || element.getAttribute('data-fallback');
    element.style.setProperty('--pfp-url', `url("${pfp}")`);

    const utcTimestamp = element.getAttribute("data-timestamp");
    const date = new Date(utcTimestamp);

    const chungYuenOffset = 8 * 60;
    const localDate = new Date(date.getTime() + chungYuenOffset * 60 * 1000);
    const subElement = document.createElement("sub");

    if (userLang.startsWith("zh-TW")) {
        const rocYear = localDate.getFullYear() - 1911;
        subElement.innerHTML = `<span class="hanLat hl-r">${rocYear}</span>年<span class="hanLat">${localDate.getMonth() + 1}</span>月<span class="hanLat">${localDate.getDate()}</span>日<span class="hanLat">${localDate.getHours()}</span>時<span class="hanLat">${localDate.getMinutes()}</span>分`;
    } else {
        subElement.textContent = date.toLocaleString();
    }

    nameElement.appendChild(subElement);
}

document.querySelectorAll('.message').forEach(element => processUserProfile(element));