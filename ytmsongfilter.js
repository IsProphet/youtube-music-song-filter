const DEBUG = false;

function debugLog(...args) {
    if (DEBUG) {
        console.log("YTM Song Filter: ", ...args);
    }
}

let keywords = [];
let enabled = true;
let lastCheckedTitle = "";
let skipping = false;

async function loadKeywords() {
    const result = await browser.storage.local.get([
        "keywords",
        "enabled"
    ]);

    keywords =
        (result.keywords || []).map(k => k.toLowerCase());

    enabled =
        result.enabled !== false;
}

browser.storage.onChanged.addListener(loadKeywords);

function getCurrentSongTitle() {
    const titleElement = document.querySelector("ytmusic-player-bar .title");

    return titleElement?.textContent?.trim() || "";
}

function getNextButton() {
    return (
        document.querySelector(
            'ytmusic-player-bar button[aria-label="Next"]'
        ) ||
        document.querySelector(
            'ytmusic-player-bar .next-button button'
        ) ||
        document.querySelector(
            'ytmusic-player-bar .next-button'
        )
    );
}

function skipSong() {
    const nextButton = getNextButton();

    if (!nextButton) {
        debugLog("Next button not found");

        return;
    }

    nextButton.click();
}

function checkSong() {
    if (!enabled) {
        return;
    }

    const title = getCurrentSongTitle();

    if (!title || title === lastCheckedTitle) {
        return;
    }

    lastCheckedTitle = title;

    debugLog("Now playing:", title);

    const lowerTitle = title.toLowerCase();

    const shouldSkip = keywords.some(keyword => lowerTitle.includes(keyword));

    if (shouldSkip) {
        debugLog("Keyword found... skipping - ", title);
        setTimeout(skipSong, 50);
    }
}

function observeSongChanges() {
    const playerBar = document.querySelector("ytmusic-player-bar");

    if (!playerBar) {
        setTimeout(observeSongChanges, 1000);
        return;
    }

    const observer = new MutationObserver(() => {
        checkSong();
    });

    observer.observe(playerBar, {
        childList: true,
        subtree: true,
        characterData: true
    });

    debugLog("Observer attached");

    checkSong();
}

async function init() {
    await loadKeywords();
    observeSongChanges();
}

init();