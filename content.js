// content.js

function injectGame() {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '10000'; // Ensure it's on top of everything
    iframe.src = chrome.runtime.getURL('index.html'); // Load your game page
    document.body.appendChild(iframe);
  }
  
  injectGame(); // Run the injection
  
  