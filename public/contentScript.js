chrome.storage.local.get(['allowedWebsites'], result => {
    const currentUrl = window.location.href;
    const isAllowed = result.allowedWebsites?.some(url => currentUrl.includes(url)) ?? false;

    if (!isAllowed) {
        document.body.innerHTML = '<h2 class="text-centered"> Stay productive </h2>'
    }
});

