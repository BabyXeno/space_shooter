// content.js

function injectGame() {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '10000'; 
    iframe.src = chrome.runtime.getURL('index.html');
    document.body.appendChild(iframe);
  }
  injectGame(); 
  
  