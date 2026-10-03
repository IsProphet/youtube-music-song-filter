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
    try {
        const result = await browser.storage.local.get([
            "keywords",
            "enabled"
        ]);
        keywords =
            (result.keywords || []).map(k => k.toLowerCase());
        enabled =
            result.enabled !== false;
    } catch (error) {
        console.error("YTM Song Filter: loadKeywords failed:", error);
        throw error;
    }
}

browser.storage.onChanged.addListener(loadKeywords);

function getCurrentSongTitle() {
    const titleElement = document.querySelector("div.ytmusicTrackInfoTitle");

    return titleElement?.textContent?.trim() || "";
}

function getNextButton() {
    return document.querySelector(
        'button.ytSpecButtonShapeNextHost[aria-label="Next"]'
    );
}

function skipSong() {
    const nextButton = getNextButton();

    if (!nextButton) {
        debugLog("Next button not found");
        return;
    }

    debugLog("Next button found — dispatching click");

    nextButton.dispatchEvent(
        new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );
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
    const titleElement = document.querySelector("div.ytmusicTrackInfoTitle");

    if (!titleElement) {
        debugLog("Song title element not found");
        setTimeout(observeSongChanges, 1000);
        return;
    }

    const observer = new MutationObserver(() => {
        checkSong();
    });

    observer.observe(titleElement, {
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