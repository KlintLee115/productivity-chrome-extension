let timerRunning = false;

// This should be called when your extension is installed or started.
chrome.runtime.onConnect.addListener(port => {


  // port.onAlarm.addListener((alarm) => {
  //   if (alarm.name === "timer" && timerRunning) {
  //     chrome.storage.local.get("timeElapsed", (data) => {
  //       let timeElapsed = data.timeElapsed || 0;
  //       timeElapsed += 1;
  //       chrome.storage.local.set({ timeElapsed });
  //     });
  //   }
  // });

  // chrome.storage.local.set({ timeElapsed: 0, timerRunning: false });
  // chrome.alarms.create("timer", { periodInMinutes: 1 / 60 });

  // Listen for messages from other parts of the extension.
  // port.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.command === 'toggleTimer') {
  //     timerRunning = !timerRunning;
  //     chrome.storage.local.set({ timerRunning });
  //   } else if (message.command === 'getTime') {
  //     chrome.storage.local.get(['timeElapsed', 'timerRunning'], (data) => {
  //       sendResponse({ timeElapsed: data.timeElapsed, timerRunning: data.timerRunning });
  //     });
  //     return true; // Keep the message channel open for the response
  //   }
  // });
  let bkg = chrome.extension.getBackgroundPage();
  bkg.console.log('foo');})

  /*
IMPORTANT!

DELETED "background": {
    "service_worker": "serviceWorker.js"
  } from manifest.json
  */