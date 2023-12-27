import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import './index.css'

enum Page {
  Main = "MAIN",
  Options = "OPTIONS"
}

const addSiteAsAllowed = (url: string, allowedWebsites: string[], setAllowedWebsites:React.Dispatch<React.SetStateAction<string[]>>) => {
  const baseUrl = new URL(url).origin;
  const newAllowedWebsites = [...allowedWebsites, baseUrl];
  setAllowedWebsites(newAllowedWebsites)
  chrome.storage.local.set({ 'allowedWebsites': newAllowedWebsites });
};

const whiteListCurrentSite = (allowedWebsites: string[], setAllowedWebsites: React.Dispatch<React.SetStateAction<string[]>>) => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url) {
      addSiteAsAllowed(currentTab.url, allowedWebsites, setAllowedWebsites)
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


function Main({ changePage }: { changePage: (pageName: string) => void }): JSX.Element {

  const [allowedWebsites, setAllowedWebsites] = useState<string[]>([])

  useEffect(() => {
    chrome.storage.local.get(['allowedWebsites'], result => setAllowedWebsites(result.allowedWebsites ?? []))
  }, []);

  return (
    <>
      <div className='flex justify-evenly items-center'>
        <p className='text-base mx-auto w-fit'>Stay productive</p>
        <i onClick={() => changePage('Options')} className="cursor-pointer fa fa-gear text-2xl"></i>
      </div>
      <button className={`'block w-full text-xl ${allowedWebsites ? 'bg-white' : 'bg-gray-500'}`}
        onClick={() => whiteListCurrentSite(allowedWebsites, setAllowedWebsites)}>Whitelist this site</button>
    </>
  )
}

function Options({ changePage }: { changePage: (page: string) => void }): JSX.Element {

  const [allowedWebsites, setAllowedWebsites] = useState<string[]>([])
  const [enableAddAllowedUrlInput, setIsEnableAddAllowedUrlInput] = useState<boolean>(false)

  const newUrlInput = useRef<HTMLInputElement | null>(null)

  const addSiteFromInput = () => {
    const newSite = newUrlInput.current?.value;
    if (newSite) addSiteAsAllowed(newSite, allowedWebsites, setAllowedWebsites)
  }

  const removeUrl = (index: number) => {
    const updatedAllowedWebsites = [...allowedWebsites!!];
    updatedAllowedWebsites.splice(index, 1); // Remove the item at the specified index
    setAllowedWebsites(updatedAllowedWebsites)
    chrome.storage.local.set({ 'allowedWebsites': updatedAllowedWebsites });
  }

  useEffect(() => {
    chrome.storage.local.get(['allowedWebsites'], ({allowedWebsites}) => {
      allowedWebsites && setAllowedWebsites(allowedWebsites)
    })
  }, []);

  return <>
    <div className='flex justify-between'>
      <p className='text-4xl cursor-pointer' style={{ lineHeight: "2rem" }} onClick={() => changePage(Page.Main)}>&#x2190;</p>
      <button className='text-lg' onClick={() =>whiteListCurrentSite(allowedWebsites, setAllowedWebsites)}>Add current URL</button>
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