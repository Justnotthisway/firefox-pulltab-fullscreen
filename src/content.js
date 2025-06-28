// Load the pulltab.html file
const pullTabUrl = browser.runtime.getURL("pulltab.html");
// IMPORTANT: Also get the absolute URL for your CSS file
const pullTabCssUrl = browser.runtime.getURL("pulltab.css");
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
    pullTab.style.pointerEvents = "none";

    // Reset drag state and explicitly disable dragging
    isDragging = false;
    wasDragging = false;
    clearTimeout(longPressTimer);
    document.removeEventListener('pointermove', handlePullTabPointerMove);
    document.removeEventListener('pointerup', handlePullTabPointerUp);
    canDrag = false;
    // When entering fullscreen, ensure any previous "ignore" state is cleared
    // ignorePullTabInputAfterFullscreen = false;
  } else {
    // Exiting fullscreen
    pullTab.style.display = "flex"; // or "flex", depending on your layout
    canDrag = false;
    // Set the flag to ignore pull tab input for a brief period
    ignorePullTabInputAfterFullscreen = true;
    setTimeout(() => {
      ignorePullTabInputAfterFullscreen = false;
      pullTab.style.pointerEvents = "auto";
      hideContextButtons(); 
      canDrag = true;
    }, 550);
  }
}

// function that opens the settings page
function openSettings() {
  window.location.href = 'settings.html';
}

function showContextButtons() {
  // document.getElementById('save-button').style.display='flex';
  document.getElementById('fullscreen-icon').style.display = 'none';
  document.getElementById('back-button').style.display = 'flex';
  document.getElementById('swap-button').style.display = 'flex';
  // document.getElementById('brightness-button').style.display='flex';
}

function hideContextButtons() {
  // document.getElementById('save-button').style.display='none';
  document.getElementById('fullscreen-icon').style.display = 'flex';
  document.getElementById('back-button').style.display = 'none';
  document.getElementById('swap-button').style.display = 'none';
  // document.getElementById('brightness-button').style.display='none';
}

function swapSide() {
  const pullTab = document.getElementById('pull-tab')

  if (pullTab.classList.contains("pull-tab-right")) {
    pullTab.className = "pull-tab-left";
  }
  else if (pullTab.classList.contains("pull-tab-left")) {
    pullTab.className = "pull-tab-right";
  }
}
function changeTheme() {

}

function saveCurrentSettings() {
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
  if (result.pinRight) {
    pullTab.classList.remove('pull-tab-left')
    pullTab.classList.add('pull-tab-right');
  }
  else {
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

let ignoreNextFullscreenClick = false; // necessary to prevent fullscreen being pressed after user exits contextmode/move-mode
let ignorePullTabInputAfterFullscreen = false;
let canDrag = true;

let longPressTimer;
let startX, startY;
let pinLeft = false;

// --- eventlistener functions ---
function handlePointerDown(e) {//fires when pulltab is pressed.
//will not do anything when we return from fullscreen via back-gesture
  if (!canDrag) {
    clearTimeout(longPressTimer); // Ensure any pending timer from a rapid tap is cleared
    return;
  }
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

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp, { passive: false });
    // vibrate to let the user know of longpress interaction, also animation for same reason
    // navigator.vibrate(200);
  }, 500); // 500ms for long press
}

function handlePointerMove(e) {//fires when pulltab is longpressed, then moved
  const pullTab = document.getElementById('pull-tab');
  if (isDragging) {
    e.preventDefault();

    let newY = e.clientY - startY;
    pullTab.style.top = `${newY}px`;

    // //put the pulltab on left edge
    // if (e.clientX < (screen.availWidth / 2)) {
    //   pullTab.className = "pull-tab-left";
    // }
    // //put the pulltab on right edge (Standard Case)
    // if (e.clientX > (screen.availWidth / 2)) {
    //   pullTab.className = "pull-tab-right";
    // }

  }
}

function handlePointerUp(e) {//fires once pulltab is released
  const pullTab = document.getElementById('pull-tab');
  clearTimeout(longPressTimer);
  isDragging = false;
  wasDragging = false;
  pullTab.style.cursor = "default";
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
}
// function handlePointerLeave(e) {
//   if (!isDragging) {
//     clearTimeout(longPressTimer);
//   }
// }
// function handlePointerEnter(e) {
//   if (isDragging) {
//     const pullTab = document.getElementById('pull-tab');
//     pullTab.style.cursor = "grabbing";
//   }
// }


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
  fetch(pullTabUrl).then(response => response.text()).then(html => {   //this line allows us to append our own js after the visited webpage
    // IMPORTANT CHANGE: Replace the placeholder with the actual, absolute CSS URL
    const modifiedHtml = html.replace('__PULLTAB_CSS_URL__', pullTabCssUrl);

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
    const contextButtonSwap = document.getElementById('swap-button');

    fullscreenTab.addEventListener('click', () => {
      if (wasDragging || ignoreNextFullscreenClick) {
        e.preventDefault(); // Prevent the default click action (e.g., if there's an href)
        e.stopImmediatePropagation(); // Stop any other click handlers on this element

        // Reset the flag immediately after consuming the unwanted click
        ignoreNextFullscreenClick = false;
        return; // Exit the function, do not toggle fullscreen
      }
      toggleFullscreen();
      wasDragging = false;
    });

    pullTab.addEventListener('pointerdown', handlePointerDown);
    // pullTab.addEventListener('pointerleave', handlePointerLeave);
    // pullTab.addEventListener('pointerenter', handlePointerEnter);
    pullTab.addEventListener('pointerup', () => {
      setTimeout(() => {
        wasDragging = false;
      }, 0);
    });

    contextButtonBack.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      hideContextButtons();

      ignoreNextFullscreenClick = true; // Set flag to ignore the next click on fullscreen-icon
      setTimeout(() => {
        ignoreNextFullscreenClick = false;
      }, 100);
    })
    contextButtonSave.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      saveCurrentSettings();
    })

    contextButtonSwap.addEventListener('pointerdown', (e) => {
      e.stopPropagation(); // Stop propagation to pullTab
      clearTimeout(longPressTimer); // Clear the timer immediat
    });
    contextButtonSwap.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      swapSide();
    })


  })
    .catch(error => {
      console.error('Error loading pull tab:', error);
    });
}

main();

