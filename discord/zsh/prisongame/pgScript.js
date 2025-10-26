let userDict = {};

if (sessionStorage.getItem('userDict')) {
    try {
        userDict = JSON.parse(sessionStorage.getItem('userDict'));
    } catch (e) {
        console.error('Failed to parse sessionStorage userDict:', e);
        userDict = {};
    }
}

const FETCH_INTERVAL = 200; // ms delay between API calls
let fetchQueue = [];
let fetchTimer = null;

function scheduleFetch(element) {
    fetchQueue.push(element);
    if (!fetchTimer) processQueue();
}

function processQueue() {
    if (fetchQueue.length === 0) {
        fetchTimer = null;
        return;
    }
    const element = fetchQueue.shift();
    processUserProfile(element);
    fetchTimer = setTimeout(processQueue, FETCH_INTERVAL);
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

async function fetchDiscordProfile(uid, retries = 2, delay = 1000) {
    const apiUrl = 'https://cors-anywhere.com/https://avatar-cyan.vercel.app/api/' + uid;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            if (response.status >= 500 && retries > 0) {
                // Retry after short delay for temporary server errors
                await new Promise(res => setTimeout(res, delay));
                return fetchDiscordProfile(uid, retries - 1, delay * 1.5);
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.avatarUrl) throw new Error('Invalid API structure');
        return data;
    } catch (error) {
        // Only log once per UID to avoid spam
        if (!fetchInProgress.has(`logged_${uid}`)) {
            console.warn(`Failed to fetch profile for ${uid}:`, error.message);
            fetchInProgress.add(`logged_${uid}`);
        }
        return null;
    }
}

function updateAllElementsWithProfile(uid, profile) {
    const dataName = `[data-uid="${uid}"]`;
    const elements = Array.prototype.slice.call(document.querySelectorAll('li' + dataName)).concat(Array.prototype.slice.call(document.querySelectorAll('.grid-item' + dataName)));
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

function applyUserProfile(element, username = null, usertag = "discord_srvr_err", pfp = "/discord/zsh/images/pfp/default.jpg") {
    if (username && username.startsWith("deleted_user_")) username = null;

    const full = element.querySelector('.full-username');
    const code = element.querySelector('code');
    const img = element.querySelector('img');

    if (full) full.textContent = username || element.getAttribute('data-fallback');
    if (code) code.textContent = usertag;
    if (img) {
        img.setAttribute('data-src', pfp);
        loadLazyImg(img);
    }
}

document.querySelectorAll('li[data-uid], .grid-item[data-uid]').forEach(scheduleFetch);

const medalMemberButton = document.getElementById('medal-button-member');
const medalCountryButton = document.getElementById('medal-button-country');
const medalMemberList = document.getElementById('medal-member');
const medalCountryList = document.getElementById('medal-country');
const medalListHolder = document.getElementById('medal-list-holder');
const medalHiddenToggle = document.getElementById('medal-hidden-toggle');
let curType = "member";

function switchView(type) {
    if (curType === type)
        return;

    medalMemberButton.classList.toggle('btn-fill');
    medalCountryButton.classList.toggle('btn-fill');
    medalMemberList.classList.toggle('display-none');
    medalCountryList.classList.toggle('display-none');
    curType = type;
}

function toggleHidden() {
    medalListHolder.classList.toggle("show-hidden-entry");
    medalHiddenToggle.classList.toggle("btn-fill");
}