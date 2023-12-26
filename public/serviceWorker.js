let startTime

// This should be called when your extension is installed or started.
chrome.runtime.onInstalled.addListener(() => console.log('Extension installed or updated foo'))

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Log the message for debugging purposes.
  console.log('Received message:', message);
  const command = message.command

  if (command === 'resetStartTime') {
    startTime = new Date()
  }
  else if (command === 'getTime') {
    let timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    timeElapsed = Number.isNaN(timeElapsed) ? 0 : timeElapsed
    sendResponse({timeElapsed: timeElapsed})
  }
});