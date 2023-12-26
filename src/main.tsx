import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

type MainProps = { changePage: (pageName: string) => void };

enum Page {
  Main = "MAIN",
  Options = "OPTIONS"
}

function Main({ changePage }: MainProps): JSX.Element {

  const [timeElapsed, setTimeElapsed] = useState<number>(NaN)
  const [isTimerStopped, setIsTimerStopped] = useState<boolean>(true)
  const intervalRef = useRef<number>(NaN)

  function stopTimer() {
    setIsTimerStopped(true)
    chrome.runtime.sendMessage({ command: 'stopTimer' })
    clearInterval(intervalRef.current)
  }

  function startTimer() {
    chrome.runtime.sendMessage({ command: 'startTimer' })
    setTimeElapsed(0)
    unPauseTimer()
  }

  function unPauseTimer() {
    chrome.runtime.sendMessage({ command: 'unPauseTimer' })
    setIsTimerStopped(false)
    intervalRef.current = setInterval(() => {
      setTimeElapsed(time => Number.isNaN(time) ? 1 : time + 1)
    }, 1000)
  }

  useEffect(() => {

    (async () => {
      const { isTimerStopped } = await chrome.runtime.sendMessage({ command: 'isTimerStopped' })
      const { timeElapsed } = await chrome.runtime.sendMessage({ command: 'getTime' })
      setIsTimerStopped(isTimerStopped)
      setTimeElapsed(timeElapsed)

      if (!isTimerStopped) unPauseTimer()
    })()
  }, [])

  return Number.isNaN(timeElapsed) ? (
    <>
      <p className='text-base mx-auto w-fit'>Productivity</p>
      <p className='text-base'>Time elapsed: 0s</p>
      <div className='flex items-center mt-[3vh]'>
        <button style={{ flexGrow: 4 }} className={'text-xl bg-gray-500'}>Start</button>
        <i onClick={() => changePage('Options')} className="cursor-pointer fa fa-gear text-2xl"></i>
      </div>
      <button>ADD URL</button>
    </>
  )
    : (
      <>
        <p className='text-base mx-auto w-fit'>Productivity</p>
        <p className='text-base'>Time elapsed: {timeElapsed}s</p>
        <div className='flex items-center mt-[3vh] gap-[2vw]'>
          <button style={{ flexGrow: 1 }} onClick={() => {
            if (isTimerStopped) {
              startTimer()
            } else {
              stopTimer()
            }
          }} className={`text-xl ${isTimerStopped ? 'bg-green-300' : 'bg-red-500'}`}>{isTimerStopped ? "Start" : "Stop"}</button>
          <i onClick={() => changePage(Page.Options)} className="cursor-pointer fa fa-gear text-2xl"></i>
        </div>
      </>
    )
}

function Options({ changePage }: { changePage: (page: string) => void }): JSX.Element {

  const [allowedWebsites, setAllowedWebsites] = useState<string[]>([])
  const [enableAddAllowedUrlInput, setIsEnableAddAllowedUrlInput] = useState<boolean>(false)

  const newUrlInput = useRef<HTMLInputElement | null>(null)

  const addSiteAsAllowed = (url: string) => {
    const urlObject = new URL(url);
    const baseUrl = `${urlObject.protocol}//${urlObject.hostname}`
    const newAllowedWebsites = [...allowedWebsites, baseUrl];
    setAllowedWebsites(newAllowedWebsites)
    chrome.storage.local.set({ 'allowedWebsites': newAllowedWebsites });
  };

  const addSiteFromInput = () => {
    const newSite = newUrlInput.current?.value;
    if (newSite) addSiteAsAllowed(newSite)
  }

  const addCurrentTabUrlToStorage = () => {
    // Use chrome.tabs.query to get the current tab's URL
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentTab = tabs[0];
      if (currentTab && currentTab.url) addSiteAsAllowed(currentTab.url)
    })
  }

  const removeUrl = (index: number) => {
    const updatedAllowedWebsites = [...allowedWebsites];
    updatedAllowedWebsites.splice(index, 1); // Remove the item at the specified index
    setAllowedWebsites(updatedAllowedWebsites)
    chrome.storage.local.set({ 'allowedWebsites': updatedAllowedWebsites });
  }

  useEffect(() => {
    chrome.storage.local.get(['allowedWebsites'], result => result.allowedWebsites && setAllowedWebsites(result.allowedWebsites))
  }, []);

  return <>
    <div className='flex justify-between'>
      <p className='text-4xl cursor-pointer' style={{ lineHeight: "2rem" }} onClick={() => changePage(Page.Main)}>&#x2190;</p>
      <button className='text-lg' onClick={addCurrentTabUrlToStorage}>Add current URL</button>
    </div>
    <div className='flex justify-between mt-[5vh]'>
      <h2 className='text-lg'>Allowed websites</h2>
      <p className='text-lg cursor-pointer' onClick={() => setIsEnableAddAllowedUrlInput(true)}>+</p>
    </div>
    {allowedWebsites.map((url, index) => (
      <div className='flex justify-between'>
        <p className='text-lg max-w-[90%] overflow-hidden whitespace-nowrap' key={url}>{url}</p>
        <p className='text-lg cursor-pointer' onClick={() => removeUrl(index)}>X</p>
      </div>))
    }

    <input ref={newUrlInput} className={`${enableAddAllowedUrlInput ? "inline" : "hidden"}`} type='text'></input>
    <p onClick={addSiteFromInput} className={`cursor-pointer ml-[2vw] ${enableAddAllowedUrlInput ? "inline" : "hidden"}`}>V</p>
  </>
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>(Page.Main);

  const changePage = (pageName: string) => setCurrentPage(pageName)

  const PageComponent = currentPage === Page.Main ? <Main changePage={changePage} /> : <Options changePage={changePage} />

  return (
    <div className='bg-orange-200 px-[2vw] w-[15rem] max-h-[20rem]'>
      {PageComponent}
    </div>
  );
}


export default App