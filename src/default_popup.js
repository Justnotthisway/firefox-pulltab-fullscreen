function openSettings() {
    window.location.href = 'settings.html';
}

function showPullTab()
{
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, { action: "showPullTab"});
    });
}

document.addEventListener('DOMContentLoaded', () => {
    main();
});

function main() {
    document.getElementById("button_fullscreen").addEventListener('click', () => {
        // Toggle visibility of the taskbar
        showPullTab();
    });
    document.getElementById("button_settings").addEventListener('click', () => {
        openSettings();
    });
}


