document.addEventListener('DOMContentLoaded', loadUserSettings());
let settingsData = {
    autohide: 'true',
    height: '50%',
    pinRight: 'true',
    darkTheme: 'true'
}

// saveUserSettings --- not important right now. all important stuff can be save through the contextButtonSave 
document.querySelector('form').addEventListener('submit', function (e) {

    e.preventDefault();


    
    // const formData = new FormData(this);
    // const data = Object.fromEntries(formData);

    // browser.storage.sync.set(data)

    // browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    //     browser.tabs.sendMessage(tabs[0].id, { action: "formData", data: data });
    // });
});

function saveUserSettings()
{
    settingsData.height = document.getElementById('pull-tab').style.position.

    browser.storage.local.set(settingsData).then(() => {
        console.log("Settings saved");
    }).catch((error) => {
        console.error("Error saving settings:", error);
    });
    
    //load user settings here so changes are applied directly
    loadUserSettings();
}
function loadUserSettings() {

    browser.storage.local.get(settingsData).then((result) => {
        console.log("Autohide:", result.autohide);
        console.log("Height:", result.height);
        console.log("Pin Right:", result.pinRight);
        console.log("Dark Theme:", result.darkTheme);
    }).catch((error) => {
        console.error("Error retrieving settings:", error);
    });
    return result;

    // browser.storage.sync.get(data).then(data => {
    //     Object.keys(data).forEach(key => {
    //         const element = document.getElementById(key);
    //         if (element) {
    //             element.value = data[key];
    //         }
    //     });
    // });
}

