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
        (result.keywords || [])
            .map(k => k.toLowerCase());

    enabled =
        result.enabled !== false;
}

browser.storage.onChanged.addListener(loadKeywords);

function getCurrentSongTitle() {
    const titleElement = document.querySelector(
        "ytmusic-player-bar .title"
    );

    return titleElement?.textContent?.trim() || "";
}

function skipSong() {
    const nextButton = document.querySelector('[aria-label*="Next"]').click()

    if (nextButton) {
        console.log("YTMSFilter: Skipping song");
        nextButton.click();
    }
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

    console.log("YTMSFilter: Now playing:", title);

    const lowerTitle = title.toLowerCase();

    const shouldSkip = keywords.some(keyword =>
        lowerTitle.includes(keyword)
    );

    if (shouldSkip) {
        console.log("YTMSFilter: keyword found... skipping - ", title);
        setTimeout(skipSong, 125);
    }
}

function observeSongChanges() {
    const playerBar = document.querySelector(
        "ytmusic-player-bar"
    );

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

    console.log("YTMSFilter: Observer attached");

    checkSong();
}

async function init() {
    await loadKeywords();
    observeSongChanges();
}

init();