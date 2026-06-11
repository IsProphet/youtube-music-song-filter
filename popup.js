const textarea = document.getElementById("keywords");
const saveButton = document.getElementById("save");
const enabledCheckbox = document.getElementById("enabled");

async function loadKeywords() {
    const result = await browser.storage.local.get([
        "keywords",
        "enabled"
    ]);

    textarea.value = (result.keywords || []).join("\n");

    enabledCheckbox.checked =
        result.enabled !== false;
}


saveButton.addEventListener("click", async () => {
    const keywords = textarea.value
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    await browser.storage.local.set({
    keywords,
    enabled: enabledCheckbox.checked
});

    window.close();
});

loadKeywords();