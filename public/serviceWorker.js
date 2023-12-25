let timerRunning = false;

// This should be called when your extension is installed or started.
chrome.runtime.onConnect.addListener(port => {

  let bkg = chrome.extension.getBackgroundPage();
  bkg.console.log('foo');})
