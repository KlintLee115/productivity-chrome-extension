import { useEffect, useRef, useState } from 'react'
import './index.css'

type MainProps = {
  changePage: (pageName: string) => void
  timeElapsed: number
  timerRunning: boolean
};

function Main({ changePage, timeElapsed, timerRunning }: MainProps): JSX.Element {

  const startStopButtonClicked = () => chrome.runtime.sendMessage({ command: 'toggleTimer' });

  return (
    <>
      <p className='text-base mx-auto w-fit'>Stay productive</p>
      <p className='text-base'>Time elapsed: {timeElapsed}s</p>
      <div className='flex items-center mt-[3vh]'>
        <button style={{ flexGrow: 4 }} className={`text-xl ${timerRunning ? 'bg-red-500' : 'bg-green-300'}`} onClick={startStopButtonClicked}>{timerRunning ? "Stop" : "Start"}</button>
        <i onClick={() => changePage('Options')} className="cursor-pointer fa fa-gear text-2xl"></i>
      </div>
    </>
  )
}

function Options({changePage}: { changePage: (page: string) => void }): JSX.Element {

  const [allowedWebsites, setAllowedWebsites] = useState<string[]>([])
  const [enableAddAllowedUrlInput, setIsEnableAddAllowedUrlInput] = useState<boolean>(false)

  const newUrlInput = useRef<HTMLInputElement | null>(null)

  const addSiteAsAllowed = () => {
    const newSite = newUrlInput.current?.value;
    if (newSite) {
      const newAllowedWebsites = [...allowedWebsites, newSite];
      chrome.storage.local.set({ 'allowedWebsites': newAllowedWebsites });
    }
  };

  const removeUrl = (index: number) => {
    const updatedAllowedWebsites = [...allowedWebsites];
    updatedAllowedWebsites.splice(index, 1); // Remove the item at the specified index
    chrome.storage.local.set({ 'allowedWebsites': updatedAllowedWebsites });
  }

  useEffect(() => {
    chrome.storage.local.get(['allowedWebsites'], result => result.allowedWebsites && setAllowedWebsites(result.allowedWebsites))
  }, [allowedWebsites]);

  return <>
    <p className='text-xl' onClick={() => changePage('Main')}>Back</p>
    <div className='flex justify-between mt-[5vh]'>
      <h2 className='text-lg'>Allowed websites</h2>
      <p className='text-lg cursor-pointer' onClick={() => setIsEnableAddAllowedUrlInput(true)}>+</p>
    </div>
    {allowedWebsites.map((url, index) => (
      <div className='flex justify-between'>
        <p className='text-lg' key={url}>{url}</p>
        <p className='text-lg cursor-pointer' onClick={() => removeUrl(index)}>X</p>
      </div>))
    }

    <input ref={newUrlInput} className={`${enableAddAllowedUrlInput ? "inline" : "hidden"}`} type='text'></input>
    <p onClick={addSiteAsAllowed} className={`cursor-pointer ml-[2vw] ${enableAddAllowedUrlInput ? "inline" : "hidden"}`}>V</p>
  </>
}

function App() {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('Main');

  const changePage = (pageName: string) => setCurrentPage(pageName)

  let PageComponent: JSX.Element;

  switch (currentPage) {
    case 'Main':
      PageComponent = <Main
        changePage={changePage}
        timeElapsed={timeElapsed}
        timerRunning={timerRunning}
      />;
      break;
    case 'Options':
      PageComponent = <Options changePage={changePage} />;
      break;
    default:
      PageComponent = <div>Page not found</div>;
  }

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.timeElapsed !== undefined) {
        setTimeElapsed(request.timeElapsed);
        setTimerRunning(request.timerRunning);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.sendMessage({ command: 'getTime' });

    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div className='bg-orange-200 px-[2vw] w-[15rem] max-h-[20rem]'>
      {PageComponent}
    </div>
  );
}


export default App


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