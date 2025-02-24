document.addEventListener('DOMContentLoaded', loadFormData);

document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    browser.storage.sync.set(data)

    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        browser.tabs.sendMessage(tabs[0].id, { action: "formData", data: data });
    });
});

function loadFormData() {
    browser.storage.sync.get(data).then(data => {
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
            }
        });
    });
}

