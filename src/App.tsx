import { useEffect, useRef, useState } from 'react'
import './index.css'

type MainProps = { changePage: (pageName: string) => void };

enum Page {
  Main = "MAIN", 
  Options = "OPTIONS"
}

function Main({ changePage }: MainProps): JSX.Element {

  const [timeElapsed, setTimeElapsed] = useState<number>(NaN)
  const [isTimerStopped, setIsTimerStopped] = useState<boolean>(true)
  const intervalRef = useRef<number>(NaN)

  const resetTimer = () => {
    setTimeElapsed(0)
    chrome.runtime.sendMessage({ command: 'resetStartTime' })
  }

  const stopTimer = () => {
    setIsTimerStopped(true)
    clearInterval(intervalRef.current)
  }

  function startTimer() {
    setIsTimerStopped(false)
    intervalRef.current = setInterval(() => {
      setTimeElapsed(time => Number.isNaN(time) ? 1 : time + 1)
    }, 1000)
  }


  useEffect(() => {

    (async () => {
      const { timeElapsed } = await chrome.runtime.sendMessage({ command: 'getTime' })
      setTimeElapsed(timeElapsed)
      timeElapsed !== 0 && startTimer()
    })()

    return () => { intervalRef.current && stopTimer() }
  }, [])

  return Number.isNaN(timeElapsed) ? (
    <>
      <p className='text-base mx-auto w-fit'>Productivity</p>
      <p className='text-base'>Time elapsed: 0s</p>
      <div className='flex items-center mt-[3vh]'>
        <button style={{ flexGrow: 4 }} className={'text-xl bg-gray-500'}>Start</button>
        <i onClick={() => changePage('Options')} className="cursor-pointer fa fa-gear text-2xl"></i>
      </div>
    </>
  )
    : (
      <>
        <p className='text-base mx-auto w-fit'>Productivity</p>
        <p className='text-base'>Time elapsed: {timeElapsed}s</p>
        <div className='flex items-center mt-[3vh]'>
          <button style={{ flexGrow: 4 }} onClick={() => {
            if (isTimerStopped) {
              resetTimer()
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
    <p className='text-4xl cursor-pointer' style={{lineHeight:"2rem"}} onClick={() => changePage(Page.Main)}>&#x2190;</p>

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
  const [currentPage, setCurrentPage] = useState<string>(Page.Main);

  const changePage = (pageName: string) => setCurrentPage(pageName)

  const PageComponent = currentPage === Page.Main ?  <Main changePage={changePage} /> : <Options changePage={changePage} />

  return (
    <div className='bg-orange-200 px-[2vw] w-[15rem] max-h-[20rem]'>
      {PageComponent}
    </div>
  );
}


export default App