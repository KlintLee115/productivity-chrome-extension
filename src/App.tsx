import { useEffect, useRef, useState } from 'react'
import './index.css'

function Main({ changePage }: {  changePage: (pageName: string) => void}): JSX.Element {

  return (
    <div className='flex'>
      <p className='text-2xl mx-auto w-fit'>Stay productive</p>
      <button onClick={() => changePage('Options')} className="cursor-pointer fa fa-gear text-2xl"></button>
    </div>
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
    <p className='text-4xl cursor-pointer' style={{lineHeight:"2rem"}} onClick={() => changePage('Main')}>&#x2190;</p>
    <div className='flex justify-between my-[5vh]'>
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
  const [currentPage, setCurrentPage] = useState<string>('Main');

  const changePage = (pageName: string) => setCurrentPage(pageName)

  let PageComponent: JSX.Element;

  switch (currentPage) {
    case 'Main':
      PageComponent = <Main changePage={changePage}/>;
      break;
    case 'Options':
      PageComponent = <Options changePage={changePage} />;
      break;
    default:
      PageComponent = <div>Page not found</div>;
  }

  return (
    <div className='bg-orange-200 px-[2vw] w-[15rem] max-h-[20rem]'>
      {PageComponent}
    </div>
  );
}


export default App