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

function applyUserProfile(element, username = null, usertag = "internet_error", pfp = "/discord/zsh/images/pfp/default.jpg") {
    if (username.startsWith("deleted_user_"))
        username = null;

    element.querySelector('.full-username').textContent = username || element.getAttribute('data-fallback');
    element.querySelector('code').textContent = usertag;
    element.querySelector('img').src = pfp;
}

document.querySelectorAll('li').forEach(element => processUserProfile(element));
document.querySelectorAll('.grid-item').forEach(element => processUserProfile(element));

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