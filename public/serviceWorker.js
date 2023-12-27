// let startTime
// let isTimerStopped
// let timeElapsed

// // This should be called when your extension is installed or started.
// chrome.runtime.onInstalled.addListener(() => {
//   startTime = NaN
//   isTimerStopped = true
//   timeElapsed = NaN
//   console.log('Extension installed or updated foo')
// })

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

//   // Log the message for debugging purposes.
//   console.log('Received message:', message);
//   const command = message.command

//   switch (command) {
//     case 'startTimer':
//       startTime = new Date()
//       timeElapsed = 0
//       isTimerStopped = false
//       break

//     case 'unPauseTimer':
//       isTimerStopped = false
//       break

//     case 'stopTimer':
//       isTimerStopped = true
//       timeElapsed = Math.floor((Date.now() - startTime) / 1000);
//       break

//     case 'isTimerStopped':
//       sendResponse({ isTimerStopped: isTimerStopped })
//       break

//     case 'getTime':

//       // initial state
//       if (isNaN(startTime)) {
//         sendResponse({ timeElapsed: 0 })
//       }

//       else if (isTimerStopped) {
//         sendResponse({ timeElapsed: timeElapsed })
//       }

//       // the program is still running
//       else {
//         sendResponse({ timeElapsed: Math.floor((Date.now() - startTime) / 1000) })
//       }
//   }
// });