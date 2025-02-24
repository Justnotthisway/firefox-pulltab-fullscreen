// Load the pulltab.html file
const pullTabUrl = browser.runtime.getURL("pulltab.html");
// loadUserSettings();
document.addEventListener("fullscreenchange", handleFullscreenChange);

// --- outsourced functions (for readability) ---

//function to set current webpage in fullscreen
function toggleFullscreen() {
  if (document.fullscreenElement)//returns true if Page is in fullscreen
  {
    document.exitFullscreen();
  }
  else {
    document.documentElement.requestFullscreen();
  }
}
// function to hide the pulltab in fullscreen and make it reapear when leaving fullscreen
function handleFullscreenChange() {
  const pullTab = document.getElementById('pull-tab');
  
  if (document.fullscreenElement) {
    // Entering fullscreen
    pullTab.style.display = "none";
  } else {
    // Exiting fullscreen
    pullTab.style.display = "flex"; // or "flex", depending on your layout
  }
}
// function that opens the settings page
function openSettings() {
  window.location.href = 'settings.html';
}

function showContextButtons()
{
  // document.getElementById('save-button').style.display='flex';
  document.getElementById('fullscreen-icon').style.display='none';
  document.getElementById('back-button').style.display='flex';
  // document.getElementById('brightness-button').style.display='flex';
}

function hideContextButtons()
{
  document.getElementById('save-button').style.display='none';
  document.getElementById('fullscreen-icon').style.display='flex';
  document.getElementById('back-button').style.display='none';
  document.getElementById('brightness-button').style.display='none';
}

function changeTheme()
{

}

function saveCurrentSettings()
{
  const pullTab = document.getElementById('pull-tab')
  let settingsData = {};
  settingsData.height = pullTab.style.top;
  settingsData.pinRight = (pullTab.className == 'pull-tab-right');
  settingsData.darkTheme = true;

    browser.storage.local.set(settingsData).then(() => {
      console.log("Height:", settingsData.height);
      console.log("Pin Right:", settingsData.pinRight);
      console.log("Dark Theme:", settingsData.darkTheme);
      console.log("Settings saved");
    }).catch((error) => {
        console.error("Error saving settings:", error);
    });
}

function loadUserSettings() {
  const pullTab = document.getElementById('pull-tab');
  browser.storage.local.get(settingsData).then((result) => {
      console.log("apply Height:", result.height);
      console.log("apply Pin Right:", result.pinRight);
      console.log("apply Dark Theme:", result.darkTheme);
  }).catch((error) => {
      console.error("Error retrieving settings:", error);
  });
  //apply right/left pinning
  if(result.pinRight)
  {
    pullTab.classList.remove('pull-tab-left')
    pullTab.classList.add('pull-tab-right');
  }
  else{
    pullTab.classList.remove('pull-tab-right');
    pullTab.classList.add('pull-tab-left')
  }
  //apply vertical positioning
  pullTab.style.top = result.height;
  //apply theme

  // browser.storage.sync.get(data).then(data => {
  //     Object.keys(data).forEach(key => {
  //         const element = document.getElementById(key);
  //         if (element) {
  //             element.value = data[key];
  //         }
  //     });
  // });
}
//main code starts here

let isDragging = false;
let wasDragging = false;
let longPressTimer;
let startX, startY;
let pinLeft = false;

// --- eventlistener functions ---
function handlePointerDown(e) {
  const pullTab = document.getElementById('pull-tab');
  startX = e.clientX - pullTab.offsetLeft;
  startY = e.clientY - pullTab.offsetTop;

  wasDragging = false; // Reset wasDragging at the start of interaction

  longPressTimer = setTimeout(() => {

    isDragging = true;
    wasDragging = true;
    pullTab.style.cursor = "grabbing";

    //show additional context buttons here, hide again in handlePointerUp()
    showContextButtons();

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    // vibrate to let the user know of longpress interaction, also animation for same reason
    // navigator.vibrate(200);
  }, 500); // 500ms for long press
}

function handlePointerMove(e) {
  const pullTab = document.getElementById('pull-tab');
  if (isDragging) {
    e.preventDefault();

    let newY = e.clientY - startY;
    pullTab.style.top = `${newY}px`;

    //put the pulltab on left edge
    if (e.clientX < (screen.availWidth / 2)) {
      pullTab.className = "pull-tab-left";
    }
    //put the pulltab on right edge (Standard Case)
    if (e.clientX > (screen.availWidth / 2)) {
      pullTab.className = "pull-tab-right";
    }

  }
}

function handlePointerUp(e) {
  const pullTab = document.getElementById('pull-tab');
  clearTimeout(longPressTimer);
  isDragging = false;
  pullTab.style.cursor = "grab";
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
}
function handlePointerLeave(e) {
  if (!isDragging) {
    clearTimeout(longPressTimer);
  }
}
function handlePointerEnter(e) {
  if (isDragging) {
    const pullTab = document.getElementById('pull-tab');
    pullTab.style.cursor = "grabbing";
  }
}

// VOID MAIN - not necessary in js, just for some order
function main() {

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "formData") {
      console.log("Settings Form data, received in content script:", message.data);
      console.log(message.data.setting_autoHide === 'true' ? true : false);

      settingsData.autohide = message.data.setting_autoHide === 'true' ? true : false;
      console.log("value of autohide:", settingsData.autohide);
      // Process the form data here as needed
    }
    if (message.action === "showPullTab") {
      document.getElementById('pull-tab').style.display = "";
    }
  });

  fetch(pullTabUrl).then(response => response.text()).then(html => {
    // Create a container for the pull tab
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    // Add event listener for the pull tab click
    const pullTab = document.getElementById('pull-tab');
    const fullscreenTab = document.getElementById('fullscreen-icon');

    const contextButtonBack = document.getElementById('back-button');
    const contextButtonBrightness = document.getElementById('brightness-button');
    const contextButtonSave = document.getElementById('save-button');

    fullscreenTab.addEventListener('click', () => {
      if (!wasDragging) {
        toggleFullscreen();
      }
      wasDragging = false;
    });

    pullTab.addEventListener('pointerdown', handlePointerDown);
    pullTab.addEventListener('pointerleave', handlePointerLeave);
    pullTab.addEventListener('pointerenter', handlePointerEnter);
    pullTab.addEventListener('pointerup', () => {
      setTimeout(() => {
        wasDragging = false;
      }, 0);
    });

    contextButtonBack.addEventListener('pointerup', () =>{
      hideContextButtons();
    })
    contextButtonSave.addEventListener('pointerup', () =>{
      saveCurrentSettings();
    })

  })
    .catch(error => {
      console.error('Error loading pull tab:', error);
    });
}

main();

